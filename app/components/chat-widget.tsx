"use client";

import { useState, useRef, useEffect } from "react";
import { MessageSquare, X, Send, Menu, Plus, History, Trash2, ArrowLeft } from "lucide-react";

type ChatSession = {
  id: string;
  title: string;
  messages: any[];
  updatedAt: number;
};

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Local storage state
  const [chatHistory, setChatHistory] = useState<ChatSession[]>([]);
  const [currentChatId, setCurrentChatId] = useState<string>(() => {
    return "chat-" + Date.now();
  });

  const [messages, setMessages] = useState<any[]>([]);
  const [status, setStatus] = useState<"idle" | "submitted" | "streaming" | "error">("idle");
  const stopRef = useRef<boolean>(false);

  const stop = () => {
    stopRef.current = true;
    setStatus("idle");
  };

  const sendMessage = async (message: { text: string }) => {
    const userMessage = { id: Date.now().toString(), role: "user", text: message.text };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);
    setStatus("submitted");
    stopRef.current = false;
    
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        body: JSON.stringify({ messages: newMessages })
      });
      
      if (!res.ok) throw new Error("API Error");
      setStatus("streaming");
      
      const assistantId = (Date.now() + 1).toString();
      let assistantText = "";
      
      const reader = res.body?.getReader();
      const decoder = new TextDecoder();
      
      if (reader) {
        setMessages(prev => [...prev, { id: assistantId, role: "assistant", text: "" }]);
        while (!stopRef.current) {
          const { done, value } = await reader.read();
          if (done) break;
          const chunk = decoder.decode(value, { stream: true });
          assistantText += chunk;
          setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, text: assistantText } : m));
        }
      }
      setStatus("idle");
    } catch (err) {
      console.error(err);
      setStatus("error");
    }
  };

  const [input, setInput] = useState("");
  const isLoading = status === "submitted" || status === "streaming";

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInput(e.target.value);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  // Load from local storage on mount
  useEffect(() => {
    const saved = localStorage.getItem("pixelbot_chats");
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setChatHistory(parsed);
        if (parsed.length > 0) {
          setCurrentChatId(parsed[0].id);
          setMessages(parsed[0].messages);
        }
      } catch (e) {
        console.error("Failed to parse chat history");
      }
    }
  }, []); // Run once on mount

  // Save to local storage whenever messages change
  useEffect(() => {
    if (messages.length === 0) return; // Don't save empty chats

    setChatHistory(prev => {
      const existingIdx = prev.findIndex(c => c.id === currentChatId);
      const firstMessage = messages[0]?.text || (messages[0]?.parts ? (messages[0]?.parts as any).map((p: any) => p.text).join('') : "New Chat");
      const title = firstMessage 
        ? firstMessage.substring(0, 30) + (firstMessage.length > 30 ? "..." : "") 
        : "New Chat";
      
      const newSession: ChatSession = {
        id: currentChatId,
        title,
        messages,
        updatedAt: Date.now()
      };

      let newHistory;
      if (existingIdx >= 0) {
        newHistory = [...prev];
        newHistory[existingIdx] = newSession;
      } else {
        newHistory = [newSession, ...prev];
      }
      
      localStorage.setItem("pixelbot_chats", JSON.stringify(newHistory));
      return newHistory;
    });
  }, [messages, currentChatId]);

  const startNewChat = () => {
    stop(); // Stop any pending streams
    const newId = "chat-" + Date.now();
    setCurrentChatId(newId);
    setMessages([]);
    setIsDrawerOpen(false);
  };

  const loadChat = (id: string) => {
    stop(); // Stop any pending streams
    const session = chatHistory.find(c => c.id === id);
    if (session) {
      setCurrentChatId(id);
      setMessages(session.messages);
    }
    setIsDrawerOpen(false);
  };

  const deleteChat = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // prevent loading the chat
    
    // Determine what to do with the current chat ID before updating history
    if (currentChatId === id) {
      const remainingHistory = chatHistory.filter(c => c.id !== id);
      if (remainingHistory.length > 0) {
        setCurrentChatId(remainingHistory[0].id);
        setMessages(remainingHistory[0].messages);
      } else {
        startNewChat();
      }
    }

    setChatHistory(prev => {
      const newHistory = prev.filter(c => c.id !== id);
      localStorage.setItem("pixelbot_chats", JSON.stringify(newHistory));
      return newHistory;
    });
  };

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isDrawerOpen]);

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {isOpen ? (
        <div className="flex flex-col w-80 sm:w-96 h-[500px] bg-background pixel-border shadow-2xl relative overflow-hidden">
          {/* Header */}
          <div className="bg-foreground text-background px-4 py-3 flex justify-between items-center pixel-border z-30 relative">
            <div className="flex items-center gap-2">
              <button onClick={() => setIsDrawerOpen(!isDrawerOpen)} className="hover:opacity-70 transition-opacity">
                {isDrawerOpen ? <ArrowLeft size={16} /> : <Menu size={16} />}
              </button>
              <span className="font-['Press_Start_2P'] text-[10px]">PixelBot</span>
            </div>
            <button onClick={() => setIsOpen(false)} className="hover:opacity-70 transition-opacity">
              <X size={16} />
            </button>
          </div>

          {/* Drawer Sidebar */}
          <div className={`absolute top-[42px] left-0 bottom-0 w-3/4 bg-background border-r-4 border-foreground/20 z-20 transition-transform duration-300 ease-in-out flex flex-col ${isDrawerOpen ? 'translate-x-0' : '-translate-x-full'}`}>
            <div className="p-3">
              <button 
                onClick={startNewChat}
                className="w-full flex items-center justify-center gap-2 bg-foreground text-background p-2 pixel-border hover:opacity-90 transition-opacity text-sm font-bold"
              >
                <Plus size={16} /> New Chat
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              <div className="text-xs font-['Press_Start_2P'] text-muted-foreground mb-2 px-2 pt-2 flex items-center gap-2">
                <History size={12} /> History
              </div>
              {chatHistory.length === 0 ? (
                <div className="text-xs text-muted-foreground px-2">No past chats</div>
              ) : (
                chatHistory.map(chat => (
                  <div 
                    key={chat.id}
                    onClick={() => loadChat(chat.id)}
                    className={`flex items-center justify-between p-2 cursor-pointer border-2 transition-colors ${currentChatId === chat.id ? 'border-foreground bg-muted' : 'border-transparent hover:bg-muted/50'}`}
                  >
                    <span className="text-sm truncate flex-1 font-mono">{chat.title}</span>
                    <button 
                      onClick={(e) => deleteChat(chat.id, e)}
                      className="text-red-500 hover:text-red-700 p-1"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 font-mono text-sm relative z-0">
            {messages.length === 0 ? (
              <div className="text-center text-muted-foreground mt-10">
                <p>Hello! I'm PixelBot.</p>
                <p className="mt-2 text-xs">Ask me anything</p>
              </div>
            ) : (
              messages.map((m) => (
                <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div 
                    className={`max-w-[80%] px-3 py-2 ${
                      m.role === 'user' 
                        ? 'bg-foreground text-background pixel-border' 
                        : 'bg-muted text-foreground pixel-border'
                    }`}
                  >
                    {m.text || (m as any).content || ((m as any).parts ? (m as any).parts.map((p: any, i: number) => p.type === 'text' ? <span key={i}>{p.text}</span> : null) : null)}
                  </div>
                </div>
              ))
            )}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-3 py-2 bg-muted text-foreground pixel-border animate-pulse">
                  ...
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-3 border-t-4 border-foreground/20 bg-background flex flex-col gap-2 relative z-0">
            <div className="flex gap-2 w-full">
              <input
                className="flex-1 bg-transparent border-2 border-foreground/20 p-2 font-mono text-sm focus:outline-none focus:border-foreground transition-colors pixel-border"
                value={input}
                placeholder="Type a message..."
                onChange={handleInputChange}
              />
              <button 
                type="submit" 
                disabled={isLoading || !input?.trim()}
                className="bg-foreground text-background p-2 pixel-border hover:opacity-90 disabled:opacity-50 transition-opacity flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </div>
          </form>

          {/* Overlay to close drawer when clicking outside */}
          {isDrawerOpen && (
            <div 
              className="absolute inset-0 top-[42px] bg-background/50 z-10 backdrop-blur-sm" 
              onClick={() => setIsDrawerOpen(false)}
            />
          )}
        </div>
      ) : (
        <button
          onClick={() => setIsOpen(true)}
          className="bg-foreground text-background p-4 pixel-border shadow-lg hover:scale-105 transition-transform flex items-center justify-center"
        >
          <MessageSquare size={24} />
        </button>
      )}
    </div>
  );
}
