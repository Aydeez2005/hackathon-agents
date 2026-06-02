#!/usr/bin/env python3
"""Team Creator Agent – Supabase participants → balanced teams → team_id write-back."""

from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path

import pandas as pd
from dotenv import load_dotenv
from supabase import Client, create_client

PROJECT_ROOT = Path(__file__).resolve().parents[2]
ROLE_BUCKETS = ("developer", "founder", "marketing", "wildcard")
ROLE_ALIASES = {
    "developer": {"developer", "dev", "engineer", "backend", "frontend"},
    "founder": {"founder", "product"},
    "marketing": {"marketing", "marketer", "gtm", "sales"},
}


def load_env() -> None:
    load_dotenv(PROJECT_ROOT / ".env.local")
    load_dotenv(PROJECT_ROOT / ".env")


def get_supabase_client() -> Client:
    url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
    key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
    if not url or not key:
        raise RuntimeError(
            "Missing Supabase env vars. Set NEXT_PUBLIC_SUPABASE_URL and "
            "SUPABASE_SERVICE_ROLE_KEY in .env.local"
        )
    return create_client(url, key)


def normalize_role(role: str) -> str:
    value = role.strip().lower()
    for bucket, aliases in ROLE_ALIASES.items():
        if value == bucket or value in aliases:
            return bucket
    return "wildcard"


def fetch_participants(client: Client) -> list[dict]:
    response = (
        client.table("participants")
        .select("id, full_name, role, team_id")
        .order("full_name")
        .execute()
    )
    return response.data or []


def load_participants_from_json(path: Path) -> list[dict]:
    rows = json.loads(path.read_text(encoding="utf-8"))
    if not isinstance(rows, list):
        raise ValueError("JSON input must be a list of participant objects")

    participants = []
    for row in rows:
        if "full_name" not in row or "role" not in row:
            raise ValueError("Each participant needs full_name and role")
        participants.append(
            {
                "id": row.get("id"),
                "full_name": row["full_name"],
                "role": row["role"],
                "team_id": row.get("team_id"),
            }
        )
    return participants


def create_teams(participants: list[dict], team_size: int = 4) -> list[dict]:
    if not participants:
        return []

    buckets: dict[str, list[dict]] = {role: [] for role in ROLE_BUCKETS}
    for participant in participants:
        buckets[normalize_role(participant["role"])].append(participant)

    for bucket in buckets.values():
        bucket.sort(key=lambda p: p["full_name"].lower())

    teams: list[list[dict]] = []

    while all(len(bucket) > 0 for bucket in buckets.values()):
        teams.append(
            [
                buckets["developer"].pop(0),
                buckets["founder"].pop(0),
                buckets["marketing"].pop(0),
                buckets["wildcard"].pop(0),
            ]
        )

    leftovers = (
        buckets["developer"]
        + buckets["founder"]
        + buckets["marketing"]
        + buckets["wildcard"]
    )

    if not teams:
        num_teams = max(1, round(len(leftovers) / team_size))
        teams = [[] for _ in range(num_teams)]
        for idx, participant in enumerate(leftovers):
            teams[idx % num_teams].append(participant)
    else:
        for idx, participant in enumerate(leftovers):
            teams[idx % len(teams)].append(participant)

    result = []
    for index, members in enumerate(teams, start=1):
        team_id = f"team-{index}"
        result.append(
            {
                "team_id": team_id,
                "members": [
                    {
                        "id": member["id"],
                        "full_name": member["full_name"],
                        "role": member["role"],
                        "team_id": team_id,
                    }
                    for member in members
                ],
            }
        )
    return result


def write_team_ids(client: Client, teams: list[dict]) -> None:
    for team in teams:
        for member in team["members"]:
            if not member.get("id"):
                continue
            client.table("participants").update({"team_id": team["team_id"]}).eq(
                "id", member["id"]
            ).execute()


def build_result(participants: list[dict], teams: list[dict]) -> dict:
    return {
        "success": True,
        "message": f"Created {len(teams)} teams for {len(participants)} participants.",
        "data": {
            "participant_count": len(participants),
            "team_count": len(teams),
            "teams": teams,
        },
    }


def teams_to_rows(teams: list[dict]) -> list[dict]:
    rows = []
    for team in teams:
        for member in team["members"]:
            rows.append(
                {
                    "team_id": team["team_id"],
                    "full_name": member["full_name"],
                    "role": member["role"],
                }
            )
    return rows


def write_teams_excel(teams: list[dict], path: Path) -> None:
    members_df = pd.DataFrame(teams_to_rows(teams))
    summary_df = pd.DataFrame(
        [
            {
                "team_id": team["team_id"],
                "members": len(team["members"]),
                "roles": ", ".join(member["role"] for member in team["members"]),
            }
            for team in teams
        ]
    )

    path.parent.mkdir(parents=True, exist_ok=True)
    with pd.ExcelWriter(path, engine="openpyxl") as writer:
        members_df.to_excel(writer, sheet_name="Teams", index=False)
        summary_df.to_excel(writer, sheet_name="Summary", index=False)


def main() -> None:
    default_excel = Path.home() / "Desktop" / "EventOS_teams.xlsx"

    parser = argparse.ArgumentParser(description="Create balanced hackathon teams from Supabase")
    parser.add_argument(
        "--input",
        "-i",
        type=Path,
        help="Optional local JSON test file with Supabase-shaped participants",
    )
    parser.add_argument("--team-size", "-s", type=int, default=4, help="Target team size")
    parser.add_argument("--output", "-o", type=Path, help="Write API-style JSON result to file")
    parser.add_argument(
        "--excel",
        "-x",
        type=Path,
        nargs="?",
        const=default_excel,
        default=default_excel,
        help="Write Excel result (default: ~/Desktop/EventOS_teams.xlsx)",
    )
    parser.add_argument("--no-excel", action="store_true", help="Skip Excel export")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Do not write team_id values back to Supabase",
    )
    args = parser.parse_args()

    load_env()

    try:
        if args.input:
            if not args.input.exists():
                raise FileNotFoundError(f"File not found: {args.input}")
            participants = load_participants_from_json(args.input)
            client = None
        else:
            client = get_supabase_client()
            participants = fetch_participants(client)
    except (RuntimeError, FileNotFoundError, ValueError) as exc:
        print(str(exc), file=sys.stderr)
        sys.exit(1)

    if not participants:
        payload = {
            "success": False,
            "message": "No participants found.",
            "data": {"participant_count": 0, "team_count": 0, "teams": []},
        }
    else:
        teams = create_teams(participants, team_size=args.team_size)
        if client and not args.dry_run:
            write_team_ids(client, teams)
        payload = build_result(participants, teams)

    text = json.dumps(payload, indent=2, ensure_ascii=False)
    if args.output:
        args.output.write_text(text, encoding="utf-8")
        print(f"Wrote {args.output}")
    else:
        print(text)

    if not args.no_excel and payload.get("data", {}).get("teams"):
        write_teams_excel(payload["data"]["teams"], args.excel)
        print(f"Wrote {args.excel}")


if __name__ == "__main__":
    main()
