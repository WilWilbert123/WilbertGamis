"use client";

import { useState, useEffect } from "react";
import { ArrowRight, X, Terminal } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { skills } from "../../data/skills";

export default function TechStack() {
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

  return (
    <>
      <section className="py-24 relative" id="stack">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col items-center justify-center mb-20 gap-4 text-center">
            <h2 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl leading-snug">
              tech stack
            </h2>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="font-['Silkscreen'] text-sm sm:text-base hover:underline underline-offset-4 flex items-center gap-2 justify-center transition-all hover:text-primary"
            >
              all capabilities <ArrowRight size={16} />
            </button>
          </div>

          {/* Categories (Clean List Layout) */}
          <div className="flex flex-col">
            {skills.map((skillGroup, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="group flex flex-col md:flex-row gap-4 md:gap-12 border-b-[2px] border-foreground/20 py-8 first:border-t-[2px] hover:border-foreground transition-colors"
              >
                {/* Category Name */}
                <div className="w-full md:w-1/3 shrink-0 md:pt-1">
                  <h3 className="font-['Press_Start_2P'] text-[12px] sm:text-[14px] leading-relaxed group-hover:translate-x-2 transition-transform duration-300">
                    {skillGroup.category.toUpperCase()}
                  </h3>
                </div>
                
                {/* Skills List */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-3 flex-1">
                  {skillGroup.items.map((item, iIdx) => (
                    <div key={iIdx} className="flex items-center gap-4">
                      <span 
                        className="font-['Silkscreen'] text-sm sm:text-base hover:-translate-y-1 hover:text-primary transition-transform cursor-default select-none inline-block"
                      >
                        {item}
                      </span>
                      {iIdx !== skillGroup.items.length - 1 && (
                        <span className="text-foreground/20 font-['Press_Start_2P'] text-[8px] animate-pulse">
                          *
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

        </div>
      </section>

      {/* Terminal Capabilities Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl pixel-border bg-foreground p-1 shadow-2xl"
            >
              <div className="bg-background h-full p-6 md:p-8 flex flex-col max-h-[85vh] overflow-y-auto custom-scrollbar relative border-2 border-foreground">
                
                {/* Header */}
                <div className="flex justify-between items-center mb-8 border-b-2 border-foreground/20 pb-4">
                  <div className="flex items-center gap-3">
                    <Terminal size={24} className="text-primary" />
                    <h3 className="font-['Press_Start_2P'] text-sm md:text-base">system_capabilities.exe</h3>
                  </div>
                  <button 
                    onClick={() => setIsModalOpen(false)}
                    className="p-2 hover:bg-foreground hover:text-background transition-colors pixel-border"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Content */}
                <div className="space-y-10">
                  {skills.map((group, idx) => (
                    <div key={idx}>
                      <h4 className="font-['Silkscreen'] text-foreground/50 mb-4 uppercase tracking-widest text-lg">
                        {'>'} {group.category}
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {group.items.map((item, i) => (
                          <div 
                            key={i} 
                            className="font-mono text-xs md:text-sm p-3 border border-foreground/10 hover:border-primary hover:text-primary hover:bg-primary/5 transition-colors flex items-center"
                          >
                            {item}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
