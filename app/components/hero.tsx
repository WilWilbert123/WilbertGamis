"use client";

import Image from "next/image";
import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import WarpText from "./WarpText/WarpText";

export default function Hero() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = theme === 'dark' || resolvedTheme === 'dark';
  const textColor = isDark ? '#ffffff' : '#000000';

  return (
    <section className="min-h-screen pt-24 pb-12 flex items-center justify-center" id="hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">

          {/* Left Side: Text */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <div className="space-y-4 w-full">
              <h2 className="font-['Silkscreen'] text-xl sm:text-2xl md:text-3xl uppercase tracking-widest text-foreground/80">
                Hello World
              </h2>
              <div className="w-full relative overflow-visible -ml-2 lg:-ml-0">
                {mounted ? (
                  <WarpText
                    className="font-['Press_Start_2P'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight"
                    text={"SOFTWARE\nENGINEER"}
                    color={textColor}
                    warpStrength={0.08}
                    warpScale={1.7}
                    speed={0.55}
                    pointerInfluence={0.42}
                    pointerStrength={0.38}
                    refraction={0.018}
                    ripple={true}
                    fontSize="inherit"
                    fontWeight="inherit"
                    fontFamily="inherit"
                    letterSpacing="inherit"
                    lineHeight="inherit"
                    style={{ height: '3.5em', minHeight: '0', width: '100%' }}
                  />
                ) : (
                  <h1 className="font-['Press_Start_2P'] text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight opacity-0">
                    SOFTWARE<br />ENGINEER
                  </h1>
                )}
              </div>
            </div>

            <p className="font-mono text-sm sm:text-base md:text-lg max-w-lg leading-relaxed">
              &gt; BUILDING HIGH-PERFORMANCE WEB & MOBILE APPLICATIONS.
              SPECIALIZING IN FULL-STACK ECOSYSTEMS AND ENTERPRISE SOFTWARE.
            </p>

            <div className="flex gap-4 pt-4">
              <a href="#work">
                <Button className="font-['Silkscreen'] text-base uppercase gap-2 h-12 px-6">
                  View Work <ArrowRight size={18} />
                </Button>
              </a>
            </div>
          </div>

          {/* Right Side: Image */}
          <div className="flex-1 flex justify-center lg:justify-end w-full max-w-md lg:max-w-none mt-12 lg:mt-0">
            {/* The frame box */}
            <div className="relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 pixel-border bg-foreground mt-12 lg:mt-8">
              {/* Frame inner background */}
              <div className="absolute inset-0 bg-background m-1 flex items-end justify-center">

                {/* 
                  Image container that breaks out of the top of the frame.
                  w-full keeps it horizontally inside the frame, while h-[130%] allows the head to stick out.
                */}
                <div className="w-full h-[130%] relative z-10 origin-bottom transition-transform hover:scale-[1.05] duration-500">
                  <Image
                    src="/Wilbertpixel.png"
                    alt="Wilbert"
                    fill
                    className="object-cover object-bottom grayscale hover:grayscale-0 transition-all duration-500"
                    onError={(e) => {
                      // Fallback if image not found
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.parentElement!.innerHTML = '<div class="w-full h-full flex items-center justify-center font-mono text-sm">No Image</div>';
                    }}
                  />
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}
