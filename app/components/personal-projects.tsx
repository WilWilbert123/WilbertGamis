"use client";

import { useState, useRef, useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { personalProjects } from "../../data/personal-projects";

export default function PersonalProjects() {
  const [selectedProject, setSelectedProject] = useState<typeof personalProjects[0] | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Prevent background scrolling when modal is open
  useEffect(() => {
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [selectedProject]);

  return (
    <>
      <section className="py-24 relative" id="projects" ref={containerRef}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-20 gap-6">
            <h2 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl">
              personal<br className="hidden sm:block" /> builds
            </h2>
            <a href="#" className="font-['Silkscreen'] text-sm sm:text-base hover:underline underline-offset-4 flex items-center gap-2">
              all personal projects <ArrowRight size={16} />
            </a>
          </div>

          {/* Hover Reveal List */}
          <div className="flex flex-col border-t-[2px] border-foreground/20">
            {personalProjects.map((project, idx) => (
              <button 
                key={idx} 
                onClick={() => setSelectedProject(project)}
                className="group w-full text-left flex flex-col md:flex-row justify-between items-start md:items-center border-b-[2px] border-foreground/20 py-10 transition-colors hover:border-foreground"
              >
                <div>
                  <h3 className="font-['Press_Start_2P'] text-lg sm:text-xl md:text-2xl transition-transform duration-300 group-hover:translate-x-4">
                    {project.title}
                  </h3>
                  {(project.subtext || project.description) && (
                    <div className="mt-2 space-y-1 transition-transform duration-300 group-hover:translate-x-4">
                      {project.subtext && <p className="font-['Silkscreen'] text-xs sm:text-sm text-foreground/70 uppercase">{project.subtext}</p>}
                      {project.description && <p className="font-mono text-xs sm:text-sm text-foreground/50 max-w-xl">{project.description}</p>}
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-4 mt-6 md:mt-0 font-['Silkscreen'] text-sm sm:text-base opacity-60 group-hover:opacity-100 transition-opacity">
                  <span>VIEW DETAILS</span>
                  <ArrowRight size={24} className="transform group-hover:-rotate-45 transition-transform shrink-0" />
                </div>
              </button>
            ))}
          </div>

        </div>

      </section>

      {/* Pixelated Modal */}
      <AnimatePresence>
        {selectedProject && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProject(null)}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm p-4 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-4xl pixel-border bg-background p-1 mt-10 md:mt-0 shadow-2xl"
            >
              {/* Modal Inner Container */}
              <div className="border-[2px] border-foreground p-6 md:p-8 bg-background relative flex flex-col max-h-[90vh] overflow-y-auto custom-scrollbar">
                
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div>
                    <h3 className="font-['Press_Start_2P'] text-xl md:text-3xl mb-2 pr-12">{selectedProject.title}</h3>
                    {selectedProject.description && (
                      <p className="font-mono text-sm md:text-base text-foreground/70 max-w-2xl leading-relaxed">
                        {selectedProject.description}
                      </p>
                    )}
                  </div>
                  <button 
                    onClick={() => setSelectedProject(null)}
                    className="absolute top-6 right-6 p-2 hover:bg-foreground hover:text-background transition-colors pixel-border"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Clickable Image */}
                {selectedProject.image && (
                  <a 
                    href={selectedProject.link !== "#" ? selectedProject.link : undefined}
                    target={selectedProject.link !== "#" ? "_blank" : undefined}
                    rel="noopener noreferrer"
                    className="block relative w-full aspect-video mb-8 group cursor-pointer"
                  >
                    <div className="absolute inset-0 bg-foreground/10 group-hover:bg-transparent transition-colors z-10 pointer-events-none" />
                    
                    {/* Hover Overlay */}
                    {selectedProject.link !== "#" && (
                      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20 bg-background/40 backdrop-blur-sm">
                        <div className="font-['Press_Start_2P'] text-sm md:text-base bg-foreground text-background px-6 py-4 pixel-border flex items-center gap-4">
                          VISIT LIVE SITE <ArrowRight size={20} className="transform -rotate-45" />
                        </div>
                      </div>
                    )}

                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={selectedProject.image} 
                      alt={selectedProject.title}
                      className="w-full h-full object-cover pixel-border grayscale-[0.5] group-hover:grayscale-0 transition-all duration-500"
                    />
                  </a>
                )}

                {/* Tech Stack */}
                {selectedProject.tech && selectedProject.tech.length > 0 && (
                  <div>
                    <h4 className="font-['Silkscreen'] text-lg mb-4 opacity-80 uppercase tracking-widest">Tech Stack</h4>
                    <div className="flex flex-wrap gap-3 md:gap-4">
                      {selectedProject.tech.map((tech, i) => (
                        <span 
                          key={i} 
                          className="font-mono text-xs md:text-sm px-4 py-2 border-[2px] border-foreground/30 hover:border-foreground hover:bg-foreground hover:text-background transition-colors select-none"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
