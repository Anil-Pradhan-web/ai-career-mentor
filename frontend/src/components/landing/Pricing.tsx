"use client";

import React from "react";
import { CheckCircle, Zap, Shield } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "free",
    name: "Free Tier",
    price: "0",
    period: "forever",
    desc: "Foundational AI assistance to kickstart your career transition.",
    features: [
      "1 Mock Interview / 2 Days",
      "3 Resume Analyses / Day",
      "1 Learning Roadmap / Day",
      "1 Full Coordinated Analysis / 2 Days",
      "4 LinkedIn Profile Reviews / Day",
      "3 Market Intelligence Queries / Day",
      "2 AI Voice Calls / Day (5 min each)",
      "3 Weekly Quizzes / Day"
    ],
    button: "Get Started Free",
    highlight: false
  },
  {
    id: "pro",
    name: "Premium Pro",
    price: "149",
    period: "month",
    desc: "Get 10x limits across every agent for high-intensity prep.",
    features: [
      "10 Mock Interviews / Day (10x Limits)",
      "30 Resume Analyses / Day (10x Limits)",
      "10 Learning Roadmaps / Day (10x Limits)",
      "10 Full Coordinated Analyses / Day (10x Limits)",
      "40 LinkedIn Profile Reviews / Day (10x Limits)",
      "30 Market Intelligence Queries / Day (10x Limits)",
      "20 AI Voice Calls / Day · 10 min each (10x Limits)",
      "30 Weekly Quizzes / Day (10x Limits)",
      "Priority API Execution & Zero Wait Time",
      "Extended RAG Context & In-Depth Analytics"
    ],
    button: "Upgrade to Pro",
    highlight: true
  }
];

export default function Pricing() {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [isLoggedIn, setIsLoggedIn] = React.useState(false);
  const [isPremium, setIsPremium] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
    setIsLoggedIn(!!localStorage.getItem("token"));
    setIsPremium(localStorage.getItem("user_tier") === "premium");
  }, []);

  const handlePlanClick = (planId: string) => {
    if (planId === "free") {
      if (isLoggedIn) {
        router.push("/dashboard");
      } else {
        router.push("/register");
      }
    } else {
      // Premium Pro
      toast("🚧 The Premium Pro tier is currently under development. Coming soon!", {
        icon: "⚡",
        duration: 5000,
      });
    }
  };

  return (
    <section id="pricing" className="py-24 px-6 relative overflow-hidden">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 blur-[120px] -z-10" />
      
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-6 tracking-tight">
            Simple, Transparent <span className="text-secondary">Pricing.</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto">
            Choose the plan that fits your ambition. Unlock 10x capability with Pro.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
          {PLANS.map((plan) => {
            const isCurrentFree = plan.id === "free" && isLoggedIn && !isPremium;
            const isCurrentPro = false; // Pro plan is never marked active (coming soon)
            const isActive = mounted && (isCurrentFree || isCurrentPro);
            
            return (
              <div 
                key={plan.id} 
                className={`relative p-10 rounded-[3rem] border transition-all duration-300 overflow-hidden group flex flex-col justify-between ${
                  plan.highlight 
                  ? "bg-slate-900/80 border-primary shadow-2xl shadow-primary/20 scale-105 z-10 pt-16" 
                  : "bg-surface/20 border-white/5 hover:border-white/10 hover:bg-surface/30"
                }`}
                style={{
                  minHeight: "580px"
                }}
              >
                {plan.id === "pro" && (
                  <div className="absolute top-0 left-0 right-0 py-3 bg-gradient-to-r from-purple-600/30 to-pink-600/30 border-b border-purple-500/20 text-center">
                    <span className="text-[11px] font-black text-purple-300 uppercase tracking-[0.3em] drop-shadow-[0_0_10px_rgba(168,85,247,0.5)]">
                      ⚡ COMING SOON ⚡
                    </span>
                  </div>
                )}

                <div>
                  <div className="mb-8">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {plan.id === "pro" && <Zap size={18} className="text-secondary" />}
                        {plan.name}
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-black text-white font-display tracking-tighter">₹{plan.price}</span>
                      <span className="text-slate-500 font-bold uppercase text-xs">/{plan.period}</span>
                    </div>
                    <p className="mt-4 text-slate-400 text-sm leading-relaxed">{plan.desc}</p>
                  </div>

                  <div className="space-y-4 mb-10">
                    {plan.features.map((feature, idx) => {
                      const isTenX = feature.includes("(10x");
                      return (
                        <div key={idx} className="flex items-center gap-3 text-sm text-slate-300 font-medium">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${
                            plan.highlight 
                              ? isTenX ? "bg-secondary/20 text-secondary" : "bg-primary/20 text-primary" 
                              : "bg-white/10 text-slate-500"
                          }`}>
                            <CheckCircle size={12} strokeWidth={4} />
                          </div>
                          <span className={isTenX ? "text-secondary font-semibold" : ""}>{feature}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handlePlanClick(plan.id)}
                  disabled={isActive}
                  className={`w-full py-5 rounded-2xl font-black text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    isActive
                    ? "bg-white/10 text-slate-500 border border-white/5 cursor-not-allowed"
                    : plan.highlight 
                      ? "bg-gradient-to-r from-primary to-secondary text-white hover:brightness-110 shadow-lg shadow-primary/20 transform hover:-translate-y-1" 
                      : "bg-white/5 text-white border border-white/10 hover:bg-white/10 transform hover:-translate-y-1"
                  }`}
                >
                  {isActive ? (
                    <span className="flex items-center gap-2">
                      <Shield size={14} /> Active Plan
                    </span>
                  ) : (
                    plan.button
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
