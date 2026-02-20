import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Career Mentor — Your Intelligent Career Coach",
  description:
    "AI-powered career mentoring with resume analysis, personalized roadmaps, job market insights, and mock interviews — powered by Microsoft AutoGen & Azure OpenAI.",
  keywords: ["AI career mentor", "resume analysis", "career roadmap", "mock interview", "Azure OpenAI"],
  openGraph: {
    title: "AI Career Mentor",
    description: "Your personal AI career coach — available 24/7",
    type: "website",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
