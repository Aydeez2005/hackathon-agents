import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Cursor x Antler Hackathon",
  description: "Hackathon management platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full bg-black text-white flex flex-col">{children}</body>
    </html>
  );
}
