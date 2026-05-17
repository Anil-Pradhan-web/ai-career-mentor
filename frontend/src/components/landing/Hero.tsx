import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Hero() {
  return (
    <section className="relative pt-40 pb-24 overflow-hidden">
      {/* Background Glows */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[500px] bg-primary/10 blur-[120px] -z-10" />
      
      <div className="max-w-7xl mx-auto px-6 text-center">
        {/* Badge */}
        <div className="flex flex-col items-center gap-4 mb-8 animate-fade-in">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 backdrop-blur-md">
            <span className="text-[10px] font-black text-primary tracking-[0.2em] uppercase">
              Project by Anil Pradhan
            </span>
          </div>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 backdrop-blur-md">
            <Sparkles className="text-secondary" size={16} />
            <span className="text-xs font-bold text-slate-300 tracking-wider uppercase">
              v4.2 Multi-Agent AI Engine Now Live
            </span>
          </div>
        </div>

        {/* Heading */}
        <h1 className="font-display text-6xl md:text-8xl font-black text-white leading-[0.95] mb-8 tracking-tight animate-fade-up">
          Engineer Your Career <br />
          <span className="bg-gradient-to-r from-primary via-secondary to-pink-500 bg-clip-text text-transparent">
            With Agentic Intelligence.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="max-w-2xl mx-auto text-xl text-slate-400 leading-relaxed mb-12 animate-fade-up delay-100">
          Stop guessing your next move. Use professional-grade AI to analyze your skills, 
          simulate interviews with FAANG engineers, and land high-growth roles.
        </p>

        {/* Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-fade-up delay-200">
          <Link 
            href="/register" 
            className="w-full sm:w-auto px-10 py-5 bg-gradient-to-r from-primary to-secondary text-white text-lg font-black rounded-2xl shadow-2xl shadow-primary/30 hover:shadow-primary/40 hover:-translate-y-1 transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            Launch Career OS <ArrowRight size={22} />
          </Link>
        </div>

        {/* Powered by Elite Models Banner */}
        <div className="mt-20 pt-10 border-t border-white/5 animate-fade-up delay-300">
          <p className="text-[10px] font-black text-slate-500 tracking-[0.25em] uppercase mb-8">
            Powering Your Intelligence With Elite AI Models
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 md:gap-12">
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md hover:border-[#76B900]/40 transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-[#76B900] shadow-[0_0_12px_#76B900]" />
              <span className="text-xs font-black text-white tracking-widest uppercase font-mono">NVIDIA AI</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md hover:border-[#F55036]/40 transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-[#F55036] shadow-[0_0_12px_#F55036]" />
              <span className="text-xs font-black text-white tracking-widest uppercase font-mono">GROQ SPEED</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 border border-white/10 px-6 py-3 rounded-2xl shadow-xl backdrop-blur-md hover:border-[#4285F4]/40 transition-colors">
              <span className="w-2.5 h-2.5 rounded-full bg-[#4285F4] shadow-[0_0_12px_#4285F4]" />
              <span className="text-xs font-black text-white tracking-widest uppercase font-mono">GOOGLE GEMINI</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
