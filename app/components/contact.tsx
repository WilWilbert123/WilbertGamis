"use client";

import { useEffect, useState, useRef } from "react";
import {
  Send,
  AlertCircle,
  Loader2,
  MapPin,
  Globe,
  ChevronLeft,
  Battery,
  Signal,
  Wifi,
  Check,
} from "lucide-react";
import { FaGithub, FaXTwitter, FaLinkedin, FaInstagram } from "react-icons/fa6";
import { Mail } from "lucide-react";
import { profile } from "../../data/profile";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";

const SUBJECTS = [
  { value: "Project Inquiry", label: "Freelance" },
  { value: "Job Opportunity", label: "Job offer" },
  { value: "General Question", label: "Question" },
  { value: "Just Saying Hi", label: "Just hi" },
] as const;

const SOCIALS = [
  { href: profile.socials.github, label: "GitHub", icon: FaGithub },
  { href: profile.socials.twitter, label: "X", icon: FaXTwitter },
  { href: profile.socials.linkedin, label: "LinkedIn", icon: FaLinkedin },
  { href: profile.socials.instagram, label: "Instagram", icon: FaInstagram },
  { href: profile.socials.email, label: "Mail", icon: Mail },
] as const;

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Project Inquiry",
    message: "",
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [clock, setClock] = useState("9:41");
  const [sentPreview, setSentPreview] = useState<string | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  const [showAutoReply, setShowAutoReply] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  // Auto adjust textarea height dynamically up to a maximum height limit
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = "auto";
      el.style.height = `${Math.min(el.scrollHeight, 110)}px`;
    }
  }, [formData.message]);

  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(
        now.toLocaleTimeString([], { hour: "numeric", minute: "2-digit", hour12: false })
      );
    };
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage("Add your name, email, and a message first.");
      setStatus("error");
      return;
    }

    const currentMsg = formData.message.trim();
    setStatus("sending");
    setErrorMessage("");

    try {
      const userAgent = typeof window !== "undefined" ? window.navigator.userAgent : "Unknown";
      let location = "Earth";
      let ipv4 = "";
      let isp = "";

      try {
        const ipRes = await fetch("https://ipinfo.io/json").then((r) => r.json());
        if (ipRes && ipRes.ip) {
          ipv4 = ipRes.ip;
          isp = ipRes.org || "";
          if (ipRes.city) {
            location = ipRes.country ? `${ipRes.city}, ${ipRes.country}` : ipRes.city;
          }
        }
      } catch {
        // Fallback silently if IP service is unavailable
      }

      const { error } = await supabase.from("contact_messages").insert([
        {
          name: formData.name.trim(),
          email: formData.email.trim(),
          subject: formData.subject,
          message: currentMsg,
          status: "unread",
          device_info: userAgent,
          location: location,
          ipv4: ipv4,
          isp: isp,
        },
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      setSentPreview(currentMsg);
      setStatus("success");
      setFormData({ name: "", email: "", subject: "Project Inquiry", message: "" });
      setShowAutoReply(false);

      // Simulate typing indicator and realistic auto-reply
      setTimeout(() => {
        setIsTyping(true);
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 600);

      setTimeout(() => {
        setIsTyping(false);
        setShowAutoReply(true);
        chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
      }, 2200);

    } catch (err: unknown) {
      console.error("Failed to send message:", err);
      setStatus("error");
      const message = err instanceof Error ? err.message : "Couldn't send. Try again or email me.";
      setErrorMessage(message);
    }
  };

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } },
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0, 0, 0.2, 1] } },
  };

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden" id="contact">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.3 }}
          className="text-center mb-10 sm:mb-14"
        >
          <motion.h2
            variants={fadeUp}
            className="font-['Press_Start_2P'] text-lg sm:text-2xl md:text-3xl leading-snug tracking-tight"
          >
            let's connect
          </motion.h2>
          <motion.p
            variants={fadeUp}
            className="font-['Silkscreen'] mt-4 text-xs sm:text-sm text-foreground/80 max-w-xl mx-auto leading-relaxed"
          >
            Drop a text like you would on your phone. Name, email, and a short message is all I need.
          </motion.p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.12 }}
          transition={{ duration: 0.55, ease: [0, 0, 0.2, 1] }}
          className="flex justify-center"
        >
          <div className="relative w-full max-w-[380px]">
            <div className="absolute -inset-3 rounded-[3.4rem] bg-black/10 dark:bg-white/10 blur-2xl opacity-50 pointer-events-none" />

            {/* Pixelated / Clean Monochromatic Phone Bezel */}
            <div className="relative rounded-[3rem] bg-black border-2 border-black dark:border-white/20 p-[10px] shadow-[0_25px_60px_-15px_rgba(0,0,0,0.7)]">
              <div className="relative rounded-[2.4rem] overflow-hidden bg-white dark:bg-[#09090b] h-[650px] flex flex-col border border-neutral-200 dark:border-neutral-800">
                {/* Dynamic Island */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 h-[24px] w-[110px] rounded-full bg-black dark:bg-black border border-neutral-800" />

                {/* Status bar */}
                <div className="relative z-20 flex items-center justify-between px-7 pt-3.5 pb-1 text-[11px] font-mono font-bold text-black dark:text-white">
                  <span className="tabular-nums">{clock}</span>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <Signal className="w-3.5 h-3.5" strokeWidth={2.4} />
                    <Wifi className="w-3.5 h-3.5" strokeWidth={2.4} />
                    <Battery className="w-5 h-3.5" strokeWidth={2.2} />
                  </div>
                </div>

                {/* Messages nav */}
                <div className="relative z-10 flex items-center gap-1 px-2 pt-1 pb-2 bg-white/90 dark:bg-black/90 border-b border-neutral-200 dark:border-neutral-800 backdrop-blur-md">
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    className="p-1 text-black dark:text-white pointer-events-none"
                  >
                    <ChevronLeft className="w-6 h-6" strokeWidth={2.2} />
                  </button>
                  <div className="flex-1 flex flex-col items-center -ml-6">
                    <div className="w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center font-bold text-xs tracking-wider border border-black dark:border-white">
                      WG
                    </div>
                    <p className="mt-1 text-[12px] font-bold text-black dark:text-white leading-none font-mono">
                      {profile.name}
                    </p>
                    <p className="mt-0.5 text-[9px] text-neutral-500 dark:text-neutral-400 font-mono tracking-tighter">
                      Available for hire · Remote
                    </p>
                  </div>
                  <span className="w-7" />
                </div>

                {/* Chat + form */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-2 space-y-2.5">
                    {/* Monochromatic Social Quick-Links */}
                    <div className="rounded-xl bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-2.5 py-2.5 mt-1">
                      <div className="flex items-center justify-between gap-1">
                        {SOCIALS.map(({ href, label, icon: Icon }) => (
                          <a
                            key={label}
                            href={href}
                            target={href.startsWith("mailto:") ? undefined : "_blank"}
                            rel="noopener noreferrer"
                            title={label}
                            className="flex flex-col items-center gap-1 min-w-[42px] group"
                          >
                            <span className="w-8 h-8 flex items-center justify-center text-black dark:text-white transition-transform group-hover:scale-110 group-active:scale-95">
                              <Icon size={20} />
                            </span>
                            <span className="text-[9px] text-neutral-600 dark:text-neutral-400 font-mono font-medium">
                              {label}
                            </span>
                          </a>
                        ))}
                      </div>
                      <div className="mt-2 pt-2 border-t border-neutral-200/60 dark:border-neutral-800 flex items-center justify-center gap-3 text-[10px] text-neutral-500 dark:text-neutral-400 font-mono">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-black dark:text-white" /> PH (GMT+8)
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Globe className="w-3 h-3 text-black dark:text-white" /> Worldwide
                        </span>
                      </div>
                    </div>

                    <p className="text-center text-[10px] text-neutral-400 font-mono py-0.5 uppercase tracking-wider">Today</p>

                    <IncomingBubble>
                      Hey — looking for a fullstack or mobile engineer? Leave your name and email, pick a topic, then hit send.
                    </IncomingBubble>

                    {/* Identity input fields */}
                    <div className="rounded-xl overflow-hidden bg-neutral-50 dark:bg-neutral-900/90 border border-neutral-200 dark:border-neutral-800 divide-y divide-neutral-200 dark:divide-neutral-800">
                      <label className="flex items-center gap-2.5 px-3 h-9">
                        <span className="text-[12px] font-mono text-neutral-500 w-12 shrink-0">Name</span>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="flex-1 bg-transparent text-[13px] text-black dark:text-white outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-sans"
                        />
                      </label>
                      <label className="flex items-center gap-2.5 px-3 h-9">
                        <span className="text-[12px] font-mono text-neutral-500 w-12 shrink-0">Email</span>
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="flex-1 bg-transparent text-[13px] text-black dark:text-white outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-600 font-sans"
                        />
                      </label>
                    </div>

                    {/* Topic Buttons (Clean 1-row layout) */}
                    <div className="grid grid-cols-4 gap-1 pt-0.5">
                      {SUBJECTS.map((item) => {
                        const active = formData.subject === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, subject: item.value })}
                            className={`text-[11px] py-1.5 px-1 rounded-lg border font-mono transition-all text-center truncate ${
                              active
                                ? "bg-black dark:bg-white border-black dark:border-white text-white dark:text-black font-semibold shadow-sm"
                                : "bg-neutral-100 dark:bg-neutral-900 border-neutral-200 dark:border-neutral-800 text-neutral-700 dark:text-neutral-300 hover:border-black/40 dark:hover:border-white/40"
                            }`}
                          >
                            {item.label}
                          </button>
                        );
                      })}
                    </div>

                    <AnimatePresence>
                      {sentPreview && status === "success" && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          className="flex flex-col items-end"
                        >
                          <div className="max-w-[85%] rounded-2xl rounded-br-xs bg-black dark:bg-white text-white dark:text-black px-3.5 py-2 text-[13px] leading-relaxed border border-black dark:border-white">
                            {sentPreview}
                          </div>
                          <span className="mt-1 mr-1 inline-flex items-center gap-0.5 text-[10px] text-neutral-400 font-mono">
                            <Check className="w-3 h-3 text-black dark:text-white" /> Delivered
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Animated Typing Indicator */}
                    <AnimatePresence>
                      {isTyping && (
                        <motion.div
                          initial={{ opacity: 0, y: 6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -4 }}
                          className="flex justify-start"
                        >
                          <div className="rounded-2xl rounded-bl-xs bg-neutral-100 dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "0ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "150ms" }} />
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-500 animate-bounce" style={{ animationDelay: "300ms" }} />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {/* Clean Professional Auto-Reply Bubble */}
                    <AnimatePresence>
                      {showAutoReply && (
                        <motion.div
                          initial={{ opacity: 0, y: 8, scale: 0.96 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          transition={{ duration: 0.35, ease: [0, 0, 0.2, 1] }}
                        >
                          <IncomingBubble>
                            Thanks for reaching out! I've received your message and will get back to you as soon as possible.
                          </IncomingBubble>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <div ref={chatBottomRef} />

                    <AnimatePresence>
                      {status === "error" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2 rounded-xl bg-neutral-900 text-white dark:bg-white dark:text-black border border-black dark:border-white px-3 py-2 text-[11px] font-mono"
                        >
                          <AlertCircle size={14} className="shrink-0 mt-0.5" />
                          <span>{errorMessage}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Clean iMessage auto-adjusting composer */}
                  <div className="px-2.5 pt-1.5 pb-2.5 bg-white dark:bg-black border-t border-neutral-200 dark:border-neutral-800">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 flex items-center rounded-2xl border border-neutral-300 dark:border-neutral-700 bg-neutral-100 dark:bg-neutral-900 min-h-[38px] px-3 py-1">
                        <textarea
                          ref={textareaRef}
                          required
                          rows={1}
                          placeholder="iMessage"
                          value={formData.message}
                          onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              (e.currentTarget.form as HTMLFormElement | null)?.requestSubmit();
                            }
                          }}
                          className="w-full max-h-[110px] resize-none bg-transparent text-[13px] leading-5 text-black dark:text-white outline-none placeholder:text-neutral-400 dark:placeholder:text-neutral-500 font-sans scrollbar-hide py-1"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={status === "sending"}
                        aria-label="Send message"
                        className="mb-0.5 w-9 h-9 rounded-full bg-black dark:bg-white text-white dark:text-black flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-transform border border-black dark:border-white"
                      >
                        {status === "sending" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 -ml-0.5" />
                        )}
                      </button>
                    </div>
                    <div className="mx-auto mt-2 h-[4px] w-[110px] rounded-full bg-black dark:bg-white" />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function IncomingBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex justify-start">
      <div className="max-w-[85%] rounded-2xl rounded-bl-xs bg-neutral-100 dark:bg-neutral-900 text-black dark:text-white border border-neutral-200 dark:border-neutral-800 px-3.5 py-2.5 text-[13px] leading-relaxed font-sans">
        {children}
      </div>
    </div>
  );
}
