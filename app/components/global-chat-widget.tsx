"use client";

import React, { useState, useEffect, useRef } from "react";
import { Globe, X, Users, Type, Send, User, MessageCircle, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id: string;
  created_at: string;
  username: string;
  content: string;
  user_id: string;
  location?: string;
  device_info?: string;
  latitude?: number;
  longitude?: number;
  isp?: string;
  ipv4?: string;
  ipv6?: string;
};

// Generate random ID for this browser session
const generateSessionId = () => Math.random().toString(36).substring(2, 15);

// Format relative time (e.g., "10h ago" or just the time)
const formatTime = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toLowerCase();
};

export default function GlobalChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [onlineCount, setOnlineCount] = useState(0);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [totalMessages, setTotalMessages] = useState<number | null>(null);

  const [sessionInfo, setSessionInfo] = useState({
    id: "",
    username: "",
    location: "Earth",
    device_info: "",
    latitude: 0,
    longitude: 0,
    isp: "",
    ipv4: "",
    ipv6: ""
  });
  const [isSetupComplete, setIsSetupComplete] = useState(false);
  const [nameInput, setNameInput] = useState("");
  const [isLocating, setIsLocating] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const channelRef = useRef<any>(null);
  const isTypingLocalRef = useRef<boolean>(false);

  // Dispatch an event so Mr Robot chat widget knows when this is open and can hide itself
  useEffect(() => {
    window.dispatchEvent(new CustomEvent("global-chat-state", { detail: isOpen }));
  }, [isOpen]);

  // Sync with global Live View counter
  useEffect(() => {
    const handleSync = (e: Event) => {
      const customEvent = e as CustomEvent;
      if (customEvent.detail) setOnlineCount(customEvent.detail);
    };
    window.addEventListener("live-view-sync", handleSync);
    return () => window.removeEventListener("live-view-sync", handleSync);
  }, []);

  // Initialization (Browser only)
  useEffect(() => {
    let savedId = localStorage.getItem("chat_session_id");
    if (!savedId) {
      savedId = Math.random().toString(36).substring(2, 15);
      localStorage.setItem("chat_session_id", savedId);
    }

    const savedName = localStorage.getItem("chat_username");
    const savedLoc = localStorage.getItem("chat_location") || "Earth";
    const savedDevice = localStorage.getItem("chat_device") || "";
    const savedLat = parseFloat(localStorage.getItem("chat_lat") || "0");
    const savedLng = parseFloat(localStorage.getItem("chat_lng") || "0");
    const savedIsp = localStorage.getItem("chat_isp") || "";
    const savedIp4 = localStorage.getItem("chat_ipv4") || "";
    const savedIp6 = localStorage.getItem("chat_ipv6") || "";

    if (savedName) {
      setSessionInfo({
        id: savedId,
        username: savedName,
        location: savedLoc,
        device_info: savedDevice,
        latitude: savedLat,
        longitude: savedLng,
        isp: savedIsp,
        ipv4: savedIp4,
        ipv6: savedIp6
      });
      setIsSetupComplete(true);

      // Always silently fetch fresh network data (IP/Location) in the background 
      // on every page load to detect if they changed WiFi or moved!
      fetchAdvancedData(savedName, savedId);
    } else {
      setSessionInfo({ id: savedId, username: "", location: "Earth", device_info: "", latitude: 0, longitude: 0, isp: "", ipv4: "", ipv6: "" });
    }
  }, []);

  const fetchAdvancedData = async (chosenName: string, sessionId: string) => {
    const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "";
    let location = "Earth";
    let ipv4 = "", ipv6 = "", isp = "", lat = 0, lng = 0;

    try {
      const fetchWithTimeout = (url: string, ms = 3000) => {
        const controller = new AbortController();
        const id = setTimeout(() => controller.abort(), ms);
        return fetch(url, { signal: controller.signal }).finally(() => clearTimeout(id));
      };

      let ipData = null;
      try {
        const geoRes = await fetchWithTimeout("https://ipinfo.io/json", 3000);
        ipData = await geoRes.json();
      } catch (e) {
        // Fallback if blocked
        try {
          const fbRes = await fetchWithTimeout("https://ipapi.co/json/", 3000);
          ipData = await fbRes.json();
        } catch (e2) { }
      }

      if (ipData) {
        ipv4 = ipData.ip || "";
        isp = ipData.org || ipData.organization_name || ipData.organization || "";

        if (ipData.loc) {
          const parts = ipData.loc.split(',');
          lat = parseFloat(parts[0]) || 0;
          lng = parseFloat(parts[1]) || 0;
        } else {
          lat = parseFloat(ipData.latitude) || 0;
          lng = parseFloat(ipData.longitude) || 0;
        }

        const city = ipData.city || "";
        const country = ipData.country || ipData.country_name || "";
        if (city) location = country ? `${city}, ${country}` : city;
      }
    } catch (e) {
      console.warn("Could not fetch advanced details", e);
    }

    localStorage.setItem("chat_username", chosenName);
    localStorage.setItem("chat_location", location);
    localStorage.setItem("chat_device", userAgent);
    localStorage.setItem("chat_lat", lat.toString());
    localStorage.setItem("chat_lng", lng.toString());
    localStorage.setItem("chat_isp", isp);
    localStorage.setItem("chat_ipv4", ipv4);
    localStorage.setItem("chat_ipv6", ipv6);

    setSessionInfo({
      id: sessionId,
      username: chosenName,
      location,
      device_info: userAgent,
      latitude: lat,
      longitude: lng,
      isp,
      ipv4,
      ipv6
    });
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nameInput.trim()) return;

    setIsLocating(true);
    const chosenName = nameInput.trim().substring(0, 20).toLowerCase(); // Lowercase for minimalist look

    await fetchAdvancedData(chosenName, sessionInfo.id);

    setIsLocating(false);
    setIsSetupComplete(true);
  };

  // Fetch initial messages & setup realtime for messages
  useEffect(() => {
    if (!sessionInfo.id) return; // Fetch even if not setup complete

    const fetchMessages = async () => {
      const { data, count } = await supabase
        .from("global_messages")
        .select("*", { count: "exact" })
        .order("created_at", { ascending: false })
        .limit(15);

      if (data) {
        setMessages(data.reverse());
        setHasMore(data.length === 15);
      }
      if (count !== null) setTotalMessages(count);
    };

    fetchMessages();

    const msgChannel = supabase.channel("global_messages_changes");
    msgChannel
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "global_messages" }, (payload) => {
        const newMsg = payload.new as Message;
        if (newMsg.user_id === sessionInfo.id) return; // Already added optimistically

        setMessages((prev) => [...prev, newMsg]);
        setTotalMessages((prev) => (prev !== null ? prev + 1 : null));
      })
      .subscribe();

    return () => {
      supabase.removeChannel(msgChannel);
    };
  }, [sessionInfo.id]);

  // Setup presence tracking separately
  useEffect(() => {
    if (!sessionInfo.id || !isSetupComplete || !sessionInfo.username) return;

    const presenceChannel = supabase.channel("global_presence");
    channelRef.current = presenceChannel;

    presenceChannel
      .on("presence", { event: "sync" }, () => {
        const state = presenceChannel.presenceState();
        let totalOnline = 0;
        const currentTyping: string[] = [];

        Object.keys(state).forEach((key) => {
          state[key].forEach((presence: any) => {
            if (presence.isTyping && presence.username?.toLowerCase() !== sessionInfo.username?.toLowerCase()) {
              const lowerName = presence.username.toLowerCase();
              if (!currentTyping.includes(lowerName)) {
                currentTyping.push(lowerName);
              }
            }
          });
        });

        setTypingUsers(currentTyping);
      })
      .subscribe(async (status) => {
        if (status === "SUBSCRIBED") {
          await presenceChannel.track({
            user_id: sessionInfo.id,
            username: sessionInfo.username,
            isTyping: false
          });
        }
      });

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, [sessionInfo.id, isSetupComplete, sessionInfo.username]);

  const loadMoreMessages = async () => {
    if (messages.length === 0 || isLoadingMore || !hasMore) return;
    setIsLoadingMore(true);

    const oldestMessage = messages[0];

    const { data } = await supabase
      .from("global_messages")
      .select("*")
      .lt("created_at", oldestMessage.created_at)
      .order("created_at", { ascending: false })
      .limit(15);

    if (data) {
      setMessages(prev => [...data.reverse(), ...prev]);
      if (data.length < 15) {
        setHasMore(false);
      }
    }
    setIsLoadingMore(false);
  };

  // Auto-scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen, isSetupComplete]);

  const handleTyping = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const text = e.target.value;
    setNewMessage(text);

    if (channelRef.current) {
      const isCurrentlyTyping = text.length > 0;

      // Only send the WebSocket payload if the state ACTUALLY changed
      if (isCurrentlyTyping !== isTypingLocalRef.current) {
        isTypingLocalRef.current = isCurrentlyTyping;
        await channelRef.current.track({
          user_id: sessionInfo.id,
          username: sessionInfo.username,
          isTyping: isCurrentlyTyping
        });
      }
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !sessionInfo.id) return;

    const content = newMessage.trim();
    setNewMessage("");

    if (channelRef.current) {
      isTypingLocalRef.current = false;
      channelRef.current.track({
        user_id: sessionInfo.id,
        username: sessionInfo.username,
        isTyping: false
      });
    }

    // Optimistic UI Update (Instantly show in chat)
    const optimisticMsg: Message = {
      id: Math.random().toString(),
      created_at: new Date().toISOString(),
      content,
      username: sessionInfo.username,
      user_id: sessionInfo.id,
      location: sessionInfo.location,
      device_info: sessionInfo.device_info,
      latitude: sessionInfo.latitude,
      longitude: sessionInfo.longitude,
      isp: sessionInfo.isp,
      ipv4: sessionInfo.ipv4,
      ipv6: sessionInfo.ipv6
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setTotalMessages((prev) => (prev !== null ? prev + 1 : null));

    if (channelRef.current) {
      await channelRef.current.track({
        user_id: sessionInfo.id,
        username: sessionInfo.username,
        isTyping: false
      });
    }

    // Try inserting with all data first
    const { error } = await supabase.from("global_messages").insert([
      {
        content,
        username: sessionInfo.username,
        user_id: sessionInfo.id,
        location: sessionInfo.location,
        device_info: sessionInfo.device_info,
        latitude: sessionInfo.latitude,
        longitude: sessionInfo.longitude,
        isp: sessionInfo.isp,
        ipv4: sessionInfo.ipv4,
        ipv6: sessionInfo.ipv6
      }
    ]);

    // Fallback if the user hasn't run the SQL query to add the extra columns yet
    if (error && error.code === "42703") { // undefined_column
      console.warn("Extra columns missing in Supabase. Falling back to simple insert.");
      await supabase.from("global_messages").insert([
        {
          content,
          username: sessionInfo.username,
          user_id: sessionInfo.id
        }
      ]);
    }
  };

  return (
    <>
      {/* Blurred Background Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsOpen(false)}
            className="fixed inset-0 bg-background/20 backdrop-blur-md z-40 transition-all duration-500"
          />
        )}
      </AnimatePresence>

      <div className="fixed bottom-4 left-4 z-50">
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              transition={{ duration: 0.4, ease: "easeOut" }}
              className="mb-4 w-[380px] h-[550px] bg-transparent flex flex-col"
            >
              {/* Header (Minimalist) */}
              <div className="flex justify-between items-center text-foreground/80 p-2 font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="opacity-50">global chat</span>
                  {isSetupComplete && (
                    <span className="px-2 py-0.5 bg-foreground/10 rounded-full text-[9px]">
                      {onlineCount} online
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-3">
                  {totalMessages !== null && (
                    <span className="opacity-40">{totalMessages} messages</span>
                  )}
                  <button onClick={() => setIsOpen(false)} className="hover:opacity-50 transition-opacity">
                    <X size={14} />
                  </button>
                </div>
              </div>

              {/* Chat Room Messages (Always visible) */}
              <div className="flex-1 flex flex-col overflow-hidden relative">
                {/* Messages Area with Smooth Fade Top Mask */}
                <div
                  className="flex-1 overflow-y-auto px-4 py-6 space-y-6 font-sans scrollbar-hide"
                  style={{ maskImage: "linear-gradient(to bottom, transparent, black 10%, black 100%)", WebkitMaskImage: "linear-gradient(to bottom, transparent, black 10%, black 100%)" }}
                >
                  {messages.length === 0 ? (
                    <div className="h-full flex items-center justify-center text-foreground/40 text-xs font-mono lowercase">
                      no messages yet
                    </div>
                  ) : (
                    <>
                      {hasMore && (
                        <div className="flex justify-center pb-4 pt-2">
                          <button
                            onClick={loadMoreMessages}
                            disabled={isLoadingMore}
                            className="text-[10px] font-mono lowercase px-3 py-1.5 rounded-full bg-foreground/10 hover:bg-foreground/20 transition-colors text-foreground/60 disabled:opacity-50"
                          >
                            {isLoadingMore ? "loading..." : "load older messages"}
                          </button>
                        </div>
                      )}
                      {messages.map((msg, i) => {
                        const isMe = msg.user_id === sessionInfo.id && isSetupComplete;
                        const showHeader = i === 0 || messages[i - 1].user_id !== msg.user_id;

                        return (
                          <div key={msg.id} className={`flex flex-col ${isMe ? "items-end" : "items-start"} max-w-[90%] ${isMe ? "ml-auto" : "mr-auto"}`}>

                            {/* Message Header (Avatar + Name + Location + Time) */}
                            {showHeader && (
                              <div className={`flex items-center gap-2 mb-1.5 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                <img
                                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${msg.username}`}
                                  alt="avatar"
                                  className="w-5 h-5 rounded-full border border-foreground/10 bg-background"
                                />
                                <div className={`flex items-center gap-1.5 text-[9px] font-mono lowercase text-foreground/50 ${isMe ? "flex-row-reverse" : "flex-row"}`}>
                                  <span className="font-bold text-foreground/80">{msg.username}</span>
                                  {msg.location && (
                                    <>
                                      <span>·</span>
                                      <span>{msg.location}</span>
                                    </>
                                  )}
                                  <span>·</span>
                                  <span>{formatTime(msg.created_at)}</span>
                                </div>
                              </div>
                            )}

                            {/* Message Bubble (Pill shape, borderless) */}
                            <div
                              className={`px-4 py-2 rounded-2xl text-sm ${isMe
                                ? "bg-foreground text-background"
                                : "bg-foreground/5 text-foreground"
                                }`}
                            >
                              {msg.content}
                            </div>
                          </div>
                        );
                      })}
                    </>
                  )}
                  <div ref={messagesEndRef} />
                </div>



                {/* Input Area (Swaps based on setup status) */}
                {!isSetupComplete ? (
                  <form onSubmit={handleSaveName} className="px-4 pb-4 pt-2">
                    <p className="text-foreground/50 text-[10px] mb-2 font-mono lowercase pl-4">what's your name?</p>
                    <div className="relative">
                      <input
                        type="text"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        placeholder="your name..."
                        maxLength={20}
                        disabled={isLocating}
                        className="w-full bg-foreground/5 rounded-full px-4 py-3 pr-20 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-foreground/40 font-mono lowercase transition-all"
                        autoFocus
                      />
                      <button
                        type="submit"
                        disabled={!nameInput.trim() || isLocating}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground disabled:opacity-0 transition-all text-[10px] font-mono lowercase"
                      >
                        {isLocating ? "..." : "next ->"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="relative px-4 pb-4 pt-2">
                    {/* Typing Indicator */}
                    <AnimatePresence>
                      {typingUsers.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: 5 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: 5 }}
                          className="absolute -top-3 left-7 text-[9px] font-mono lowercase text-foreground/50 flex items-center gap-1.5"
                        >
                          <span className="flex gap-0.5">
                            <span className="w-1 h-1 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1 h-1 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1 h-1 bg-foreground/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </span>
                          {typingUsers.length === 1
                            ? `${typingUsers[0]} is typing...`
                            : typingUsers.length === 2
                              ? `${typingUsers[0]} and ${typingUsers[1]} are typing...`
                              : `several people are typing...`}
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <form onSubmit={sendMessage} className="relative">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="type a message..."
                        className="w-full bg-foreground/5 rounded-full px-4 py-3 pr-12 text-foreground text-xs focus:outline-none focus:ring-1 focus:ring-foreground/20 placeholder:text-foreground/40 font-mono lowercase transition-all"
                      />
                      <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-foreground/50 hover:text-foreground disabled:opacity-30 transition-all p-1"
                      >
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Floating Toggle Button (Hidden when open for cleaner look, or keep it?) */}
        <AnimatePresence>
          {!isOpen && (
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsOpen(true)}
              className="text-foreground transition-transform flex flex-col items-center justify-center p-2 relative"
            >
              <div className="relative flex items-center justify-center w-[45px] h-[45px]">
                <MessageSquare size={45} className="absolute z-10 opacity-80" />
                <Globe size={24} className="absolute z-10 opacity-80 mb-1 animate-spin" style={{ animationDuration: '4s' }} />
              </div>
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </>
  );
}
