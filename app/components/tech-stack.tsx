import { ArrowRight } from "lucide-react";
import { skills } from "../../data/skills";

export default function TechStack() {
  return (
    <section className="py-24 relative" id="stack">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-20 gap-4 text-center">
          <h2 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl leading-snug">
            tech stack
          </h2>
          <a href="#" className="font-['Silkscreen'] text-sm sm:text-base hover:underline underline-offset-4 flex items-center gap-2 justify-center">
            all capabilities <ArrowRight size={16} />
          </a>
        </div>

        {/* Categories (Clean List Layout) */}
        <div className="flex flex-col">
          {skills.map((skillGroup, idx) => (
            <div 
              key={idx} 
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
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
