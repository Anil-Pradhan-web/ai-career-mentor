import React from "react";
import { Loader2 } from "lucide-react";

interface Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  loading?: boolean;
  variant?: "primary" | "secondary";
}

export default function AuthButton({ children, loading, variant = "primary", ...props }: Props) {
  const baseStyles = "w-full py-4 rounded-xl font-bold transition-all flex items-center justify-center gap-2 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-secondary text-white shadow-lg shadow-primary/20 hover:shadow-primary/40 hover:-translate-y-0.5",
    secondary: "bg-white/5 text-slate-300 border border-white/10 hover:bg-white/10"
  };

  return (
    <button {...props} disabled={loading || props.disabled} className={`${baseStyles} ${variants[variant]}`}>
      {loading ? <Loader2 className="animate-spin" size={22} /> : children}
    </button>
  );
}
