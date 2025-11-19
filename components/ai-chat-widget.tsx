"use client";

import { useState, useRef, useEffect } from "react";

interface Message {
  role: "user" | "ai";
  content: string;
  timestamp: Date;
}

export function AIChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "ai",
      content: "Halo! Saya asisten AI Apotek. Saya bisa bantu info obat, stok, harga, atau rekomendasi. Ada yang bisa dibantu?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const response = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: input }),
      });

      let data: { response?: string; error?: string } | null = null;

      try {
        data = await response.json();
      } catch (_) {
        // ignore JSON parse errors and use generic fallback
      }

      if (!response.ok || data?.error) {
        throw new Error(data?.error || "Gagal menghubungi layanan AI");
      }

      const aiMessage: Message = {
        role: "ai",
        content: data?.response || "",
        timestamp: new Date(),
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Maaf, terjadi kesalahan.";
      const errorMessage: Message = {
        role: "ai",
        content: message || "Maaf, terjadi kesalahan.",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/50 transition hover:scale-110 hover:shadow-xl"
          aria-label="Open AI Chat"
        >
          <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-6 right-6 z-50 flex h-[600px] w-[380px] flex-col rounded-2xl border border-slate-200 bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between rounded-t-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-4 py-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/20">
                <span className="text-xl">🤖</span>
              </div>
              <div>
                <h3 className="font-semibold text-white">AI Asisten Apotek</h3>
                <p className="text-xs text-emerald-100">Online</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="rounded-lg p-1 text-white/80 transition hover:bg-white/20 hover:text-white">
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-4 overflow-y-auto p-4">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[80%] rounded-2xl px-4 py-2 ${msg.role === "user" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800"}`}>
                  <p className="whitespace-pre-wrap text-sm">{msg.content}</p>
                  <p className={`mt-1 text-xs ${msg.role === "user" ? "text-emerald-100" : "text-slate-500"}`}>{msg.timestamp.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })}</p>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="rounded-2xl bg-slate-100 px-4 py-3">
                  <div className="flex gap-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "0ms" }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "150ms" }}></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-slate-400" style={{ animationDelay: "300ms" }}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Tanya tentang obat..."
                disabled={isLoading}
                className="flex-1 rounded-xl border border-slate-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:bg-slate-5 placeholder:text-black/50 text-black"
              />
              <button onClick={handleSend} disabled={!input.trim() || isLoading} className="rounded-xl bg-emerald-600 px-4 py-2 text-white transition hover:bg-emerald-500 disabled:cursor-not-allowed disabled:opacity-50">
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
