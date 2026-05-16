import React from "react";

interface Props {
    width?: string | number;
    height?: string | number;
    borderRadius?: string | number;
    className?: string;
}

export default function Skeleton({ width = "100%", height = "20px", borderRadius = "8px", className = "" }: Props) {
    return (
        <div 
            className={`animate-pulse ${className}`}
            style={{
                width,
                height,
                borderRadius,
                background: "linear-gradient(90deg, rgba(255,255,255,0.03) 25%, rgba(255,255,255,0.08) 50%, rgba(255,255,255,0.03) 75%)",
                backgroundSize: "200% 100%",
                animation: "skeleton-loading 1.5s infinite linear"
            }}
        />
    );
}

// Add CSS keyframes via a style tag or your global CSS
const style = `
@keyframes skeleton-loading {
    0% { background-position: 200% 0; }
    100% { background-position: -200% 0; }
}
`;
