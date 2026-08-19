import { ArrowRight } from "lucide-react";
import { workProjects } from "../../data/work-projects";

export default function WorkProjects() {
  return (
    <section className="py-24" id="work">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <h2 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl mb-12">
            enterprise<br className="hidden sm:block" /> & client projects
          </h2>
          <a href="#" className="font-['Silkscreen'] text-sm sm:text-base hover:underline underline-offset-4 flex items-center gap-2">
            view client work <ArrowRight size={16} />
          </a>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          {workProjects.map((project, idx) => (
            <div 
              key={idx} 
              className="pixel-border p-4 sm:p-6 bg-background flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-4 gap-4 flex-wrap">
                  <h3 className="font-['Press_Start_2P'] text-sm sm:text-base leading-relaxed">
                    {project.title}
                  </h3>
                  {project.link && (
                    <a 
                      href={project.link} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="p-2 border-2 border-foreground hover:bg-foreground hover:text-background transition-colors"
                      aria-label={`View ${project.title}`}
                    >
                      <ArrowRight size={16} />
                    </a>
                  )}
                </div>
                
                <p className="font-['Silkscreen'] text-xs sm:text-sm mb-4 opacity-80">
                  {project.subtext}
                </p>
                
                <p className="font-mono text-sm sm:text-base mb-6">
                  {project.description}
                </p>
              </div>

              {/* Tech Stack Tags */}
              <div className="flex flex-wrap gap-2 mt-auto">
                {project.tech.map((tech, tIdx) => (
                  <span 
                    key={tIdx} 
                    className="font-mono text-xs sm:text-sm px-2 py-1 border border-foreground"
                  >
                    {tech}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
