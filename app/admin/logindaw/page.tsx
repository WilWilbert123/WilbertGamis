"use client";

import React, { useState, useEffect } from "react";
import {
  ShieldCheck,
  Lock,
  Users,
  MessageSquare,
  Mail,
  Search,
  RefreshCw,
  Trash2,
  CheckCircle,
  Clock,
  Eye,
  MapPin,
  Database,
  Copy,
  Check,
  LogOut,
  ExternalLink,
  Filter,
  Inbox,
  User,
  Key,
  Loader2,
  Sun,
  Moon,
  AlertTriangle
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

// Helper for formatting date strings
const formatDate = (dateStr: string) => {
  if (!dateStr) return "N/A";
  const date = new Date(dateStr);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  });
};

export default function AdminDashboard() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isDark, setIsDark] = useState(true);

  // Theme helpers
  const bg = isDark ? "bg-black" : "bg-white";
  const text = isDark ? "text-white" : "text-black";
  const border = isDark ? "border-white" : "border-black";
  const dimText = isDark ? "text-white/60" : "text-black/50";
  const hoverBg = isDark ? "hover:bg-white hover:text-black" : "hover:bg-black hover:text-white";
  const invertedBg = isDark ? "bg-white text-black" : "bg-black text-white";
  const cardActive = isDark ? "border-white bg-white text-black" : "border-black bg-black text-white";
  const cardInactive = isDark ? "border-white/50 bg-black text-white hover:border-white" : "border-black/40 bg-white text-black hover:border-black";
  const inputCls = isDark
    ? "bg-black border-white text-white focus:bg-neutral-950 placeholder:text-neutral-600"
    : "bg-white border-black text-black focus:bg-neutral-50 placeholder:text-neutral-400";
  const rowHover = isDark ? "hover:bg-white/5" : "hover:bg-black/5";
  const tabActive = isDark ? "border-white bg-white text-black font-bold" : "border-black bg-black text-white font-bold";
  const tabInactive = isDark ? "border-transparent bg-black text-white hover:bg-neutral-900" : "border-transparent bg-white text-black hover:bg-neutral-100";
  const scrollBar = isDark ? "[&::-webkit-scrollbar-thumb]:bg-white/30" : "[&::-webkit-scrollbar-thumb]:bg-black/20";

  // Supabase Auth Credentials
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passError, setPassError] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Tabs
  const [activeTab, setActiveTab] = useState<"inquiries" | "visitors" | "messages" | "sql">("inquiries");

  // Clearing states
  const [isClearing, setIsClearing] = useState<string | null>(null);

  // Data states
  const [visitors, setVisitors] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [inquiries, setInquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Search & Filters
  const [visitorSearch, setVisitorSearch] = useState("");
  const [messageSearch, setMessageSearch] = useState("");
  const [inquirySearch, setInquirySearch] = useState("");
  const [inquiryFilter, setInquiryFilter] = useState<"all" | "unread" | "read" | "archived">("all");

  // Selection modals
  const [selectedVisitor, setSelectedVisitor] = useState<any | null>(null);
  const [selectedInquiry, setSelectedInquiry] = useState<any | null>(null);

  // SQL Copy state
  const [copiedSql, setCopiedSql] = useState(false);

  // Check login session on mount
  useEffect(() => {
    const checkAuthSession = async () => {
      // 1. Check active Supabase Auth session
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setIsAuthenticated(true);
        return;
      }

      // 2. Check saved session state fallback
      const savedAuth = localStorage.getItem("wilbert_admin_auth");
      if (savedAuth === "true") {
        setIsAuthenticated(true);
      }
    };

    checkAuthSession();

    // Listen for Supabase auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) {
        setIsAuthenticated(true);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch initial data & setup realtime when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    fetchData();

    // Setup Supabase Realtime Subscriptions
    const visitorsChannel = supabase
      .channel("admin-visitors-changes")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "portfolio_visitors" },
        (payload) => {
          setVisitors((prev) => [payload.new, ...prev]);
        }
      )
      .subscribe();

    const messagesChannel = supabase
      .channel("admin-messages-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "global_messages" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setMessages((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "DELETE") {
            setMessages((prev) => prev.filter((m) => m.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    const inquiriesChannel = supabase
      .channel("admin-inquiries-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "contact_messages" },
        (payload) => {
          if (payload.eventType === "INSERT") {
            setInquiries((prev) => [payload.new, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            setInquiries((prev) =>
              prev.map((i) => (i.id === payload.new.id ? payload.new : i))
            );
          } else if (payload.eventType === "DELETE") {
            setInquiries((prev) => prev.filter((i) => i.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(visitorsChannel);
      supabase.removeChannel(messagesChannel);
      supabase.removeChannel(inquiriesChannel);
    };
  }, [isAuthenticated]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      // 1. Fetch Visitors
      const { data: vData } = await supabase
        .from("portfolio_visitors")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (vData) setVisitors(vData);

      // 2. Fetch Global Messages
      const { data: mData } = await supabase
        .from("global_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (mData) setMessages(mData);

      // 3. Fetch Contact Inquiries
      const { data: iData } = await supabase
        .from("contact_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(200);
      if (iData) setInquiries(iData);
    } catch (err) {
      console.error("Error fetching admin data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password) {
      setErrorMessage("Please enter both email and password.");
      setPassError(true);
      return;
    }

    setIsAuthenticating(true);
    setPassError(false);
    setErrorMessage("");

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password: password
      });

      if (error) {
        setErrorMessage(error.message);
        setPassError(true);
      } else {
        setIsAuthenticated(true);
        localStorage.setItem("wilbert_admin_auth", "true");
      }
    } catch (err: any) {
      setErrorMessage(err.message || "Authentication failed.");
      setPassError(true);
    } finally {
      setIsAuthenticating(false);
    }
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (e) { }
    setIsAuthenticated(false);
    localStorage.removeItem("wilbert_admin_auth");
  };

  // Actions: Contact Messages
  const updateInquiryStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from("contact_messages")
      .update({ status: newStatus })
      .eq("id", id);
    if (!error) {
      setInquiries((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: newStatus } : item))
      );
      if (selectedInquiry && selectedInquiry.id === id) {
        setSelectedInquiry((prev: any) => ({ ...prev, status: newStatus }));
      }
    }
  };

  const deleteInquiry = async (id: string) => {
    if (!confirm("Are you sure you want to delete this message?")) return;
    const { error } = await supabase.from("contact_messages").delete().eq("id", id);
    if (!error) {
      setInquiries((prev) => prev.filter((item) => item.id !== id));
      if (selectedInquiry?.id === id) setSelectedInquiry(null);
    }
  };

  // Actions: Global Messages
  const deleteGlobalMessage = async (id: string) => {
    if (!confirm("Are you sure you want to delete this chat message?")) return;
    const { error } = await supabase.from("global_messages").delete().eq("id", id);
    if (!error) {
      setMessages((prev) => prev.filter((item) => item.id !== id));
    }
  };

  // Clear All functions
  const clearAllInquiries = async () => {
    if (!confirm("⚠️ DELETE ALL direct inquiries/messages? This cannot be undone!")) return;
    setIsClearing("inquiries");
    const { error } = await supabase.from("contact_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) setInquiries([]);
    setIsClearing(null);
  };

  const clearAllVisitors = async () => {
    if (!confirm("⚠️ DELETE ALL visitor records? This cannot be undone!")) return;
    setIsClearing("visitors");
    const { error } = await supabase.from("portfolio_visitors").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) setVisitors([]);
    setIsClearing(null);
  };

  const clearAllMessages = async () => {
    if (!confirm("⚠️ DELETE ALL global chat messages? This cannot be undone!")) return;
    setIsClearing("messages");
    const { error } = await supabase.from("global_messages").delete().neq("id", "00000000-0000-0000-0000-000000000000");
    if (!error) setMessages([]);
    setIsClearing(null);
  };

  // SQL helper script text
  const sqlScript = `-- 1. Global Messages Table
create table if not exists public.global_messages (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  username text not null,
  content text not null,
  user_id text not null,
  device_info text null,
  latitude numeric null,
  longitude numeric null,
  isp text null,
  ipv4 text null,
  location text null default 'Earth'::text,
  ipv6 text null,
  constraint global_messages_pkey primary key (id)
) TABLESPACE pg_default;

-- 2. Portfolio Visitors Table
create table if not exists public.portfolio_visitors (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone null default now(),
  session_id text not null,
  device_info text null,
  latitude double precision null,
  longitude double precision null,
  isp text null,
  ipv4 text null,
  ipv6 text null,
  location text null,
  browser text null,
  os text null,
  device_model text null,
  gpu text null,
  connection_type text null,
  screen_resolution text null,
  battery_level text null,
  timezone text null,
  cpu_cores text null,
  ram text null,
  referrer_url text null,
  constraint portfolio_visitors_pkey primary key (id)
) TABLESPACE pg_default;

-- 3. Direct Contact Messages Table
create table if not exists public.contact_messages (
  id uuid not null default gen_random_uuid (),
  created_at timestamp with time zone not null default timezone ('utc'::text, now()),
  name text not null,
  email text not null,
  subject text null default 'Portfolio Inquiry'::text,
  message text not null,
  status text not null default 'unread'::text,
  device_info text null,
  location text null default 'Earth'::text,
  ipv4 text null,
  isp text null,
  constraint contact_messages_pkey primary key (id)
) TABLESPACE pg_default;

-- 4. Enable Row Level Security (RLS) & Public Access Policies
alter table public.global_messages enable row level security;
alter table public.portfolio_visitors enable row level security;
alter table public.contact_messages enable row level security;

create policy "Allow public read global_messages" on public.global_messages for select using (true);
create policy "Allow public insert global_messages" on public.global_messages for insert with check (true);
create policy "Allow public delete global_messages" on public.global_messages for delete using (true);

create policy "Allow public insert portfolio_visitors" on public.portfolio_visitors for insert with check (true);
create policy "Allow public select portfolio_visitors" on public.portfolio_visitors for select using (true);

create policy "Allow public insert contact_messages" on public.contact_messages for insert with check (true);
create policy "Allow public select contact_messages" on public.contact_messages for select using (true);
create policy "Allow public update contact_messages" on public.contact_messages for update using (true);
create policy "Allow public delete contact_messages" on public.contact_messages for delete using (true);
`;

  const copySql = () => {
    navigator.clipboard.writeText(sqlScript);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  // Filtered queries
  const filteredInquiries = inquiries.filter((i) => {
    const matchesSearch =
      i.name?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      i.email?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      i.message?.toLowerCase().includes(inquirySearch.toLowerCase()) ||
      i.subject?.toLowerCase().includes(inquirySearch.toLowerCase());

    if (inquiryFilter === "all") return matchesSearch;
    return matchesSearch && i.status === inquiryFilter;
  });

  const filteredVisitors = visitors.filter(
    (v) =>
      v.ip?.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.ipv4?.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.location?.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.os?.toLowerCase().includes(visitorSearch.toLowerCase()) ||
      v.browser?.toLowerCase().includes(visitorSearch.toLowerCase())
  );

  const filteredMessages = messages.filter(
    (m) =>
      m.username?.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.content?.toLowerCase().includes(messageSearch.toLowerCase()) ||
      m.location?.toLowerCase().includes(messageSearch.toLowerCase())
  );

  const unreadInquiriesCount = inquiries.filter((i) => i.status === "unread").length;

  // STRICT BLACK & WHITE EMAIL / PASSWORD LOGIN SCREEN
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center p-4 font-mono select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md border-2 border-white bg-black p-6 sm:p-8 shadow-[8px_8px_0px_0px_rgba(255,255,255,1)] relative"
        >
          {/* Header */}
          <div className="flex items-center gap-3 border-b-2 border-white pb-5 mb-6">
            <ShieldCheck className="w-8 h-8 text-white shrink-0" />
            <div>
              <h1 className="font-['Press_Start_2P'] text-xs sm:text-sm text-white">WILBERT.PRO ADMIN</h1>
              <p className="font-['Silkscreen'] text-[11px] text-white/70 mt-1 uppercase">SUPABASE AUTH GATEWAY</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email / Username */}
            <div>
              <label className="block text-xs uppercase text-white mb-1.5 font-['Silkscreen'] flex items-center gap-2">
                <User className="w-3.5 h-3.5 text-white" /> EMAIL / USERNAME
              </label>
              <input
                type="email"
                required
                autoFocus
                placeholder="admin@wilbert.pro"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border-2 border-white text-white p-3 font-mono text-xs sm:text-sm outline-none transition-colors focus:bg-neutral-950 placeholder:text-neutral-600"
              />
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs uppercase text-white mb-1.5 font-['Silkscreen'] flex items-center gap-2">
                <Key className="w-3.5 h-3.5 text-white" /> PASSWORD
              </label>
              <input
                type="password"
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-black border-2 border-white text-white p-3 font-mono text-xs sm:text-sm outline-none transition-colors focus:bg-neutral-950 placeholder:text-neutral-600"
              />
            </div>

            {passError && (
              <div className="text-xs text-white border-2 border-white bg-black p-3 font-mono">
                {errorMessage || "Authentication failed. Invalid email or password."}
              </div>
            )}

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full font-['Press_Start_2P'] text-[11px] sm:text-xs py-4 border-2 border-white bg-white text-black hover:bg-black hover:text-white transition-all duration-200 cursor-pointer disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
            >
              {isAuthenticating ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> VERIFYING...
                </>
              ) : (
                "AUTHENTICATE & LOG IN"
              )}
            </button>
          </form>

          <div className="mt-6 pt-4 border-t-2 border-white/30 text-center font-['Silkscreen'] text-[10px] text-white/50">
            SUPABASE AUTHENTICATION • MONOCHROME
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className={`h-screen max-h-screen ${bg} ${text} font-mono flex flex-col overflow-hidden select-none transition-colors duration-300`}>

      {/* Top Admin Header */}
      <header className={`border-b-2 ${border} ${bg} px-4 sm:px-6 py-3 flex justify-between items-center shrink-0 z-40 transition-colors duration-300`}>
        <div className="flex items-center gap-3">
          <div className={`w-2.5 h-2.5 rounded-full ${isDark ? "bg-white" : "bg-black"} animate-ping`} />
          <span className={`font-['Press_Start_2P'] text-xs sm:text-sm ${text}`}>
            wilbert
          </span>

        </div>

        <div className="flex items-center gap-2">
          {/* Dark/Light Mode Toggle */}
          <button
            onClick={() => setIsDark(!isDark)}
            className={`flex items-center gap-1.5 text-xs ${bg} ${text} ${hoverBg} border-2 ${border} px-3 py-1.5 transition-colors cursor-pointer`}
            title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}
          >
            {isDark ? <Sun className="w-3.5 h-3.5" /> : <Moon className="w-3.5 h-3.5" />}
            <span className="hidden sm:inline">{isDark ? "Light" : "Dark"}</span>
          </button>
          <button
            onClick={fetchData}
            disabled={isLoading}
            className={`flex items-center gap-1.5 text-xs ${bg} ${text} ${hoverBg} border-2 ${border} px-3 py-1.5 transition-colors cursor-pointer`}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} /> Refresh
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-1.5 text-xs ${invertedBg} ${hoverBg} border-2 ${border} px-3 py-1.5 font-bold transition-colors cursor-pointer`}
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </header>

      {/* Metrics Row */}
      <div className="px-4 sm:px-6 pt-4 shrink-0">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">

          {/* Inquiries Stat */}
          <div
            onClick={() => setActiveTab("inquiries")}
            className={`p-3.5 border-2 transition-all cursor-pointer ${activeTab === "inquiries" ? cardActive : cardInactive
              }`}
          >
            <div className="flex justify-between items-center text-xs mb-1 font-['Silkscreen']">
              <span>DIRECT INQUIRIES</span>
              <Mail className="w-4 h-4" />
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-['Press_Start_2P']">
                {inquiries.length}
              </span>
              {unreadInquiriesCount > 0 && (
                <span className="text-[10px] font-bold px-1.5 py-0.5 border border-current font-mono">
                  {unreadInquiriesCount} UNREAD
                </span>
              )}
            </div>
          </div>

          {/* Visitors Stat */}
          <div
            onClick={() => setActiveTab("visitors")}
            className={`p-3.5 border-2 transition-all cursor-pointer ${activeTab === "visitors" ? cardActive : cardInactive
              }`}
          >
            <div className="flex justify-between items-center text-xs mb-1 font-['Silkscreen']">
              <span>PORTFOLIO VISITORS</span>
              <Users className="w-4 h-4" />
            </div>
            <span className="text-2xl font-bold font-['Press_Start_2P']">
              {visitors.length}
            </span>
          </div>

          {/* Global Messages Stat */}
          <div
            onClick={() => setActiveTab("messages")}
            className={`p-3.5 border-2 transition-all cursor-pointer ${activeTab === "messages" ? cardActive : cardInactive
              }`}
          >
            <div className="flex justify-between items-center text-xs mb-1 font-['Silkscreen']">
              <span>GLOBAL CHAT MESSAGES</span>
              <MessageSquare className="w-4 h-4" />
            </div>
            <span className="text-2xl font-bold font-['Press_Start_2P']">
              {messages.length}
            </span>
          </div>

        </div>
      </div>

      {/* Main Tab Container */}
      <div className="px-4 sm:px-6 pt-4 pb-4 flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Tab Header Buttons */}
        <div className={`flex flex-wrap border-b-2 ${border} gap-1.5 shrink-0`}>
          <button
            onClick={() => setActiveTab("inquiries")}
            className={`px-4 py-2 font-['Silkscreen'] text-xs flex items-center gap-2 border-t-2 border-x-2 transition-colors cursor-pointer ${activeTab === "inquiries"
              ? tabActive
              : tabInactive
              }`}
          >
            <Inbox size={15} /> Direct Messages {unreadInquiriesCount > 0 && `(${unreadInquiriesCount})`}
          </button>

          <button
            onClick={() => setActiveTab("visitors")}
            className={`px-4 py-2 font-['Silkscreen'] text-xs flex items-center gap-2 border-t-2 border-x-2 transition-colors cursor-pointer ${activeTab === "visitors"
              ? tabActive
              : tabInactive
              }`}
          >
            <Users size={15} /> Portfolio Visitors ({visitors.length})
          </button>

          <button
            onClick={() => setActiveTab("messages")}
            className={`px-4 py-2 font-['Silkscreen'] text-xs flex items-center gap-2 border-t-2 border-x-2 transition-colors cursor-pointer ${activeTab === "messages"
              ? tabActive
              : tabInactive
              }`}
          >
            <MessageSquare size={15} /> Global Messages ({messages.length})
          </button>

          <button
            onClick={() => setActiveTab("sql")}
            className={`px-4 py-2 font-['Silkscreen'] text-xs flex items-center gap-2 border-t-2 border-x-2 transition-colors cursor-pointer ml-auto ${activeTab === "sql"
              ? tabActive
              : tabInactive
              }`}
          >
            <Database size={15} /> Supabase SQL Setup
          </button>
        </div>

        {/* TAB 1: DIRECT CLIENT INQUIRIES */}
        {activeTab === "inquiries" && (
          <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-3">
            {/* Search & Filter Bar */}
            <div className={`flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${bg} border-2 ${border} p-2.5 shrink-0`}>
              <div className="relative w-full sm:w-80">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${dimText}`} />
                <input
                  type="text"
                  placeholder="Search name, email, message..."
                  value={inquirySearch}
                  onChange={(e) => setInquirySearch(e.target.value)}
                  className={`w-full ${inputCls} border pl-8 pr-2.5 py-1.5 text-xs rounded-none outline-none`}
                />
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <Filter className={`w-3.5 h-3.5 ${text}`} />
                <span className={`text-xs ${text} font-['Silkscreen']`}>Filter:</span>
                {(["all", "unread", "read", "archived"] as const).map((st) => (
                  <button
                    key={st}
                    onClick={() => setInquiryFilter(st)}
                    className={`text-xs px-2.5 py-1 uppercase font-['Silkscreen'] transition-colors ${inquiryFilter === st
                      ? `${invertedBg} font-bold`
                      : `${bg} ${text} border ${isDark ? "border-white/40" : "border-black/30"}`
                      }`}
                  >
                    {st}
                  </button>
                ))}
                <button
                  onClick={clearAllInquiries}
                  disabled={isClearing === "inquiries" || inquiries.length === 0}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1 font-['Silkscreen'] border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  {isClearing === "inquiries" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                  CLEAR ALL
                </button>
              </div>
            </div>

            {/* Inquiries Table */}
            <div className="flex-1 border-2 border-white bg-black overflow-y-auto custom-scrollbar min-h-0">
              <table className="w-full text-left text-xs">
                <thead className="bg-white text-black uppercase font-['Silkscreen'] sticky top-0 z-10">
                  <tr>
                    <th className="p-3">Status</th>
                    <th className="p-3">Sender</th>
                    <th className="p-3">Subject</th>
                    <th className="p-3">Message Snippet</th>
                    <th className="p-3">Location / IP</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/20">
                  {filteredInquiries.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="p-8 text-center text-neutral-400">
                        No direct client messages found.
                      </td>
                    </tr>
                  ) : (
                    filteredInquiries.map((item) => (
                      <tr
                        key={item.id}
                        onClick={() => setSelectedInquiry(item)}
                        className={`${rowHover} cursor-pointer transition-colors ${
                          item.status === "unread" ? `font-bold ${isDark ? "bg-white/10" : "bg-black/10"}` : ""
                        }`}
                      >
                        <td className="p-3 whitespace-nowrap">
                          {item.status === "unread" ? (
                            <span className={`inline-block ${invertedBg} font-bold px-2 py-0.5 text-[10px] font-['Silkscreen']`}>
                              UNREAD
                            </span>
                          ) : item.status === "read" ? (
                            <span className={`inline-block border ${border} ${text} px-2 py-0.5 text-[10px] font-['Silkscreen']`}>
                              READ
                            </span>
                          ) : (
                            <span className={`inline-block ${dimText} px-2 py-0.5 text-[10px] font-['Silkscreen']`}>
                              ARCHIVED
                            </span>
                          )}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <div className={`font-bold ${text}`}>{item.name}</div>
                          <div className={`${dimText} text-[11px]`}>{item.email}</div>
                        </td>
                        <td className={`p-3 whitespace-nowrap ${text} font-bold`}>{item.subject}</td>
                        <td className={`p-3 max-w-xs truncate ${dimText}`}>{item.message}</td>
                        <td className={`p-3 whitespace-nowrap ${dimText}`}>
                          <div>{item.location || "Earth"}</div>
                          <div className={`text-[10px] ${dimText}`}>{item.ipv4 || "No IP"}</div>
                        </td>
                        <td className={`p-3 whitespace-nowrap ${dimText}`}>{formatDate(item.created_at)}</td>
                        <td className="p-3 text-right whitespace-nowrap space-x-2" onClick={(e) => e.stopPropagation()}>
                          {item.status === "unread" ? (
                            <button
                              onClick={() => updateInquiryStatus(item.id, "read")}
                              title="Mark as Read"
                              className={`p-1.5 ${bg} ${hoverBg} ${text} border ${border} transition-colors`}
                            >
                              <CheckCircle size={14} />
                            </button>
                          ) : (
                            <button
                              onClick={() => updateInquiryStatus(item.id, "unread")}
                              title="Mark as Unread"
                              className={`p-1.5 ${bg} ${hoverBg} ${text} border ${border} transition-colors`}
                            >
                              <Clock size={14} />
                            </button>
                          )}
                          <button
                            onClick={() => deleteInquiry(item.id)}
                            title="Delete"
                            className={`p-1.5 ${bg} ${hoverBg} ${text} border ${border} transition-colors`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 2: PORTFOLIO VISITORS */}
        {activeTab === "visitors" && (
          <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-3">
            {/* Search Bar & Clear All */}
            <div className={`${bg} border-2 ${border} p-2.5 shrink-0 flex items-center justify-between gap-4`}>
              <div className="relative flex-1">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${dimText}`} />
                <input
                  type="text"
                  placeholder="Search IP, Location, OS, Browser..."
                  value={visitorSearch}
                  onChange={(e) => setVisitorSearch(e.target.value)}
                  className={`w-full ${inputCls} border pl-8 pr-2.5 py-1.5 text-xs rounded-none outline-none`}
                />
              </div>
              <button
                onClick={clearAllVisitors}
                disabled={isClearing === "visitors" || visitors.length === 0}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 font-['Silkscreen'] border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isClearing === "visitors" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                CLEAR ALL
              </button>
            </div>

            {/* Visitors Table */}
            <div className={`flex-1 border-2 ${border} ${bg} overflow-y-auto custom-scrollbar min-h-0`}>
              <table className="w-full text-left text-xs">
                <thead className={`${invertedBg} uppercase font-['Silkscreen'] sticky top-0 z-10`}>
                  <tr>
                    <th className="p-3">Location</th>
                    <th className="p-3">IP Address</th>
                    <th className="p-3">Browser & OS</th>
                    <th className="p-3">Device</th>
                    <th className="p-3">ISP / Network</th>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3 text-right">Details</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-white/20" : "divide-black/20"}`}>
                  {filteredVisitors.length === 0 ? (
                    <tr>
                      <td colSpan={7} className={`p-8 text-center ${dimText}`}>
                        No visitor records found.
                      </td>
                    </tr>
                  ) : (
                    filteredVisitors.map((v) => (
                      <tr
                        key={v.id}
                        onClick={() => setSelectedVisitor(v)}
                        className={`${rowHover} cursor-pointer transition-colors`}
                      >
                        <td className={`p-3 whitespace-nowrap font-bold ${text} flex items-center gap-1.5`}>
                          <MapPin size={14} className="shrink-0" /> {v.location || "Earth"}
                        </td>
                        <td className={`p-3 whitespace-nowrap ${text} font-mono`}>
                          {v.ipv4 || v.ipv6 || "N/A"}
                        </td>
                        <td className={`p-3 whitespace-nowrap ${text}`}>
                          {v.browser} <span className={dimText}>({v.os})</span>
                        </td>
                        <td className={`p-3 whitespace-nowrap ${dimText}`}>{v.device_model || "Desktop"}</td>
                        <td className={`p-3 max-w-xs truncate ${dimText}`}>{v.isp || "Unknown"}</td>
                        <td className={`p-3 whitespace-nowrap ${dimText}`}>{formatDate(v.created_at)}</td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => setSelectedVisitor(v)}
                            className={`p-1.5 ${bg} ${hoverBg} ${text} border ${border} transition-colors`}
                          >
                            <Eye size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GLOBAL MESSAGES */}
        {activeTab === "messages" && (
          <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-3">
            {/* Search Bar & Clear All */}
            <div className={`${bg} border-2 ${border} p-2.5 shrink-0 flex items-center justify-between gap-4`}>
              <div className="relative flex-1">
                <Search className={`w-3.5 h-3.5 absolute left-3 top-2.5 ${dimText}`} />
                <input
                  type="text"
                  placeholder="Search user, content, location..."
                  value={messageSearch}
                  onChange={(e) => setMessageSearch(e.target.value)}
                  className={`w-full ${inputCls} border pl-8 pr-2.5 py-1.5 text-xs rounded-none outline-none`}
                />
              </div>
              <button
                onClick={clearAllMessages}
                disabled={isClearing === "messages" || messages.length === 0}
                className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 font-['Silkscreen'] border-2 border-red-500 text-red-500 hover:bg-red-500 hover:text-white transition-colors cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
              >
                {isClearing === "messages" ? <Loader2 className="w-3 h-3 animate-spin" /> : <Trash2 className="w-3 h-3" />}
                CLEAR ALL
              </button>
            </div>

            {/* Messages Table */}
            <div className={`flex-1 border-2 ${border} ${bg} overflow-y-auto custom-scrollbar min-h-0`}>
              <table className="w-full text-left text-xs">
                <thead className={`${invertedBg} uppercase font-['Silkscreen'] sticky top-0 z-10`}>
                  <tr>
                    <th className="p-3">User</th>
                    <th className="p-3">Message Content</th>
                    <th className="p-3">Location</th>
                    <th className="p-3">IP</th>
                    <th className="p-3">Date</th>
                    <th className="p-3 text-right">Delete</th>
                  </tr>
                </thead>
                <tbody className={`divide-y ${isDark ? "divide-white/20" : "divide-black/20"}`}>
                  {filteredMessages.length === 0 ? (
                    <tr>
                      <td colSpan={6} className={`p-8 text-center ${dimText}`}>
                        No global messages recorded.
                      </td>
                    </tr>
                  ) : (
                    filteredMessages.map((m) => (
                      <tr key={m.id} className={`${rowHover} transition-colors`}>
                        <td className={`p-3 whitespace-nowrap font-bold ${text}`}>{m.username}</td>
                        <td className={`p-3 ${text} max-w-md break-words`}>{m.content}</td>
                        <td className={`p-3 whitespace-nowrap ${dimText}`}>{m.location || "Earth"}</td>
                        <td className={`p-3 whitespace-nowrap ${dimText} font-mono`}>{m.ipv4 || "N/A"}</td>
                        <td className={`p-3 whitespace-nowrap ${dimText}`}>{formatDate(m.created_at)}</td>
                        <td className="p-3 text-right whitespace-nowrap">
                          <button
                            onClick={() => deleteGlobalMessage(m.id)}
                            className={`p-1.5 ${bg} ${hoverBg} ${text} border ${border} transition-colors`}
                          >
                            <Trash2 size={14} />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 4: SUPABASE SQL SETUP */}
        {activeTab === "sql" && (
          <div className="flex-1 flex flex-col min-h-0 pt-3 space-y-3 overflow-hidden">
            <div className={`border-2 ${border} ${bg} p-3.5 flex items-start justify-between gap-4 shrink-0`}>
              <div>
                <h3 className={`font-['Press_Start_2P'] text-xs ${text} mb-1.5`}>SUPABASE DDL SCRIPT</h3>
                <p className={`text-xs ${dimText}`}>
                  Copy and run this SQL script in your Supabase SQL Editor to instantly create all tables, RLS policies, and triggers required for this dashboard.
                </p>
              </div>
              <button
                onClick={copySql}
                className={`${invertedBg} ${hoverBg} font-['Silkscreen'] text-xs px-4 py-2 border-2 ${border} transition-all flex items-center gap-2 shrink-0 cursor-pointer font-bold`}
              >
                {copiedSql ? <Check size={14} /> : <Copy size={14} />}
                {copiedSql ? "COPIED!" : "COPY SQL"}
              </button>
            </div>

            <pre className={`flex-1 ${bg} border-2 ${border} p-4 text-xs ${text} overflow-y-auto custom-scrollbar font-mono leading-relaxed min-h-0`}>
              {sqlScript}
            </pre>
          </div>
        )}

      </div>

      {/* MODAL: INQUIRY DETAILS */}
      <AnimatePresence>
        {selectedInquiry && (
          <div
            onClick={() => setSelectedInquiry(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${bg} border-2 ${border} max-w-2xl w-full p-6 shadow-2xl space-y-6 ${text}`}
            >
              <div className={`flex justify-between items-start border-b-2 ${border} pb-4`}>
                <div>
                  <span className={`text-xs font-['Silkscreen'] ${dimText} uppercase`}>
                    DIRECT CLIENT MESSAGE
                  </span>
                  <h2 className={`text-xl font-bold ${text} mt-1`}>{selectedInquiry.subject}</h2>
                </div>
                <button
                  onClick={() => setSelectedInquiry(null)}
                  className={`${text} ${hoverBg} text-xs px-3 py-1 border ${border} transition-colors`}
                >
                  ✕ CLOSE
                </button>
              </div>

              <div className={`grid grid-cols-2 gap-4 text-xs ${bg} p-4 border-2 ${border}`}>
                <div>
                  <span className={`${dimText} block`}>SENDER NAME</span>
                  <span className={`font-bold ${text}`}>{selectedInquiry.name}</span>
                </div>
                <div>
                  <span className={`${dimText} block`}>EMAIL ADDRESS</span>
                  <a href={`mailto:${selectedInquiry.email}`} className={`${text} underline font-bold`}>
                    {selectedInquiry.email}
                  </a>
                </div>
                <div>
                  <span className={`${dimText} block`}>LOCATION</span>
                  <span className={text}>{selectedInquiry.location || "Earth"}</span>
                </div>
                <div>
                  <span className={`${dimText} block`}>IP / ISP</span>
                  <span className={text}>{selectedInquiry.ipv4 || "N/A"} ({selectedInquiry.isp || "Unknown"})</span>
                </div>
              </div>

              <div>
                <span className={`text-xs font-['Silkscreen'] ${dimText} block mb-2`}>MESSAGE CONTENT</span>
                <div className={`${bg} border-2 ${border} p-4 ${text} text-xs whitespace-pre-wrap leading-relaxed`}>
                  {selectedInquiry.message}
                </div>
              </div>

              <div className={`flex justify-between items-center pt-4 border-t-2 ${border}`}>
                <div className={`text-xs ${dimText}`}>
                  Received: {formatDate(selectedInquiry.created_at)}
                </div>

                <div className="flex gap-3">
                  <a
                    href={`mailto:${selectedInquiry.email}?subject=Re: ${encodeURIComponent(selectedInquiry.subject)}`}
                    className={`${invertedBg} ${hoverBg} border-2 ${border} font-['Silkscreen'] text-xs px-4 py-2 font-bold transition-colors flex items-center gap-2`}
                  >
                    <Mail size={14} /> REPLY VIA EMAIL
                  </a>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* MODAL: VISITOR HARDWARE DETAILS */}
      <AnimatePresence>
        {selectedVisitor && (
          <div
            onClick={() => setSelectedVisitor(null)}
            className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className={`${bg} border-2 ${border} max-w-2xl w-full p-6 shadow-2xl space-y-6 ${text}`}
            >
              <div className={`flex justify-between items-start border-b-2 ${border} pb-4`}>
                <div>
                  <span className={`text-xs font-['Silkscreen'] ${dimText} uppercase`}>
                    VISITOR TELEMETRY & HARDWARE SPECS
                  </span>
                  <h2 className={`text-lg font-bold ${text} mt-1 flex items-center gap-2`}>
                    <MapPin className={text} size={18} /> {selectedVisitor.location || "Unknown Location"}
                  </h2>
                </div>
                <button
                  onClick={() => setSelectedVisitor(null)}
                  className={`${text} ${hoverBg} text-xs px-3 py-1 border ${border} transition-colors`}
                >
                  ✕ CLOSE
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div className={`${bg} p-3 border ${border}`}>
                  <span className={`${dimText} block mb-1`}>IPv4 ADDRESS</span>
                  <span className={`font-mono font-bold ${text}`}>{selectedVisitor.ipv4 || "N/A"}</span>
                </div>
                <div className={`${bg} p-3 border ${border}`}>
                  <span className={`${dimText} block mb-1`}>OPERATING SYSTEM</span>
                  <span className={text}>{selectedVisitor.os}</span>
                </div>
                <div className={`${bg} p-3 border ${border}`}>
                  <span className={`${dimText} block mb-1`}>BROWSER</span>
                  <span className={text}>{selectedVisitor.browser}</span>
                </div>

                <div className={`${bg} p-3 border ${border}`}>
                  <span className={`${dimText} block mb-1`}>GPU RENDERER</span>
                  <span className={`${text} truncate block`} title={selectedVisitor.gpu}>
                    {selectedVisitor.gpu || "Unknown GPU"}
                  </span>
                </div>
                <div className={`${bg} p-3 border ${border}`}>
                  <span className={`${dimText} block mb-1`}>RAM / CPU CORES</span>
                  <span className={text}>
                    {selectedVisitor.ram || "?"} RAM / {selectedVisitor.cpu_cores || "?"} Cores
                  </span>
                </div>
                <div className={`${bg} p-3 border ${border}`}>
                  <span className={`${dimText} block mb-1`}>SCREEN RESOLUTION</span>
                  <span className={text}>{selectedVisitor.screen_resolution || "N/A"}</span>
                </div>

                <div className={`${bg} p-3 border ${border}`}>
                  <span className={`${dimText} block mb-1`}>BATTERY LEVEL</span>
                  <span className={text}>{selectedVisitor.battery_level || "N/A"}</span>
                </div>
                <div className={`${bg} p-3 border ${border}`}>
                  <span className={`${dimText} block mb-1`}>CONNECTION TYPE</span>
                  <span className={text}>{selectedVisitor.connection_type || "N/A"}</span>
                </div>
                <div className={`${bg} p-3 border ${border}`}>
                  <span className={`${dimText} block mb-1`}>REFERRER URL</span>
                  <span className={`${text} truncate block`} title={selectedVisitor.referrer_url}>
                    {selectedVisitor.referrer_url || "Direct"}
                  </span>
                </div>
              </div>

              {selectedVisitor.latitude && selectedVisitor.longitude && (
                <div className="pt-2">
                  <a
                    href={`https://www.google.com/maps?q=${selectedVisitor.latitude},${selectedVisitor.longitude}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`inline-flex items-center gap-2 ${invertedBg} ${hoverBg} border-2 ${border} px-4 py-2 font-bold text-xs transition-colors`}
                  >
                    <ExternalLink size={14} /> Open Location on Google Maps ({selectedVisitor.latitude}, {selectedVisitor.longitude})
                  </a>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
