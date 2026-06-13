import type { Metadata } from "next";
import "./globals.css";
import ThemeProvider from "@/app/components/ThemeProvider";
import Footer from "@/app/components/Footer";

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
      <body className="antialiased bg-bg-primary text-fg-primary">
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            {children}
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
