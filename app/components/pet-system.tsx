"use client";

import React, { createContext, useContext, useState, useEffect, useRef, useCallback, useMemo } from "react";

export type PetType = "mouse" | "chicken" | "cat" | "dog" | "bird" | "fox" | "totoro" | "snake" | "turtle";

export interface PetInstance {
  id: string;
  type: PetType;
  x: number;
  y: number;
  vx: number;
  vy: number;
  flipX: boolean;
  speed: number;
  isExcited?: boolean;
  bubbleText?: string;
  targetX?: number;
  targetY?: number;
  spinUntil?: number;
  nextActionTime?: number;
  bubbleClearTime?: number;
}

const BASE_URL = "https://raw.githubusercontent.com/tonybaloney/vscode-pets/main/media";

export const PET_SPRITES: Record<PetType, { walk: string, idle: string }> = {
  mouse: { walk: `${BASE_URL}/rat/brown_walk_8fps.gif`, idle: `${BASE_URL}/rat/brown_idle_8fps.gif` },
  chicken: { walk: `${BASE_URL}/chicken/white_walk_8fps.gif`, idle: `${BASE_URL}/chicken/white_idle_8fps.gif` },
  cat: { walk: "/pets/cat/brown_walk_8fps.gif", idle: "/pets/cat/brown_idle_8fps.gif" },
  dog: { walk: `${BASE_URL}/dog/black_walk_8fps.gif`, idle: `${BASE_URL}/dog/black_idle_8fps.gif` },
  bird: { walk: "/pets/flappy_bird.gif", idle: "/pets/flappy_bird.gif" },
  fox: { walk: `${BASE_URL}/fox/red_walk_8fps.gif`, idle: `${BASE_URL}/fox/red_idle_8fps.gif` },
  totoro: { walk: `${BASE_URL}/totoro/gray_walk_8fps.gif`, idle: `${BASE_URL}/totoro/gray_idle_8fps.gif` },
  snake: { walk: `${BASE_URL}/snake/green_walk_8fps.gif`, idle: `${BASE_URL}/snake/green_idle_8fps.gif` },
  turtle: { walk: `${BASE_URL}/turtle/green_walk_8fps.gif`, idle: `${BASE_URL}/turtle/green_idle_8fps.gif` },
};

const PET_SPEEDS: Record<PetType, number> = {
  mouse: 3,
  chicken: 2,
  cat: 2.5,
  dog: 2,
  bird: 1.8,
  fox: 3,
  totoro: 1.5,
  snake: 2,
  turtle: 0.35,
};

interface PetContextType {
  addPet: (type: PetType) => void;
  addAllPets: () => void;
  clearPets: () => void;
}

const PetContext = createContext<PetContextType | undefined>(undefined);

export function usePets() {
  const context = useContext(PetContext);
  if (!context) {
    throw new Error("usePets must be used within a PetProvider");
  }
  return context;
}

export function PetProvider({ children }: { children: React.ReactNode }) {
  const [pets, setPets] = useState<PetInstance[]>([]);
  const mousePos = useRef({ x: 0, y: 0 });
  const lastMouseTime = useRef<number>(Date.now());
  const animationRef = useRef<number>(0);
  const petsRef = useRef<PetInstance[]>([]);

  useEffect(() => {
    // Initial mouse position
    if (typeof window !== "undefined") {
      mousePos.current = { x: window.innerWidth / 2, y: window.innerHeight / 2 };
    }
  }, []);

  // Keep ref in sync with state for animation loop
  useEffect(() => {
    petsRef.current = pets;
  }, [pets]);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      mousePos.current = { x: e.clientX, y: e.clientY };
      lastMouseTime.current = Date.now();
    };

    window.addEventListener("mousemove", handleMouseMove);

    // For touch devices
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length > 0) {
        mousePos.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        lastMouseTime.current = Date.now();
      }
    };
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  useEffect(() => {
    const updatePets = () => {
      if (petsRef.current.length === 0) {
        animationRef.current = requestAnimationFrame(updatePets);
        return;
      }

      setPets((currentPets) => {
        const now = Date.now();
        const timeSinceMouseMoved = now - lastMouseTime.current;
        const isMouseMoving = timeSinceMouseMoved < 1000;

        return currentPets.map((pet) => {
          const time = now / 1000;

          if (pet.type === 'bird') {

            let targetX = pet.targetX;
            let targetY = pet.targetY;

            if (isMouseMoving) {
              const distToMouseX = mousePos.current.x - pet.x;
              const distToMouseY = mousePos.current.y - pet.y;
              const distToMouse = Math.sqrt(distToMouseX * distToMouseX + distToMouseY * distToMouseY);

              if (distToMouse < 120) {
                // Orbit the mouse at a safe distance and slowly
                const angleOffset = parseInt(pet.id, 36) % 100;
                targetX = mousePos.current.x + Math.cos(time * 2 + angleOffset) * 90;
                targetY = mousePos.current.y + Math.sin(time * 2 + angleOffset) * 90;
              } else {
                // Follow mouse
                targetX = mousePos.current.x;
                targetY = mousePos.current.y - 50; // Follow further above
              }
            } else {
              // Mouse stopped: Random flight
              if (!targetX || !targetY) {
                targetX = Math.random() * window.innerWidth;
                targetY = Math.random() * window.innerHeight * 0.8;
              } else {
                const dx = targetX - pet.x;
                const dy = targetY - pet.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < 20) {
                  // Pick new random target when reached
                  targetX = Math.random() * window.innerWidth;
                  targetY = Math.random() * window.innerHeight * 0.8;
                }
              }
            }

            const dx = targetX - pet.x;
            const dy = targetY - pet.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            // Smoothly move towards the target
            const speed = pet.isExcited ? pet.speed * 3 : pet.speed;
            const vx = distance > 0 ? (dx / distance) * Math.min(speed, distance * 0.1) : 0;
            const vy = distance > 0 ? (dy / distance) * Math.min(speed, distance * 0.1) : 0;
            const flipX = vx < 0;

            return {
              ...pet,
              x: pet.x + vx,
              y: pet.y + vy,
              vx,
              vy,
              flipX,
              targetX,
              targetY
            };
          } else {
            // Ground behavior (Cat, Dog, Mouse, Chicken): stay on the floor
            const groundY = window.innerHeight - 32;

            // Apply gravity if not on ground
            let newY = pet.y;
            let vy = 0;
            if (pet.y < groundY - 2) {
              vy = 5; // Fall down
              newY = Math.min(groundY, pet.y + vy);
            } else if (pet.y > groundY + 2) {
              newY = groundY; // Snap to ground if window resizes
            }

            let vx = 0;
            let flipX = pet.flipX;
            let targetX = pet.targetX;
            let nextActionTime = pet.nextActionTime || 0;
            let bubbleText = pet.bubbleText;
            let isExcited = pet.isExcited;
            let bubbleClearTime = pet.bubbleClearTime;

            const speed = pet.isExcited ? pet.speed * 3 : pet.speed;

            if (isMouseMoving) {
              // Chase mouse X
              const idOffset = (parseInt(pet.id, 36) % 100) - 50;
              targetX = mousePos.current.x + idOffset;
              const dx = targetX - pet.x;
              const distanceX = Math.abs(dx);

              if (distanceX > 5) {
                vx = Math.sign(dx) * Math.min(speed, distanceX);
                flipX = vx < 0;
              }
              // Reset action timer while chasing
              nextActionTime = now + 1000 + Math.random() * 2000;
            } else {
              // Mouse is idle: wander randomly
              if (now > nextActionTime) {
                const action = Math.random();
                if (action < 0.4) {
                  // walk left
                  targetX = Math.max(0, pet.x - 100 - Math.random() * 200);
                  nextActionTime = now + 1500 + Math.random() * 1500;
                } else if (action < 0.8) {
                  // walk right
                  targetX = Math.min(window.innerWidth, pet.x + 100 + Math.random() * 200);
                  nextActionTime = now + 1500 + Math.random() * 1500;
                } else {
                  // stop
                  targetX = pet.x;
                  nextActionTime = now + 1000 + Math.random() * 2000;
                  // sometimes show angry emoji when stopped
                  if (Math.random() < 0.2 && !pet.isExcited) {
                    bubbleText = '😡';
                    isExcited = true;
                    bubbleClearTime = now + 1500;
                  }
                }
              }

              // Move towards random target
              if (targetX !== undefined) {
                const dx = targetX - pet.x;
                const distanceX = Math.abs(dx);
                if (distanceX > 5) {
                  vx = Math.sign(dx) * Math.min(speed * 0.5, distanceX); // walk slower when wandering
                  flipX = vx < 0;
                }
              }
            }

            // Clear auto bubble if expired
            if (bubbleClearTime && now > bubbleClearTime) {
              bubbleText = undefined;
              isExcited = false;
              bubbleClearTime = undefined;
            }

            return {
              ...pet,
              x: pet.x + vx,
              y: newY,
              vx,
              vy,
              flipX,
              targetX,
              nextActionTime,
              bubbleText,
              isExcited,
              bubbleClearTime
            };
          }
        });
      });

      animationRef.current = requestAnimationFrame(updatePets);
    };

    animationRef.current = requestAnimationFrame(updatePets);

    return () => {
      cancelAnimationFrame(animationRef.current);
    };
  }, []);

  const addPet = useCallback((type: PetType) => {
    const newPet: PetInstance = {
      id: Math.random().toString(36).substring(7),
      type,
      x: Math.random() * window.innerWidth,
      y: window.innerHeight + 50, // Start slightly offscreen bottom
      vx: 0,
      vy: 0,
      flipX: false,
      speed: PET_SPEEDS[type] + (Math.random() * 0.5 - 0.25), // Slight variation
    };
    setPets((prev) => [...prev, newPet]);
  }, []);

  const addAllPets = useCallback(() => {
    const types: PetType[] = ["mouse", "chicken", "cat", "dog", "bird"];
    types.forEach((type, index) => {
      setTimeout(() => addPet(type), index * 200); // Stagger spawning
    });
  }, [addPet]);

  const clearPets = useCallback(() => {
    setPets([]);
  }, []);

  const handlePetClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();

    setPets((prev) => prev.map(p =>
      p.id === id ? { ...p, isExcited: true, bubbleText: '😡' } : p
    ));

    setTimeout(() => {
      setPets((prev) => prev.map(p =>
        p.id === id ? { ...p, isExcited: false, bubbleText: undefined } : p
      ));
    }, 1500);
  };

  const contextValue = useMemo(() => ({ addPet, addAllPets, clearPets }), [addPet, addAllPets, clearPets]);

  return (
    <PetContext.Provider value={contextValue}>
      {children}
      {/* Render Pets Container */}
      <div className="fixed inset-0 pointer-events-none z-[9999] overflow-hidden">
        {pets.map((pet) => {
          const isMoving = Math.abs(pet.vx) > 0.1 || Math.abs(pet.vy) > 0.1;
          const spriteUrl = isMoving ? PET_SPRITES[pet.type].walk : PET_SPRITES[pet.type].idle;

          return (
            <div
              key={pet.id}
              className="absolute pointer-events-auto cursor-pointer select-none"
              onClick={(e) => handlePetClick(e, pet.id)}
              style={{
                transform: `translate(${pet.x - 16}px, ${pet.y - 16}px) scaleX(${pet.flipX ? -1 : 1}) scale(${pet.type === 'bird' ? 0.8 : (pet.type === 'cat' && isMoving ? 0.85 : 1)})`,
                width: '32px',
                height: '32px',
                transition: 'transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1)',
                zIndex: pet.isExcited ? 10000 : 9999,
              }}
            >
              {pet.bubbleText && (
                <div
                  style={{
                    position: 'absolute',
                    top: '-24px',
                    left: '50%',
                    transform: `translateX(-50%) scaleX(${pet.flipX ? -1 : 1})`,
                    backgroundColor: 'transparent',
                    fontSize: '18px',
                    pointerEvents: 'none',
                    textShadow: '0 2px 4px rgba(0,0,0,0.3)',
                  }}
                >
                  {pet.bubbleText}
                </div>
              )}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={spriteUrl}
                alt={`${pet.type} pet`}
                draggable={false}
                style={{
                  width: '100%',
                  height: '100%',
                  imageRendering: 'pixelated',
                  pointerEvents: 'none'
                }}
              />
            </div>
          );
        })}
      </div>
    </PetContext.Provider>
  );
}
