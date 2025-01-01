"use client";

import { useState } from "react";
import dynamic from 'next/dynamic';
import ChatBox from "@/components/ChatBox";
import { Cpu } from "lucide-react";

// Dynamically import CodeEditor to avoid SSR issues
const CodeEditor = dynamic(() => import("@/components/CodeEditor"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-full bg-black/50 rounded-lg">
      <div className="text-cyan-400 animate-pulse">Loading Quantum Editor...</div>
    </div>
  ),
});

export default function Home() {
  const [editorOpen, setEditorOpen] = useState(false);

  return (
    <main className="min-h-screen bg-gradient-to-br from-black via-blue-900 to-black">
      <div className="container mx-auto p-4">
        {/* Main Content */}
        <div className="sci-fi-chat mb-4">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-cyan-500/20">
            <div className="flex items-center gap-3">
              <Cpu className="w-8 h-8 text-cyan-400 animate-pulse" />
              <h1 className="text-3xl font-bold text-cyan-400 font-orbitron">Martin AI</h1>
            </div>
            <button
              onClick={() => setEditorOpen(!editorOpen)}
              className="sci-fi-button px-4 py-2 flex items-center gap-2"
            >
              <span className="font-mono text-sm">{"{"}</span>
              {editorOpen ? 'Close Editor' : 'Open Editor'}
              <span className="font-mono text-sm">{"}"}</span>
            </button>
          </div>

          {/* Chat Interface */}
          <div className="p-4">
            <ChatBox />
          </div>
        </div>

        {/* Code Editor Modal */}
        <CodeEditor 
          isOpen={editorOpen} 
          onClose={() => setEditorOpen(false)} 
        />
      </div>
    </main>
  );
}