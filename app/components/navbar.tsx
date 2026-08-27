"use client";

import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Moon, Sun, Menu, X, Cat } from "lucide-react";
import { cn } from "@/lib/utils";
import LiveViewCount from "./live-view-count";
import { usePets, PetType, PET_SPRITES } from "./pet-system";

function PetDropdownMenu({
  setPetMenuOpen,
  clearPets,
  addPet,
  spawnBall
}: {
  setPetMenuOpen: (val: boolean) => void;
  clearPets: () => void;
  addPet: (type: PetType) => void;
  spawnBall: () => void;
}) {
  const allAvailablePets: PetType[] = [
    "mouse", "chicken", "cat", "dog", "bird",
    "fox", "totoro", "snake", "turtle"
  ];

  return (
    <div className="absolute right-0 mt-2 w-[156px] bg-background border-2 border-foreground shadow-lg z-50 font-['Silkscreen'] text-sm">
      <div className="p-2 border-b-2 border-foreground flex justify-between items-center relative">
        <span>Pets</span>
        <button 
          onClick={() => { spawnBall(); setPetMenuOpen(false); }} 
          className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center group cursor-pointer mt-1" 
          title="Spawn Ball"
        >
          <div className="w-3 h-3 rounded-full bg-foreground group-hover:scale-125 transition-transform animate-bounce shadow-sm" />
          <span className="text-[8px] font-bold opacity-0 group-hover:opacity-100 transition-opacity mt-1">BALL</span>
        </button>
        <button onClick={clearPets} className="text-xs hover:underline">Clear</button>
      </div>
      <div className="py-2 px-2 flex flex-wrap gap-2 justify-start max-h-[60vh] overflow-y-auto">
        {allAvailablePets.map(pet => (
          <button
            key={pet}
            onClick={() => { addPet(pet); setPetMenuOpen(false); }}
            className="w-10 h-10 flex justify-center items-center rounded hover:bg-foreground/10 border-2 border-transparent hover:border-foreground transition-colors"
            title={pet}
          >
            <img
              src={PET_SPRITES[pet].idle}
              alt={pet}
              className="w-8 h-8 object-contain"
              style={{ imageRendering: 'pixelated' }}
            />
          </button>
        ))}
      </div>
    </div>
  );
}

export default function Navbar() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const { addPet, addAllPets, clearPets, spawnBall } = usePets();
  const [mounted, setMounted] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [petMenuOpen, setPetMenuOpen] = useState(false);

  useEffect(() => setMounted(true), []);

  const toggleTheme = () => {
    setTheme(resolvedTheme === "dark" ? "light" : "dark");
  };

  const navLinks = [
    { name: "Work", href: "#work" },
    { name: "Projects", href: "#projects" },
    { name: "Stack", href: "#stack" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav className="fixed top-0 w-full bg-background border-b-2 border-foreground z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex-shrink-0 flex items-center">
            <a href="#" className="font-['Press_Start_2P'] text-xl tracking-tighter">W.</a>
          </div>

          {/* Right Side Controls */}
          <div className="flex items-center space-x-4 md:space-x-8">

            {/* Desktop Links */}
            <div className="hidden md:flex items-center space-x-8 font-['Silkscreen'] text-sm order-0">
              {navLinks.map((link) => (
                <a key={link.name} href={link.href} className="hover:underline underline-offset-4 decoration-2">
                  {link.name}
                </a>
              ))}
            </div>

            <div className="order-1 md:absolute md:right-1 md:top-6 flex items-center">
              <LiveViewCount />
            </div>

            {/* Pet Toggle Menu */}
            {mounted && (
              <div className="relative order-2">
                <button
                  onClick={() => setPetMenuOpen(!petMenuOpen)}
                  className="p-2 pixel-border pixel-border-hover bg-background flex items-center justify-center"
                  aria-label="Spawn Pet"
                >
                  <Cat size={18} />
                </button>

                {petMenuOpen && (
                  <PetDropdownMenu setPetMenuOpen={setPetMenuOpen} clearPets={clearPets} addPet={addPet} spawnBall={spawnBall} />
                )}
              </div>
            )}

            {/* Theme Toggle (Visible on both) */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 pixel-border pixel-border-hover bg-background order-2"
                aria-label="Toggle Dark Mode"
              >
                {resolvedTheme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
              </button>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 border-2 border-foreground bg-background order-3"
            >
              {menuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden border-t-2 border-foreground bg-background">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3 font-['Silkscreen']">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                onClick={() => setMenuOpen(false)}
                className="block px-3 py-2 text-base border-b-2 border-transparent hover:border-foreground"
              >
                {link.name}
              </a>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
