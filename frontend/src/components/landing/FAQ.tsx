"use client";

import React, { useState } from "react";
import { ChevronDown } from "lucide-react";

const FAQS = [
  {
    q: "Is CareerMentor really free?",
    a: "Yes. The free tier gives you access to all 5 AI agents with generous daily limits — 1 resume audit every 2 days, 1 mock interview per week, 1 roadmap every 5 days, plus LinkedIn reviews and market scrapes. No credit card required.",
  },
  {
    q: "How does the ATS resume audit work?",
    a: "Our engine performs deterministic keyword parsing, extracts experience and skills, removes OCR noise, and computes your true ATS score against 50,000+ benchmark specifications. You get specific rewrite suggestions, not vague advice.",
  },
  {
    q: "What AI models power the platform?",
    a: "We use a multi-provider AI architecture with automatic failover. If one provider is unavailable, requests seamlessly route to the next — ensuring high uptime and fast responses.",
  },
  {
    q: "How realistic are the mock interviews?",
    a: "Very realistic. The interview engine runs a 7-phase finite state machine covering tech stack discovery, CS fundamentals, coding challenges, resume deep-dives, and system design. It adapts in real-time based on your answers.",
  },
  {
    q: "Can I use this for non-tech careers?",
    a: "CareerMentor is optimized for software engineering and tech roles. The ATS audit, market intelligence, and LinkedIn SEO features work for any resume, but the interview prep and roadmap agents are tech-focused.",
  },
  {
    q: "How is my data handled?",
    a: "Your resume data is processed in-memory and never stored permanently. We use encrypted connections for all AI processing, and your account data is secured via JWT authentication with bcrypt-hashed passwords.",
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
