"use client";

import { useState } from "react";
import { Mail, Send, CheckCircle2, AlertCircle, Loader2, Sparkles, MapPin, Globe, Check, RotateCcw } from "lucide-react";
import { FaGithub, FaXTwitter, FaLinkedin, FaInstagram } from "react-icons/fa6";
import { profile } from "../../data/profile";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { supabase } from "@/lib/supabase";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "Project Inquiry",
    message: ""
  });
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setErrorMessage("Please fill in all required fields.");
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
        const ipRes = await fetch("https://ipinfo.io/json").then(r => r.json());
        if (ipRes && ipRes.ip) {
          ipv4 = ipRes.ip;
          isp = ipRes.org || "";
          if (ipRes.city) {
            location = ipRes.country ? `${ipRes.city}, ${ipRes.country}` : ipRes.city;
          }
        }
      } catch (err) {
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
          isp: isp
        }
      ]);

      if (error) {
        console.error("Supabase insert error:", error);
        throw error;
      }

      setStatus("success");
      setFormData({ name: "", email: "", subject: "Project Inquiry", message: "" });
    } catch (err: any) {
      console.error("Failed to send message:", err);
      setStatus("error");
      setErrorMessage(err.message || "Failed to send message. Please try again or email directly.");
    }
  };

  const containerVariants: Variants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.1 } }
  };

  const fadeUp: Variants = {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.55, ease: [0, 0, 0.2, 1] } }
  };

  const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.5, ease: [0, 0, 0.2, 1] } }
  };

  return (
    <section className="py-16 sm:py-24 relative overflow-hidden" id="contact">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Section Header */}
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
            My inbox is always open. Whether you have a project in mind or just want to say hi, send me a direct message!
          </motion.p>
        </motion.div>

        {/* Contact Card */}
        <motion.div
          variants={containerVariants}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.15 }}
          className="pixel-border bg-background shadow-2xl border-2 border-foreground/30 relative"
        >
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y-2 md:divide-y-0 md:divide-x-2 divide-foreground/20">

            {/* LEFT COLUMN */}
            <motion.div
              variants={fadeIn}
              className="md:col-span-4 p-5 sm:p-8 flex flex-col justify-between bg-foreground/[0.02]"
            >
              <div>
                <motion.div variants={fadeUp} className="flex items-center gap-2 text-foreground font-['Silkscreen'] text-xs font-bold mb-5">
                  <span className="w-2.5 h-2.5 rounded-full bg-foreground animate-pulse" />
                  AVAILABLE FOR HIRE
                </motion.div>

                <motion.h3 variants={fadeUp} className="font-['Press_Start_2P'] text-sm sm:text-base leading-relaxed mb-4">
                  START A PROJECT TOGETHER
                </motion.h3>

                <motion.p variants={fadeUp} className="font-mono text-sm font-semibold text-foreground/80 leading-relaxed mb-6">
                  Looking for a Fullstack Developer or Mobile App Engineer? Feel free to reach out anytime.
                </motion.p>

                <motion.div variants={fadeUp} className="space-y-3 font-mono text-sm font-bold text-foreground/90">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-foreground/60 shrink-0" />
                    <span>Philippines (GMT+8)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Globe className="w-4 h-4 text-foreground/60 shrink-0" />
                    <span>Remote Worldwide</span>
                  </div>
                </motion.div>
              </div>

              {/* Social Channels */}
              <motion.div variants={fadeUp} className="mt-8 pt-6 border-t-2 border-foreground/20">
                <span className="font-['Silkscreen'] text-xs text-foreground/70 font-bold block mb-3 uppercase tracking-wider">
                  SOCIAL NETWORKS
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <a href={profile.socials.github} target="_blank" rel="noopener noreferrer"
                    className="p-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-all hover:-translate-y-1 transform duration-200" title="GitHub">
                    <FaGithub size={20} />
                  </a>
                  <a href={profile.socials.twitter} target="_blank" rel="noopener noreferrer"
                    className="p-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-all hover:-translate-y-1 transform duration-200" title="Twitter / X">
                    <FaXTwitter size={20} />
                  </a>
                  <a href={profile.socials.linkedin} target="_blank" rel="noopener noreferrer"
                    className="p-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-all hover:-translate-y-1 transform duration-200" title="LinkedIn">
                    <FaLinkedin size={20} />
                  </a>
                  <a href={profile.socials.instagram} target="_blank" rel="noopener noreferrer"
                    className="p-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-all hover:-translate-y-1 transform duration-200" title="Instagram">
                    <FaInstagram size={20} />
                  </a>
                  <a href={profile.socials.email}
                    className="p-3 border-2 border-foreground hover:bg-foreground hover:text-background transition-all hover:-translate-y-1 transform duration-200" title="Email">
                    <Mail size={20} />
                  </a>
                </div>
              </motion.div>
            </motion.div>

            {/* RIGHT COLUMN: Form */}
            <motion.div variants={fadeIn} className="md:col-span-8 p-5 sm:p-8">
              <motion.div variants={fadeUp} className="flex items-center justify-between border-b-2 border-foreground/20 pb-4 mb-6">
                <span className="font-['Press_Start_2P'] text-[10px] sm:text-xs text-foreground/90 flex items-center gap-2">
                  <Mail className="w-4 h-4 text-foreground animate-pulse" /> DIRECT INBOX MESSAGE
                </span>

              </motion.div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <motion.div variants={fadeUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Name */}
                  <div>
                    <label className="block font-['Silkscreen'] text-xs font-bold uppercase mb-1.5 text-foreground/90">
                      Your Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. John Doe"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-background border-2 border-foreground/30 focus:border-foreground p-3 font-mono text-sm font-semibold outline-none transition-colors"
                    />
                  </div>
                  {/* Email */}
                  <div>
                    <label className="block font-['Silkscreen'] text-xs font-bold uppercase mb-1.5 text-foreground/90">
                      Your Email <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="e.g. john@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-background border-2 border-foreground/30 focus:border-foreground p-3 font-mono text-sm font-semibold outline-none transition-colors"
                    />
                  </div>
                </motion.div>

                {/* Subject */}
                <motion.div variants={fadeUp}>
                  <label className="block font-['Silkscreen'] text-xs font-bold uppercase mb-1.5 text-foreground/90">
                    Inquiry Type / Subject
                  </label>
                  <select
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-background border-2 border-foreground/30 focus:border-foreground p-3 font-mono text-sm font-semibold outline-none transition-colors cursor-pointer"
                  >
                    <option value="Project Inquiry">Project Inquiry / Freelance</option>
                    <option value="Job Opportunity">Full-time / Remote Opportunity</option>
                    <option value="General Question">General Question</option>
                    <option value="Just Saying Hi">Just Saying Hi</option>
                  </select>
                </motion.div>

                {/* Message */}
                <motion.div variants={fadeUp}>
                  <label className="block font-['Silkscreen'] text-xs font-bold uppercase mb-1.5 text-foreground/90">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    required
                    rows={4}
                    placeholder="Tell me about your project, idea, or question..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-background border-2 border-foreground/30 focus:border-foreground p-3 font-mono text-sm font-semibold outline-none transition-colors resize-none"
                  />
                </motion.div>

                {/* Feedback */}
                <AnimatePresence>
                  {status === "error" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3 border-2 border-rose-500/50 bg-rose-500/10 text-rose-400 font-mono text-xs flex items-center gap-2"
                    >
                      <AlertCircle size={16} className="shrink-0" />
                      <span>{errorMessage}</span>
                    </motion.div>
                  )}
                  {status === "success" && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="p-3.5 border-2 border-foreground/40 bg-foreground/5 text-foreground font-['Silkscreen'] text-xs flex items-center gap-3"
                    >
                      <CheckCircle2 size={18} className="shrink-0" />
                      <div>
                        <p className="font-bold">MESSAGE TRANSMITTED!</p>
                        <p className="font-mono text-[11px] text-foreground/70 mt-0.5">
                          Thanks for reaching out! Your message was sent directly to my dashboard.
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Submit & Clear Buttons */}
                <motion.div variants={fadeUp} className="flex gap-3 mt-2">
                  <motion.button
                    type="submit"
                    disabled={status === "sending"}
                    className="flex-1 font-['Press_Start_2P'] text-xs sm:text-sm py-4 px-6 border-2 border-foreground bg-foreground text-background hover:bg-background hover:text-foreground transition-all duration-200 flex items-center justify-center gap-3 disabled:opacity-50 cursor-pointer shadow-lg"
                  >
                    {status === "sending" ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /> SENDING...</>
                    ) : (
                      <><Send className="w-4 h-4" /> SEND</>
                    )}
                  </motion.button>

                  <button
                    type="button"
                    onClick={() => {
                      setFormData({ name: "", email: "", subject: "Project Inquiry", message: "" });
                      setStatus("idle");
                      setErrorMessage("");
                    }}
                    disabled={status === "sending"}
                    title="Clear message fields"
                    className="font-['Press_Start_2P'] text-xs py-4 px-4 border-2 border-foreground/40 bg-transparent text-foreground/80 hover:border-foreground hover:text-foreground hover:bg-foreground/5 transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-lg"
                  >
                    <RotateCcw className="w-4 h-4" /> CLEAR
                  </button>
                </motion.div>
              </form>
            </motion.div>

          </div>
        </motion.div>

      </div>
    </section>
  );
}

