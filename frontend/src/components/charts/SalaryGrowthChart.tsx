import React from "react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

interface Props {
    data: { year: number; salary: number; formatted: string }[];
}

export default function SalaryGrowthChart({ data = [] }: Props) {
    return (
        <div style={{ height: "300px", width: "100%" }}>
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorSalary" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                            <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="year" stroke="rgba(255,255,255,0.3)" fontSize={12} tickLine={false} axisLine={false} />
                    <YAxis hide />
                    <Tooltip
                        contentStyle={{ background: "#0f172a", border: "1px solid rgba(255,255,255,0.1)", borderRadius: "12px" }}
                        itemStyle={{ color: "#06b6d4", fontWeight: 700 }}
                    />
                    <Area type="monotone" dataKey="salary" stroke="#06b6d4" strokeWidth={3} fillOpacity={1} fill="url(#colorSalary)" />
                </AreaChart>
            </ResponsiveContainer>
        </div>
    );
}
