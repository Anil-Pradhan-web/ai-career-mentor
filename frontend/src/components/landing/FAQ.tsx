"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is CareerMentor really free?",
    a: "Yes. The free tier gives you access to all 5 AI agents — 1 resume audit / day, 1 mock interview / 5 days, 1 roadmap / 3 days, 2 LinkedIn reviews / day, and 2 market searches / day. No credit card required.",
  },
  {
    q: "How does the resume ATS diagnostic work?",
    a: "Your resume undergoes comprehensive document parsing and ATS compatibility analysis. We evaluate structural parsing, keyword coverage, and quantifiable accomplishments (such as the Google XYZ formula) to give you an actionable score and targeted bullet rewrites.",
  },
  {
    q: "How do the 5 AI agents work together?",
    a: "Each agent specializes in a distinct career pillar — ATS Resume Diagnostics, Skill Roadmap Architecting, Company Mock Interviews, Real-Time Market Intelligence, and LinkedIn Optimization. They leverage your target role and resume context across independent, on-demand sessions.",
  },
  {
    q: "How does the mock interview simulation adapt to me?",
    a: "The interview engine draws context directly from your background and target seniority. Questions dynamically evaluate technical depth, problem-solving, architectural decision-making, and live coding, complete with Staff-engineer level model answer blueprints.",
  },
  {
    q: "Can I practice for specific companies?",
    a: "Yes. The interview engine supports company-specific interview profiles across top tech enterprises and high-growth startups, mapping questioning styles to real-world engineering standards.",
  },
  {
    q: "What are the rate limits?",
    a: "Free tier limits protect LLM costs: 1 resume audit / day, 1 roadmap / 3 days, 1 mock interview / 5 days, 2 market searches / day, and 2 LinkedIn reviews / day. Cooldown locks prevent rapid re-execution and reset on fixed schedules.",
  },
  {
    q: "How is my data handled?",
    a: "Your resume is processed in-memory for analysis and saved to your encrypted database for personalization (so the roadmap targets YOUR skill gaps and the interviewer asks about YOUR projects). Account data is secured via JWT authentication with bcrypt-hashed passwords.",
  },
  {
    q: "What happens if an AI provider goes down?",
    a: "The platform uses a multi-provider failover chain. If one provider is unavailable, requests automatically route to the next — ensuring high uptime and fast responses without any action needed from you.",
  },
];

export default function FAQ() {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="faq" className="py-28 px-6 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-3xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-xs font-bold uppercase tracking-[0.2em] mb-4 inline-block" style={{ color: "var(--accent-amber)" }}>
            Common Questions
          </span>
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-6 tracking-tight leading-none" style={{ color: "var(--fg-primary)" }}>
            Frequently Asked <span className="gradient-text">Questions</span>
          </h2>
        </div>

        <div className="space-y-3">
          {FAQS.map((faq, i) => (
            <div
              key={i}
              className="overflow-hidden transition-all duration-300"
              style={{
                borderRadius: "var(--radius-xl)",
                background: "var(--bg-card)",
                border: openIdx === i ? "1px solid rgba(59,130,246,0.2)" : "1px solid var(--border-default)",
              }}
            >
              <button
                onClick={() => setOpenIdx(openIdx === i ? null : i)}
                className="w-full flex items-center justify-between p-6 text-left cursor-pointer"
              >
                <span className="text-sm font-bold pr-4" style={{ color: "var(--fg-primary)" }}>{faq.q}</span>
                <ChevronDown
                  size={16}
                  className="shrink-0 transition-transform duration-300"
                  style={{
                    color: "var(--fg-muted)",
                    transform: openIdx === i ? "rotate(180deg)" : "rotate(0deg)"
                  }}
                />
              </button>
              <div
                className="overflow-hidden transition-all duration-300"
                style={{
                  maxHeight: openIdx === i ? "200px" : "0",
                  opacity: openIdx === i ? 1 : 0,
                }}
              >
                <p className="px-6 pb-6 text-sm leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
                  {faq.a}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
