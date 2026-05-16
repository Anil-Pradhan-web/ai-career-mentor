import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function CTA() {
  return (
    <section className="py-24 px-6">
      <div className="max-w-7xl mx-auto rounded-[3.5rem] bg-gradient-to-br from-primary via-secondary to-pink-500 p-1 lg:p-2 shadow-2xl shadow-primary/20">
        <div className="bg-slate-950 rounded-[3rem] px-8 py-20 lg:py-32 text-center relative overflow-hidden">
          {/* Decorative Circles */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] -z-10" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 blur-[100px] -z-10" />

          <Sparkles className="text-primary mx-auto mb-8 animate-pulse" size={48} />
          
          <h2 className="font-display text-4xl lg:text-7xl font-black text-white mb-10 tracking-tight max-w-4xl mx-auto leading-[0.95]">
            Ready to secure your <br />
            <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              dream placement?
            </span>
          </h2>
          
          <p className="text-xl text-slate-400 mb-12 max-w-xl mx-auto">
            Join 20,000+ developers using Career AI to outpace the market and land roles at global tech giants.
          </p>

          <Link 
            href="/register" 
            className="inline-flex items-center gap-3 px-12 py-6 bg-white text-slate-950 text-xl font-black rounded-2xl hover:bg-slate-100 hover:-translate-y-1 transition-all active:scale-95 shadow-xl"
          >
            Get Early Access <ArrowRight size={24} />
          </Link>
        </div>
      </div>
    </section>
  );
}
