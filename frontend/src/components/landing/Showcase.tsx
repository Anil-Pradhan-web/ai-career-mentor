import React from "react";
import { 
  FileText, Target, Activity, Sparkles, TrendingUp, ChevronRight 
} from "lucide-react";

export default function Showcase() {
  return (
    <section id="demo" className="py-24 px-6 bg-slate-950/30">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="font-display text-4xl md:text-5xl font-black text-white mb-4">
            Your Career <span className="text-primary">Command Center.</span>
          </h2>
          <p className="text-slate-400">Everything you need to land your next big role, in one powerful interface.</p>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative group p-1 lg:p-2 bg-gradient-to-br from-white/10 to-transparent rounded-[3rem] shadow-2xl overflow-hidden shadow-primary/10">
          <div className="bg-slate-900 rounded-[2.5rem] flex flex-col lg:flex-row overflow-hidden border border-white/5 shadow-2xl">
            
            {/* Sidebar Mockup */}
            <div className="w-full lg:w-64 bg-slate-950/50 border-r border-white/5 p-6 hidden lg:flex flex-col gap-8">
              <div className="font-display font-black text-white flex items-center gap-2">
                <Sparkles size={18} className="text-primary" />
                <span>CareerMentor</span>
              </div>
              
              <div className="space-y-1">
                {[
                  { icon: Sparkles, label: "Overview", active: true },
                  { icon: FileText, label: "Resume Analysis" },
                  { icon: Target, label: "Mock Interviews" },
                  { icon: Activity, label: "Roadmap" },
                  { icon: TrendingUp, label: "Market Insights" },
                  { icon: Target, label: "Full Career Analysis" },
                ].map((item, i) => (
                  <div key={i} className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer ${item.active ? "bg-primary/10 text-primary" : "text-slate-500 hover:text-white"}`}>
                    <item.icon size={18} />
                    {item.label}
                  </div>
                ))}
              </div>

              <div className="mt-auto p-5 bg-gradient-to-br from-primary/20 to-secondary/10 rounded-2xl border border-white/5">
                <Sparkles size={20} className="text-primary mb-3" />
                <h4 className="text-white text-xs font-black uppercase mb-1">Upgrade to Pro</h4>
                <p className="text-[10px] text-slate-400 mb-3 leading-relaxed">Unlock advanced insights and AI feedback.</p>
                <div className="text-[10px] font-black text-white flex items-center gap-1 group/btn cursor-pointer">
                  Upgrade Now <ChevronRight size={12} className="group-hover/btn:translate-x-1 transition-transform" />
                </div>
              </div>
            </div>

            {/* Main Content Area Mockup */}
            <div className="flex-1 p-8 lg:p-10 bg-slate-900/50">
              <div className="flex justify-between items-center mb-10">
                <div>
                  <h3 className="text-2xl font-black text-white mb-1">Your Career Hub</h3>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">Track. Improve. Achieve.</p>
                </div>
                <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-xl text-[10px] font-black text-slate-400 flex items-center gap-2">
                  This Week <ChevronRight size={14} className="rotate-90" />
                </div>
              </div>

              {/* Stats Row */}
              <div className="grid md:grid-cols-4 gap-6 mb-10">
                {[
                  { label: "ATS Score Match", val: "92%", status: "Great Match!", color: "text-emerald-500" },
                  { label: "Interview Readiness", val: "85%", status: "Keep Practicing", color: "text-primary" },
                  { label: "Profile Strength", val: "72%", status: "Almost There!", color: "text-amber-500" },
                  { label: "Weekly Goal", val: "5/7", status: "Tasks Completed", color: "text-secondary" },
                ].map((stat, i) => (
                  <div key={i} className="p-6 bg-slate-950/40 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-all">
                    <div className="relative z-10 flex flex-col items-center text-center">
                       <div className={`text-2xl font-black mb-1 ${stat.color}`}>{stat.val}</div>
                       <div className="text-[10px] font-bold text-white mb-2">{stat.label}</div>
                       <div className="text-[9px] text-slate-500 font-bold uppercase tracking-tighter">{stat.status}</div>
                    </div>
                    {/* Ring Visual Placeholder */}
                    <div className={`absolute -right-4 -bottom-4 w-16 h-16 rounded-full border-4 border-white/5 opacity-20 ${stat.color}`} />
                  </div>
                ))}
              </div>

              {/* Main Charts Mockup Area */}
              <div className="grid lg:grid-cols-3 gap-6">
                 <div className="lg:col-span-2 p-8 bg-slate-950/40 rounded-[2rem] border border-white/5">
                    <h4 className="text-sm font-bold text-white mb-8">Weekly Activity</h4>
                    <div className="h-48 flex items-end justify-between px-4">
                       {[30, 45, 60, 40, 85, 70, 55].map((h, i) => (
                         <div key={i} className="w-10 bg-slate-800 rounded-t-lg relative overflow-hidden shadow-lg shadow-primary/10" style={{ height: `${h}%` }}>
                            <div className="absolute inset-0 bg-gradient-to-t from-primary to-secondary opacity-80" />
                         </div>
                       ))}
                    </div>
                    <div className="flex justify-between mt-6 px-4">
                       {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map(d => (
                         <span key={d} className="text-[9px] font-bold text-slate-600 uppercase">{d}</span>
                       ))}
                    </div>
                 </div>

                 <div className="space-y-6">
                    <div className="p-8 bg-gradient-to-br from-amber-500/10 to-transparent border border-amber-500/20 rounded-[2rem]">
                       <div className="flex justify-between items-start mb-4">
                         <span className="text-[10px] font-bold text-amber-500 uppercase tracking-widest">Market Salary (SDE II)</span>
                         <TrendingUp className="text-amber-500" size={16} />
                       </div>
                       <div className="text-2xl font-black text-white mb-1">$135k - $180k</div>
                       <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tighter">Avg. Base Salary in India</p>
                    </div>

                    <div className="p-8 bg-slate-950/40 border border-white/5 rounded-[2rem]">
                       <h4 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-6">Top In-Demand Skills</h4>
                       <div className="flex flex-wrap gap-2">
                          {["Python", "System Design", "SQL", "AWS", "+4"].map(skill => (
                            <span key={skill} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-lg text-[10px] font-black text-slate-400 whitespace-nowrap">
                              {skill}
                            </span>
                          ))}
                       </div>
                    </div>
                 </div>
              </div>
            </div>

          </div>
          
          {/* Overlay Glow for 3D effect */}
          <div className="absolute inset-0 pointer-events-none rounded-[3rem] border border-white/10 shadow-[inset_0_1px_1px_rgba(255,255,255,0.1)]" />
        </div>
      </div>
    </section>
  );
}
