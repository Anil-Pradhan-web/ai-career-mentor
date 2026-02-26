"use client";

import { Loader2 } from "lucide-react";

export default function DashboardLoading() {
    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] w-full bg-black">
            <div className="relative flex flex-col items-center">
                {/* Glow behind loader */}
                <div className="absolute inset-0 bg-blue-500/20 blur-[50px] rounded-full" />

                {/* Loader icon */}
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin z-10" />

                <h3 className="mt-6 text-xl font-medium bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent z-10 font-mono">
                    Initializing AI Agents...
                </h3>

                <p className="mt-2 text-gray-500 text-sm z-10">
                    Preparing your fully personalized career dashboard
                </p>

                {/* Skeletons to mimic dashboard layout */}
                <div className="w-full max-w-3xl flex flex-col gap-4 mt-12 opacity-50">
                    <div className="h-24 w-full bg-gray-900/80 rounded-2xl animate-pulse" />
                    <div className="flex gap-4">
                        <div className="h-40 flex-1 bg-gray-900/60 rounded-2xl animate-pulse" />
                        <div className="h-40 flex-1 bg-gray-900/60 rounded-2xl animate-pulse" />
                        <div className="h-40 flex-1 bg-gray-900/60 rounded-2xl animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}
