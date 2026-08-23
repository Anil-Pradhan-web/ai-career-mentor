import React from "react";

const TECH_STACK = [
  { name: "Groq", color: "#10b981" },
  { name: "Google Gemini", color: "#3b82f6" },
  { name: "NVIDIA NIM", color: "#76b900" },
  { name: "LangGraph", color: "#ec4899" },
  { name: "ChromaDB", color: "#f59e0b" },
  { name: "Neon Postgres", color: "#06b6d4" },
  { name: "Upstash Redis", color: "#8b5cf6" },
  { name: "FastAPI", color: "#10b981" },
];

export default function LogoCloud() {
  return (
    <section className="py-16 px-6 relative" style={{ background: "var(--bg-base)" }}>
      <div className="max-w-6xl mx-auto">
        <p className="text-center text-xs font-bold uppercase tracking-[0.2em] mb-10" style={{ color: "var(--fg-muted)" }}>
          Built with Industry-Leading Infrastructure
        </p>
        <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6">
          {TECH_STACK.map((tech) => (
            <div key={tech.name} className="flex items-center gap-2 opacity-50 hover:opacity-100 transition-opacity duration-300">
              <div className="w-2 h-2 rounded-full" style={{ background: tech.color }} />
              <span className="text-sm font-semibold" style={{ color: "var(--fg-secondary)" }}>{tech.name}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
