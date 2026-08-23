"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function IntroSplash() {
  const [show, setShow] = useState(true);
  const [displayedText, setDisplayedText] = useState("");
  const fullText = "WILBERT";

  // Typewriter effect (prevents letter-by-letter layout jumping)
  useEffect(() => {
    let currentIndex = 0;
    const typingInterval = setInterval(() => {
      if (currentIndex <= fullText.length) {
        setDisplayedText(fullText.slice(0, currentIndex));
        currentIndex++;
      } else {
        clearInterval(typingInterval);
      }
    }, 110);

    return () => clearInterval(typingInterval);
  }, []);

  // Exit trigger
  useEffect(() => {
    document.body.style.overflow = "hidden";
    const timer = setTimeout(() => {
      setShow(false);
      document.body.style.overflow = "auto";
    }, 2400);

    return () => {
      clearTimeout(timer);
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          key="splash"
          initial={{ y: "0%" }}
          exit={{
            y: "-100%",
            transition: { duration: 0.8, ease: [0.76, 0, 0.24, 1] },
          }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black text-white select-none"
        >
          {/* Main Fixed Lockup */}
          <div className="flex flex-col items-center">
            {/* Monospaced text line */}
            <div className="flex items-center text-2xl font-['Press_Start_2P'] tracking-widest sm:text-4xl md:text-5xl">
              <span>{displayedText}</span>

              {/* Seamless Blinking Block Cursor */}
              <motion.span
                animate={{ opacity: [1, 0, 1] }}
                transition={{
                  duration: 0.6,
                  repeat: Infinity,
                  ease: "linear",
                }}
                className="ml-1 inline-block h-[0.8em] w-[0.5em] bg-white align-middle"
              />
            </div>

            {/* Progress Bar */}
            <div className="mt-6 h-[2px] w-44 overflow-hidden rounded-full bg-zinc-800 sm:w-64">
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{
                  duration: 1.3,
                  delay: 0.2,
                  ease: [0.65, 0, 0.35, 1],
                }}
                style={{ transformOrigin: "left center" }}
                className="h-full w-full bg-white"
              />
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}