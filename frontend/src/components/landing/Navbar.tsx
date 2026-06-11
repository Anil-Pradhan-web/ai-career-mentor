import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 w-full flex justify-center p-6">
      <div className="flex items-center justify-between w-full max-w-7xl px-8 py-4 bg-slate-950/45 backdrop-blur-3xl border border-white/10 rounded-[2rem] shadow-[0_20px_50px_rgba(0,0,0,0.6)] transition-all">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <div className="w-9 h-9 rounded-xl overflow-hidden border border-white/10 group-hover:scale-110 transition-all duration-300 flex items-center justify-center">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <div className="flex flex-col">
            <span className="font-display font-extrabold text-base sm:text-lg text-white tracking-tight leading-none">
              CareerMentor<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">.ai</span>
            </span>
            <span className="text-[7px] sm:text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">
              A Project by Anil Pradhan
            </span>
          </div>
        </Link>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-8">
          {[
            { name: "AI Core Features", href: "#ai-agents" },
            { name: "Demo Terminal", href: "#demo" },
            { name: "Interview Prep", href: "#interviews" },
            { name: "Pricing Plans", href: "#pricing" }
          ].map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all hover:-translate-y-[1px]"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector(link.href)?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              {link.name}
            </Link>
          ))}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 sm:gap-4">
          <Link href="/login" className="hidden sm:block text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-white transition-colors px-4">
            Login
          </Link>
          <Link 
            href="/register" 
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary to-secondary text-white text-[10px] font-black uppercase tracking-widest rounded-xl border border-primary/20 hover:from-primary/95 hover:to-secondary/95 hover:shadow-[0_0_20px_rgba(99,102,241,0.3)] hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
          >
            Get Started <ArrowRight size={14} />
          </Link>
        </div>
      </div>
    </nav>
  );
}

