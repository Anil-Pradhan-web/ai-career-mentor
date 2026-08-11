"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AnyaSection() {
  const showAnyaToast = () => {
    toast("Call with your personal agent", {
      position: "bottom-center",
      style: {
        background: "#0a0a0a",
        color: "#ededed",
        border: "1px solid rgba(59, 130, 246, 0.2)",
        fontSize: "14px",
        fontWeight: "500",
        borderRadius: "12px",
        padding: "12px 20px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
      }
    });
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden" style={{ background: "var(--bg-base)" }}>
      <style dangerouslySetInnerHTML={{
        __html: `
        @keyframes soundwave {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1.0); }
        }
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.02); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(0.99); }
        }
        @keyframes float-3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-7px) scale(1.01); }
        }
        @keyframes float-4 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(0.98); }
        }
        .animate-soundwave {
          animation: soundwave 1.2s ease-in-out infinite;
        }
        .animate-float-1 {
          animation: float-1 4.5s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-2 5.5s ease-in-out infinite;
        }
        .animate-float-3 {
          animation: float-3 5.0s ease-in-out infinite;
        }
        .animate-float-4 {
          animation: float-4 4.0s ease-in-out infinite;
        }
      `}} />

      <div className="absolute pointer-events-none" style={{ top: "50%", left: "25%", transform: "translateY(-50%)", width: "500px", height: "500px", background: "radial-gradient(circle, rgba(236,72,153,0.04) 0%, transparent 70%)", filter: "blur(130px)" }} />
      <div className="absolute pointer-events-none" style={{ top: "33%", right: "25%", width: "400px", height: "400px", background: "radial-gradient(circle, rgba(139,92,246,0.04) 0%, transparent 70%)", filter: "blur(110px)" }} />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          {/* Left Column */}
          <div className="lg:col-span-5 text-center lg:text-left flex flex-col items-center lg:items-start">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] mb-4 inline-block" style={{ color: "var(--accent-rose)" }}>
              Real-time AI Voice Assistant
            </span>

            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] mb-6 tracking-tight" style={{ color: "var(--fg-primary)" }}>
              Talk to{" "}
              <span className="gradient-text">
                Anya
              </span>
              ,<br />
              Your AI Career Coach
            </h2>

            <p className="text-sm sm:text-base lg:text-lg leading-relaxed mb-10 max-w-xl" style={{ color: "var(--fg-secondary)" }}>
              Have natural conversations, clear your doubts, and get personalized career guidance in real-time voice calls.
            </p>

            <Link
              href="/register"
              onClick={showAnyaToast}
              className="btn btn-primary inline-flex items-center gap-3"
              style={{ padding: "16px 32px", fontSize: "0.75rem", fontWeight: 800, letterSpacing: "0.08em", textTransform: "uppercase" }}
            >
              <span>Try Voice Assistant</span>
              <ArrowRight size={14} />
            </Link>

            <div className="flex items-center gap-2.5 text-xs mt-6 font-medium" style={{ color: "var(--fg-muted)" }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{ color: "var(--accent-rose)", opacity: 0.8 }}>
                <path d="M12 2v20M17 5v14M22 9v6M7 5v14M2 9v6" />
              </svg>
              <span>Real-time Voice Engine • Low Latency • Human-like Conversations</span>
            </div>
          </div>

          {/* Right Column */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[480px] sm:min-h-[520px]">
            <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] pointer-events-none scale-110" style={{
              background: "radial-gradient(circle, rgba(236,72,153,0.08) 0%, transparent 70%)",
              filter: "blur(80px)"
            }} />

            {/* Floating Bubbles */}
            <div onClick={showAnyaToast} className="absolute top-[8%] left-[-2%] sm:left-[4%] lg:left-[5%] z-20 max-w-[170px] sm:max-w-[210px] px-4 py-3 rounded-2xl backdrop-blur-md cursor-pointer animate-float-1 transition-all duration-300 hover:scale-105" style={{
              background: "rgba(10,10,10,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)"
            }}>
              <p className="text-[11px] sm:text-xs leading-relaxed font-semibold" style={{ color: "var(--fg-secondary)" }}>
                Mera resume mein aur kya improve kar sakta hu?
              </p>
            </div>

            <div onClick={showAnyaToast} className="absolute bottom-[22%] left-[-8%] sm:left-[0%] lg:left-[0%] z-20 max-w-[170px] sm:max-w-[210px] px-4 py-3 rounded-2xl backdrop-blur-md cursor-pointer animate-float-2 transition-all duration-300 hover:scale-105" style={{
              background: "rgba(10,10,10,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)"
            }}>
              <p className="text-[11px] sm:text-xs leading-relaxed font-semibold" style={{ color: "var(--fg-secondary)" }}>
                Mujhe DSA kaise strong karna chahiye?
              </p>
            </div>

            <div onClick={showAnyaToast} className="absolute top-[16%] right-[-2%] sm:right-[4%] lg:right-[5%] z-20 max-w-[170px] sm:max-w-[210px] px-4 py-3 rounded-2xl backdrop-blur-md cursor-pointer animate-float-3 transition-all duration-300 hover:scale-105" style={{
              background: "rgba(10,10,10,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)"
            }}>
              <p className="text-[11px] sm:text-xs leading-relaxed font-semibold" style={{ color: "var(--fg-secondary)" }}>
                System Design kahan se padhne se acha rhega?.
              </p>
            </div>

            <div onClick={showAnyaToast} className="absolute bottom-[18%] right-[-8%] sm:right-[0%] lg:right-[0%] z-20 max-w-[170px] sm:max-w-[210px] px-4 py-3 rounded-2xl backdrop-blur-md cursor-pointer animate-float-4 transition-all duration-300 hover:scale-105" style={{
              background: "rgba(10,10,10,0.8)",
              border: "1px solid rgba(255,255,255,0.06)",
              boxShadow: "0 12px 30px rgba(0,0,0,0.5)"
            }}>
              <p className="text-[11px] sm:text-xs leading-relaxed font-semibold" style={{ color: "var(--fg-secondary)" }}>
                Interview ke liye kese prepare karu?
              </p>
            </div>

            {/* Anya Image */}
            <div onClick={showAnyaToast} className="relative z-10 w-[250px] sm:w-[290px] lg:w-[330px] h-auto rounded-[2rem] overflow-hidden cursor-pointer select-none hover:scale-[1.03] transition-all duration-300 group" style={{
              border: "2px solid rgba(255,255,255,0.08)",
              boxShadow: "0 20px 50px rgba(0,0,0,0.5)"
            }}>
              <div className="absolute inset-0 rounded-[2rem] z-10 pointer-events-none" style={{
                background: "linear-gradient(135deg, rgba(236,72,153,0.08), rgba(139,92,246,0.08))"
              }} />
              <img
                src="/anya.png"
                alt="Anya AI Career Coach Avatar"
                className="w-full h-auto object-cover scale-100 group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>

            {/* Listening Bar */}
            <div onClick={showAnyaToast} className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[85%] max-w-[310px] z-30 backdrop-blur-2xl rounded-full px-5 py-3 flex items-center justify-between gap-4 cursor-pointer transition-all duration-300 hover:scale-[1.03]" style={{
              background: "rgba(10,10,10,0.9)",
              border: "1px solid rgba(16,185,129,0.2)",
              boxShadow: "0 15px 35px rgba(0,0,0,0.7)"
            }}>
              <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0" style={{
                background: "rgba(16,185,129,0.08)",
                border: "1px solid rgba(16,185,129,0.15)"
              }}>
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="var(--accent-emerald)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </div>

              <div className="flex items-center gap-[3px] h-4 shrink-0">
                <div className="w-[3px] h-3.5 rounded-full animate-soundwave origin-center" style={{ background: "var(--accent-emerald)", animationDelay: '0.1s' }} />
                <div className="w-[3px] h-2 rounded-full animate-soundwave origin-center" style={{ background: "var(--accent-emerald)", animationDelay: '0.35s' }} />
                <div className="w-[3px] h-4.5 rounded-full animate-soundwave origin-center" style={{ background: "var(--accent-emerald)", animationDelay: '0.15s' }} />
                <div className="w-[3px] h-2.5 rounded-full animate-soundwave origin-center" style={{ background: "var(--accent-emerald)", animationDelay: '0.45s' }} />
                <div className="w-[3px] h-4 rounded-full animate-soundwave origin-center" style={{ background: "var(--accent-emerald)", animationDelay: '0.2s' }} />
                <div className="w-[3px] h-1.5 rounded-full animate-soundwave origin-center" style={{ background: "var(--accent-emerald)", animationDelay: '0.3s' }} />
                <div className="w-[3px] h-3 rounded-full animate-soundwave origin-center" style={{ background: "var(--accent-emerald)", animationDelay: '0.5s' }} />
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest uppercase" style={{ color: "var(--accent-emerald)" }}>
                  Listening...
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" style={{ background: "var(--accent-emerald)" }}></span>
                  <span className="relative inline-flex rounded-full h-2 w-2" style={{ background: "var(--accent-emerald)" }}></span>
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
