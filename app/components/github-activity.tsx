"use client";

import { GitHubCalendar } from 'react-github-calendar';
import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { ArrowRight } from "lucide-react";
import { profile } from "../../data/profile";

export default function GithubActivity() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = (mounted && (theme === 'dark' || resolvedTheme === 'dark')) ? 'dark' : 'light';

  const explicitTheme = {
    light: ['#f0f0f0', '#c4c4c4', '#a0a0a0', '#545454', '#000000'],
    dark: ['#1a1a1a', '#3f3f3f', '#707070', '#a6a6a6', '#ffffff'],
  };

  return (
    <section className="pt-24 pb-4" id="github">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex flex-col items-center justify-center mb-8 gap-4 text-center">
          <h2 className="font-['Press_Start_2P'] text-xl sm:text-2xl md:text-3xl leading-snug">
            github activity
          </h2>
          <a href={profile.socials.github} target="_blank" rel="noopener noreferrer" className="font-['Silkscreen'] text-sm sm:text-base hover:underline underline-offset-4 flex items-center justify-center gap-2">
            @WilWilbert123 <ArrowRight size={16} className="-rotate-45" />
          </a>
        </div>

        <div className="w-full overflow-x-auto pb-4 flex justify-center">
          <div className="min-w-max p-6 bg-background">
            {mounted && (
              <GitHubCalendar 
                username="WilWilbert123" 
                theme={explicitTheme}
                colorScheme={currentTheme}
              />
            )}
            {!mounted && (
              <div className="h-[120px] w-full bg-foreground/10 animate-pulse" />
            )}
          </div>
        </div>

      </div>
    </section>
  );
}
