"use client";

import { ArrowRight, ChevronLeft, ChevronRight, X, Maximize2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { workProjects } from "../../data/work-projects";

// Carousel Component for individual projects
function ProjectCarousel({ images, title }: { images: string[], title: string }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Auto-slide is disabled; users will click through manually using the next/prev buttons.
  useEffect(() => {
    // Left intentionally empty or could be completely removed.
  }, [images]);

  const closeLightbox = () => {
    setIsLightboxOpen(false);
    setCurrentIndex(0); // Reset to first image on close
  };

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
      <div 
        className="relative w-full h-full overflow-hidden cursor-pointer group/image"
        onClick={() => setIsLightboxOpen(true)}
      >
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

        {/* Hover Hint */}
        <div className="absolute inset-0 bg-background/20 backdrop-blur-sm opacity-0 group-hover/image:opacity-100 transition-opacity flex items-center justify-center">
          <div className="font-['Press_Start_2P'] text-sm bg-foreground text-background px-4 py-3 pixel-border flex items-center gap-3">
            VIEW <Maximize2 size={16} />
          </div>
        </div>
      </div>

      {/* Controls (Only show if multiple images exist) */}
      {images.length > 1 && (
        <div className="absolute inset-0 flex items-center justify-between p-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
          <button
            onClick={handlePrev}
            className="w-10 h-10 pixel-border bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-colors pointer-events-auto"
            aria-label="Previous image"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={handleNext}
            className="w-10 h-10 pixel-border bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-colors pointer-events-auto"
            aria-label="Next image"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      )}

      {/* Image Counter */}
      {images.length > 1 && (
        <div className="absolute bottom-4 right-4 bg-background px-2 py-1 pixel-border font-['Silkscreen'] text-xs opacity-0 group-hover:opacity-100 transition-opacity z-10 pointer-events-none">
          {currentIndex + 1} / {images.length}
        </div>
      )}

      {/* Lightbox Modal */}
      <AnimatePresence>
        {isLightboxOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 backdrop-blur-sm p-4 md:p-8"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-7xl h-[80vh] md:h-[90vh] pixel-border bg-background p-1 shadow-2xl flex flex-col"
            >
              {/* Lightbox Inner Container */}
              <div className="border-[2px] border-foreground bg-background relative flex flex-col h-full overflow-hidden">
                
                {/* Header */}
                <div className="flex justify-between items-center p-4 border-b-[2px] border-foreground">
                  <h3 className="font-['Press_Start_2P'] text-sm md:text-base lg:text-lg truncate pr-4">
                    {title}
                  </h3>
                  <button
                    onClick={closeLightbox}
                    className="p-2 pixel-border hover:bg-foreground hover:text-background transition-colors flex-shrink-0"
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Main Image Area */}
                <div className="relative flex-grow flex items-center justify-center p-2 md:p-6 overflow-hidden bg-foreground/5">
                  <img
                    src={images[currentIndex]}
                    alt={`${title} full screenshot ${currentIndex + 1}`}
                    className="w-full h-full object-contain"
                  />
                  
                  {/* Internal Controls */}
                  {images.length > 1 && (
                    <>
                      <button
                        onClick={handlePrev}
                        className="absolute left-2 md:left-6 w-12 h-12 pixel-border bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-colors z-10"
                        aria-label="Previous image"
                      >
                        <ChevronLeft size={24} />
                      </button>
                      <button
                        onClick={handleNext}
                        className="absolute right-2 md:right-6 w-12 h-12 pixel-border bg-background flex items-center justify-center hover:bg-foreground hover:text-background transition-colors z-10"
                        aria-label="Next image"
                      >
                        <ChevronRight size={24} />
                      </button>
                    </>
                  )}
                </div>
                
                {/* Footer with Counter */}
                {images.length > 1 && (
                  <div className="p-3 border-t-[2px] border-foreground text-center font-['Silkscreen'] text-sm opacity-70">
                    IMAGE {currentIndex + 1} OF {images.length}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
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
                <div className={`relative w-full aspect-[4/3] pixel-border ${isEven ? 'md:order-2' : 'md:order-1'}`}>
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
