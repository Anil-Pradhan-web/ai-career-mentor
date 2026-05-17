import React from "react";
interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ComponentType<any>;
  label: string;
}

export default function AuthInput({ icon: Icon, label, ...props }: Props) {
  return (
    <div className="mb-5">
      <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 ml-1">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors z-10">
          <Icon size={18} />
        </div>
        <input
          {...props}
          className="w-full pl-12 pr-12 py-4 rounded-xl bg-white border border-white text-slate-900 placeholder:text-slate-400 outline-none focus:ring-4 focus:ring-primary/10 transition-all text-base font-medium shadow-sm"
        />
      </div>
    </div>
  );
}
