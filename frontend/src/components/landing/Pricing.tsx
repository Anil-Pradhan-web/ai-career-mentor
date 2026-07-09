"use client";

import React from "react";
import { CheckCircle, Zap, Shield } from "lucide-react";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";

const PLANS = [
  {
    id: "free",
    name: "Cloud Sandbox",
    price: "Free",
    period: "forever",
    desc: "Experience-adapted mock interviews and roadmaps on our public sandbox.",
    features: [
      "1 Mock Interview / 7 Days",
      "1 Resume Analysis / 2 Days",
      "1 Learning Roadmap / 5 Days",
      "1 Full Coordinated Analysis / 7 Days",
      "1 LinkedIn Profile Review / Day",
      "1 Market Scrape / Day",
      "2 AI Voice Calls / 3 Days (5 min each)",
      "3 Quizzes / Day"
    ],
    button: "Get Started Free",
    highlight: false,
    themeColor: "#6366f1", // Indigo
    glowColor: "rgba(99, 102, 241, 0.12)",
  },
  {
    id: "self-hosted",
    name: "Self-Hosted Deploy",
    price: "Open-Source",
    period: "free",
    desc: "Run CareerMentor locally or deploy to your own cloud instance with zero limits.",
    features: [
      "Unlimited interview sessions & resumes (No rate limits)",
      "Connect your own LLM keys (Groq, Gemini, NVIDIA NIM)",
      "Fully customized local database storage (SQLite / Postgres)",
      "Deploy to Render or Vercel with 1-click configs",
      "Complete code control (Fork, modify, and run locally)",
      "Fast local embedded ChromaDB queries",
      "Zero server hosting subscription costs",
      "Secure offline processing options"
    ],
    button: "Deploy to GitHub",
    highlight: true,
    themeColor: "#ec4899", // Pink/Purple
    glowColor: "rgba(236, 72, 153, 0.15)",
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
      window.open("https://github.com/Anil-Pradhan-web/ai-career-mentor", "_blank");
    }
  };

  return (
    <section id="pricing" className="py-28 px-6 relative overflow-hidden bg-slate-950">
      {/* Background Glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-secondary/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Header */}
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl sm:text-5xl font-black text-white mb-6 tracking-tight leading-none">
            Simple, Transparent <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">Access</span>
          </h2>
          <p className="text-slate-400 max-w-xl mx-auto text-sm sm:text-base leading-relaxed">
            Access CareerMentor via our hosted sandbox or self-host it on your own server.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {PLANS.map((plan) => {
            const isCurrentFree = plan.id === "free" && isLoggedIn && !isPremium;
            const isCurrentPro = false;
            const isActive = mounted && (isCurrentFree || isCurrentPro);
            
            return (
              <div 
                key={plan.id} 
                className={`group relative p-10 rounded-[2rem] bg-[#070913]/70 border transition-all duration-300 flex flex-col justify-between overflow-hidden ${
                  plan.highlight 
                    ? "border-purple-500/30 hover:border-purple-500/50 shadow-[0_20px_50px_rgba(168,85,247,0.08)]" 
                    : "border-white/[0.06] hover:border-white/10 hover:bg-[#0c0e1a]/95 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
                }`}
                style={{
                  minHeight: "580px"
                }}
              >
                {/* Fully Open Source Top Bar for Self-Hosted */}
                {plan.id === "self-hosted" && (
                  <div className="absolute top-0 left-0 right-0 py-3.5 bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-b border-purple-500/10 text-center">
                    <span className="text-[10px] font-black text-purple-300 uppercase tracking-[0.25em] drop-shadow-[0_0_10px_rgba(168,85,247,0.4)]">
                      ⚡ Fully Open Source ⚡
                    </span>
                  </div>
                )}

                {/* Corner Glow Highlight */}
                <div 
                  className="absolute -right-16 -top-16 w-36 h-36 rounded-full blur-[40px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                  style={{ background: plan.glowColor }}
                />

                <div className={plan.id === "self-hosted" ? "pt-6" : ""}>
                  <div className="mb-8">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold text-white flex items-center gap-2">
                        {plan.id === "self-hosted" && <Zap size={18} className="text-pink-400" />}
                        {plan.name}
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-4xl font-black text-white font-display tracking-tighter">
                        {plan.id === "free" ? "₹0" : "Free"}
                      </span>
                      <span className="text-slate-500 font-bold uppercase text-[10px] tracking-wider">/{plan.period}</span>
                    </div>
                    <p className="mt-4 text-slate-400 text-sm leading-relaxed">{plan.desc}</p>
                  </div>

                  {/* Plan Features */}
                  <div className="space-y-4 mb-10">
                    {plan.features.map((feature, idx) => {
                      const isFiveX = feature.includes("(5x");
                      return (
                        <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-slate-300 font-medium">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                            plan.highlight 
                              ? isFiveX ? "bg-pink-500/10 text-pink-400 border border-pink-500/20" : "bg-purple-500/10 text-purple-400 border border-purple-500/20" 
                              : "bg-white/5 text-slate-500 border border-white/10"
                          }`}>
                            <CheckCircle size={11} strokeWidth={3.5} />
                          </div>
                          <span className={isFiveX ? "text-pink-400 font-semibold" : ""}>{feature}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Plan Action Button */}
                <button
                  onClick={() => handlePlanClick(plan.id)}
                  disabled={isActive}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer ${
                    isActive
                      ? "bg-white/10 text-slate-500 border border-white/5 cursor-not-allowed"
                      : plan.highlight 
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:shadow-[0_0_25px_rgba(99,102,241,0.25)] hover:-translate-y-0.5 border border-white/5" 
                        : "bg-white/5 text-white border border-white/10 hover:bg-white/10 hover:-translate-y-0.5"
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
