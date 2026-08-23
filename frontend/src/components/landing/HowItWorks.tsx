import React from "react";
import { Upload, Cpu, BarChart } from "lucide-react";

const STEPS = [
  {
    number: "01",
    icon: Upload,
    title: "Upload Your Resume",
    desc: "Drop your PDF resume. Our OCR pipeline extracts text, removes noise, and structures your data for analysis in seconds.",
    color: "var(--brand)",
  },
  {
    number: "02",
    icon: Cpu,
    title: "AI Agents Analyze",
    desc: "Five specialized agents cross-reference your resume against ATS benchmarks, market trends, skill gaps, and interview readiness simultaneously.",
    color: "var(--accent-purple)",
  },
  {
    number: "03",
    icon: BarChart,
    title: "Get Your Action Plan",
    desc: "Receive a unified career plan with ATS optimization tips, personalized learning roadmaps, salary insights, LinkedIn strategy, and mock interview prep.",
    color: "var(--accent-emerald)",
  },
];

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-28 px-6 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <div className="absolute pointer-events-none" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", filter: "blur(140px)" }} />

      <div className="max-w-5xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-20">
          <span className="text-xs font-bold uppercase tracking-[0.2em] mb-4 inline-block" style={{ color: "var(--accent-purple)" }}>
            Simple Workflow
          </span>
          <h2 className="font-display text-4xl sm:text-5xl md:text-6xl font-black mb-6 tracking-tight leading-none" style={{ color: "var(--fg-primary)" }}>
            How It <span className="gradient-text">Works</span>
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
            Three steps from resume to career clarity
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
          {/* Connecting Line */}
          <div className="hidden md:block absolute top-16 left-[20%] right-[20%] h-px" style={{ background: "linear-gradient(to right, var(--brand), var(--accent-purple), var(--accent-emerald))", opacity: 0.2 }} />

          {STEPS.map((step, i) => (
            <div key={i} className="relative text-center">
              {/* Step Number */}
              <div className="relative inline-flex items-center justify-center mb-8">
                <div className="w-16 h-16 rounded-2xl flex items-center justify-center relative z-10" style={{
                  background: `color-mix(in srgb, ${step.color} 8%, transparent)`,
                  border: `1px solid color-mix(in srgb, ${step.color} 20%, transparent)`,
                }}>
                  <step.icon size={24} style={{ color: step.color }} />
                </div>
                <span className="absolute -top-2 -right-2 text-[10px] font-black px-1.5 py-0.5 rounded-md" style={{
                  background: step.color,
                  color: "#000"
                }}>{step.number}</span>
              </div>

              <h3 className="text-lg font-bold mb-3 tracking-tight" style={{ color: "var(--fg-primary)" }}>
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed max-w-xs mx-auto" style={{ color: "var(--fg-secondary)" }}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
