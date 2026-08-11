import React from "react";

interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ComponentType<any>;
  label: string;
}

export default function AuthInput({ icon: Icon, label, ...props }: Props) {
  return (
    <div className="mb-4">
      <label className="block mb-1.5 ml-0.5" style={{ fontSize: "0.6875rem", fontWeight: 600, color: "var(--fg-muted)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
        {label}
      </label>
      <div className="relative">
        <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: "var(--fg-muted)" }}>
          <Icon size={15} />
        </div>
        <input {...props} className="input input-with-icon" style={{ padding: "10px 12px 10px 36px", fontSize: "0.875rem" }} />
      </div>
    </div>
  );
}
