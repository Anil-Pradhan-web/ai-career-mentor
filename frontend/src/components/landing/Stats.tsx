import React from "react";

const STATS = [
  { value: "₹42 LPA", label: "Highest Package", icon: "💰", color: "from-emerald-500/20" },
  { value: "89%", label: "Success Rate", icon: "🎯", color: "from-primary/20" },
  { value: "₹15 LPA", label: "Avg Package", icon: "📈", color: "from-secondary/20" },
  { value: "10k+", label: "Daily Mock Runs", icon: "🤖", color: "from-cyan-500/20" }
];

export default function Stats() {
  return (
    <section className="py-12 px-6">
      <div className="max-w-7xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-6">
        {STATS.map((stat, i) => (
          <div 
            key={i} 
            className="group p-8 rounded-[2.5rem] bg-surface/40 backdrop-blur-3xl border border-white/10 hover:border-primary/40 transition-all hover:-translate-y-2"
          >
            <div className="text-4xl mb-4">{stat.icon}</div>
            <div className="font-display text-4xl font-black text-white mb-1 tracking-tight">
              {stat.value}
            </div>
            <div className="text-sm font-bold text-slate-500 uppercase tracking-widest">
              {stat.label}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
