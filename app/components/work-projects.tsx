"use client";

import { ArrowRight, ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { workProjects } from "../../data/work-projects";

// Carousel Component for individual projects
function ProjectCarousel({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-slide every 3 seconds if there is more than 1 image
  useEffect(() => {
    if (!images || images.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % images.length);
    }, 3000);
    
    return () => clearInterval(interval);
  }, [images]);

  const handleNext = (e: React.MouseEvent) => {
    e.preventDefault(); // Prevent triggering any links if wrapped
    setCurrentIndex((prev) => (prev + 1) % images.length);
  };

  const handlePrev = (e: React.MouseEvent) => {
    e.preventDefault();
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  if (!images || images.length === 0) {
    return (
      <div className="w-full h-full object-cover p-2 bg-background flex items-center justify-center border-[2px] border-dashed border-foreground/30">
        <span className="font-['Silkscreen'] text-foreground/50 text-sm md:text-base">NO IMAGE AVAILABLE</span>
      </div>
    );
  }

  return (
    <div className="relative w-full h-full p-2 bg-background group">
      <div className="relative w-full h-full overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.img
            key={currentIndex}
            src={images[currentIndex]}
            alt={`${title} screenshot ${currentIndex + 1}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
          />
        </AnimatePresence>
      </div>

      {/* Controls (Only show if multiple images exist) */}
      {images.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button 
            onClick={handlePrev}
            className="w-10 h-10 pixel-border bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button 
            onClick={handleNext}
            className="w-10 h-10 pixel-border bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-colors"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-background px-2 py-1 pixel-border font-['Silkscreen'] text-xs opacity-0 group-hover:opacity-100 transition-opacity">
          {currentIndex + 1} / {images.length}
        </div>
      )}
    </div>
  );
}

export default function WorkProjects() {
  return (
    <section className="py-24" id="work">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-24 gap-6">
          <h2 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl mb-12">
            enterprise<br className="hidden sm:block" /> & client projects
          </h2>
          <a href="#" className="font-['Silkscreen'] text-sm sm:text-base hover:underline underline-offset-4 flex items-center gap-2">
            view client work <ArrowRight size={16} />
          </a>
        </div>

        {/* Editorial Layout */}
        <div className="flex flex-col gap-32">
          {workProjects.map((project, idx) => {
            const isEven = idx % 2 === 0;

            return (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="grid grid-cols-1 md:grid-cols-2 gap-12 lg:gap-24 items-center"
              >
                {/* Carousel / Image Section */}
                <div className={`relative w-full aspect-[4/3] sm:aspect-[16/9] md:aspect-[4/3] pixel-border ${isEven ? 'md:order-2' : 'md:order-1'}`}>
                  <ProjectCarousel images={project.images} title={project.title} />
                </div>

                {/* Text Section */}
                <div className={`flex flex-col ${isEven ? 'md:order-1' : 'md:order-2'}`}>
                  <h3 className="font-['Press_Start_2P'] text-xl sm:text-2xl lg:text-3xl leading-snug mb-4">
                    {project.title}
                  </h3>
                  
                  <p className="font-['Silkscreen'] text-sm sm:text-base mb-6 text-foreground/60 uppercase tracking-wider">
                    {project.subtext}
                  </p>
                  
                  <p className="font-mono text-base sm:text-lg mb-10 text-foreground/80 leading-relaxed max-w-xl">
                    {project.description}
                  </p>

                  {/* Tech Stack Tags */}
                  <div className="flex flex-wrap gap-3 mb-10">
                    {project.tech.map((tech, tIdx) => (
                      <span 
                        key={tIdx} 
                        className="font-mono text-xs sm:text-sm px-3 py-1.5 border-[2px] border-foreground/30 hover:border-foreground transition-colors bg-background cursor-default"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="group inline-flex items-center gap-4 font-['Silkscreen'] text-sm sm:text-base border-b-2 border-transparent hover:border-foreground pb-1 transition-colors w-max"
                    >
                      VIEW PROJECT
                      <ArrowRight size={20} className="transform group-hover:-rotate-45 transition-transform" />
                    </a>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}
