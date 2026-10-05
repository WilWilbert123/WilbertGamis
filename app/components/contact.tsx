"use client";

import { useEffect, useState } from "react";
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
  { href: profile.socials.github, label: "GitHub", icon: FaGithub, tint: "bg-neutral-900 text-white dark:bg-white dark:text-black" },
  { href: profile.socials.twitter, label: "X", icon: FaXTwitter, tint: "bg-neutral-900 text-white dark:bg-white dark:text-black" },
  { href: profile.socials.linkedin, label: "LinkedIn", icon: FaLinkedin, tint: "bg-[#0A66C2] text-white" },
  { href: profile.socials.instagram, label: "Instagram", icon: FaInstagram, tint: "bg-gradient-to-br from-[#f58529] via-[#dd2a7b] to-[#8134af] text-white" },
  { href: profile.socials.email, label: "Mail", icon: Mail, tint: "bg-[#007AFF] text-white" },
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
          message: formData.message.trim(),
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

      setSentPreview(formData.message.trim());
      setStatus("success");
      setFormData({ name: "", email: "", subject: "Project Inquiry", message: "" });
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
            className="font-['Press_Start_2P'] text-lg sm:text-2xl md:text-3xl leading-snug"
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
          <div className="relative w-full max-w-[390px]">
            <div className="absolute -inset-3 rounded-[3.4rem] bg-foreground/10 dark:bg-white/20 blur-2xl opacity-60 dark:opacity-40 pointer-events-none" />

            {/* Phone bezel */}
            <div className="relative rounded-[3rem] bg-[#1c1c1e] dark:bg-neutral-300 p-[11px] shadow-[0_28px_80px_-20px_rgba(0,0,0,0.55)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.55),0_24px_70px_-18px_rgba(255,255,255,0.22)] ring-1 ring-black/50 dark:ring-white">
              <div className="relative rounded-[2.4rem] overflow-hidden bg-[#F2F2F7] dark:bg-[#0b0b0d] h-[640px] sm:h-[680px] flex flex-col ring-1 ring-black/30 dark:ring-black/80">
                {/* Dynamic Island */}
                <div className="absolute top-2.5 left-1/2 -translate-x-1/2 z-30 h-[26px] w-[118px] rounded-full bg-black dark:bg-neutral-950 ring-1 ring-black/40 dark:ring-white/15" />

                {/* Status bar */}
                <div className="relative z-20 flex items-center justify-between px-7 pt-3.5 pb-1 text-[12px] font-semibold text-black dark:text-white">
                  <span className="tabular-nums min-w-[42px] whitespace-nowrap">{clock}</span>
                  <div className="flex items-center gap-1.5 opacity-90">
                    <Signal className="w-3.5 h-3.5" strokeWidth={2.4} />
                    <Wifi className="w-3.5 h-3.5" strokeWidth={2.4} />
                    <Battery className="w-5 h-3.5" strokeWidth={2.2} />
                  </div>
                </div>

                {/* Messages nav */}
                <div className="relative z-10 flex items-center gap-1 px-2 pt-1 pb-2 bg-[#F2F2F7]/90 dark:bg-black/80 backdrop-blur-md">
                  <button
                    type="button"
                    tabIndex={-1}
                    aria-hidden
                    className="p-2 text-[#007AFF] pointer-events-none"
                  >
                    <ChevronLeft className="w-7 h-7" strokeWidth={2.2} />
                  </button>
                  <div className="flex-1 flex flex-col items-center -ml-8">
                    <div className="w-10 h-10 rounded-full bg-neutral-800 dark:bg-neutral-200 text-white dark:text-black flex items-center justify-center font-semibold text-sm tracking-tight">
                      WG
                    </div>
                    <p className="mt-1 text-[13px] font-semibold text-black dark:text-white leading-none">
                      {profile.name}
                    </p>
                    <p className="mt-0.5 text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">
                      Available for hire · Remote
                    </p>
                  </div>
                  <span className="w-9" />
                </div>

                {/* Chat + form */}
                <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0">
                  <div className="flex-1 overflow-y-auto scrollbar-hide px-3 pb-3 space-y-3">
                    {/* In-phone socials */}
                    <div className="rounded-2xl bg-white/80 dark:bg-white/10 px-3 py-3 mt-1">
                      <div className="flex items-center justify-center gap-3">
                        {SOCIALS.map(({ href, label, icon: Icon, tint }) => (
                          <a
                            key={label}
                            href={href}
                            target={href.startsWith("mailto:") ? undefined : "_blank"}
                            rel="noopener noreferrer"
                            title={label}
                            className="flex flex-col items-center gap-1 min-w-[48px] group"
                          >
                            <span className={`w-11 h-11 rounded-[14px] flex items-center justify-center shadow-sm ${tint} transition-transform group-active:scale-95`}>
                              <Icon size={18} />
                            </span>
                            <span className="text-[9px] text-neutral-500 dark:text-neutral-400 font-medium">
                              {label}
                            </span>
                          </a>
                        ))}
                      </div>
                      <div className="mt-3 flex items-center justify-center gap-4 text-[11px] text-neutral-500 dark:text-neutral-400">
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3 h-3" /> Philippines (GMT+8)
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Globe className="w-3 h-3" /> Worldwide
                        </span>
                      </div>
                    </div>

                    <p className="text-center text-[11px] text-neutral-400 font-medium py-1">Today</p>

                    <IncomingBubble>
                      Hey — looking for a fullstack or mobile engineer? Leave your name and email, pick a topic, then hit send.
                    </IncomingBubble>

                    {/* Identity fields */}
                    <div className="rounded-2xl overflow-hidden bg-white dark:bg-white/10 divide-y divide-neutral-200/80 dark:divide-white/10">
                      <label className="flex items-center gap-3 px-3.5 h-11">
                        <span className="text-[13px] text-neutral-500 w-14 shrink-0">Name</span>
                        <input
                          type="text"
                          required
                          placeholder="John Doe"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className="flex-1 bg-transparent text-[15px] text-black dark:text-white outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                        />
                      </label>
                      <label className="flex items-center gap-3 px-3.5 h-11">
                        <span className="text-[13px] text-neutral-500 w-14 shrink-0">Email</span>
                        <input
                          type="email"
                          required
                          placeholder="john@example.com"
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="flex-1 bg-transparent text-[15px] text-black dark:text-white outline-none placeholder:text-neutral-300 dark:placeholder:text-neutral-600"
                        />
                      </label>
                    </div>

                    <div className="flex flex-wrap gap-1.5 px-0.5">
                      {SUBJECTS.map((item) => {
                        const active = formData.subject === item.value;
                        return (
                          <button
                            key={item.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, subject: item.value })}
                            className={`text-[12px] px-3 py-1.5 rounded-full border transition-colors ${
                              active
                                ? "bg-[#007AFF] border-[#007AFF] text-white"
                                : "bg-white dark:bg-white/10 border-neutral-200 dark:border-white/15 text-neutral-700 dark:text-neutral-200"
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
                          <div className="max-w-[82%] rounded-[20px] rounded-br-[6px] bg-[#007AFF] text-white px-3.5 py-2.5 text-[15px] leading-snug">
                            {sentPreview}
                          </div>
                          <span className="mt-1 mr-1 inline-flex items-center gap-0.5 text-[10px] text-neutral-400">
                            <Check className="w-3 h-3" /> Delivered
                          </span>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    <AnimatePresence>
                      {status === "error" && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="flex items-start gap-2 rounded-2xl bg-rose-500/10 text-rose-500 px-3 py-2.5 text-[12px]"
                        >
                          <AlertCircle size={14} className="shrink-0 mt-0.5" />
                          <span>{errorMessage}</span>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* iMessage composer */}
                  <div className="px-2.5 pt-1.5 pb-3 bg-[#F2F2F7] dark:bg-black">
                    <div className="flex items-end gap-2">
                      <div className="flex-1 flex items-end rounded-[22px] border border-neutral-300 dark:border-white/20 bg-white dark:bg-neutral-900 min-h-[36px] px-3.5 py-1.5">
                        <textarea
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
                          className="w-full max-h-24 resize-none bg-transparent text-[15px] leading-5 text-black dark:text-white outline-none placeholder:text-neutral-400"
                        />
                      </div>
                      <button
                        type="submit"
                        disabled={status === "sending"}
                        aria-label="Send message"
                        className="mb-px w-9 h-9 rounded-full bg-[#007AFF] text-white flex items-center justify-center shrink-0 disabled:opacity-40 active:scale-95 transition-transform"
                      >
                        {status === "sending" ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <Send className="w-4 h-4 -ml-0.5" />
                        )}
                      </button>
                    </div>
                    <div className="mx-auto mt-2.5 h-[4px] w-[120px] rounded-full bg-black/80 dark:bg-white/80" />
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
      <div className="max-w-[82%] rounded-[20px] rounded-bl-[6px] bg-[#E5E5EA] dark:bg-[#2C2C2E] text-black dark:text-white px-3.5 py-2.5 text-[15px] leading-snug">
        {children}
      </div>
    </div>
  );
}
