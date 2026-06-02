#!/usr/bin/env python3
"""Team Creator Agent – reads participants, outputs balanced teams."""

from __future__ import annotations

import argparse
import json
import sys
from pathlib import Path

import pandas as pd

LEVEL_RANK = {"Beginner": 1, "Intermediate": 2, "Advanced": 3}
SKILLS = ["Frontend", "Backend", "Design", "Product", "AI", "Data", "GTM"]


def load_participants(path: Path) -> pd.DataFrame:
    suffix = path.suffix.lower()
    if suffix in {".xlsx", ".xls", ".csv"}:
        if suffix == ".csv":
            df = pd.read_csv(path)
        else:
            df = pd.read_excel(path)
    elif suffix == ".pdf":
        # Minimal PDF support: one line per person, "Name | Experience"
        from pypdf import PdfReader

        reader = PdfReader(str(path))
        rows = []
        for page in reader.pages:
            for line in page.extract_text().splitlines():
                line = line.strip()
                if not line or "|" not in line:
                    continue
                name, experience = [part.strip() for part in line.split("|", 1)]
                rows.append({"Name": name, "Experience": experience})
        df = pd.DataFrame(rows)
    else:
        raise ValueError(f"Unsupported file type: {suffix}")

    if "Name" not in df.columns:
        raise ValueError("Input must contain a 'Name' column")

    experience_col = next(
        (c for c in df.columns if c.lower() in {"experience", "erfahrung"}),
        None,
    )
    if experience_col is None:
        raise ValueError("Input must contain 'Experience' or 'Erfahrung'")

    df = df.rename(columns={experience_col: "Experience"})
    return df[["Name", "Experience"] + [c for c in df.columns if c not in {"Name", "Experience"}]]


def score_participant(row: pd.Series) -> int:
    level = str(row.get("Level", "Intermediate"))
    return LEVEL_RANK.get(level, 2)


def primary_skill(row: pd.Series) -> str:
    skill = str(row.get("Primary Skill", "")).strip()
    return skill if skill in SKILLS else "Other"


def create_teams(df: pd.DataFrame, team_size: int = 3) -> list[dict]:
    working = df.copy()
    working["_score"] = working.apply(score_participant, axis=1)
    working["_skill"] = working.apply(primary_skill, axis=1)

    # Snake draft: strong participants spread across teams
    ordered = working.sort_values("_score", ascending=False)
    num_teams = max(1, round(len(ordered) / team_size))
    teams: list[list[dict]] = [[] for _ in range(num_teams)]

    for idx, (_, row) in enumerate(ordered.iterrows()):
        team_idx = idx % num_teams if (idx // num_teams) % 2 == 0 else num_teams - 1 - (idx % num_teams)
        teams[team_idx].append(
            {
                "name": row["Name"],
                "experience": row["Experience"],
                "level": row.get("Level"),
                "primary_skill": row.get("Primary Skill"),
            }
        )

    result = []
    for i, members in enumerate(teams, start=1):
        skills = [m.get("primary_skill") for m in members if m.get("primary_skill")]
        result.append(
            {
                "team_id": f"team-{i}",
                "team_name": f"Team {i}",
                "members": members,
                "skills": skills,
                "avg_level_score": round(
                    sum(LEVEL_RANK.get(str(m.get("level") or "Intermediate"), 2) for m in members)
                    / max(len(members), 1),
                    2,
                ),
            }
        )
    return result


def teams_to_rows(teams: list[dict]) -> list[dict]:
    rows = []
    for team in teams:
        for member in team["members"]:
            rows.append(
                {
                    "Team": team["team_name"],
                    "Team ID": team["team_id"],
                    "Name": member["name"],
                    "Experience": member["experience"],
                    "Level": member.get("level"),
                    "Primary Skill": member.get("primary_skill"),
                }
            )
    return rows


def write_teams_excel(teams: list[dict], path: Path) -> None:
    members_df = pd.DataFrame(teams_to_rows(teams))
    summary_df = pd.DataFrame(
        [
            {
                "Team": team["team_name"],
                "Team ID": team["team_id"],
                "Members": len(team["members"]),
                "Skills": ", ".join(team["skills"]),
                "Avg Level Score": team["avg_level_score"],
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

    parser = argparse.ArgumentParser(description="Create balanced hackathon teams")
    parser.add_argument("--input", "-i", required=True, type=Path, help="Excel/CSV/PDF with participants")
    parser.add_argument("--team-size", "-s", type=int, default=3, help="Target team size")
    parser.add_argument("--output", "-o", type=Path, help="Write JSON result to file")
    parser.add_argument(
        "--excel",
        "-x",
        type=Path,
        nargs="?",
        const=default_excel,
        default=default_excel,
        help="Write Excel result (default: ~/Desktop/EventOS_teams.xlsx). Pass a path to override.",
    )
    parser.add_argument("--no-excel", action="store_true", help="Skip Excel export")
    args = parser.parse_args()

    if not args.input.exists():
        print(f"File not found: {args.input}", file=sys.stderr)
        sys.exit(1)

    df = load_participants(args.input)
    teams = create_teams(df, team_size=args.team_size)
    payload = {
        "participant_count": len(df),
        "team_count": len(teams),
        "teams": teams,
    }

    text = json.dumps(payload, indent=2, ensure_ascii=False)
    if args.output:
        args.output.write_text(text, encoding="utf-8")
        print(f"Wrote {args.output}")
    else:
        print(text)

    if not args.no_excel:
        write_teams_excel(teams, args.excel)
        print(f"Wrote {args.excel}")


if __name__ == "__main__":
    main()
