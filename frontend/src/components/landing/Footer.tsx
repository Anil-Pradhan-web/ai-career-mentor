import React from "react";
import Link from "next/link";
import { Sparkles } from "lucide-react";

export default function Footer() {
  return (
    <footer className="py-24 px-6 border-t border-white/5 bg-slate-950">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row justify-between items-start gap-16">
        <div className="max-w-sm">
          <Link href="/" className="flex items-center gap-3 no-underline mb-6 group">
            <div className="w-8 h-8 rounded-lg overflow-hidden border border-white/10 flex items-center justify-center">
              <img src="/logo.png" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <div className="flex flex-col">
              <span className="font-display font-extrabold text-base text-white tracking-tight leading-none">
                CareerMentor<span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">.ai</span>
              </span>
              <span className="text-[8px] text-slate-500 font-bold uppercase tracking-widest mt-1">
                A Project by Anil Pradhan
              </span>
            </div>
          </Link>
          <p className="text-xs text-slate-500 leading-relaxed mb-8">
            The world&apos;s first multi-agent career operating system. Providing decentralized autonomous workflows to maximize professional talent profiles.
          </p>
          <div className="flex gap-4">
             {["Twitter", "Discord", "LinkedIn", "GitHub"].map(social => (
               <Link key={social} href="#" className="text-[10px] font-black uppercase tracking-widest text-slate-600 hover:text-white transition-colors">{social}</Link>
             ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-12 sm:gap-20">
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">Infrastructure</h4>
            <div className="flex flex-col gap-4 text-xs font-bold text-slate-500">
              <Link href="#ai-agents" className="hover:text-white transition-colors">AI Core Agents</Link>
              <Link href="#demo" className="hover:text-white transition-colors">Demo Terminal</Link>
              <Link href="#pricing" className="hover:text-white transition-colors">Subscription Models</Link>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">Company & Compliance</h4>
            <div className="flex flex-col gap-4 text-xs font-bold text-slate-500">
              <Link href="#" className="hover:text-white transition-colors">Status SLA</Link>
              <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
              <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            </div>
          </div>
          <div>
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white mb-6">Support & Docs</h4>
            <div className="flex flex-col gap-4 text-xs font-bold text-slate-500">
              <Link href="#" className="hover:text-white transition-colors">Documentation</Link>
              <Link href="#" className="hover:text-white transition-colors">Help Center</Link>
              <Link href="#" className="hover:text-white transition-colors">Contact Relations</Link>
            </div>
          </div>
        </div>
      </div>
      
      <div className="max-w-7xl mx-auto mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-slate-600 text-[10px] font-black uppercase tracking-[0.2em]">
        <div>© 2026 AI Career Mentor. All rights reserved.</div>
        <div className="flex items-center gap-2">
           <span>Engineered & Coded by</span>
           <span className="text-white bg-white/5 px-3.5 py-1.5 rounded-lg border border-white/10 italic tracking-normal">Anil Pradhan</span>
        </div>
      </div>
    </footer>
  );
}

