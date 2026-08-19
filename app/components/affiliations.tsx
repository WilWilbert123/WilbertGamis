import { ArrowRight, Quote, Terminal } from "lucide-react";
import { profile } from "../../data/profile";

export default function Affiliations() {
  return (
    <section className="py-24" id="affiliations">
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
                <li key={idx} className="flex items-start gap-4 group">
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
                </li>
              ))}
            </ul>
          </div>

          {/* Recommendations */}
          <div className="lg:col-span-7">
            <h3 className="font-['Silkscreen'] text-lg sm:text-xl border-b-2 border-foreground pb-4 mb-8">
              Recommendations
            </h3>
            <div className="space-y-8">
              {profile.recommendations.map((rec, idx) => (
                <div key={idx} className="pixel-border pixel-border-hover p-6 sm:p-8 bg-background relative transition-all hover:-translate-y-1">
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
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </section>
  );
}
