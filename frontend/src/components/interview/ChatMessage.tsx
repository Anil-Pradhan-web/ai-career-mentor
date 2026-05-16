import React from "react";
import { Bot, User } from "lucide-react";

interface Props {
    msg: {
        role: string;
        content: string;
        type?: string;
    };
    codingMode: boolean;
    isSpeaking?: boolean;
}

function renderMessageContent(content: string): React.ReactNode {
    if (!content) return null;
    const codeBlockRegex = /```(?:([a-zA-Z0-9+#-]+)\n)?([\s\S]*?)```/g;
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = codeBlockRegex.exec(content)) !== null) {
        const textBefore = content.slice(lastIndex, match.index);
        if (textBefore) {
            parts.push(
                <span key={`text-${lastIndex}`} style={{ whiteSpace: "pre-wrap" }}>
                    {textBefore}
                </span>
            );
        }

        parts.push(
            <pre
                key={`code-${match.index}`}
                style={{
                    background: "rgba(0,0,0,0.3)",
                    padding: "10px",
                    borderRadius: "6px",
                    overflowX: "auto",
                    margin: "8px 0",
                    whiteSpace: "pre",
                }}
            >
                <code>{match[2]}</code>
            </pre>
        );

        lastIndex = match.index + match[0].length;
    }

    const textAfter = content.slice(lastIndex);
    if (textAfter) {
        parts.push(
            <span key={`text-${lastIndex}`} style={{ whiteSpace: "pre-wrap" }}>
                {textAfter}
            </span>
        );
    }

    return <>{parts}</>;
}

export const ChatMessage = React.memo(({ msg, codingMode, isSpeaking }: Props) => {
    // Filter out system messages or empty content
    if (msg.role === "system" || !msg.content.trim()) return null;
    
    const isInterviewer = msg.role === "interviewer" || msg.role === "interviewer_stream";
    return (
        <div
            className="animate-fade-in"
            style={{
                display: "flex",
                gap: "16px",
                marginBottom: "24px",
                maxWidth: msg.role === "candidate" ? "85%" : (codingMode ? "100%" : "85%"),
                alignSelf: msg.role === "candidate" ? "flex-end" : "flex-start",
                flexDirection: msg.role === "candidate" ? "row-reverse" : "row",
                animation: "fadeSlideUp 0.3s ease"
            }}
        >
            <div style={{ position: "relative", flexShrink: 0 }}>
                {isInterviewer ? (
                    <div
                        className={isSpeaking ? "speaking-pulse" : ""}
                        style={{
                            width: "36px",
                            height: "36px",
                            background: "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "white",
                            boxShadow: isSpeaking ? "0 0 15px rgba(99, 102, 241, 0.4)" : "none"
                        }}
                    >
                        <Bot size={20} />
                    </div>
                ) : (
                    <div
                        style={{
                            width: "36px",
                            height: "36px",
                            background: "rgba(255,255,255,0.1)",
                            borderRadius: "50%",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            color: "#94A3B8"
                        }}
                    >
                        <User size={20} />
                    </div>
                )}
            </div>
            <div
                style={{
                    flex: 1,
                    padding: "14px 18px",
                    background: msg.role === "candidate" ? "linear-gradient(135deg, #6366f1 0%, #4f46e5 100%)" : "rgba(30, 41, 59, 0.4)",
                    borderRadius: msg.role === "candidate" ? "20px 20px 0 20px" : "0 20px 20px 20px",
                    border: msg.role === "candidate" ? "none" : "1px solid rgba(255,255,255,0.05)",
                    boxShadow: msg.role === "candidate" ? "0 4px 12px rgba(99, 102, 241, 0.2)" : "none"
                }}
            >
                <div style={{ color: msg.role === "candidate" ? "#F8FAFC" : "#E2E8F0", fontSize: "15px", lineHeight: "1.6" }}>
                    {renderMessageContent(msg.content)}
                </div>
            </div>
        </div>
    );
});

ChatMessage.displayName = "ChatMessage";
