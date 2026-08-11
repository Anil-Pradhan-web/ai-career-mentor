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
    color: "var(--brand)",
  },
  {
    id: "pro",
    name: "Premium Pro",
    price: "299 ($3.59)",
    period: "month",
    desc: "Get 5x limits across every agent for high-intensity prep.",
    features: [
      "5 Mock Interviews / 7 Days (5x Limit)",
      "5 Resume Analyses / 2 Days (5x Limit)",
      "5 Learning Roadmaps / 5 Days (5x Limit)",
      "5 Full Coordinated Analyses / 7 Days (5x Limit)",
      "5 LinkedIn Profile Reviews / Day (5x Limit)",
      "5 Market Scrapes / Day (5x Limit)",
      "10 AI Voice Calls / 3 Days · 10 min each (5x Limit)",
      "15 Quizzes / Day (5x Limit)",
      "Interactive Coding Sandbox & Live Debugger",
      "Company-Specific Simulation (FAANG/Tier 1 Prep)",
      "Recruiter Search SEO Headline Optimization",
      "Daily Curated Job-Matching Scraper Alerts",
      "Priority API Routing (Zero Wait Latencies)",
      "Premium Anya Live Voice Persona Options"
    ],
    button: "Upgrade to Pro",
    highlight: true,
    color: "var(--accent-purple)",
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
      toast("The Premium Pro tier is currently under development. Coming soon!", {
        icon: "⚡",
        duration: 5000,
        style: {
          background: "#0a0a0a",
          color: "#ededed",
          border: "1px solid rgba(139, 92, 246, 0.2)",
          borderRadius: "12px",
        }
      });
    }
  };

  return (
    <section id="pricing" className="py-28 px-6 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <div className="absolute pointer-events-none" style={{ top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "600px", height: "600px", background: "radial-gradient(circle, rgba(59,130,246,0.04) 0%, transparent 70%)", filter: "blur(140px)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-20">
          <h2 className="font-display text-4xl sm:text-5xl font-black mb-6 tracking-tight leading-none" style={{ color: "var(--fg-primary)" }}>
            Simple, Transparent <span className="gradient-text">Pricing</span>
          </h2>
          <p className="max-w-xl mx-auto text-sm sm:text-base leading-relaxed" style={{ color: "var(--fg-secondary)" }}>
            Choose the plan that fits your ambition. Unlock 5x capability with Pro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-stretch">
          {PLANS.map((plan) => {
            const isCurrentFree = plan.id === "free" && isLoggedIn && !isPremium;
            const isCurrentPro = false;
            const isActive = mounted && (isCurrentFree || isCurrentPro);

            return (
              <div
                key={plan.id}
                className="group relative p-10 transition-all duration-300 flex flex-col justify-between overflow-hidden"
                style={{
                  borderRadius: "var(--radius-2xl)",
                  background: "var(--bg-card)",
                  border: plan.highlight ? "1px solid rgba(139,92,246,0.3)" : "1px solid var(--border-default)",
                  minHeight: "580px"
                }}
              >
                {plan.id === "pro" && (
                  <div className="absolute top-0 left-0 right-0 py-3.5 text-center" style={{
                    background: "linear-gradient(135deg, rgba(139,92,246,0.12), rgba(236,72,153,0.08))",
                    borderBottom: "1px solid rgba(139,92,246,0.1)"
                  }}>
                    <span className="text-[10px] font-black uppercase tracking-[0.25em]" style={{ color: "var(--accent-purple)" }}>
                      ⚡ Coming Soon ⚡
                    </span>
                  </div>
                )}

                <div className={plan.id === "pro" ? "pt-6" : ""}>
                  <div className="mb-8">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="text-xl font-bold flex items-center gap-2" style={{ color: "var(--fg-primary)" }}>
                        {plan.id === "pro" && <Zap size={18} style={{ color: "var(--accent-purple)" }} />}
                        {plan.name}
                      </h3>
                    </div>
                    <div className="flex items-baseline gap-1 mt-4">
                      <span className="text-4xl font-black font-display tracking-tighter" style={{ color: "var(--fg-primary)" }}>
                        {plan.id === "free" ? "₹0" : "₹299 ($3.59)"}
                      </span>
                      <span className="font-bold uppercase text-[10px] tracking-wider" style={{ color: "var(--fg-muted)" }}>/{plan.period}</span>
                    </div>
                    <p className="mt-4 text-sm leading-relaxed" style={{ color: "var(--fg-secondary)" }}>{plan.desc}</p>
                  </div>

                  <div className="space-y-4 mb-10">
                    {plan.features.map((feature, idx) => {
                      const isFiveX = feature.includes("(5x");
                      return (
                        <div key={idx} className="flex items-start gap-3 text-xs sm:text-sm font-medium" style={{ color: "var(--fg-secondary)" }}>
                          <div className="w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5" style={{
                            background: plan.highlight
                              ? isFiveX ? "rgba(236,72,153,0.08)" : "rgba(139,92,246,0.08)"
                              : "rgba(255,255,255,0.04)",
                            border: plan.highlight
                              ? isFiveX ? "1px solid rgba(236,72,153,0.15)" : "1px solid rgba(139,92,246,0.15)"
                              : "1px solid var(--border-default)",
                            color: plan.highlight
                              ? isFiveX ? "var(--accent-rose)" : "var(--accent-purple)"
                              : "var(--fg-muted)"
                          }}>
                            <CheckCircle size={11} strokeWidth={3.5} />
                          </div>
                          <span className={isFiveX ? "font-semibold" : ""} style={{ color: isFiveX ? "var(--accent-rose)" : undefined }}>{feature}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <button
                  onClick={() => handlePlanClick(plan.id)}
                  disabled={isActive}
                  className="w-full py-4 rounded-2xl font-black text-xs uppercase tracking-wider text-center transition-all duration-300 flex items-center justify-center gap-2 cursor-pointer"
                  style={{
                    background: isActive
                      ? "var(--bg-muted)"
                      : plan.highlight
                        ? "var(--brand-gradient)"
                        : "var(--bg-surface)",
                    color: isActive
                      ? "var(--fg-muted)"
                      : "var(--fg-primary)",
                    border: isActive
                      ? "1px solid var(--border-subtle)"
                      : plan.highlight
                        ? "1px solid rgba(59,130,246,0.2)"
                        : "1px solid var(--border-default)",
                    cursor: isActive ? "not-allowed" : "pointer",
                    opacity: isActive ? 0.6 : 1
                  }}
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
