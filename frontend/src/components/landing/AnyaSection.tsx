"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "react-hot-toast";

export default function AnyaSection() {
  const showAnyaToast = () => {
    toast("📞 Call with your personal agent", {
      position: "bottom-center",
      style: {
        background: "#0f172a",
        color: "#ffffff",
        border: "1px solid rgba(99, 102, 241, 0.2)",
        fontSize: "14px",
        fontWeight: "500",
        borderRadius: "12px",
        padding: "12px 20px",
        boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.5)"
      }
    });
  };

  return (
    <section className="py-24 px-6 relative overflow-hidden bg-slate-950">
      {/* Custom Animations Styling */}
      <style dangerouslySetInnerHTML={{__html: `
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

      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-purple-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-pink-500/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center">
          
          {/* Left Column: Title, description, CTA */}
          <div className="lg:col-span-5 text-center lg:text-left flex flex-col items-center lg:items-start">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-pink-500 mb-4 inline-block">
              Real-time AI Voice Assistant
            </span>
            
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Talk to{" "}
              <span className="bg-gradient-to-r from-pink-500 via-purple-400 to-indigo-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(236,72,153,0.2)]">
                Anya
              </span>
              ,<br />
              Your AI Career Coach
            </h2>
            
            <p className="text-slate-400 text-sm sm:text-base lg:text-lg leading-relaxed mb-10 max-w-xl">
              Have natural conversations, clear your doubts, and get personalized career guidance in real-time voice calls.
            </p>
            
            {/* CTA Button */}
            <Link 
              href="/register" 
              onClick={showAnyaToast}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 hover:shadow-[0_0_35px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <span>Try Voice Assistant</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            
            {/* Sub-button details */}
            <div className="flex items-center gap-2.5 text-slate-500 text-xs mt-6 font-medium">
              {/* Custom SVG Soundwave Icon */}
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-pink-500/80">
                <path d="M12 2v20M17 5v14M22 9v6M7 5v14M2 9v6" />
              </svg>
              <span>Real-time Voice Engine • Low Latency • Human-like Conversations</span>
            </div>
          </div>
          
          {/* Right Column: Anya image, speech bubbles, active listening widget */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[480px] sm:min-h-[520px]">
            {/* Central Glow behind Avatar */}
            <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] bg-gradient-to-br from-pink-500/10 via-purple-500/8 to-indigo-500/10 rounded-full blur-[80px] pointer-events-none scale-110" />
            
            {/* Floating Speech Bubble 1 (Top Left) */}
            <div 
              onClick={showAnyaToast}
              className="absolute top-[8%] left-[-2%] sm:left-[4%] lg:left-[5%] z-20 max-w-[170px] sm:max-w-[210px] px-4 py-3 rounded-2xl bg-[#0b0c16]/80 backdrop-blur-md border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:border-pink-500/20 group cursor-pointer animate-float-1"
            >
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-semibold group-hover:text-white transition-colors">
                Kya aapka resume ATS friendly hai?
              </p>
            </div>
            
            {/* Floating Speech Bubble 2 (Bottom Left) */}
            <div 
              onClick={showAnyaToast}
              className="absolute bottom-[22%] left-[-8%] sm:left-[0%] lg:left-[0%] z-20 max-w-[170px] sm:max-w-[210px] px-4 py-3 rounded-2xl bg-[#0b0c16]/80 backdrop-blur-md border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:border-pink-500/20 group cursor-pointer animate-float-2"
            >
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-semibold group-hover:text-white transition-colors">
                Mujhe DSA kaise strong karna chahiye?
              </p>
            </div>
            
            {/* Floating Speech Bubble 3 (Top Right) */}
            <div 
              onClick={showAnyaToast}
              className="absolute top-[16%] right-[-2%] sm:right-[4%] lg:right-[5%] z-20 max-w-[170px] sm:max-w-[210px] px-4 py-3 rounded-2xl bg-[#0b0c16]/80 backdrop-blur-md border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:border-pink-500/20 group cursor-pointer animate-float-3"
            >
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-semibold group-hover:text-white transition-colors">
                System Design ka roadmap batao na.
              </p>
            </div>
            
            {/* Floating Speech Bubble 4 (Bottom Right) */}
            <div 
              onClick={showAnyaToast}
              className="absolute bottom-[18%] right-[-8%] sm:right-[0%] lg:right-[0%] z-20 max-w-[170px] sm:max-w-[210px] px-4 py-3 rounded-2xl bg-[#0b0c16]/80 backdrop-blur-md border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:border-pink-500/20 group cursor-pointer animate-float-4"
            >
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-semibold group-hover:text-white transition-colors">
                Interview ke liye kaise prepare karu?
              </p>
            </div>
            
            {/* Anya Avatar Image (Rounded Square Shape) */}
            <div 
              onClick={showAnyaToast}
              className="relative z-10 w-[250px] sm:w-[290px] lg:w-[330px] h-auto rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer select-none hover:scale-[1.03] transition-all duration-300 group"
            >
              {/* Inner Gradient Border Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-pink-500/10 via-purple-500/10 to-indigo-500/10 rounded-[2rem] z-10 pointer-events-none" />
              
              <img 
                src="/anya.png" 
                alt="Anya AI Career Coach Avatar" 
                className="w-full h-auto object-cover scale-100 group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
            
            {/* Active Listening Capsule Bar */}
            <div 
              onClick={showAnyaToast}
              className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[85%] max-w-[310px] z-30 bg-[#070913]/90 backdrop-blur-2xl border border-emerald-500/20 shadow-[0_15px_35px_rgba(0,0,0,0.7),0_0_20px_rgba(16,185,129,0.08)] rounded-full px-5 py-3 flex items-center justify-between gap-4 cursor-pointer hover:border-emerald-400/40 transition-all duration-300 hover:scale-[1.03]"
            >
              {/* Green Microphone Icon Container */}
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                  <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                  <line x1="12" y1="19" x2="12" y2="22" />
                </svg>
              </div>
              
              {/* Green Sound Waveform Animation */}
              <div className="flex items-center gap-[3px] h-4 shrink-0">
                <div className="w-[3px] h-3.5 bg-emerald-400 rounded-full animate-soundwave origin-center" style={{ animationDelay: '0.1s' }} />
                <div className="w-[3px] h-2 bg-emerald-400 rounded-full animate-soundwave origin-center" style={{ animationDelay: '0.35s' }} />
                <div className="w-[3px] h-4.5 bg-emerald-400 rounded-full animate-soundwave origin-center" style={{ animationDelay: '0.15s' }} />
                <div className="w-[3px] h-2.5 bg-emerald-400 rounded-full animate-soundwave origin-center" style={{ animationDelay: '0.45s' }} />
                <div className="w-[3px] h-4 bg-emerald-400 rounded-full animate-soundwave origin-center" style={{ animationDelay: '0.2s' }} />
                <div className="w-[3px] h-1.5 bg-emerald-400 rounded-full animate-soundwave origin-center" style={{ animationDelay: '0.3s' }} />
                <div className="w-[3px] h-3 bg-emerald-400 rounded-full animate-soundwave origin-center" style={{ animationDelay: '0.5s' }} />
              </div>
              
              {/* Status indicator with pulsing green dot */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-emerald-400 uppercase">
                  Listening...
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
                </span>
              </div>
            </div>
            
          </div>
          
        </div>
      </div>
    </section>
  );
}
