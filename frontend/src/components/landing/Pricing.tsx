import React from "react";
import { CheckCircle } from "lucide-react";

const PLANS = [
  {
    name: "Free",
    price: "0",
    desc: "Perfect for exploring our AI capabilities.",
    features: ["1 Resume Analysis / Day", "Basic Career Roadmap", "Limited Mock Interviews", "Public Community Access"],
    button: "Get Started",
    highlight: false
  },
  {
    name: "Pro",
    price: "149",
    desc: "The ultimate career operating system.",
    features: [
      "Unlimited AI Analysis",
      "Dynamic Agent Roadmaps",
      "24/7 Mock Interview Access",
      "Priority Placement Network",
      "Custom Skill Benchmarking",
      "Ad-free Experience"
    ],
    button: "Go Pro Now",
    highlight: true
  },
  {
    name: "Team",
    price: "999",
    desc: "For colleges and bootcamp cohorts.",
    features: ["Team Progress Dashboard", "Bulk Resume Exports", "Collaborative Roadmaps", "Dedicated Success Manager"],
    button: "Contact Sales",
    highlight: false
  }
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Simple, Transparent <span className="text-secondary">Pricing.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Choose the plan that fits your ambition. No hidden fees, just pure growth.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {PLANS.map((plan, i) => (
            <div 
              key={i} 
              className={`relative p-10 rounded-[3rem] border transition-all overflow-hidden group ${
                plan.highlight 
                ? "bg-slate-900 border-primary shadow-2xl shadow-primary/20 scale-105 z-10" 
                : "bg-surface/20 border-white/5 hover:border-white/10"
              }`}
            >
              {/* Coming Soon Overlay */}
              <div className="absolute inset-0 z-20 flex items-center justify-center bg-slate-950/20 backdrop-blur-md transition-opacity">
                 <div className="px-8 py-3 bg-slate-900/80 border border-white/10 rounded-full shadow-2xl shadow-black">
                    <span className="text-[10px] font-black text-primary uppercase tracking-[0.3em]">Coming Soon</span>
                 </div>
              </div>

              {/* Blurred Content */}
              <div className="blur-xl select-none pointer-events-none opacity-50">
                {plan.highlight && (
                    <div className="absolute -top-5 left-1/2 -translate-x-1/2 px-6 py-2 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-full shadow-xl">
                    Most Popular
                    </div>
                )}

                <div className="mb-8">
                    <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-white">{plan.name}</h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                    <span className="text-5xl font-black text-white font-display tracking-tighter">₹{plan.price}</span>
                    <span className="text-slate-500 font-bold uppercase text-xs">/month</span>
                    </div>
                    <p className="mt-4 text-slate-400 text-sm leading-relaxed">{plan.desc}</p>
                </div>

                <div className="space-y-4 mb-10">
                    {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center ${plan.highlight ? "bg-primary/20 text-primary" : "bg-white/10 text-slate-500"}`}>
                        <CheckCircle size={12} strokeWidth={4} />
                        </div>
                        {feature}
                    </div>
                    ))}
                </div>

                <div className={`w-full py-5 rounded-2xl font-black text-center transition-all flex items-center justify-center gap-2 ${
                    plan.highlight 
                    ? "bg-gradient-to-r from-primary to-secondary text-white" 
                    : "bg-white/5 text-white border border-white/10"
                    }`}
                >
                    {plan.name === "Free" ? "Get Started" : "Get Notified"}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
