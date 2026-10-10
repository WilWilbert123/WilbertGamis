"use client";

import { ArrowRight } from "lucide-react";
import { Button } from "./ui/button";
import { useTheme } from "next-themes";
import { useState, useEffect } from "react";
import WarpText from "./WarpText/WarpText";
import DitherVeil from "./DitherVeil/DitherVeil";
import Galaxy from "./Galaxy/Galaxy";

import { supabase } from "@/lib/supabase";

export default function Hero() {
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [heroImage, setHeroImage] = useState("/wilbertnew.png");
  const [heroScale, setHeroScale] = useState(110);
  const [heroCrop, setHeroCrop] = useState(false);
  const [heroDisableBg, setHeroDisableBg] = useState(false);
  const [heroEffect, setHeroEffect] = useState("hologram");

  useEffect(() => {
    setMounted(true);

    const fetchSettings = async () => {
      const { data } = await supabase.from("portfolio_settings").select("*");
      if (data) {
        data.forEach((setting) => {
          if (setting.setting_key === "hero_image") setHeroImage(setting.setting_value);
          if (setting.setting_key === "hero_scale") setHeroScale(parseInt(setting.setting_value) || 110);
          if (setting.setting_key === "hero_crop") setHeroCrop(setting.setting_value === "true");
          if (setting.setting_key === "hero_disable_bg") setHeroDisableBg(setting.setting_value === "true");
          if (setting.setting_key === "hero_effect") setHeroEffect(setting.setting_value);
          // fallback
          if (setting.setting_key === "hero_bw_filter" && setting.setting_value === "true" && !data.find((s) => s.setting_key === "hero_effect")) setHeroEffect("bw");
        });
      }
    };

    fetchSettings();

    const channel = supabase
      .channel("hero-settings-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "portfolio_settings" },
        (payload) => {
          if (payload.new) {
            const key = (payload.new as any).setting_key;
            const val = (payload.new as any).setting_value;
            if (key === "hero_image") setHeroImage(val);
            if (key === "hero_scale") setHeroScale(parseInt(val) || 110);
            if (key === "hero_crop") setHeroCrop(val === "true");
            if (key === "hero_disable_bg") setHeroDisableBg(val === "true");
            if (key === "hero_effect") setHeroEffect(val);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const isDark = theme === "dark" || resolvedTheme === "dark";
  const textColor = isDark ? "#ffffff" : "#000000";

  return (
    <section className="min-h-screen pt-24 pb-12 flex items-center justify-center" id="hero">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="flex flex-col-reverse lg:flex-row items-center gap-12 lg:gap-24">

          {/* Left Side: Text */}
          <div className="flex-1 flex flex-col items-center lg:items-start text-center lg:text-left space-y-8">
            <div className="space-y-4 w-full">
              <h2 className="font-['Silkscreen'] text-xl sm:text-2xl md:text-3xl uppercase tracking-widest text-foreground/80">
                I'M WILBERT
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
                    fontSize={"inherit" as any}
                    fontWeight={"inherit" as any}
                    fontFamily={"inherit" as any}
                    letterSpacing={"inherit" as any}
                    lineHeight={"inherit" as any}
                    style={{ height: "3.5em", minHeight: "0", width: "100%" }}
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
              DRIVEN BY A DAILY OBSESSION WITH TACKLING COMPLEX CHALLENGES
              AND ARCHITECTING FULL-STACK & ENTERPRISE SYSTEMS.

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
            <div className={`relative w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 pixel-border mt-12 lg:mt-8 ${heroEffect === 'bw' ? 'bg-black' : 'bg-foreground'}`}>
              {/* Frame inner background */}
              <div className={`absolute inset-0 m-1 flex items-end justify-center ${heroEffect === 'bw' ? 'bg-white' : 'bg-background'}`}>

                {/* Galaxy background (Dark mode only with smooth zero-lag fade) */}
                {mounted && !heroDisableBg && (
                  <div className={`absolute inset-0 z-0 overflow-hidden pointer-events-none transition-opacity duration-500 ease-in-out ${isDark ? 'opacity-100' : 'opacity-0'}`}>
                    <Galaxy
                      active={isDark}
                      mouseRepulsion
                      mouseInteraction
                      density={1}
                      glowIntensity={0.3}
                      saturation={0}
                      hueShift={140}
                      twinkleIntensity={0.3}
                      rotationSpeed={0.1}
                      repulsionStrength={2}
                      autoCenterRepulsion={0}
                      starSpeed={0.5}
                      speed={1}
                    />
                  </div>
                )}

                {/* Dynamic Dither Colors based on effect */}
                {(() => {
                  // By default (hologram), we use white ink and transparent (black) paper.
                  // In dark mode, this looks like a glowing white hologram.
                  // In light mode, this creates a cool "inverted silver glass" effect!
                  let ditherInk = "#ffffff";
                  let ditherPaper = "transparent";
                  let ditherPalette: "duotone" | "rgb" = "duotone";

                  if (heroEffect === "bw") {
                    // For Solid B&W, we force the frame to be white, so paper must be white.
                    ditherInk = "#000000";
                    ditherPaper = "#ffffff";
                    ditherPalette = "duotone";
                  } else if (heroEffect === "color") {
                    ditherInk = "#000000";
                    ditherPaper = isDark ? "#000000" : "#ffffff";
                    ditherPalette = "rgb";
                  }

                  return (
                    <div
                      className="w-full h-[135%] relative z-10 origin-bottom pointer-events-auto"
                      style={{
                        transform: `scale(${heroScale / 100})`,
                        filter: 'none',
                        maskImage: `url("${heroImage}")`,
                        WebkitMaskImage: `url("${heroImage}")`,
                        maskSize: heroCrop ? 'cover' : 'contain',
                        WebkitMaskSize: heroCrop ? 'cover' : 'contain',
                        maskRepeat: 'no-repeat',
                        WebkitMaskRepeat: 'no-repeat',
                        maskPosition: 'center',
                        WebkitMaskPosition: 'center',
                      }}
                    >
                      <DitherVeil
                        src={heroImage}
                        style={{ width: '100%', height: '100%' }}
                        pattern="floyd"
                        pixelSize={0.5}
                        inkColor={ditherInk}
                        paperColor={ditherPaper}
                        revealRadius={180}
                        softness={0.6}
                        linger={1}
                        fit={heroCrop ? "cover" : "contain"}
                        rimColor="#a78bfa"
                        palette={ditherPalette}
                        levels={4}
                        contrast={1.0}
                        brightness={0.15}
                        rim={0}
                        reverse={false}
                        wander={false}
                        clickBurst
                      />
                    </div>
                  );
                })()}

                {/* Pixelated Name Tag */}
                <div className="absolute -bottom-6 right-4 z-20 bg-background pixel-border px-3 py-1.5 shadow-md">
                  <span className="font-['Press_Start_2P'] text-[10px] md:text-xs">
                    WILBERT GAMIS
                  </span>
                </div>

              </div>
            </div>
          </div>

        </div>
      </div>
    </section>
  );
}