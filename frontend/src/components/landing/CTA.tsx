import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-20 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="relative rounded-3xl overflow-hidden border border-white/5">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f1629] via-[#0a0e1a] to-[#0f1629]" />
          <div className="absolute top-0 left-1/3 w-[400px] h-[400px] bg-primary/8 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 right-1/4 w-[300px] h-[300px] bg-secondary/8 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative flex flex-col md:flex-row items-center justify-between gap-8 px-10 py-14 sm:px-16 sm:py-16">
            {/* Left Side */}
            <div className="flex items-start gap-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shrink-0 shadow-[0_0_30px_rgba(99,102,241,0.25)]">
                <Sparkles className="text-white" size={24} />
              </div>
              <div>
                <h3 className="font-display text-2xl sm:text-3xl font-black text-white tracking-tight mb-2">
                  Ready to Accelerate Your Career?
                </h3>
                <p className="text-slate-400 text-sm max-w-lg leading-relaxed">
                  Join developers who are using CareerMentor to target roles at tech leaders.
                </p>
              </div>
            </div>

            {/* Right Side: CTA Button */}
            <Link 
              href="/register" 
              className="shrink-0 px-8 py-4 bg-gradient-to-r from-primary to-secondary text-white text-xs font-black uppercase tracking-widest rounded-xl border border-white/10 hover:shadow-[0_0_30px_rgba(99,102,241,0.4)] hover:-translate-y-0.5 transition-all duration-200 flex items-center gap-2 group whitespace-nowrap"
            >
              <span>Get Started Now</span>
              <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
