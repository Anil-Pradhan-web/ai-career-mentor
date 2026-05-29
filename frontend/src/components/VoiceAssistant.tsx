// Copyright (c) 2026 Anil Pradhan. All rights reserved.
"use client";

import React, { useState, useEffect, useRef } from "react";
import { 
    Sparkles, Bot, Loader2, X, AlertTriangle 
} from "lucide-react";
import { toast } from "react-hot-toast";

// Custom Inline SVGs to avoid dependency or version import issues
const PhoneIcon = ({ size = 24, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
);

const PhoneOffIcon = ({ size = 24, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91" />
        <path d="M14.05 14.05a16 16 0 0 0 3.86-3.86" />
        <path d="M16 10.5a12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92v.5" />
    </svg>
);

const MicIcon = ({ size = 24, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
);

const MicOffIcon = ({ size = 24, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <line x1="1" y1="1" x2="23" y2="23" />
        <path d="M9 9v3a3 3 0 0 0 5.12 2.12M15 9.34V5a3 3 0 0 0-5.94-.6" />
        <path d="M17 11a6.9 6.9 0 0 1-2.2 5M9 13.9a7 7 0 0 1-4-1.9v-2" />
        <line x1="12" y1="19" x2="12" y2="22" />
    </svg>
);

const HeadphonesIcon = ({ size = 24, className = "", style }: { size?: number; className?: string; style?: React.CSSProperties }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} style={style}>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
    </svg>
);

const getWsUrl = (): string => {
    const apiBase = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
    const wsBase = apiBase.replace(/^http/, "ws");
    return `${wsBase}/career/voice-assistant/ws`;
};

// Helper downsampler function
function downsampleBuffer(buffer: Float32Array, inputRate: number, outputRate: number): Int16Array {
    if (outputRate === inputRate) {
        const pcm = new Int16Array(buffer.length);
        for (let i = 0; i < buffer.length; i++) {
            pcm[i] = Math.min(1, Math.max(-1, buffer[i])) * 0x7FFF;
        }
        return pcm;
    }
    const sampleRateRatio = inputRate / outputRate;
    const newLength = Math.round(buffer.length / sampleRateRatio);
    const result = new Int16Array(newLength);
    let offsetResult = 0;
    let offsetBuffer = 0;
    while (offsetResult < result.length) {
        const nextOffsetBuffer = Math.round((offsetResult + 1) * sampleRateRatio);
        let accum = 0;
        let count = 0;
        for (let i = offsetBuffer; i < nextOffsetBuffer && i < buffer.length; i++) {
            accum += buffer[i];
            count++;
        }
        result[offsetResult] = (count > 0 ? accum / count : 0) * 0x7FFF;
        offsetResult++;
        offsetBuffer = nextOffsetBuffer;
    }
    return result;
}

// Convert Int16Array to Base64
function bufferToBase64(buffer: Int16Array): string {
    const uint8 = new Uint8Array(buffer.buffer);
    let binary = "";
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
        binary += String.fromCharCode(uint8[i]);
    }
    return window.btoa(binary);
}

export default function VoiceAssistant() {
    const [isOpen, setIsOpen] = useState(false);
    const [callState, setCallState] = useState<"idle" | "connecting" | "active" | "error">("idle");
    const [isMuted, setIsMuted] = useState(false);
    const [transcript, setTranscript] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [userName, setUserName] = useState("Candidate");
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [mounted, setMounted] = useState(false);
    const [callSeconds, setCallSeconds] = useState(0);

    // Audio & Socket Refs
    const wsRef = useRef<WebSocket | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const processorRef = useRef<ScriptProcessorNode | null>(null);
    const silentGainRef = useRef<GainNode | null>(null);
    const activeSourcesRef = useRef<AudioBufferSourceNode[]>([]);
    
    // Analysers for visualization
    const micAnalyserRef = useRef<AnalyserNode | null>(null);
    const aiAnalyserRef = useRef<AnalyserNode | null>(null);
    
    // Canvas ref
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const callTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Audio playback synchronizer
    const nextPlayTimeRef = useRef<number>(0);
    const isMutedRef = useRef(isMuted);

    const syncMicrophoneCapture = () => {
        const shouldCapture = !isMutedRef.current && activeSourcesRef.current.length === 0;
        streamRef.current?.getAudioTracks().forEach(track => {
            track.enabled = shouldCapture;
        });
    };

    // Update muted ref for AudioWorklet/ScriptProcessor callback
    useEffect(() => {
        isMutedRef.current = isMuted;
        syncMicrophoneCapture();
    }, [isMuted]);

    // Retrieve userName from localStorage on mount
    useEffect(() => {
        setMounted(true);
        if (typeof window !== "undefined") {
            const storedName = localStorage.getItem("userName");
            if (storedName) setUserName(storedName);
        }
    }, []);

    // Stop playback immediately when user interrupts or ends call
    const stopAiPlayback = () => {
        activeSourcesRef.current.forEach(source => {
            try {
                source.stop();
            } catch (e) {
                // Ignore if already ended
            }
        });
        activeSourcesRef.current = [];
        setIsSpeaking(false);
        if (audioContextRef.current) {
            nextPlayTimeRef.current = audioContextRef.current.currentTime;
        }
        syncMicrophoneCapture();
    };

    // Play a chunk of audio received from Gemini (24kHz PCM)
    const playAudioChunk = (base64Data: string) => {
        if (!audioContextRef.current) return;
        const ctx = audioContextRef.current;
        
        try {
            const binaryStr = window.atob(base64Data);
            const len = binaryStr.length;
            const bytes = new Uint8Array(len);
            for (let i = 0; i < len; i++) {
                bytes[i] = binaryStr.charCodeAt(i);
            }
            
            // Safe conversion to Int16Array via DataView to avoid RangeError on odd byte lengths
            const sampleCount = Math.floor(bytes.byteLength / 2);
            const float32Buffer = new Float32Array(sampleCount);
            const view = new DataView(bytes.buffer);
            
            for (let i = 0; i < sampleCount; i++) {
                // PCM 16-bit is little-endian from Gemini API
                const val = view.getInt16(i * 2, true);
                float32Buffer[i] = val / 32768.0;
            }
            
            const audioBuffer = ctx.createBuffer(1, float32Buffer.length, 24000);
            audioBuffer.getChannelData(0).set(float32Buffer);
            
            const sourceNode = ctx.createBufferSource();
            sourceNode.buffer = audioBuffer;
            
            // Connect to visualizer analyser
            if (aiAnalyserRef.current) {
                sourceNode.connect(aiAnalyserRef.current);
            } else {
                sourceNode.connect(ctx.destination);
            }
            
            // Gapless playback scheduler with lookahead buffer to absorb network jitter
            const PLAYBACK_DELAY = 0.12; // 120ms lookahead delay to handle network jitter smoothly
            let startTime = nextPlayTimeRef.current;
            if (startTime < ctx.currentTime) {
                startTime = ctx.currentTime + PLAYBACK_DELAY;
            }
            
            sourceNode.start(startTime);
            nextPlayTimeRef.current = startTime + audioBuffer.duration;
            
            setIsSpeaking(true);
            activeSourcesRef.current.push(sourceNode);
            syncMicrophoneCapture();
            sourceNode.onended = () => {
                activeSourcesRef.current = activeSourcesRef.current.filter(s => s !== sourceNode);
                if (activeSourcesRef.current.length === 0) {
                    setIsSpeaking(false);
                    syncMicrophoneCapture();
                }
            };
        } catch (err) {
            console.error("Error playing audio chunk:", err);
        }
    };

    // Start a real-time call with Anya
    const startCall = async () => {
        setCallState("connecting");
        setTranscript("Connecting to your career mentor...");
        setErrorMessage("");

        const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        if (!token) {
            setCallState("error");
            setErrorMessage("Session expired. Please log in again.");
            toast.error("Auth token not found.");
            return;
        }

        try {
            // 1. Request microphone access
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: {
                    echoCancellation: true,
                    noiseSuppression: true,
                    channelCount: 1,
                }
            });
            streamRef.current = stream;

            // 2. Initialize Web Audio API context
            const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
            const audioContext = new AudioContextClass();
            audioContextRef.current = audioContext;
            nextPlayTimeRef.current = audioContext.currentTime;

            // 3. Connect mic inputs & analysers
            const micSource = audioContext.createMediaStreamSource(stream);
            
            const micAnalyser = audioContext.createAnalyser();
            micAnalyser.fftSize = 256;
            micSource.connect(micAnalyser);
            micAnalyserRef.current = micAnalyser;

            const aiAnalyser = audioContext.createAnalyser();
            aiAnalyser.fftSize = 256;
            aiAnalyser.connect(audioContext.destination);
            aiAnalyserRef.current = aiAnalyser;

            // 4. Create ScriptProcessorNode for recording + downsampling to 16kHz
            const processor = audioContext.createScriptProcessor(2048, 1, 1);
            const silentGain = audioContext.createGain();
            silentGain.gain.value = 0;
            micSource.connect(processor);
            processor.connect(silentGain);
            silentGain.connect(audioContext.destination); // Required for callback triggers without monitoring mic audio
            processorRef.current = processor;
            silentGainRef.current = silentGain;

            processor.onaudioprocess = (e) => {
                if (isMutedRef.current) return;
                if (activeSourcesRef.current.length > 0) return;
                
                const inputBuffer = e.inputBuffer.getChannelData(0);

                // Downsample & stream to server
                const downsampled = downsampleBuffer(inputBuffer, e.inputBuffer.sampleRate, 16000);
                const base64Audio = bufferToBase64(downsampled);
                
                if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) {
                    wsRef.current.send(JSON.stringify({
                        type: "audio",
                        data: base64Audio
                    }));
                }
            };

            // 5. Connect WebSocket
            const wsUrl = `${getWsUrl()}?token=${encodeURIComponent(token)}`;
            const ws = new WebSocket(wsUrl);
            wsRef.current = ws;

            ws.onopen = () => {
                setCallState("active");
                setTranscript(`Anya is here. Say "Hi" to start speaking!`);
                setCallSeconds(0);
                // Start call timer
                callTimerRef.current = setInterval(() => {
                    setCallSeconds(prev => prev + 1);
                }, 1000);
                drawWaveform();
            };

            ws.onmessage = (event) => {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === "audio" && msg.data) {
                        playAudioChunk(msg.data);
                    } else if (msg.type === "transcript" && msg.text) {
                        // Append or update subtitles transcript
                        setTranscript(prev => {
                            // If Anya starts a new thought, clear the greeting message
                            if (prev.startsWith("Anya is here") || prev.startsWith("Connecting")) {
                                return msg.text;
                            }
                            // Keep transcripts concise to look like subtitles
                            if (prev.length > 150) {
                                return msg.text;
                            }
                            return prev + msg.text;
                        });
                    } else if (msg.type === "interrupted") {
                        stopAiPlayback();
                    } else if (msg.type === "time_limit") {
                        toast.error(msg.message || "Call time limit reached.", {
                            duration: 6000,
                            style: { background: "#1f2937", color: "#fff" }
                        });
                        endCall();
                    } else if (msg.type === "error") {
                        toast.error(msg.message || "An error occurred during the call.");
                        endCall();
                    }
                } catch (err) {
                    console.error("Error parsing socket message:", err);
                }
            };

            ws.onerror = (err) => {
                console.error("WebSocket error:", err);
                setCallState("error");
                setErrorMessage("WebSocket connection failed.");
                toast.error("Failed to connect to Voice Assistant.");
                endCall();
            };

            ws.onclose = (event) => {
                logger.info(`WebSocket closed: code=${event.code}, reason=${event.reason}`);
                if (event.code === 4000 || event.code === 1008) {
                    setCallState("error");
                    setErrorMessage("Authentication failed. Please refresh your session.");
                }
                endCall();
            };

        } catch (err: any) {
            console.error("Failed to initialize audio or websocket:", err);
            setCallState("error");
            setErrorMessage(err.message || "Failed to access microphone.");
            toast.error("Microphone access denied or error occurred.");
        }
    };

    // End call and cleanup resources
    const endCall = () => {
        // Stop audio playback
        stopAiPlayback();

        // Close WebSocket
        if (wsRef.current) {
            wsRef.current.close();
            wsRef.current = null;
        }

        // Stop microphone stream
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Disconnect audio processor
        if (processorRef.current) {
            processorRef.current.disconnect();
            processorRef.current = null;
        }

        if (silentGainRef.current) {
            silentGainRef.current.disconnect();
            silentGainRef.current = null;
        }

        // Close audio context
        if (audioContextRef.current) {
            audioContextRef.current.close();
            audioContextRef.current = null;
        }

        // Cancel animation loop
        if (animationFrameRef.current) {
            cancelAnimationFrame(animationFrameRef.current);
            animationFrameRef.current = null;
        }

        micAnalyserRef.current = null;
        aiAnalyserRef.current = null;
        // Clear call timer
        if (callTimerRef.current) {
            clearInterval(callTimerRef.current);
            callTimerRef.current = null;
        }
        setCallSeconds(0);
        setCallState("idle");
        setIsMuted(false);
    };

    // Clean up on component unmount
    useEffect(() => {
        return () => {
            endCall();
        };
    }, []);

    // Draw the pulsing Siri-style waveform on canvas
    const drawWaveform = () => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;
        const bufferLength = 128;
        const dataArray = new Uint8Array(bufferLength);

        const draw = () => {
            if (!canvasRef.current) return;
            animationFrameRef.current = requestAnimationFrame(draw);

            ctx.clearRect(0, 0, width, height);

            // Read from AI analyser (priority) or Mic analyser
            let analyser = null;
            const isAiSpeaking = activeSourcesRef.current.length > 0;
            
            if (isAiSpeaking && aiAnalyserRef.current) {
                analyser = aiAnalyserRef.current;
            } else if (micAnalyserRef.current && !isMutedRef.current) {
                analyser = micAnalyserRef.current;
            }

            if (analyser) {
                analyser.getByteFrequencyData(dataArray);
            } else {
                dataArray.fill(0);
            }

            // Calculate average volume amplitude
            let sum = 0;
            for (let i = 0; i < bufferLength; i++) {
                sum += dataArray[i];
            }
            const average = sum / bufferLength;
            const amplitude = Math.max(3, (average / 255.0) * (height / 2));

            ctx.lineWidth = 3;
            ctx.lineCap = "round";

            const time = Date.now() * 0.005;

            // Draw 3 overlapping waves with glowing glassmorphic colors
            const colors = [
                "rgba(99, 102, 241, 0.85)",  // Indigo-500
                "rgba(236, 72, 153, 0.65)",   // Pink-500
                "rgba(6, 182, 212, 0.45)",    // Cyan-500
            ];

            for (let waveIdx = 0; waveIdx < 3; waveIdx++) {
                ctx.strokeStyle = colors[waveIdx];
                ctx.beginPath();

                const phase = time + waveIdx * Math.PI * 0.25;
                const frequency = 0.015 + waveIdx * 0.008;

                for (let x = 0; x < width; x++) {
                    const pinch = Math.sin((x / width) * Math.PI); // Pinched at the ends
                    const y = height / 2 + Math.sin(x * frequency + phase) * amplitude * pinch;

                    if (x === 0) {
                        ctx.moveTo(x, y);
                    } else {
                        ctx.lineTo(x, y);
                    }
                }
                ctx.stroke();
            }
        };

        draw();
    };

    const toggleMute = () => {
        setIsMuted(prev => !prev);
        toast.success(isMuted ? "🎤 Microphone Unmuted" : "🔇 Microphone Muted", {
            position: "bottom-center",
            style: { background: "#1f2937", color: "#fff" }
        });
    };

    if (!mounted) return null;

    return (
        <div style={{ position: "fixed", bottom: "24px", right: "24px", zIndex: 99999, display: "flex", flexDirection: "column", alignItems: "flex-end", fontFamily: "'Inter', sans-serif" }}>
            {/* 1. Glassmorphic Active Panel */}
            {isOpen && (
                <div style={{ 
                    marginBottom: "16px", 
                    width: "380px", 
                    overflow: "hidden", 
                    borderRadius: "16px", 
                    border: "1px solid rgba(255,255,255,0.08)", 
                    background: "rgba(15, 23, 42, 0.95)", 
                    boxShadow: "0 20px 50px rgba(0,0,0,0.5)", 
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                    transition: "all 0.3s ease",
                    color: "white"
                }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid rgba(255, 255, 255, 0.08)", background: "rgba(30, 41, 59, 0.4)", padding: "16px 20px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <div style={{ position: "relative" }}>
                                <style>{`
                                    @keyframes speaking-glow {
                                        0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(236, 72, 153, 0.6); }
                                        50% { transform: scale(1.08); box-shadow: 0 0 0 10px rgba(236, 72, 153, 0); }
                                        100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(236, 72, 153, 0); }
                                    }
                                    .speaking-avatar {
                                        animation: speaking-glow 1.5s infinite ease-in-out;
                                    }
                                `}</style>
                                <div 
                                    className={isSpeaking ? "speaking-avatar" : ""}
                                    style={{ 
                                        display: "flex", 
                                        height: "40px", 
                                        width: "40px", 
                                        alignItems: "center", 
                                        justifyItems: "center", 
                                        justifyContent: "center", 
                                        borderRadius: "50%", 
                                        background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)", 
                                        color: "white", 
                                        boxShadow: isSpeaking ? "0 0 15px rgba(236, 72, 153, 0.8)" : "0 4px 10px rgba(99, 102, 241, 0.3)",
                                        transition: "all 0.3s ease"
                                    }}
                                >
                                    <Bot size={20} />
                                </div>
                                <span style={{ position: "absolute", bottom: 0, right: 0, height: "12px", width: "12px", borderRadius: "50%", border: "2px solid #0f172a", backgroundColor: callState === "active" ? (isSpeaking ? "#ec4899" : "#10b981") : "#6b7280" }} />
                            </div>
                            <div style={{ textAlign: "left" }}>
                                <h3 style={{ fontWeight: 600, fontSize: "0.875rem", margin: 0, color: "white" }}>Anya</h3>
                                <p style={{ 
                                    fontSize: "0.75rem", 
                                    color: callState === "active" ? (isSpeaking ? "#f472b6" : "#10b981") : "#94a3b8", 
                                    fontWeight: isSpeaking ? 600 : 400, 
                                    margin: 0,
                                    transition: "all 0.2s ease"
                                }}>
                                    {callState === "active" ? (isSpeaking ? "🎙️ Anya is speaking..." : "🟢 Listening...") : "AI Career Coach (Hinglish)"}
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => { setIsOpen(false); endCall(); }}
                            style={{ background: "none", border: "none", cursor: "pointer", padding: "4px", color: "#94a3b8", display: "flex", alignItems: "center", borderRadius: "6px" }}
                            onMouseEnter={e => e.currentTarget.style.color = "white"}
                            onMouseLeave={e => e.currentTarget.style.color = "#94a3b8"}
                        >
                            <X size={18} />
                        </button>
                    </div>

                    {/* Content Panel */}
                    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px", textAlign: "center" }}>
                        {callState === "idle" && (
                            <div style={{ padding: "12px 0" }}>
                                <div style={{ marginLeft: "auto", marginRight: "auto", marginBottom: "16px", display: "flex", height: "64px", width: "64px", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(99, 102, 241, 0.1)", color: "#818cf8" }}>
                                    <Sparkles size={32} />
                                </div>
                                <h4 style={{ marginBottom: "8px", fontWeight: 600, color: "white", fontSize: "1.1rem", marginTop: 0 }}>Start a Call with Anya</h4>
                                <p style={{ marginBottom: "24px", padding: "0 16px", fontSize: "0.8rem", color: "#94a3b8", lineHeight: 1.5, margin: "0 auto" }}>
                                    Career doubts? Learning roadmap questions? Apne personalized coach se voice call par baat karein.
                                </p>
                                <button
                                    onClick={startCall}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "12px", background: "linear-gradient(135deg, #6366f1 0%, #ec4899 100%)", padding: "12px 24px", fontWeight: "600", color: "white", border: "none", cursor: "pointer", boxShadow: "0 10px 20px rgba(99,102,241,0.2)" }}
                                >
                                    <PhoneIcon size={16} />
                                    <span>Start Call</span>
                                </button>
                            </div>
                        )}

                        {callState === "connecting" && (
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 0" }}>
                                <Loader2 size={36} style={{ marginBottom: "16px", color: "#6366f1" }} className="animate-spin" />
                                <p style={{ fontSize: "0.875rem", fontWeight: 500, color: "#e2e8f0", margin: 0 }}>Connecting to Anya...</p>
                                <p style={{ marginTop: "8px", fontSize: "0.75rem", color: "#64748b", marginBottom: "24px" }}>Retrieving resume and learning path</p>
                                <button
                                    onClick={endCall}
                                    style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "12px", background: "rgba(220, 38, 38, 0.9)", border: "1px solid rgba(220, 38, 38, 0.3)", padding: "10px 20px", fontSize: "0.75rem", fontWeight: "600", color: "white", cursor: "pointer", boxShadow: "0 10px 20px rgba(220,38,38,0.25)" }}
                                >
                                    <PhoneOffIcon size={14} />
                                    <span>Cancel Call</span>
                                </button>
                            </div>
                        )}

                        {callState === "active" && (
                            <div style={{ width: "100%", padding: "8px 0" }}>
                                {/* Call Duration Timer */}
                                <div style={{ textAlign: "center", marginBottom: "16px" }}>
                                    <span style={{ 
                                        display: "inline-block",
                                        fontSize: "0.7rem", 
                                        fontWeight: 700, 
                                        color: callSeconds >= 390 ? "#f87171" : "rgba(255,255,255,0.5)",
                                        background: callSeconds >= 390 ? "rgba(239,68,68,0.1)" : "rgba(255,255,255,0.04)", 
                                        padding: "4px 14px", 
                                        borderRadius: "20px",
                                        border: callSeconds >= 390 ? "1px solid rgba(239,68,68,0.3)" : "1px solid rgba(255,255,255,0.06)",
                                        fontFamily: "'Space Mono', 'JetBrains Mono', monospace",
                                        letterSpacing: "0.1em",
                                        transition: "all 0.3s ease"
                                    }}>
                                        {String(Math.floor(callSeconds / 60)).padStart(2, "0")}:{String(callSeconds % 60).padStart(2, "0")} / 07:30
                                    </span>
                                </div>
                                {/* Visualizer Waveform */}
                                <div style={{ position: "relative", marginBottom: "24px", display: "flex", height: "96px", width: "100%", alignItems: "center", justifyContent: "center", borderRadius: "12px", background: "rgba(2, 6, 23, 0.6)", overflow: "hidden" }}>
                                    <canvas 
                                        ref={canvasRef} 
                                        width={320} 
                                        height={96}
                                        style={{ height: "100%", width: "100%" }}
                                    />
                                    {isMuted && (
                                        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(2, 6, 23, 0.85)", backdropFilter: "blur(4px)", fontSize: "0.75rem", color: "#94a3b8", gap: "6px", fontWeight: 500 }}>
                                            <MicOffIcon size={14} style={{ color: "#ef4444" }} /> Muted
                                        </div>
                                    )}
                                </div>

                                {/* Live Subtitle Box */}
                                <div style={{ marginBottom: "24px", minHeight: "64px", borderRadius: "12px", background: "rgba(15, 23, 42, 0.6)", padding: "16px", textAlign: "left", border: "1px solid rgba(255, 255, 255, 0.06)", overflowY: "auto", maxHeight: "120px" }}>
                                    <span style={{ display: "block", fontSize: "10px", fontWeight: "bold", textTransform: "uppercase", letterSpacing: "0.05em", color: "#818cf8", marginBottom: "4px" }}>
                                        Live Transcripts
                                    </span>
                                    <p style={{ fontSize: "0.875rem", color: "#e2e8f0", margin: 0, fontStyle: "italic", lineHeight: 1.5 }}>
                                        "{transcript}"
                                    </p>
                                </div>

                                {/* Call Controls */}
                                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "16px" }}>
                                    <button
                                        onClick={toggleMute}
                                        style={{ display: "flex", height: "48px", width: "48px", alignItems: "center", justifyContent: "center", borderRadius: "50%", border: isMuted ? "1px solid rgba(239, 68, 68, 0.3)" : "1px solid rgba(255, 255, 255, 0.08)", background: isMuted ? "rgba(239, 68, 68, 0.1)" : "rgba(30, 41, 59, 0.6)", color: isMuted ? "#ef4444" : "#cbd5e1", cursor: "pointer" }}
                                        title={isMuted ? "Unmute Mic" : "Mute Mic"}
                                    >
                                        {isMuted ? <MicOffIcon size={18} /> : <MicIcon size={18} />}
                                    </button>
                                    <button
                                        onClick={endCall}
                                        style={{ display: "inline-flex", alignItems: "center", gap: "8px", borderRadius: "12px", background: "#dc2626", color: "white", padding: "12px 24px", fontWeight: "600", fontSize: "0.875rem", border: "none", cursor: "pointer", boxShadow: "0 10px 20px rgba(220, 38, 38, 0.25)" }}
                                        title="End Call"
                                    >
                                        <PhoneOffIcon size={18} />
                                        <span>End Call</span>
                                    </button>
                                </div>
                            </div>
                        )}

                        {callState === "error" && (
                            <div style={{ padding: "12px 0" }}>
                                <div style={{ marginLeft: "auto", marginRight: "auto", marginBottom: "16px", display: "flex", height: "56px", width: "56px", alignItems: "center", justifyContent: "center", borderRadius: "50%", background: "rgba(239, 68, 68, 0.1)", color: "#f87171" }}>
                                    <AlertTriangle size={28} />
                                </div>
                                <h4 style={{ marginBottom: "8px", fontWeight: 600, color: "white", fontSize: "1rem", marginTop: 0 }}>Call Failed</h4>
                                <p style={{ marginBottom: "24px", padding: "0 16px", fontSize: "0.75rem", color: "#94a3b8" }}>{errorMessage}</p>
                                <button
                                    onClick={startCall}
                                    style={{ borderRadius: "12px", background: "rgba(30, 41, 59, 0.6)", border: "1px solid rgba(255, 255, 255, 0.08)", padding: "10px 20px", fontSize: "0.75rem", fontWeight: "600", color: "white", cursor: "pointer" }}
                                >
                                    Try Again
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* 2. Floating Action Button (FAB) */}
            <button
                onClick={() => setIsOpen(prev => !prev)}
                style={{ 
                    display: "flex", 
                    height: "56px", 
                    width: "56px", 
                    alignItems: "center", 
                    justifyContent: "center", 
                    borderRadius: "50%", 
                    background: isOpen ? "rgba(30, 41, 59, 0.9)" : "linear-gradient(135deg, #6366f1 0%, #d946ef 50%, #ec4899 100%)", 
                    color: "white", 
                    border: "none", 
                    cursor: "pointer", 
                    boxShadow: "0 10px 30px rgba(99, 102, 241, 0.4)", 
                    transition: "all 0.3s ease"
                }}
                title="Talk to Anya"
            >
                {isOpen ? <X size={24} /> : <HeadphonesIcon size={24} />}
            </button>
        </div>
    );
}

// Log helper to simulate winston/loguru logging style in client
const logger = {
    info: (msg: string) => console.log(`[VoiceAssistant] INFO: ${msg}`),
    error: (msg: string, err?: any) => console.error(`[VoiceAssistant] ERROR: ${msg}`, err),
};
