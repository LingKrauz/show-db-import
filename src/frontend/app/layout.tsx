import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AniList Show Finder",
  description: "Browse your completed anime from AniList and get AI-powered recommendations for what to watch next.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#07091a]">
        {children}
      </body>
    </html>
  );
}
