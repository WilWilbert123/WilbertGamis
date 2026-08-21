"use client";

import { useState, useEffect } from "react";
import { ArrowRight, Quote, Terminal, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { profile } from "../../data/profile";

export default function Affiliations() {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isModalOpen]);

  // Only show first 2 recommendations on the main page to keep it clean
  const previewRecommendations = profile.recommendations.slice(0, 2);

  return (
    <>
      <section className="py-24 relative" id="affiliations">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
            <h2 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl leading-snug">
              affiliations<br className="hidden sm:block" /> & feedback
            </h2>
            <a href="#contact" className="font-['Silkscreen'] text-sm sm:text-base hover:underline underline-offset-4 flex items-center gap-2 transition-transform hover:translate-x-2">
              connect <ArrowRight size={16} />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-16 lg:gap-24">

            {/* Affiliations */}
            <div className="lg:col-span-5">
              <div className="flex items-center gap-3 mb-8 border-b-2 border-foreground pb-4">
                <Terminal size={24} />
                <h3 className="font-['Silkscreen'] text-lg sm:text-xl">
                  Professional Affiliations
                </h3>
              </div>
              <ul className="space-y-8">
                {profile.affiliations.map((aff, idx) => (
                  <motion.li
                    key={idx}
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="flex items-start gap-4 group"
                  >
                    <span className="font-['Press_Start_2P'] text-foreground/40 text-xs mt-1.5 group-hover:text-foreground transition-colors">{">"}</span>
                    <div className="flex flex-col">
                      {aff.link ? (
                        <a href={aff.link} target="_blank" rel="noopener noreferrer" className="font-mono text-lg font-bold group-hover:underline underline-offset-4">
                          {aff.organization}
                        </a>
                      ) : (
                        <span className="font-mono text-lg font-bold group-hover:underline underline-offset-4 cursor-default">
                          {aff.organization}
                        </span>
                      )}
                      <span className="font-mono text-sm opacity-70 mt-1">{aff.title}</span>
                    </div>
                  </motion.li>
                ))}
              </ul>
            </div>

            {/* Recommendations */}
            <div className="lg:col-span-7">
              <div className="flex items-center justify-between border-b-2 border-foreground pb-4 mb-8">
                <h3 className="font-['Silkscreen'] text-lg sm:text-xl">
                  Recommendations
                </h3>
                <button
                  onClick={() => setIsModalOpen(true)}
                  className="font-['Silkscreen'] text-sm hover:text-primary transition-colors flex items-center gap-2 group"
                >
                  See All <span className="group-hover:animate-pulse">{'>_'}</span>
                </button>
              </div>
              <div className="space-y-8">
                {previewRecommendations.map((rec, idx) => (
                  <motion.div 
                    key={idx} 
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    whileHover={{ y: -4 }}
                    viewport={{ once: true, amount: 0.3 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="pixel-border pixel-border-hover p-6 sm:p-8 bg-background relative"
                  >
                    <div className="absolute -top-5 -left-2 bg-foreground text-background p-1.5 border-2 border-foreground">
                      <Quote size={24} fill="currentColor" />
                    </div>
                    <p className="font-mono text-base sm:text-lg italic mb-8 leading-relaxed pt-2">
                      "{rec.quote}"
                    </p>
                    <div className="flex items-center justify-end gap-3 opacity-90">
                      <div className="w-8 h-[2px] bg-foreground" />
                      <p className="font-['Silkscreen'] text-sm sm:text-base">
                        {rec.author}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

          </div>

        </div>
      </section>

      {/* Recommendations Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-5xl pixel-border bg-foreground p-1 my-10 shadow-2xl"
            >
              <div className="bg-background h-full p-6 md:p-8 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar relative border-2 border-foreground">

                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b-2 border-foreground/20 pb-4">
                  <div className="flex items-center gap-3">
                    <Quote size={24} className="text-primary" />
                    <h3 className="font-['Press_Start_2P'] text-sm md:text-base">all_recommendations.log</h3>
                  </div>
                  <button
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-foreground hover:text-background transition-colors pixel-border"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Bento Box Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 grid-flow-row-dense">
                  {profile.recommendations.map((rec, idx) => {
                    // Create bento layout logic that cycles organically through all 15 items
                    const isWide = idx % 5 === 0 || idx % 8 === 3;
                    const isTall = idx % 6 === 1;

                    return (
                      <div
                        key={idx}
                        className={`pixel-border bg-background p-6 flex flex-col justify-between group transition-all duration-300 hover:bg-foreground hover:text-background ${isWide ? 'md:col-span-2' : ''} ${isTall ? 'md:row-span-2' : ''}`}
                      >
                        <div className="mb-6">
                          <Quote size={20} className="mb-4 opacity-50 group-hover:opacity-100 transition-opacity" />
                          <p className={`font-mono italic leading-relaxed ${isWide ? 'text-lg md:text-xl' : 'text-sm md:text-base'}`}>
                            "{rec.quote}"
                          </p>
                        </div>
                        <div className="flex items-center gap-3 opacity-90 mt-auto">
                          <div className="w-6 h-[2px] bg-current" />
                          <p className="font-['Silkscreen'] text-xs sm:text-sm">
                            {rec.author}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>

              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
