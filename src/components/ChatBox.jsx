"use client";

import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Bot, User, Loader } from "lucide-react";

const ChatBox = ({ onCodeResponse, setEditorOpen }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Function to extract code blocks from markdown
  const extractCodeBlocks = (text) => {
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    const codeBlocks = [];
    let match;

    while ((match = codeBlockRegex.exec(text)) !== null) {
      codeBlocks.push({
        language: match[1] || 'javascript',
        code: match[2].trim()
      });
    }

    return codeBlocks;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    // Add user message
    const userMessage = {
      id: Date.now(),
      text: input,
      sender: "user",
    };

    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ message: input }),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      
      // Add AI response
      const aiMessage = {
        id: Date.now() + 1,
        text: data.reply,
        sender: "ai",
      };

      setMessages(prev => [...prev, aiMessage]);

      // Extract code blocks and send to editor if found
      const codeBlocks = extractCodeBlocks(data.reply);
      if (codeBlocks.length > 0) {
        // Take the first code block for now
        const { language, code } = codeBlocks[0];
        
        // Create a new file name based on language
        const extension = language === 'javascript' ? 'js' : 
                         language === 'python' ? 'py' :
                         language === 'typescript' ? 'ts' : 'txt';
        
        const fileName = `generated-${Date.now()}.${extension}`;
        
        // Send to editor
        onCodeResponse({
          name: fileName,
          language,
          content: code,
          type: 'file'
        });
        
        // Open the editor
        setEditorOpen(true);
      }

    } catch (error) {
      console.error("Error:", error);
      const errorMessage = {
        id: Date.now() + 1,
        text: "Sorry, I encountered an error. Please try again.",
        sender: "ai",
        error: true,
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-[70vh]">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <motion.div
            key={message.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`flex items-start gap-3 ${
              message.sender === "user" ? "flex-row-reverse" : ""
            }`}
          >
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                message.sender === "user"
                  ? "bg-blue-500"
                  : message.error
                  ? "bg-red-500"
                  : "bg-cyan-500"
              }`}
            >
              {message.sender === "user" ? (
                <User className="w-5 h-5 text-white" />
              ) : (
                <Bot className="w-5 h-5 text-white" />
              )}
            </div>

            <div
              className={`max-w-[80%] p-3 rounded-lg ${
                message.sender === "user"
                  ? "bg-blue-500 text-white ml-auto"
                  : message.error
                  ? "bg-red-500/10 text-red-400"
                  : "bg-gray-800 text-cyan-400"
              }`}
            >
              {message.text}
            </div>
          </motion.div>
        ))}

        {isTyping && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center gap-3"
          >
            <div className="w-8 h-8 rounded-full bg-cyan-500/50 flex items-center justify-center">
              <Loader className="w-5 h-5 text-white animate-spin" />
            </div>
            <div className="bg-gray-800 text-cyan-400 p-3 rounded-lg">
              Processing quantum data...
            </div>
          </motion.div>
        )}

        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSubmit} className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your command, captain..."
            className="sci-fi-input flex-1"
            disabled={isTyping}
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="sci-fi-button px-4 py-2 flex items-center gap-2"
          >
            {isTyping ? (
              <Loader className="w-5 h-5 animate-spin" />
            ) : (
              <Send className="w-5 h-5" />
            )}
            <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default ChatBox;