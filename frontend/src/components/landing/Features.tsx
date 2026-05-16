import React from "react";
import { Sparkles, Activity, Target, TrendingUp } from "lucide-react";

const FEATURES = [
  {
    title: "Resume Intelligence",
    desc: "AI agents scan your resume against 50,000+ job descriptions to find skill gaps.",
    icon: Target,
    color: "text-primary",
    bg: "bg-primary/10"
  },
  {
    title: "Market Analysis",
    desc: "Real-time hiring volume and salary trends for every role and tier.",
    icon: TrendingUp,
    color: "text-secondary",
    bg: "bg-secondary/10"
  },
  {
    title: "Adaptive Roadmaps",
    desc: "Customized learning paths that evolve as you complete projects.",
    icon: Activity,
    color: "text-cyan-400",
    bg: "bg-cyan-400/10"
  },
  {
    title: "Live Mock Interviews",
    desc: "Speak with AI engineers that adapt to your answers in real-time.",
    icon: Sparkles,
    color: "text-emerald-400",
    bg: "bg-emerald-400/10"
  }
];

export default function Features() {
  return (
    <section id="ai-agents" className="py-24 px-6 relative">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-6">
            Equipped with 4 specialized <br />
            <span className="text-primary">Career AI Agents.</span>
          </h2>
          <p className="text-slate-400 max-w-2xl mx-auto text-lg">
            Our multi-agent system collaborates to build your professional profile from scratch. 
            No more generic advice—just raw data and execution.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {FEATURES.map((f, i) => (
            <div 
              key={i} 
              className="group p-10 rounded-[3rem] bg-surface/20 border border-white/5 hover:border-white/20 transition-all hover:bg-surface/40 flex flex-col items-center text-center"
            >
              <div className={`w-16 h-16 rounded-2xl ${f.bg} ${f.color} flex items-center justify-center mb-8 group-hover:scale-110 transition-transform`}>
                <f.icon size={32} />
              </div>
              <h3 className="font-display text-2xl font-bold text-white mb-4 tracking-tight">{f.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
