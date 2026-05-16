import React from "react";
import Link from "next/link";
import { ArrowRight, Sparkles } from "lucide-react";

export default function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-center p-6">
      <div className="flex items-center justify-between w-full max-w-7xl px-8 py-4 bg-surface/30 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-2xl">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 no-underline group">
          <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10 group-hover:scale-110 transition-transform">
            <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
          </div>
          <span className="font-display font-extrabold text-xl text-white tracking-tight">
            CareerMentor<span className="text-primary">.ai</span>
          </span>
        </Link>

        {/* Links */}
        <div className="hidden lg:flex items-center gap-8">
          {[
            { name: "Features", href: "#ai-agents" },
            { name: "Showcase", href: "#demo" },
            { name: "Placements", href: "#placements" },
            { name: "Pricing", href: "#pricing" }
          ].map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className="text-sm font-bold text-slate-400 hover:text-white transition-all hover:scale-105 active:scale-95"
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
          <Link href="/login" className="hidden sm:block text-sm font-bold text-white hover:text-primary transition-colors px-4">
            Login
          </Link>
          <Link 
            href="/register" 
            className="flex items-center gap-2 px-5 py-2.5 sm:px-7 sm:py-3.5 bg-gradient-to-r from-primary to-secondary text-white text-xs sm:text-sm font-black rounded-xl sm:rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all active:scale-95 whitespace-nowrap"
          >
            Get Started <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </nav>
  );
}
