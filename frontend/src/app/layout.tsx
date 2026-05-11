import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CareerMentor.ai — Your Personal AI Career Coach",
  description:
    "AI-powered career mentoring with resume analysis, personalized roadmaps, job market insights, and real-time mock interviews — powered by CareerMentor.ai",
  keywords: ["AI career mentor", "CareerMentor.ai", "resume analysis", "career roadmap", "mock interview"],
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
      <body>
        <Providers>
          <Toaster />
          {children}
        </Providers>
      </body>
    </html>
  );
}
