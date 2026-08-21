import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerMentor.ai — Your Personal AI Career Coach",
  description:
    "AI-powered career mentoring with resume analysis, personalized roadmaps, job market insights, and real-time mock interviews — powered by CareerMentor.ai",
  keywords: ["AI career mentor", "CareerMentor.ai", "resume analysis", "career roadmap", "mock interview"],
  icons: {
    icon: [
      { url: "/icon.svg", type: "image/svg+xml" },
      { url: "/favicon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/icon.svg",
    apple: "/icon.svg",
  },
  openGraph: {
    title: "CareerMentor.ai",
    description: "Your personal AI career coach — available 24/7",
    type: "website",
  },
};

import { Toaster } from "react-hot-toast";
import { Providers } from "@/components/Providers";

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        {/* ── Non-blocking font loading (preconnect + display=swap) ── */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,300;0,14..32,400;0,14..32,500;0,14..32,600;0,14..32,700;0,14..32,800;1,14..32,400&family=Space+Grotesk:wght@400;500;600;700;800&display=swap"
        />
        <link rel="icon" href="/icon.svg" type="image/svg+xml" />
      </head>
      <body>
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
