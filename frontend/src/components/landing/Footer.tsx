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
          <p className="text-xs text-slate-500 leading-relaxed mb-6">
            The world&apos;s first multi-agent career operating system. Providing decentralized autonomous workflows to maximize professional talent profiles.
          </p>
          {/* Portfolio Spotlight Card */}
          <a 
            href="https://my-portfolio-anil.vercel.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="block text-left p-4 rounded-xl bg-gradient-to-br from-slate-900/60 to-slate-950 border border-white/5 hover:border-primary/30 transition-all duration-300 group relative overflow-hidden mb-6"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl group-hover:bg-primary/10 transition-colors pointer-events-none" />
            <div className="flex items-center gap-2 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />
              <span className="text-[9px] font-black text-primary uppercase tracking-[0.25em]">CREATOR PORTFOLIO</span>
            </div>
            <p className="text-[11px] text-slate-400 leading-normal mb-2 group-hover:text-slate-300 transition-colors">
              Looking for a skilled Full-Stack Developer or Devops Engineer? Explore my other production-grade startups and portfolio experiments.
            </p>
            <div className="inline-flex items-center gap-1 text-[9px] font-black text-white uppercase tracking-widest group-hover:text-primary transition-colors">
              <span>Visit Portfolio</span>
              <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
            </div>
          </a>
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
        <div className="flex items-center gap-2 tracking-normal font-semibold">
           <span className="text-slate-500 text-[10px] font-black uppercase tracking-[0.2em]">Engineered & Coded by</span>
           <a 
             href="https://my-portfolio-anil.vercel.app/" 
             target="_blank" 
             rel="noopener noreferrer"
             className="text-white hover:text-primary bg-white/5 hover:bg-white/10 px-3.5 py-1.5 rounded-lg border border-white/10 hover:border-primary/30 transition-all font-bold tracking-wide flex items-center gap-1.5"
           >
             <span>Anil Pradhan</span>
             <span className="text-[9px] text-slate-400 font-normal group-hover:text-primary">&rarr;</span>
           </a>
        </div>
      </div>
    </footer>
  );
}

