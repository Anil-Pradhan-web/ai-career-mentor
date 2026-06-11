"use client";

import React from "react";
import Link from "next/link";
import { ArrowRight, Code, Brain, RefreshCcw, Sparkles } from "lucide-react";
import { toast } from "react-hot-toast";

const COMPANIES = [
  { name: "Google", logo: "/google.svg", filter: "" },
  { name: "Microsoft", logo: "/microsoft.svg", filter: "" },
  { name: "Amazon", logo: "/amazon.svg", filter: "brightness-0 invert" },
  { name: "Meta", logo: "/meta.svg", filter: "" },
  { name: "Netflix", logo: "/netflix.svg", filter: "" },
  { name: "OpenAI", logo: "/openai.svg", filter: "brightness-0 invert" },
  { name: "Salesforce", logo: "/salesforce.svg", filter: "" },
  { name: "Cisco", logo: "/cisco.svg", filter: "brightness-0 invert" },
  { name: "NVIDIA", logo: "/nvidia.svg", filter: "" },
  { name: "JPMorgan", logo: "/jpmorgan.svg", filter: "brightness-0 invert" },
  { name: "Apple", logo: "/apple.svg", filter: "brightness-0 invert" },
  { name: "Dell", logo: "/dell.svg", filter: "brightness-0 invert" },
  { name: "Flipkart", logo: "/flipkart.svg", filter: "" },
  { name: "SAP", logo: "/sap.svg", filter: "" },
  { name: "Spotify", logo: "/spotify.svg", filter: "" }
];

export default function InterviewPrep() {
  const showInterviewToast = () => {
    toast("🤖 Launching interactive mock session", {
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
    <section id="interviews" className="py-24 px-6 relative overflow-hidden bg-[#020617]">
      {/* Custom Animations Styling */}
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes wave-pulse {
          0%, 100% { transform: scaleY(0.3); }
          50% { transform: scaleY(1.0); }
        }
        @keyframes float-prep-1 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-7px) scale(1.02); }
        }
        @keyframes float-prep-2 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-5px) scale(0.99); }
        }
        @keyframes float-prep-3 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-8px) scale(1.01); }
        }
        @keyframes float-prep-4 {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-4px) scale(0.98); }
        }
        .animate-wave-pulse {
          animation: wave-pulse 1.2s ease-in-out infinite;
        }
        .animate-float-prep-1 {
          animation: float-prep-1 4.2s ease-in-out infinite;
        }
        .animate-float-prep-2 {
          animation: float-prep-2 5.2s ease-in-out infinite;
        }
        .animate-float-prep-3 {
          animation: float-prep-3 4.8s ease-in-out infinite;
        }
        .animate-float-prep-4 {
          animation: float-prep-4 3.8s ease-in-out infinite;
        }
      `}} />

      {/* Ambient background glows */}
      <div className="absolute top-1/2 left-1/4 -translate-y-1/2 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute top-1/3 right-1/4 w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-indigo-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* ── Top Part: 2-Column Product Features Section ── */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-8 items-center mb-32">
          
          {/* Left Column: Title, description, feature items, CTA */}
          <div className="lg:col-span-5 text-center lg:text-left flex flex-col items-center lg:items-start">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em] text-violet-400 mb-4 inline-block">
              Interactive AI Interview Simulator
            </span>
            
            <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-white leading-[1.1] mb-6 tracking-tight">
              Master Your{" "}
              <span className="bg-gradient-to-r from-violet-500 via-indigo-400 to-cyan-400 bg-clip-text text-transparent drop-shadow-[0_0_15px_rgba(139,92,246,0.2)]">
                Interviews
              </span>
              ,<br />
              Tailored To Your Resume
            </h2>
            
            <p className="text-slate-400 text-sm sm:text-base leading-relaxed mb-8 max-w-xl">
              Step into simulated rigorous interview sessions. Face custom questions that test your real limits, tailored dynamically to your resume and operational domains of top companies.
            </p>

            {/* Prompt-derived features list */}
            <div className="flex flex-col gap-4 text-left w-full max-w-xl mb-10">
              
              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-violet-500/10 border border-violet-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Brain size={14} className="text-violet-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">
                    Structured 7-Phase Assessment
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Evaluates you across Tech Stack Discovery, CS/ML Fundamentals (concurrency, transaction isolation), LeetCode coding algorithms, Resume Project Deep-Dives, and complex scale System Designs.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0 mt-1">
                  <RefreshCcw size={14} className="text-cyan-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">
                    Adaptive Questioning (Intelligent Recursion)
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    The interviewer adapts on the fly: offering hint structures for incorrect logic, or aggressively digging into optimization and memory constraints when you answer correctly.
                  </p>
                </div>
              </div>

              <div className="flex gap-4 items-start">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center shrink-0 mt-1">
                  <Sparkles size={14} className="text-indigo-400" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">
                    Role-Tailored Interview Personas
                  </h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Face distinct AI personas: a FAANG Senior Staff Engineer focused on clean scale, a startup CTO checking execution speed, or a culture-focused Hiring Manager checking leadership potential.
                  </p>
                </div>
              </div>

            </div>
            
            {/* CTA Button */}
            <Link 
              href="/register" 
              onClick={showInterviewToast}
              className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 hover:shadow-[0_0_35px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all duration-200 group"
            >
              <span>Start Mock Interview</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
            
            {/* Sub-button details */}
            <div className="flex items-center gap-2.5 text-slate-500 text-xs mt-6 font-medium">
              <Code size={14} className="text-violet-400" />
              <span>Powered by WebSockets • Custom Question Pools • Detail Scorecards</span>
            </div>
          </div>
          
          {/* Right Column: Interview image, speech bubbles, active listening widget */}
          <div className="lg:col-span-7 relative flex items-center justify-center min-h-[480px] sm:min-h-[520px]">
            {/* Central Glow behind Avatar */}
            <div className="absolute w-[280px] sm:w-[360px] h-[280px] sm:h-[360px] bg-gradient-to-br from-violet-500/10 via-indigo-500/8 to-cyan-500/10 rounded-full blur-[80px] pointer-events-none scale-110" />
            
            {/* Floating Speech Bubble 1 (Top Left) */}
            <div 
              onClick={showInterviewToast}
              className="absolute top-[8%] left-[-2%] sm:left-[4%] lg:left-[5%] z-20 max-w-[170px] sm:max-w-[220px] px-4 py-3 rounded-2xl bg-[#0b0c16]/80 backdrop-blur-md border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:border-violet-500/20 group cursor-pointer animate-float-prep-1"
            >
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-semibold group-hover:text-white transition-colors">
                Tell me about a project achievement from your resume.
              </p>
            </div>
            
            {/* Floating Speech Bubble 2 (Bottom Left) */}
            <div 
              onClick={showInterviewToast}
              className="absolute bottom-[22%] left-[-8%] sm:left-[0%] lg:left-[0%] z-20 max-w-[170px] sm:max-w-[220px] px-4 py-3 rounded-2xl bg-[#0b0c16]/80 backdrop-blur-md border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:border-violet-500/20 group cursor-pointer animate-float-prep-2"
            >
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-semibold group-hover:text-white transition-colors">
                Explain database transaction isolation levels.
              </p>
            </div>
            
            {/* Floating Speech Bubble 3 (Top Right) */}
            <div 
              onClick={showInterviewToast}
              className="absolute top-[16%] right-[-2%] sm:right-[4%] lg:right-[5%] z-20 max-w-[170px] sm:max-w-[220px] px-4 py-3 rounded-2xl bg-[#0b0c16]/80 backdrop-blur-md border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:border-violet-500/20 group cursor-pointer animate-float-prep-3"
            >
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-semibold group-hover:text-white transition-colors">
                Let's design a movie ticket booking platform.
              </p>
            </div>
            
            {/* Floating Speech Bubble 4 (Bottom Right) */}
            <div 
              onClick={showInterviewToast}
              className="absolute bottom-[18%] right-[-8%] sm:right-[0%] lg:right-[0%] z-20 max-w-[170px] sm:max-w-[220px] px-4 py-3 rounded-2xl bg-[#0b0c16]/80 backdrop-blur-md border border-white/[0.08] shadow-[0_12px_30px_rgba(0,0,0,0.5)] transition-all duration-300 hover:scale-105 hover:border-violet-500/20 group cursor-pointer animate-float-prep-4"
            >
              <p className="text-[11px] sm:text-xs text-slate-300 leading-relaxed font-semibold group-hover:text-white transition-colors">
                How would you solve the Two Sum challenge?
              </p>
            </div>
            
            {/* Interview Avatar Image (Rounded Square Shape) */}
            <div 
              onClick={showInterviewToast}
              className="relative z-10 w-[250px] sm:w-[290px] lg:w-[330px] h-auto rounded-[2rem] overflow-hidden border-2 border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] cursor-pointer select-none hover:scale-[1.03] transition-all duration-300 group"
            >
              {/* Inner Gradient Border Glow */}
              <div className="absolute inset-0 bg-gradient-to-tr from-violet-500/10 via-indigo-500/10 to-cyan-500/10 rounded-[2rem] z-10 pointer-events-none" />
              
              <img 
                src="/interview.png" 
                alt="Interactive AI Interview Interface" 
                className="w-full h-auto object-cover scale-100 group-hover:scale-[1.02] transition-transform duration-500"
              />
            </div>
            
            {/* Active Session Capsule Bar */}
            <div 
              onClick={showInterviewToast}
              className="absolute bottom-[2%] left-1/2 -translate-x-1/2 w-[85%] max-w-[310px] z-30 bg-[#070913]/90 backdrop-blur-2xl border border-cyan-500/20 shadow-[0_15px_35px_rgba(0,0,0,0.7),0_0_20px_rgba(6,182,212,0.08)] rounded-full px-5 py-3 flex items-center justify-between gap-4 cursor-pointer hover:border-cyan-400/40 transition-all duration-300 hover:scale-[1.03]"
            >
              {/* Cyan Terminal/Headset Icon Container */}
              <div className="w-8 h-8 rounded-full bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#22d3ee" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="animate-pulse">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
              
              {/* Cyan Sound Waveform Animation */}
              <div className="flex items-center gap-[3px] h-4 shrink-0">
                <div className="w-[3px] h-3.5 bg-cyan-400 rounded-full animate-wave-pulse origin-center" style={{ animationDelay: '0.1s' }} />
                <div className="w-[3px] h-2 bg-cyan-400 rounded-full animate-wave-pulse origin-center" style={{ animationDelay: '0.35s' }} />
                <div className="w-[3px] h-4.5 bg-cyan-400 rounded-full animate-wave-pulse origin-center" style={{ animationDelay: '0.15s' }} />
                <div className="w-[3px] h-2.5 bg-cyan-400 rounded-full animate-wave-pulse origin-center" style={{ animationDelay: '0.45s' }} />
                <div className="w-[3px] h-4 bg-cyan-400 rounded-full animate-wave-pulse origin-center" style={{ animationDelay: '0.2s' }} />
                <div className="w-[3px] h-1.5 bg-cyan-400 rounded-full animate-wave-pulse origin-center" style={{ animationDelay: '0.3s' }} />
                <div className="w-[3px] h-3 bg-cyan-400 rounded-full animate-wave-pulse origin-center" style={{ animationDelay: '0.5s' }} />
              </div>
              
              {/* Status indicator with pulsing cyan dot */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black tracking-widest text-cyan-400 uppercase">
                  Session Live...
                </span>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400"></span>
                </span>
              </div>
            </div>
            
          </div>
          
        </div>

        {/* ── Bottom Part: Company Logos Grid (Renamed Title) ── */}
        <div className="relative border-t border-white/[0.05] pt-20">
          <div className="text-center mb-16">
            <h3 className="font-display text-2xl sm:text-3xl font-black text-white mb-4 tracking-tight">
              Practice your interview with top tech companies
            </h3>
            <p className="text-slate-400 text-xs sm:text-sm font-medium">
              Simulate questions and formats mapped dynamically to real company roles.
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {COMPANIES.map((company) => (
              <div 
                key={company.name} 
                className="h-24 flex items-center justify-center bg-[#090d16]/30 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-lg border border-white/5 hover:border-violet-500/20 hover:bg-[#090d16]/60 hover:-translate-y-1.5 group"
              >
                <img
                  src={company.logo}
                  alt={company.name}
                  className={`max-h-full max-w-full object-contain group-hover:scale-105 transition-all duration-300 opacity-60 group-hover:opacity-100 ${company.filter}`}
                />
              </div>
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
