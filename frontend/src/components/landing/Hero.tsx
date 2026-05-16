import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles, Shield } from "lucide-react";

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
      </div>
    </section>
  );
}
