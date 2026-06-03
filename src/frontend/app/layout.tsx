import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AniList Show Finder",
  description: "Find and import your anime shows from AniList",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
