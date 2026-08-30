"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";


interface GamePet {
  id: string;
  type: "fox" | "dog" | "turtle" | "snake" | "cat";
  x: number;
  y: number;
  vx: number;
  vy: number;
  flipX: boolean;
  isWalking: boolean;
  scale: number;
  speed: number;
  idleDuration: number;
  walkDuration: number;
  nextActionTime: number;
  targetX?: number;
  targetY?: number;
  lastHitTimes?: Record<string, number>;
}

interface Player {
  user_id: string;
  username: string;
  x: number;
  y: number;
  flipX: boolean;
  isWalking: boolean;
  mapId?: string;
}

const CAT_WALK = "/pets/cat/brown_walk_8fps.gif";
const CAT_IDLE = "/pets/cat/brown_idle_8fps.gif";
const FOX_WALK = "/pets/fox/red_walk_8fps.gif";
const FOX_IDLE = "/pets/fox/red_idle_8fps.gif";
const DOG_WALK = "/pets/dog/black_walk_8fps.gif";
const DOG_IDLE = "/pets/dog/black_idle_8fps.gif";
const MOUSE_WALK = "/pets/mouse/brown_walk_8fps.gif";
const MOUSE_IDLE = "/pets/mouse/brown_idle_8fps.gif";
const CHICKEN_WALK = "/pets/chicken/white_walk_8fps.gif";
const CHICKEN_IDLE = "/pets/chicken/white_idle_8fps.gif";


const PET_SPEEDS: Record<string, number> = {
  fox: 60,
  dog: 60,
  turtle: 20,
  snake: 30
};

interface GlobalChatGameProps {
  sessionInfo: { id: string; username: string };
  channelRef: React.MutableRefObject<any>;
  channelReadyRef: React.MutableRefObject<boolean>;
  sharedPresenceRef: React.MutableRefObject<any>;
  onlinePlayers: Player[];
  messages?: any[];
  isOpen?: boolean;
}

const getPlayerColor = (username: string) => {
  let hash = 0;
  for (let i = 0; i < username.length; i++) {
    hash = username.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
};

function PlayerSprite({ username, flipX, isWalking, isDead }: { username: string, flipX: boolean, isWalking: boolean, isDead?: boolean }) {
  const shirtColor = getPlayerColor(username);

  return (
    <div className="relative flex flex-col items-center select-none">
      <style>{`
        @keyframes walk-up {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-4px); }
        }
        @keyframes walk-down {
          0%, 100% { transform: translateY(-4px); }
          50% { transform: translateY(0px); }
        }
        .anim-walk-1 { animation: walk-up 0.4s infinite; }
        .anim-walk-2 { animation: walk-down 0.4s infinite; }
      `}</style>

      {/* Head */}
      <div className={`w-10 h-[26px] overflow-hidden relative z-10 ${(isWalking && !isDead) ? 'animate-bounce' : ''}`} style={{ animationDuration: '0.4s' }}>
        <img
          src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${username}`}
          alt={username}
          className="w-10 h-10 max-w-none absolute top-0 left-0 pixelated"
          style={{ transform: `scaleX(${flipX ? -1 : 1})` }}
        />
        {isDead && (
          <div className="absolute top-[13px] left-[13px] right-[13px] flex justify-between pointer-events-none opacity-80" style={{ transform: `scaleX(${flipX ? -1 : 1})` }}>
            <span className="text-[#111] text-[10px] font-bold leading-none pixelated">x</span>
            <span className="text-[#111] text-[10px] font-bold leading-none pixelated">x</span>
          </div>
        )}
      </div>

      {/* Body Container */}
      <div className={`relative w-[24px] h-[16px] flex justify-center -mt-[2px] z-0`} style={{ transform: `scaleX(${flipX ? -1 : 1})` }}>

        {/* Left Arm */}
        <div className={`absolute top-[2px] -left-[2px] w-[6px] h-[10px] z-10 ${isWalking ? 'anim-walk-1' : ''}`}>
          <div className="w-full h-[8px]" style={{ backgroundColor: shirtColor }} />
          <div className="w-full h-[4px] bg-[#fcd34d]" />
        </div>

        {/* Right Arm */}
        <div className={`absolute top-[2px] -right-[2px] w-[6px] h-[10px] z-10 ${isWalking ? 'anim-walk-2' : ''}`}>
          <div className="w-full h-[8px]" style={{ backgroundColor: shirtColor }} />
          <div className="w-full h-[4px] bg-[#fcd34d]" />
        </div>

        {/* Torso */}
        <div className="w-[16px] h-[12px] z-0 shadow-[inset_0_-2px_0_rgba(0,0,0,0.2)]" style={{ backgroundColor: shirtColor }} />

        {/* Left Leg */}
        <div className={`absolute top-[10px] left-[4px] w-[6px] h-[12px] bg-[#1e3a8a] z-0 ${isWalking ? 'anim-walk-2' : ''}`}>
          <div className="absolute bottom-0 -left-[1px] w-[8px] h-[4px] bg-[#451a03]" />
        </div>

        {/* Right Leg */}
        <div className={`absolute top-[10px] right-[4px] w-[6px] h-[12px] bg-[#1e3a8a] z-0 ${isWalking ? 'anim-walk-1' : ''}`}>
          <div className="absolute bottom-0 -left-[1px] w-[8px] h-[4px] bg-[#451a03]" />
        </div>

      </div>
    </div>
  );
};

function RemotePlayerSprite({ userId, username, initialFlipX, initialIsWalking }: { userId: string, username: string, initialFlipX: boolean, initialIsWalking: boolean }) {
  const [spriteState, setSpriteState] = useState({ flipX: initialFlipX, isWalking: initialIsWalking });

  useEffect(() => {
    const handleUpdate = (e: CustomEvent) => {
      setSpriteState(prev => {
        if (prev.flipX !== e.detail.flipX || prev.isWalking !== e.detail.isWalking) {
          return { flipX: e.detail.flipX, isWalking: e.detail.isWalking };
        }
        return prev;
      });
    };
    window.addEventListener(`sprite-update-${userId}` as any, handleUpdate as any);
    return () => window.removeEventListener(`sprite-update-${userId}` as any, handleUpdate as any);
  }, [userId]);

  return <PlayerSprite username={username} flipX={spriteState.flipX} isWalking={spriteState.isWalking} />;
};

// Game Map Constants
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 2000;
const MOVE_SPEED = 4;
const UPDATE_INTERVAL_MS = 100; // 100ms = 10 updates per second for smoother movement

interface Portal {
  id: string;
  x: number;
  y: number;
  width: number;
  height: number;
  destMapId: string;
  destX: number;
  destY: number;
}

interface MapConfig {
  backgroundImage: string;
  width: number;
  height: number;
  portals: Portal[];
}



const MAPS: Record<string, MapConfig> = {
  forest: {
    backgroundImage: "/rpg_map_large.png", // Dynamically swapped for night time
    width: 2000,
    height: 2000,
    portals: [
      { id: "to_space", x: 970, y: 80, width: 60, height: 100, destMapId: "space", destX: 1000, destY: 1700 },
      { id: "to_tech", x: 970, y: 1820, width: 60, height: 100, destMapId: "tech", destX: 1000, destY: 300 },
      { id: "to_amazon", x: 80, y: 950, width: 60, height: 100, destMapId: "amazon", destX: 1700, destY: 1000 },
      { id: "to_desert", x: 1860, y: 950, width: 60, height: 100, destMapId: "desert", destX: 300, destY: 1000 },
      { id: "to_philippines", x: 250, y: 250, width: 60, height: 100, destMapId: "philippines", destX: 1500, destY: 1500 },
      { id: "to_nolife", x: 1690, y: 250, width: 60, height: 100, destMapId: "nolife", destX: 500, destY: 1500 },
      { id: "to_japan", x: 250, y: 1650, width: 60, height: 100, destMapId: "japan", destX: 1500, destY: 500 },
      { id: "to_island", x: 1690, y: 1650, width: 60, height: 100, destMapId: "island", destX: 500, destY: 500 }
    ]
  },
  space: {
    backgroundImage: "/rpg_map_large_space.jpeg",
    width: 2000,
    height: 2000,
    portals: [
      { id: "to_space", x: 970, y: 80, width: 60, height: 100, destMapId: "forest", destX: 1000, destY: 1700 },
      { id: "to_tech", x: 970, y: 1820, width: 60, height: 100, destMapId: "tech", destX: 1000, destY: 300 },
      { id: "to_amazon", x: 80, y: 950, width: 60, height: 100, destMapId: "amazon", destX: 1700, destY: 1000 },
      { id: "to_desert", x: 1860, y: 950, width: 60, height: 100, destMapId: "desert", destX: 300, destY: 1000 },
      { id: "to_philippines", x: 250, y: 250, width: 60, height: 100, destMapId: "philippines", destX: 1500, destY: 1500 },
      { id: "to_nolife", x: 1690, y: 250, width: 60, height: 100, destMapId: "nolife", destX: 500, destY: 1500 },
      { id: "to_japan", x: 250, y: 1650, width: 60, height: 100, destMapId: "japan", destX: 1500, destY: 500 },
      { id: "to_island", x: 1690, y: 1650, width: 60, height: 100, destMapId: "island", destX: 500, destY: 500 }
    ]
  },
  desert: {
    backgroundImage: "/rpg_map_large_dissert.jpeg",
    width: 2000,
    height: 2000,
    portals: [
      { id: "to_space", x: 970, y: 80, width: 60, height: 100, destMapId: "space", destX: 1000, destY: 1700 },
      { id: "to_tech", x: 970, y: 1820, width: 60, height: 100, destMapId: "tech", destX: 1000, destY: 300 },
      { id: "to_amazon", x: 80, y: 950, width: 60, height: 100, destMapId: "amazon", destX: 1700, destY: 1000 },
      { id: "to_desert", x: 1860, y: 950, width: 60, height: 100, destMapId: "forest", destX: 300, destY: 1000 },
      { id: "to_philippines", x: 250, y: 250, width: 60, height: 100, destMapId: "philippines", destX: 1500, destY: 1500 },
      { id: "to_nolife", x: 1690, y: 250, width: 60, height: 100, destMapId: "nolife", destX: 500, destY: 1500 },
      { id: "to_japan", x: 250, y: 1650, width: 60, height: 100, destMapId: "japan", destX: 1500, destY: 500 },
      { id: "to_island", x: 1690, y: 1650, width: 60, height: 100, destMapId: "island", destX: 500, destY: 500 }
    ]
  },
  nolife: {
    backgroundImage: "/rpg_map_large_nolife.jpeg",
    width: 2000,
    height: 2000,
    portals: [
      { id: "to_space", x: 970, y: 80, width: 60, height: 100, destMapId: "space", destX: 1000, destY: 1700 },
      { id: "to_tech", x: 970, y: 1820, width: 60, height: 100, destMapId: "tech", destX: 1000, destY: 300 },
      { id: "to_amazon", x: 80, y: 950, width: 60, height: 100, destMapId: "amazon", destX: 1700, destY: 1000 },
      { id: "to_desert", x: 1860, y: 950, width: 60, height: 100, destMapId: "desert", destX: 300, destY: 1000 },
      { id: "to_philippines", x: 250, y: 250, width: 60, height: 100, destMapId: "philippines", destX: 1500, destY: 1500 },
      { id: "to_nolife", x: 1690, y: 250, width: 60, height: 100, destMapId: "forest", destX: 500, destY: 1500 },
      { id: "to_japan", x: 250, y: 1650, width: 60, height: 100, destMapId: "japan", destX: 1500, destY: 500 },
      { id: "to_island", x: 1690, y: 1650, width: 60, height: 100, destMapId: "island", destX: 500, destY: 500 }
    ]
  },
  amazon: {
    backgroundImage: "/rpg_map_large_amazon.jpeg",
    width: 2000,
    height: 2000,
    portals: [
      { id: "to_space", x: 970, y: 80, width: 60, height: 100, destMapId: "space", destX: 1000, destY: 1700 },
      { id: "to_tech", x: 970, y: 1820, width: 60, height: 100, destMapId: "tech", destX: 1000, destY: 300 },
      { id: "to_amazon", x: 80, y: 950, width: 60, height: 100, destMapId: "forest", destX: 1700, destY: 1000 },
      { id: "to_desert", x: 1860, y: 950, width: 60, height: 100, destMapId: "desert", destX: 300, destY: 1000 },
      { id: "to_philippines", x: 250, y: 250, width: 60, height: 100, destMapId: "philippines", destX: 1500, destY: 1500 },
      { id: "to_nolife", x: 1690, y: 250, width: 60, height: 100, destMapId: "nolife", destX: 500, destY: 1500 },
      { id: "to_japan", x: 250, y: 1650, width: 60, height: 100, destMapId: "japan", destX: 1500, destY: 500 },
      { id: "to_island", x: 1690, y: 1650, width: 60, height: 100, destMapId: "island", destX: 500, destY: 500 }
    ]
  },
  island: {
    backgroundImage: "/rpg_map_large_island.jpeg",
    width: 2000,
    height: 2000,
    portals: [
      { id: "to_space", x: 970, y: 80, width: 60, height: 100, destMapId: "space", destX: 1000, destY: 1700 },
      { id: "to_tech", x: 970, y: 1820, width: 60, height: 100, destMapId: "tech", destX: 1000, destY: 300 },
      { id: "to_amazon", x: 80, y: 950, width: 60, height: 100, destMapId: "amazon", destX: 1700, destY: 1000 },
      { id: "to_desert", x: 1860, y: 950, width: 60, height: 100, destMapId: "desert", destX: 300, destY: 1000 },
      { id: "to_philippines", x: 250, y: 250, width: 60, height: 100, destMapId: "philippines", destX: 1500, destY: 1500 },
      { id: "to_nolife", x: 1690, y: 250, width: 60, height: 100, destMapId: "nolife", destX: 500, destY: 1500 },
      { id: "to_japan", x: 250, y: 1650, width: 60, height: 100, destMapId: "japan", destX: 1500, destY: 500 },
      { id: "to_island", x: 1690, y: 1650, width: 60, height: 100, destMapId: "forest", destX: 500, destY: 500 }
    ]
  },
  tech: {
    backgroundImage: "/rpg_map_large_future.jpeg",
    width: 2000,
    height: 2000,
    portals: [
      { id: "to_space", x: 970, y: 80, width: 60, height: 100, destMapId: "space", destX: 1000, destY: 1700 },
      { id: "to_tech", x: 970, y: 1820, width: 60, height: 100, destMapId: "forest", destX: 1000, destY: 300 },
      { id: "to_amazon", x: 80, y: 950, width: 60, height: 100, destMapId: "amazon", destX: 1700, destY: 1000 },
      { id: "to_desert", x: 1860, y: 950, width: 60, height: 100, destMapId: "desert", destX: 300, destY: 1000 },
      { id: "to_philippines", x: 250, y: 250, width: 60, height: 100, destMapId: "philippines", destX: 1500, destY: 1500 },
      { id: "to_nolife", x: 1690, y: 250, width: 60, height: 100, destMapId: "nolife", destX: 500, destY: 1500 },
      { id: "to_japan", x: 250, y: 1650, width: 60, height: 100, destMapId: "japan", destX: 1500, destY: 500 },
      { id: "to_island", x: 1690, y: 1650, width: 60, height: 100, destMapId: "island", destX: 500, destY: 500 }
    ]
  },
  japan: {
    backgroundImage: "/rpg_map_large_japan.jpeg",
    width: 2000,
    height: 2000,
    portals: [
      { id: "to_space", x: 970, y: 80, width: 60, height: 100, destMapId: "space", destX: 1000, destY: 1700 },
      { id: "to_tech", x: 970, y: 1820, width: 60, height: 100, destMapId: "tech", destX: 1000, destY: 300 },
      { id: "to_amazon", x: 80, y: 950, width: 60, height: 100, destMapId: "amazon", destX: 1700, destY: 1000 },
      { id: "to_desert", x: 1860, y: 950, width: 60, height: 100, destMapId: "desert", destX: 300, destY: 1000 },
      { id: "to_philippines", x: 250, y: 250, width: 60, height: 100, destMapId: "philippines", destX: 1500, destY: 1500 },
      { id: "to_nolife", x: 1690, y: 250, width: 60, height: 100, destMapId: "nolife", destX: 500, destY: 1500 },
      { id: "to_japan", x: 250, y: 1650, width: 60, height: 100, destMapId: "forest", destX: 1500, destY: 500 },
      { id: "to_island", x: 1690, y: 1650, width: 60, height: 100, destMapId: "island", destX: 500, destY: 500 }
    ]
  },
  philippines: {
    backgroundImage: "/rpg_map_large_philippines.jpeg",
    width: 2000,
    height: 2000,
    portals: [
      { id: "to_space", x: 970, y: 80, width: 60, height: 100, destMapId: "space", destX: 1000, destY: 1700 },
      { id: "to_tech", x: 970, y: 1820, width: 60, height: 100, destMapId: "tech", destX: 1000, destY: 300 },
      { id: "to_amazon", x: 80, y: 950, width: 60, height: 100, destMapId: "amazon", destX: 1700, destY: 1000 },
      { id: "to_desert", x: 1860, y: 950, width: 60, height: 100, destMapId: "desert", destX: 300, destY: 1000 },
      { id: "to_philippines", x: 250, y: 250, width: 60, height: 100, destMapId: "forest", destX: 1500, destY: 1500 },
      { id: "to_nolife", x: 1690, y: 250, width: 60, height: 100, destMapId: "nolife", destX: 500, destY: 1500 },
      { id: "to_japan", x: 250, y: 1650, width: 60, height: 100, destMapId: "japan", destX: 1500, destY: 500 },
      { id: "to_island", x: 1690, y: 1650, width: 60, height: 100, destMapId: "island", destX: 500, destY: 500 }
    ]
  }
};



export default function GlobalChatGame({ sessionInfo, channelRef, channelReadyRef, sharedPresenceRef, onlinePlayers, messages = [], isOpen = true }: GlobalChatGameProps) {
  // Local Player State
  const [isPlaying, setIsPlaying] = useState(false);
  const [localSpriteState, setLocalSpriteState] = useState({ flipX: false, isWalking: false });
  const [currentMapId, setCurrentMapId] = useState("forest");
  const [showGameOver, setShowGameOver] = useState(false);

  const handleRespawn = useCallback(() => {
    setShowGameOver(false);
    isDeadRef.current = false;

    localHealth.current = 100;
    localPos.current.x = 1000;
    localPos.current.y = 1000;
    localPos.current.mapId = "forest";
    setCurrentMapId("forest");

    if (channelReadyRef.current && channelRef.current) {
      channelRef.current.send({
        type: 'broadcast',
        event: 'move',
        payload: {
          user_id: sessionInfo.id,
          x: 1000,
          y: 1000,
          flipX: localPos.current.flipX,
          isWalking: false,
          mapId: "forest"
        }
      });
      channelRef.current.send({
        type: 'broadcast',
        event: 'health_update',
        payload: {
          user_id: sessionInfo.id,
          health: 100,
          isDead: false
        }
      });
    }

    if (playerHealthBarRef.current) {
      playerHealthBarRef.current.style.width = '100%';
      playerHealthBarRef.current.style.backgroundColor = '#22c55e';
    }

    if (playerRef.current) {
      playerRef.current.style.transition = 'none';
      playerRef.current.style.transform = `scaleX(${localPos.current.flipX ? -1 : 1})`;
    }
  }, [sessionInfo.id]);

  // Map Pets
  const [mapPets, setMapPets] = useState<GamePet[]>([]);
  const petsRef = useRef<GamePet[]>([]);

  // Spawn pets when map changes
  useEffect(() => {
    if (isPlaying && currentMapId === "amazon") {
      const amazonPets: { type: "fox" | "dog" | "turtle" | "snake", count: number }[] = [
        { type: "fox", count: 10 },
        { type: "dog", count: 12 },
        { type: "turtle", count: 9 },
        { type: "snake", count: 5 }
      ];

      const newPets: GamePet[] = [];
      amazonPets.forEach(({ type, count }) => {
        for (let i = 0; i < count; i++) {
          const isDogOrFox = type === 'dog' || type === 'fox';

          newPets.push({
            id: `pet-${type}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            x: Math.random() * MAP_WIDTH,
            y: MAP_HEIGHT * (0.35 + Math.random() * 0.65), // Avoid top 35% of map
            vx: 0,
            vy: 0,
            flipX: Math.random() > 0.5,
            isWalking: false,
            scale: isDogOrFox ? 1 : (0.6 + Math.random() * 0.8),
            speed: PET_SPEEDS[type] + (Math.random() * 20 - 10),
            idleDuration: isDogOrFox ? 10000 + Math.random() * 2000 : 4000 + Math.random() * 2000,
            walkDuration: isDogOrFox ? 3000 + Math.random() * 1000 : 1500 + Math.random() * 1500,
            nextActionTime: Date.now() + Math.random() * 3000
          });
        }
      });
      petsRef.current = newPets;
      setMapPets(newPets);
    } else {
      petsRef.current = [];
      setMapPets([]);
    }
  }, [currentMapId, isPlaying]);



  // We use refs for local position to update instantly without React re-renders lagging the physics
  const localPos = useRef({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, flipX: false, isWalking: false, mapId: "forest" });
  const keysPressed = useRef<{ [key: string]: boolean }>({});
  const isDeadRef = useRef(false);

  // Refs for direct DOM manipulation (Performance optimization for Safari)
  const playerRef = useRef<HTMLDivElement>(null);
  const playerHealthBarRef = useRef<HTMLDivElement>(null);
  const localHealth = useRef(100);
  const lastHitTime = useRef(0);
  const playersHealth = useRef<Record<string, { hp: number, lastHitTime: number }>>({});
  const minimapPlayerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTrackTimeout = useRef<NodeJS.Timeout | null>(null);
  const latestPositions = useRef<Record<string, { x: number, y: number, flipX: boolean, isWalking: boolean, mapId?: string }>>({});

  // Preload all map images when the game loads to ensure zero delay when using portals
  useEffect(() => {
    const imagesToPreload = [
      "/rpg_map_large.png",
      "/rpg_map_large_night.jpeg"
    ];

    // Add all map backgrounds
    Object.values(MAPS).forEach(map => {
      if (!imagesToPreload.includes(map.backgroundImage)) {
        imagesToPreload.push(map.backgroundImage);
      }
    });

    imagesToPreload.forEach(src => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Setup cats with persistent refs to avoid re-renders resetting their state
  const catsRef = useRef(Array.from({ length: 3 }).map((_, i) => ({
    id: `cat-center-${i}`,
    x: (MAP_WIDTH / 2) + (Math.random() - 0.5) * 300,
    y: (MAP_HEIGHT / 2) + (Math.random() - 0.5) * 300,
    targetX: (MAP_WIDTH / 2) + (Math.random() - 0.5) * 300,
    targetY: (MAP_HEIGHT / 2) + (Math.random() - 0.5) * 300,
    speed: 0.5 + Math.random() * 0.5,
    flipX: false,
    isWalking: false,
    nextMoveTime: 0
  })));

  // Setup foxes
  const foxesRef = useRef(Array.from({ length: 4 }).map((_, i) => ({
    id: `fox-bottom-${i}`,
    x: (MAP_WIDTH / 2) + (Math.random() - 0.5) * (MAP_WIDTH - 200),
    y: MAP_HEIGHT - Math.random() * 400, // Bottom 400px of the map
    targetX: (MAP_WIDTH / 2) + (Math.random() - 0.5) * (MAP_WIDTH - 200),
    targetY: MAP_HEIGHT - Math.random() * 400,
    speed: 0.3 + Math.random() * 0.4, // Slow/normal
    flipX: false,
    isWalking: false,
    nextMoveTime: Math.random() * 5000 // Stagger initial idle
  })));

  // Setup dogs
  const dogsRef = useRef(Array.from({ length: 4 }).map((_, i) => ({
    id: `dog-bottomright-${i}`,
    x: MAP_WIDTH - Math.random() * 400, // Bottom right 400px of map
    y: MAP_HEIGHT - Math.random() * 400,
    targetX: MAP_WIDTH - Math.random() * 400,
    targetY: MAP_HEIGHT - Math.random() * 400,
    speed: 0.3 + Math.random() * 0.4,
    flipX: false,
    isWalking: false,
    nextMoveTime: Math.random() * 5000
  })));

  // Setup mice
  const miceRef = useRef(Array.from({ length: 5 }).map((_, i) => ({
    id: `mouse-rightcenter-${i}`,
    x: MAP_WIDTH - Math.random() * 400, // Right 400px of map
    y: (MAP_HEIGHT / 2) + (Math.random() - 0.5) * 400, // Center Y
    targetX: MAP_WIDTH - Math.random() * 400,
    targetY: (MAP_HEIGHT / 2) + (Math.random() - 0.5) * 400,
    speed: 0.4 + Math.random() * 0.5, // Slightly faster, skittish
    flipX: false,
    isWalking: false,
    nextMoveTime: Math.random() * 4000
  })));

  // Setup chickens
  const chickensRef = useRef(Array.from({ length: 4 }).map((_, i) => ({
    id: `chicken-leftcenter-${i}`,
    x: Math.random() * 400, // Left 400px of map
    y: (MAP_HEIGHT / 2) + (Math.random() - 0.5) * 400, // Center Y
    targetX: Math.random() * 400,
    targetY: (MAP_HEIGHT / 2) + (Math.random() - 0.5) * 400,
    speed: 0.3 + Math.random() * 0.4,
    flipX: false,
    isWalking: false,
    nextMoveTime: Math.random() * 5000
  })));

  // Last broadcasted state
  const lastBroadcast = useRef({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, time: 0, wasWalking: false, flipX: false, mapId: "forest" });
  const lastRenderedState = useRef({ flipX: false, isWalking: false });

  // Listen for broadcast events from other players
  useEffect(() => {
    const handlePlayerMove = (e: any) => {
      const data = e.detail;
      if (data.user_id === sessionInfo.id) return;

      // Store the absolute latest position for when React re-renders
      latestPositions.current[data.user_id] = { x: data.x, y: data.y, flipX: data.flipX, isWalking: data.isWalking, mapId: data.mapId };

      const playerEl = document.getElementById(`player-${data.user_id}`);
      if (playerEl) {
        playerEl.style.display = data.mapId === currentMapId ? 'flex' : 'none';
        playerEl.style.transform = `translate3d(${data.x}px, ${data.y}px, 0) translate(-50%, -100%)`;
        playerEl.style.zIndex = Math.floor(data.y).toString();
      }

      const minimapEl = document.getElementById(`minimap-${data.user_id}`);
      if (minimapEl) {
        minimapEl.style.left = `${(data.x / MAP_WIDTH) * 100}%`;
        minimapEl.style.top = `${(data.y / MAP_HEIGHT) * 100}%`;
      }

      window.dispatchEvent(new CustomEvent(`sprite-update-${data.user_id}`, { detail: { flipX: data.flipX, isWalking: data.isWalking } }));
    };

    const handlePlayerHealth = (e: any) => {
      const data = e.detail;
      if (data.user_id === sessionInfo.id) return;

      if (!playersHealth.current[data.user_id]) {
        playersHealth.current[data.user_id] = { hp: 100, lastHitTime: 0 };
      }

      const remoteStats = playersHealth.current[data.user_id];
      remoteStats.hp = data.health;

      const healthBarEl = document.getElementById(`healthbar-${data.user_id}`);
      if (healthBarEl) {
        const hpPercent = (remoteStats.hp / 100) * 100;
        healthBarEl.style.width = `${hpPercent}%`;

        if (hpPercent > 50) {
          healthBarEl.style.backgroundColor = '#22c55e'; // green
        } else if (hpPercent > 25) {
          healthBarEl.style.backgroundColor = '#eab308'; // yellow
        } else {
          healthBarEl.style.backgroundColor = '#ef4444'; // red
        }
      }

      const playerEl = document.getElementById(`player-${data.user_id}`);
      if (playerEl && data.isDead) {
        playerEl.style.transition = 'transform 0.5s ease-in-out';
        const pos = latestPositions.current[data.user_id] || { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 };
        playerEl.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -100%) rotate(90deg) translate(10px, 30px)`;
      } else if (playerEl && !data.isDead) {
        // Just in case they respawned
        const pos = latestPositions.current[data.user_id] || { x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2 };
        playerEl.style.transform = `translate3d(${pos.x}px, ${pos.y}px, 0) translate(-50%, -100%)`;
      }

      window.dispatchEvent(new CustomEvent(`sprite-update-${data.user_id}`, { detail: { isDead: data.isDead } }));
    };

    window.addEventListener('player-move', handlePlayerMove);
    window.addEventListener('player-health', handlePlayerHealth);
    return () => {
      window.removeEventListener('player-move', handlePlayerMove);
      window.removeEventListener('player-health', handlePlayerHealth);
    };
  }, [sessionInfo.id, currentMapId]);

  // Game Loop
  useEffect(() => {
    if (!isPlaying) return;

    // Initially broadcast position to be visible to others when joining
    sharedPresenceRef.current.x = localPos.current.x;
    sharedPresenceRef.current.y = localPos.current.y;
    channelRef.current?.track({
      user_id: sessionInfo.id,
      username: sessionInfo.username,
      ...sharedPresenceRef.current
    });

    const showHitEffect = (x: number, y: number, damage: number, petType: string) => {
      if (!worldRef.current) return;

      // Damage Number (floats up from the pet)
      const dmgEl = document.createElement('div');
      dmgEl.className = 'absolute text-red-500 font-bold pointer-events-none select-none z-[999]';
      dmgEl.style.left = `${x}px`;
      dmgEl.style.top = `${y - 40}px`;
      dmgEl.style.fontFamily = "'Press Start 2P', monospace";
      dmgEl.style.fontSize = '10px';
      dmgEl.style.textShadow = '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000';
      dmgEl.innerText = `-${damage}`;
      worldRef.current.appendChild(dmgEl);
      dmgEl.animate([
        { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
        { transform: 'translate(-50%, -30px) scale(1.5)', opacity: 0 }
      ], { duration: 800, easing: 'ease-out' });
      setTimeout(() => { if (dmgEl.parentNode) dmgEl.parentNode.removeChild(dmgEl); }, 800);

      // Cross Strike Effect (from reference image)
      const crossStrike = document.createElement('div');
      crossStrike.className = 'absolute pointer-events-none z-[999] flex items-center justify-center';
      crossStrike.style.left = `${x}px`;
      crossStrike.style.top = `${y - 20}px`;
      crossStrike.style.width = '40px';
      crossStrike.style.height = '40px';
      crossStrike.style.marginLeft = '-20px';
      crossStrike.style.marginTop = '-20px';
      crossStrike.style.filter = 'drop-shadow(2px 2px 0 rgba(0,0,0,0.8))';

      // Broken Circle - Top & Bottom arcs
      const arc1 = document.createElement('div');
      arc1.style.position = 'absolute';
      arc1.style.width = '28px';
      arc1.style.height = '28px';
      arc1.style.left = '6px';
      arc1.style.top = '6px';
      arc1.style.borderRadius = '50%';
      arc1.style.border = '4px solid transparent';
      arc1.style.borderTopColor = '#ff7a00';
      arc1.style.borderBottomColor = '#ff7a00';
      crossStrike.appendChild(arc1);

      // Broken Circle - Left & Right arcs
      const arc2 = document.createElement('div');
      arc2.style.position = 'absolute';
      arc2.style.width = '28px';
      arc2.style.height = '28px';
      arc2.style.left = '6px';
      arc2.style.top = '6px';
      arc2.style.borderRadius = '50%';
      arc2.style.border = '4px solid transparent';
      arc2.style.borderLeftColor = '#ffea00';
      arc2.style.borderRightColor = '#ffea00';
      crossStrike.appendChild(arc2);

      // Diagonal Spike 1 (Top-Left to Bottom-Right)
      const spikeX1 = document.createElement('div');
      spikeX1.style.position = 'absolute';
      spikeX1.style.width = '40px';
      spikeX1.style.height = '6px';
      spikeX1.style.left = '0px';
      spikeX1.style.top = '17px';
      spikeX1.style.background = 'linear-gradient(90deg, #ff7a00 0%, #ffea00 30%, #ffea00 70%, #ff7a00 100%)';
      spikeX1.style.transform = 'rotate(45deg)';
      spikeX1.style.clipPath = 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)';
      crossStrike.appendChild(spikeX1);

      // Diagonal Spike 2 (Top-Right to Bottom-Left)
      const spikeX2 = document.createElement('div');
      spikeX2.style.position = 'absolute';
      spikeX2.style.width = '40px';
      spikeX2.style.height = '6px';
      spikeX2.style.left = '0px';
      spikeX2.style.top = '17px';
      spikeX2.style.background = 'linear-gradient(90deg, #ff7a00 0%, #ffea00 30%, #ffea00 70%, #ff7a00 100%)';
      spikeX2.style.transform = 'rotate(-45deg)';
      spikeX2.style.clipPath = 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)';
      crossStrike.appendChild(spikeX2);

      // Vertical Spike
      const spikeV = document.createElement('div');
      spikeV.style.position = 'absolute';
      spikeV.style.width = '4px';
      spikeV.style.height = '48px';
      spikeV.style.left = '18px';
      spikeV.style.top = '-4px';
      spikeV.style.background = 'linear-gradient(180deg, #ff7a00 0%, #ffea00 30%, #ffea00 70%, #ff7a00 100%)';
      spikeV.style.clipPath = 'polygon(50% 0, 100% 10%, 100% 90%, 50% 100%, 0 90%, 0 10%)';
      crossStrike.appendChild(spikeV);

      worldRef.current.appendChild(crossStrike);

      // Pop Animation
      crossStrike.animate([
        { transform: 'scale(0.3) rotate(-15deg)', opacity: 1 },
        { transform: 'scale(1.2) rotate(15deg)', opacity: 0 }
      ], { duration: 300, easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)' });

      setTimeout(() => {
        if (crossStrike.parentNode) crossStrike.parentNode.removeChild(crossStrike);
      }, 300);
    };

    let animationFrameId: number;
    let lastTime = performance.now();

    const gameLoop = (time: number) => {
      const deltaTime = time - lastTime;
      lastTime = time;

      // Cap deltaTime at 50ms to prevent huge jumps if tab is inactive
      const dt = Math.min(deltaTime, 50);

      // Target speed was ~240 pixels per second (4 pixels at 60fps)
      const moveSpeedPixelsPerMs = 0.24;
      const currentMoveSpeed = moveSpeedPixelsPerMs * dt;

      let moved = false;
      let dx = 0;
      let dy = 0;

      // Only allow movement if not dead
      if (!isDeadRef.current) {
        if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= currentMoveSpeed;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += currentMoveSpeed;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= currentMoveSpeed;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += currentMoveSpeed;
      }

      if (dx !== 0 || dy !== 0) {
        moved = true;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
          const length = Math.sqrt(dx * dx + dy * dy);
          dx = (dx / length) * currentMoveSpeed;
          dy = (dy / length) * currentMoveSpeed;
        }

        localPos.current.x = Math.max(16, Math.min(MAP_WIDTH - 16, localPos.current.x + dx));
        localPos.current.y = Math.max(32, Math.min(MAP_HEIGHT - 32, localPos.current.y + dy));

        if (dx < 0) localPos.current.flipX = true;
        if (dx > 0) localPos.current.flipX = false;
      }

      // Check for portal collisions
      const currentMap = MAPS[localPos.current.mapId || "forest"];
      if (currentMap && currentMap.portals) {
        // approximate player hit box
        const playerRect = { x: localPos.current.x - 20, y: localPos.current.y - 40, width: 40, height: 40 };
        for (const portal of currentMap.portals) {
          if (
            playerRect.x < portal.x + portal.width &&
            playerRect.x + playerRect.width > portal.x &&
            playerRect.y < portal.y + portal.height &&
            playerRect.y + playerRect.height > portal.y
          ) {
            // Teleport!
            localPos.current.x = portal.destX;
            localPos.current.y = portal.destY;
            localPos.current.mapId = portal.destMapId;
            setCurrentMapId(portal.destMapId);

            // Broadcast teleport so other clients move us immediately
            if (channelReadyRef.current && channelRef.current) {
              channelRef.current.send({
                type: 'broadcast',
                event: 'move',
                payload: {
                  user_id: sessionInfo.id,
                  x: portal.destX,
                  y: portal.destY,
                  flipX: localPos.current.flipX,
                  isWalking: false,
                  mapId: portal.destMapId
                }
              });
            }
            break; // only trigger one portal
          }
        }
      }

      localPos.current.isWalking = moved;

      // Update Cats
      catsRef.current.forEach(cat => {
        if (time > cat.nextMoveTime) {
          if (cat.isWalking) {
            cat.isWalking = false;
            // Idle for exactly 10 seconds
            cat.nextMoveTime = time + 10000;
          } else {
            // Pick a new target in the center of the map
            cat.targetX = Math.max((MAP_WIDTH / 2) - 400, Math.min((MAP_WIDTH / 2) + 400, cat.x + (Math.random() - 0.5) * 300));
            cat.targetY = Math.max((MAP_HEIGHT / 2) - 400, Math.min((MAP_HEIGHT / 2) + 400, cat.y + (Math.random() - 0.5) * 300));
            cat.isWalking = true;
            cat.flipX = cat.targetX < cat.x;
            // Walk for 3 to 5 seconds
            cat.nextMoveTime = time + 3000 + Math.random() * 2000;
          }
        }

        if (cat.isWalking) {
          const cdx = cat.targetX - cat.x;
          const cdy = cat.targetY - cat.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist > 1) {
            cat.x += (cdx / cdist) * cat.speed;
            cat.y += (cdy / cdist) * cat.speed;
          } else {
            // Reached target early! Start idling.
            cat.isWalking = false;
            cat.nextMoveTime = time + 10000;
          }

          const el = document.getElementById(cat.id);
          if (el) {
            el.style.transform = `translate3d(${cat.x}px, ${cat.y}px, 0) translate(-50%, -100%)`;
            el.style.zIndex = Math.floor(cat.y).toString();

            const img = el.querySelector('img');
            if (img) {
              img.style.transition = 'none';
              img.style.transform = `scale(${cat.flipX ? -0.85 : 0.85}, 0.85)`;
              if (img.getAttribute('src') !== CAT_WALK) {
                img.setAttribute('src', CAT_WALK);
              }
            }
          }
        } else {
          const el = document.getElementById(cat.id);
          if (el) {
            const img = el.querySelector('img');
            if (img) {
              img.style.transition = 'none';
              img.style.transform = `scale(${cat.flipX ? -1 : 1}, 1)`;
              if (img.getAttribute('src') !== CAT_IDLE) {
                img.setAttribute('src', CAT_IDLE);
              }
            }
          }
        }
      });

      // Update Foxes
      foxesRef.current.forEach(fox => {
        if (time > fox.nextMoveTime) {
          if (fox.isWalking) {
            fox.isWalking = false;
            // Idle for 5 to 15 seconds
            fox.nextMoveTime = time + 5000 + Math.random() * 10000;
          } else {
            // Pick a new target at the bottom of the map
            fox.targetX = Math.max(0, Math.min(MAP_WIDTH, fox.x + (Math.random() - 0.5) * 400));
            fox.targetY = Math.max(MAP_HEIGHT - 600, Math.min(MAP_HEIGHT, fox.y + (Math.random() - 0.5) * 400));
            fox.isWalking = true;
            fox.flipX = fox.targetX < fox.x;
            // Walk for 3 to 6 seconds
            fox.nextMoveTime = time + 3000 + Math.random() * 3000;
          }
        }

        if (fox.isWalking) {
          const fdx = fox.targetX - fox.x;
          const fdy = fox.targetY - fox.y;
          const fdist = Math.sqrt(fdx * fdx + fdy * fdy);

          if (fdist > 1) {
            fox.x += (fdx / fdist) * fox.speed;
            fox.y += (fdy / fdist) * fox.speed;
          } else {
            fox.isWalking = false;
            fox.nextMoveTime = time + 5000 + Math.random() * 10000;
          }

          const el = document.getElementById(fox.id);
          if (el) {
            el.style.transform = `translate3d(${fox.x}px, ${fox.y}px, 0) translate(-50%, -100%)`;
            el.style.zIndex = Math.floor(fox.y).toString();

            const img = el.querySelector('img');
            if (img) {
              img.style.transition = 'none';
              img.style.transform = `scale(${fox.flipX ? -1 : 1}, 1)`;
              if (img.getAttribute('src') !== FOX_WALK) {
                img.setAttribute('src', FOX_WALK);
              }
            }
          }
        } else {
          const el = document.getElementById(fox.id);
          if (el) {
            const img = el.querySelector('img');
            if (img) {
              img.style.transition = 'none';
              img.style.transform = `scale(${fox.flipX ? -1 : 1}, 1)`;
              if (img.getAttribute('src') !== FOX_IDLE) {
                img.setAttribute('src', FOX_IDLE);
              }
            }
          }
        }
      });

      // Update Dogs
      dogsRef.current.forEach(dog => {
        if (time > dog.nextMoveTime) {
          if (dog.isWalking) {
            dog.isWalking = false;
            // Idle for 5 to 15 seconds
            dog.nextMoveTime = time + 5000 + Math.random() * 10000;
          } else {
            // Pick a new target at the bottom right of the map
            dog.targetX = Math.max(MAP_WIDTH - 600, Math.min(MAP_WIDTH, dog.x + (Math.random() - 0.5) * 400));
            dog.targetY = Math.max(MAP_HEIGHT - 600, Math.min(MAP_HEIGHT, dog.y + (Math.random() - 0.5) * 400));
            dog.isWalking = true;
            dog.flipX = dog.targetX < dog.x;
            // Walk for 3 to 6 seconds
            dog.nextMoveTime = time + 3000 + Math.random() * 3000;
          }
        }

        if (dog.isWalking) {
          const ddx = dog.targetX - dog.x;
          const ddy = dog.targetY - dog.y;
          const ddist = Math.sqrt(ddx * ddx + ddy * ddy);

          if (ddist > 1) {
            dog.x += (ddx / ddist) * dog.speed;
            dog.y += (ddy / ddist) * dog.speed;
          } else {
            dog.isWalking = false;
            dog.nextMoveTime = time + 5000 + Math.random() * 10000;
          }

          const el = document.getElementById(dog.id);
          if (el) {
            el.style.transform = `translate3d(${dog.x}px, ${dog.y}px, 0) translate(-50%, -100%)`;
            el.style.zIndex = Math.floor(dog.y).toString();

            const img = el.querySelector('img');
            if (img) {
              img.style.transition = 'none';
              img.style.transform = `scale(${dog.flipX ? -1 : 1}, 1)`;
              if (img.getAttribute('src') !== DOG_WALK) {
                img.setAttribute('src', DOG_WALK);
              }
            }
          }
        } else {
          const el = document.getElementById(dog.id);
          if (el) {
            const img = el.querySelector('img');
            if (img) {
              img.style.transition = 'none';
              img.style.transform = `scale(${dog.flipX ? -1 : 1}, 1)`;
              if (img.getAttribute('src') !== DOG_IDLE) {
                img.setAttribute('src', DOG_IDLE);
              }
            }
          }
        }
      });

      // Update Mice
      miceRef.current.forEach(mouse => {
        if (time > mouse.nextMoveTime) {
          if (mouse.isWalking) {
            mouse.isWalking = false;
            // Idle for 3 to 10 seconds
            mouse.nextMoveTime = time + 3000 + Math.random() * 7000;
          } else {
            // Pick a new target at the right center of the map
            mouse.targetX = Math.max(MAP_WIDTH - 600, Math.min(MAP_WIDTH, mouse.x + (Math.random() - 0.5) * 400));
            mouse.targetY = Math.max((MAP_HEIGHT / 2) - 400, Math.min((MAP_HEIGHT / 2) + 400, mouse.y + (Math.random() - 0.5) * 400));
            mouse.isWalking = true;
            mouse.flipX = mouse.targetX < mouse.x;
            // Walk for 2 to 5 seconds
            mouse.nextMoveTime = time + 2000 + Math.random() * 3000;
          }
        }

        if (mouse.isWalking) {
          const mdx = mouse.targetX - mouse.x;
          const mdy = mouse.targetY - mouse.y;
          const mdist = Math.sqrt(mdx * mdx + mdy * mdy);

          if (mdist > 1) {
            mouse.x += (mdx / mdist) * mouse.speed;
            mouse.y += (mdy / mdist) * mouse.speed;
          } else {
            mouse.isWalking = false;
            mouse.nextMoveTime = time + 3000 + Math.random() * 7000;
          }

          const el = document.getElementById(mouse.id);
          if (el) {
            el.style.transform = `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -100%)`;
            el.style.zIndex = Math.floor(mouse.y).toString();

            const img = el.querySelector('img');
            if (img) {
              img.style.transition = 'none';
              img.style.transform = `scale(${mouse.flipX ? -1 : 1}, 1)`;
              if (img.getAttribute('src') !== MOUSE_WALK) {
                img.setAttribute('src', MOUSE_WALK);
              }
            }
          }
        } else {
          const el = document.getElementById(mouse.id);
          if (el) {
            const img = el.querySelector('img');
            if (img) {
              img.style.transition = 'none';
              img.style.transform = `scale(${mouse.flipX ? -1 : 1}, 1)`;
              if (img.getAttribute('src') !== MOUSE_IDLE) {
                img.setAttribute('src', MOUSE_IDLE);
              }
            }
          }
        }
      });

      // Update Chickens
      chickensRef.current.forEach(chicken => {
        if (time > chicken.nextMoveTime) {
          if (chicken.isWalking) {
            chicken.isWalking = false;
            // Idle for 5 to 15 seconds
            chicken.nextMoveTime = time + 5000 + Math.random() * 10000;
          } else {
            // Pick a new target at the left center of the map
            chicken.targetX = Math.max(0, Math.min(400, chicken.x + (Math.random() - 0.5) * 400));
            chicken.targetY = Math.max((MAP_HEIGHT / 2) - 400, Math.min((MAP_HEIGHT / 2) + 400, chicken.y + (Math.random() - 0.5) * 400));
            chicken.isWalking = true;
            chicken.flipX = chicken.targetX < chicken.x;
            // Walk for 3 to 6 seconds
            chicken.nextMoveTime = time + 3000 + Math.random() * 3000;
          }
        }

        if (chicken.isWalking) {
          const cdx = chicken.targetX - chicken.x;
          const cdy = chicken.targetY - chicken.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);

          if (cdist > 1) {
            chicken.x += (cdx / cdist) * chicken.speed;
            chicken.y += (cdy / cdist) * chicken.speed;
          } else {
            chicken.isWalking = false;
            chicken.nextMoveTime = time + 5000 + Math.random() * 10000;
          }

          const el = document.getElementById(chicken.id);
          if (el) {
            el.style.transform = `translate3d(${chicken.x}px, ${chicken.y}px, 0) translate(-50%, -100%)`;
            el.style.zIndex = Math.floor(chicken.y).toString();

            const img = el.querySelector('img');
            if (img) {
              img.style.transition = 'none';
              img.style.transform = `scale(${chicken.flipX ? -1 : 1}, 1)`;
              if (img.getAttribute('src') !== CHICKEN_WALK) {
                img.setAttribute('src', CHICKEN_WALK);
              }
            }
          }
        } else {
          const el = document.getElementById(chicken.id);
          if (el) {
            const img = el.querySelector('img');
            if (img) {
              img.style.transition = 'none';
              img.style.transform = `scale(${chicken.flipX ? -1 : 1}, 1)`;
              if (img.getAttribute('src') !== CHICKEN_IDLE) {
                img.setAttribute('src', CHICKEN_IDLE);
              }
            }
          }
        }
      });

      // Direct DOM manipulation to avoid React re-render lag in Safari
      if (playerRef.current) {
        playerRef.current.style.zIndex = Math.floor(localPos.current.y).toString();
        playerRef.current.style.transform = `translate3d(${localPos.current.x}px, ${localPos.current.y}px, 0) translate(-50%, -100%)`;
      }

      if (minimapPlayerRef.current) {
        minimapPlayerRef.current.style.left = `${(localPos.current.x / MAP_WIDTH) * 100}%`;
        minimapPlayerRef.current.style.top = `${(localPos.current.y / MAP_HEIGHT) * 100}%`;
      }

      // Update local visual state instantly without waiting for network broadcasts
      if (moved !== lastRenderedState.current.isWalking || localPos.current.flipX !== lastRenderedState.current.flipX) {
        lastRenderedState.current.isWalking = moved;
        lastRenderedState.current.flipX = localPos.current.flipX;
        setLocalSpriteState({ flipX: localPos.current.flipX, isWalking: moved });
      }

      localPos.current.isWalking = moved;

      if (worldRef.current && containerRef.current) {
        // Calculate viewport size dynamically for responsiveness
        const rect = containerRef.current.getBoundingClientRect();
        const viewportWidth = rect.width;
        const viewportHeight = rect.height;

        let camX = localPos.current.x - viewportWidth / 2;
        let camY = localPos.current.y - viewportHeight / 2;
        camX = Math.max(0, Math.min(MAP_WIDTH - viewportWidth, camX));
        camY = Math.max(0, Math.min(MAP_HEIGHT - viewportHeight, camY));

        worldRef.current.style.transform = `translate3d(${-camX}px, ${-camY}px, 0)`;
      }

      // Broadcast to network
      const now = Date.now();
      if (moved) {
        if (idleTrackTimeout.current) {
          clearTimeout(idleTrackTimeout.current);
          idleTrackTimeout.current = null;
        }

        if (now - lastBroadcast.current.time > UPDATE_INTERVAL_MS) {
          if (channelReadyRef.current && channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'move',
              payload: {
                user_id: sessionInfo.id,
                x: localPos.current.x,
                y: localPos.current.y,
                flipX: localPos.current.flipX,
                isWalking: true,
                mapId: localPos.current.mapId
              }
            });
          }
          lastBroadcast.current.time = now;
          lastBroadcast.current.wasWalking = true;
          lastBroadcast.current.flipX = localPos.current.flipX;
        }
      } else {
        if (lastBroadcast.current.wasWalking) {
          // Just stopped moving, send final broadcast
          if (channelReadyRef.current && channelRef.current) {
            channelRef.current.send({
              type: 'broadcast',
              event: 'move',
              payload: {
                user_id: sessionInfo.id,
                x: localPos.current.x,
                y: localPos.current.y,
                flipX: localPos.current.flipX,
                isWalking: false,
                mapId: localPos.current.mapId
              }
            });
          }

          lastBroadcast.current.wasWalking = false;

          // And update presence track for late joiners (Debounced to prevent spam)
          if (idleTrackTimeout.current) clearTimeout(idleTrackTimeout.current);
          idleTrackTimeout.current = setTimeout(() => {
            sharedPresenceRef.current.x = localPos.current.x;
            sharedPresenceRef.current.y = localPos.current.y;
            sharedPresenceRef.current.flipX = localPos.current.flipX;
            sharedPresenceRef.current.isWalking = false;
            sharedPresenceRef.current.mapId = localPos.current.mapId;

            channelRef.current?.track({
              user_id: sessionInfo.id,
              username: sessionInfo.username,
              ...sharedPresenceRef.current
            });
          }, 1000);
        }
      }


      // --- MAP PETS UPDATE ---
      const petNow = Date.now();
      const petDt = 0.016; // approx 60fps delta

      petsRef.current.forEach((pet) => {
        let { x, y, vx, vy, speed, nextActionTime, targetX, targetY, isWalking, flipX } = pet;

        let isChasing = false;

        if (pet.type === 'dog' || pet.type === 'fox' || pet.type === 'cat' || pet.type === 'snake') {
          let closestPlayerId = isDeadRef.current ? "" : "local";
          let closestPlayerX = localPos.current.x;
          let closestPlayerY = localPos.current.y;
          let minDist = isDeadRef.current ? Infinity : Math.hypot(closestPlayerX - x, closestPlayerY - y);

          Object.keys(latestPositions.current).forEach((playerId) => {
            const p = latestPositions.current[playerId] as any;
            const isRemoteDead = playersHealth.current[playerId]?.hp === 0;

            // Only chase if they are on the same map (assuming amazon since pets are here) and NOT dead
            if ((p.mapId === "amazon" || !p.mapId) && !isRemoteDead) {
              const dist = Math.hypot(p.x - x, p.y - y);
              if (dist < minDist) {
                minDist = dist;
                closestPlayerX = p.x;
                closestPlayerY = p.y;
                closestPlayerId = playerId;
              }
            }
          });

          if (minDist < 250) { // Chase range
            isChasing = true;
            targetX = closestPlayerX;
            targetY = closestPlayerY;
            isWalking = true;
            nextActionTime = petNow + 2000; // Delay normal actions while chasing

            // Hit detection
            if (minDist < 30) {
              let damage = 1;
              if (pet.type === 'dog') damage = 3;
              if (pet.type === 'fox') damage = 2;
              if (pet.type === 'snake') damage = 1;

              if (!pet.lastHitTimes) pet.lastHitTimes = {};
              const lastHit = pet.lastHitTimes[closestPlayerId] || 0;

              // Each pet has its OWN 1 second cooldown against a specific player
              if (petNow - lastHit > 1000) {
                pet.lastHitTimes[closestPlayerId] = petNow;

                // Apply slight random offset to prevent perfect overlapping if multiple pets hit exactly at the same coordinate
                const offsetX = (Math.random() - 0.5) * 10;
                const offsetY = (Math.random() - 0.5) * 10;
                showHitEffect(x + offsetX, y + offsetY, damage, pet.type);

                if (closestPlayerId === "local") {
                  localHealth.current = Math.max(0, localHealth.current - damage);

                  if (localHealth.current === 0 && !isDeadRef.current) {
                    isDeadRef.current = true;
                    if (playerRef.current) {
                      playerRef.current.style.transition = 'transform 0.5s ease-in-out';
                      // Fall flat with head on the right and feet on the left, keeping their map position
                      playerRef.current.style.transform = `translate3d(${localPos.current.x}px, ${localPos.current.y}px, 0) translate(-50%, -100%) rotate(90deg) translate(10px, 30px)`;

                      setTimeout(() => {
                        setTimeout(() => {
                          setShowGameOver(true);
                        }, 1200);
                      }, 250);
                    } else {
                      setShowGameOver(true);
                    }
                  }

                  if (playerHealthBarRef.current) {
                    const hpPercent = (localHealth.current / 100) * 100;
                    playerHealthBarRef.current.style.width = `${hpPercent}%`;

                    if (hpPercent > 50) {
                      playerHealthBarRef.current.style.backgroundColor = '#22c55e'; // green
                    } else if (hpPercent > 25) {
                      playerHealthBarRef.current.style.backgroundColor = '#eab308'; // yellow
                    } else {
                      playerHealthBarRef.current.style.backgroundColor = '#ef4444'; // red
                    }
                  }

                  if (channelReadyRef.current && channelRef.current) {
                    channelRef.current.send({
                      type: 'broadcast',
                      event: 'health_update',
                      payload: {
                        user_id: sessionInfo.id,
                        health: localHealth.current,
                        isDead: isDeadRef.current
                      }
                    });
                  }
                } else {

                }
              }
            }
          }

        }

        if (!isChasing && petNow > nextActionTime) {
          const action = Math.random();
          if (action < 0.4) {
            // walk left
            targetX = Math.max(0, x - 100 - Math.random() * 300);
            targetY = y;
            nextActionTime = petNow + pet.walkDuration;
            isWalking = true;
          } else if (action < 0.8) {
            // walk right
            targetX = Math.min(MAP_WIDTH, x + 100 + Math.random() * 300);
            targetY = y;
            nextActionTime = petNow + pet.walkDuration;
            isWalking = true;
          } else {
            // stop
            targetX = x;
            targetY = y;
            nextActionTime = petNow + pet.idleDuration;
            isWalking = false;
          }
        }

        if (isWalking && targetX !== undefined) {
          const tY = targetY !== undefined ? targetY : y;
          const dx = targetX - x;
          const dy = tY - y;
          const dist = Math.hypot(dx, dy);

          if (dist > 30) {
            const currentSpeed = speed;
            vx = (dx / dist) * Math.min(currentSpeed, dist);
            vy = (dy / dist) * Math.min(currentSpeed, dist);
            flipX = vx < 0;
            x += vx * petDt;
            y += vy * petDt;


            y = Math.min(MAP_HEIGHT, Math.max(MAP_HEIGHT * 0.35, y));
          } else {
            isWalking = isChasing;
          }
        }

        // Update physics
        pet.x = x;
        pet.y = y;
        pet.vx = vx;
        pet.flipX = flipX;
        pet.isWalking = isWalking;
        pet.targetX = targetX;
        pet.nextActionTime = nextActionTime;

        // Update DOM directly
        const petEl = document.getElementById(pet.id);
        if (petEl) {
          petEl.style.transform = `translate3d(${x - 20}px, ${y - 26}px, 0)`;
        }
        const petImg = document.getElementById(`${pet.id}-img`) as HTMLImageElement;
        if (petImg) {
          petImg.style.transform = `scaleX(${flipX ? -1 : 1}) scale(${pet.scale})`;
          const sprites = {
            fox: { walk: FOX_WALK, idle: FOX_IDLE },
            dog: { walk: DOG_WALK, idle: DOG_IDLE },
            turtle: { walk: "/pets/turtle/green_walk_8fps.gif", idle: "/pets/turtle/green_idle_8fps.gif" },
            snake: { walk: "/pets/snake/green_walk_8fps.gif", idle: "/pets/snake/green_idle_8fps.gif" }
          };
          const sprite = isWalking ? sprites[pet.type as keyof typeof sprites].walk : sprites[pet.type as keyof typeof sprites].idle;
          if (petImg.getAttribute('src') !== sprite) {
            petImg.src = sprite;
          }
        }
      });
      // --- END MAP PETS UPDATE -----

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, sessionInfo.id, sessionInfo.username, channelRef, channelReadyRef, sharedPresenceRef]);

  // Input Listeners
  useEffect(() => {
    if (!isPlaying || !isOpen) {
      keysPressed.current = {};
      return;
    }

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if typing in an input
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      keysPressed.current[e.key.toLowerCase()] = true;
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isPlaying, isOpen]);

  if (!isPlaying) {
    return (
      <div
        className="w-full h-full flex flex-col items-center justify-center bg-transparent text-center p-6"
        style={{ fontFamily: "'Press Start 2P', monospace" }}
      >
        <h2
          className="text-lg md:text-xl font-bold uppercase mb-4 text-foreground/80"
          style={{ textShadow: "2px 2px 0px rgba(0,0,0,0.1)" }}
        >
          Join the World
        </h2>

        <p className="text-[9px] md:text-[10px] text-foreground/60 mb-10 max-w-[80%] leading-loose">
          step into the multiplayer pixel world and hang out with the global chat.
        </p>

        <div className="flex items-center gap-2 mb-10 text-[10px] text-foreground/50">
          <div className="flex gap-1">
            <span className="px-2 py-1.5 border-2 border-foreground/20 bg-foreground/5 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">W</span>
            <span className="px-2 py-1.5 border-2 border-foreground/20 bg-foreground/5 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">A</span>
            <span className="px-2 py-1.5 border-2 border-foreground/20 bg-foreground/5 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">S</span>
            <span className="px-2 py-1.5 border-2 border-foreground/20 bg-foreground/5 rounded shadow-[2px_2px_0px_0px_rgba(0,0,0,0.1)] dark:shadow-[2px_2px_0px_0px_rgba(255,255,255,0.1)]">D</span>
          </div>
          <span className="ml-2 lowercase">to move</span>
        </div>

        <button
          onClick={() => setIsPlaying(true)}
          className="px-6 py-4 bg-foreground text-background uppercase text-[10px] hover:scale-105 active:scale-95 transition-transform"
          style={{
            boxShadow: "4px 4px 0px 0px rgba(0,0,0,0.2)"
          }}
        >
          Click to Start
        </button>
      </div>
    );
  }

  // Do not filter by mapId here. We will use display:none in the JSX so that broadcast teleports are instant.
  const otherPlayers = onlinePlayers.filter(p => p.user_id !== sessionInfo.id && p.x !== undefined && p.y !== undefined);

  // Helper to get active chat message for a user
  const getLatestMessage = (userId: string) => {
    if (!messages || messages.length === 0) return null;
    const userMessages = messages.filter(m => m.user_id === userId);
    if (userMessages.length === 0) return null;
    const latestMsg = userMessages[userMessages.length - 1];

    const now = Date.now();
    const msgTime = new Date(latestMsg.created_at).getTime();

    // Show for 5 seconds
    if (now - msgTime < 5000) {
      return latestMsg.content;
    }
    return null;
  };

  const currentHour = new Date().getHours();
  const isNight = currentHour >= 17 || currentHour < 6;
  let activeBg = MAPS[currentMapId]?.backgroundImage || "/rpg_map_large.png";
  if (currentMapId === "forest") {
    activeBg = isNight ? "/rpg_map_large_night.jpeg" : "/rpg_map_large.png";
  }

  return (
    <div ref={containerRef} className="w-full h-full relative bg-white dark:bg-black overflow-hidden select-none">
      {/* World Container (Moves with Camera) */}
      <div
        ref={worldRef}
        className="absolute inset-0 transition-transform duration-0 ease-linear"
        style={{ transform: `translate3d(0px, 0px, 0px)`, willChange: 'transform' }}
      >
        {/* RPG Town Map Background */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            backgroundImage: `url(${activeBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            imageRendering: 'pixelated'
          }}
        />

        {/* Portals */}
        {MAPS[currentMapId]?.portals.map(portal => (
          <div
            key={portal.id}
            className="absolute flex items-center justify-center pointer-events-none"
            style={{
              left: `${portal.x}px`,
              top: `${portal.y}px`,
              width: `${portal.width}px`,
              height: `${portal.height}px`,
            }}
          >
            {/* Outer Dark Green Blocky Ring */}
            <div className="absolute w-full h-full bg-[#166534]" style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0 80%, 0 20%)' }} />

            {/* Spinning Blocky Cross / Swirl */}
            <div className="absolute w-[80%] h-[80%] animate-[spin_0.8s_steps(4)_infinite]">
              <div className="absolute top-0 left-[20%] w-[60%] h-[20%] bg-[#22c55e]" />
              <div className="absolute bottom-0 left-[20%] w-[60%] h-[20%] bg-[#22c55e]" />
              <div className="absolute left-0 top-[20%] w-[20%] h-[60%] bg-[#22c55e]" />
              <div className="absolute right-0 top-[20%] w-[20%] h-[60%] bg-[#22c55e]" />
            </div>

            {/* Inner Bright Swirl */}
            <div className="absolute w-[60%] h-[60%] animate-[spin_0.6s_steps(4)_infinite_reverse]">
              <div className="absolute top-0 left-[20%] w-[60%] h-[20%] bg-[#39ff14]" />
              <div className="absolute bottom-0 left-[20%] w-[60%] h-[20%] bg-[#39ff14]" />
              <div className="absolute left-0 top-[20%] w-[20%] h-[60%] bg-[#39ff14]" />
              <div className="absolute right-0 top-[20%] w-[20%] h-[60%] bg-[#39ff14]" />
            </div>

            {/* Core */}
            <div className="absolute w-[30%] h-[30%] bg-[#ccff00] animate-pulse" style={{ clipPath: 'polygon(20% 0, 80% 0, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0 80%, 0 20%)' }} />

            {/* Floating Pixels */}
            <div className="absolute w-[15%] h-[15%] bg-white animate-[bounce_1s_steps(2)_infinite] top-[10%] left-[10%]" />
            <div className="absolute w-[15%] h-[15%] bg-[#39ff14] animate-[bounce_1.2s_steps(2)_infinite] bottom-[10%] right-[10%]" />

            <div className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap text-[8px] uppercase text-white font-bold pointer-events-none z-10" style={{ fontFamily: "'Press Start 2P', monospace", textShadow: "2px 2px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000, 1px 1px 0 #000" }}>
              To {portal.destMapId === 'tech' ? 'BGC' : portal.destMapId === 'space' ? 'Space' : portal.destMapId}
            </div>
          </div>
        ))}

        {/* Semi-transparent overlay to make characters stand out */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }} />

        {/* Cats */}
        {catsRef.current.map((cat) => (
          <div
            id={cat.id}
            key={cat.id}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: 0, top: 0, zIndex: Math.floor(cat.y), transform: `translate3d(${cat.x}px, ${cat.y}px, 0) translate(-50%, -100%)`
            }}
          >
            <img
              src={CAT_IDLE}
              alt="Cat"
              style={{
                width: '49px',
                height: '40px',
                maxWidth: 'none',
                imageRendering: 'pixelated',
                transform: `scale(${cat.flipX ? -1 : 1}, 1)`,
                transition: 'none'
              }}
            />
          </div>
        ))}

        {/* Foxes */}
        {foxesRef.current.map((fox) => (
          <div
            id={fox.id}
            key={fox.id}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: 0, top: 0, zIndex: Math.floor(fox.y), transform: `translate3d(${fox.x}px, ${fox.y}px, 0) translate(-50%, -100%)`
            }}
          >
            <img
              src={FOX_IDLE}
              alt="Fox"
              style={{
                width: '49px',
                height: '40px',
                maxWidth: 'none',
                imageRendering: 'pixelated',
                transform: `scale(${fox.flipX ? -1 : 1}, 1)`,
                transition: 'none'
              }}
            />
          </div>
        ))}

        {/* Dogs */}
        {dogsRef.current.map((dog) => (
          <div
            id={dog.id}
            key={dog.id}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: 0, top: 0, zIndex: Math.floor(dog.y), transform: `translate3d(${dog.x}px, ${dog.y}px, 0) translate(-50%, -100%)`
            }}
          >
            <img
              src={DOG_IDLE}
              alt="Dog"
              style={{
                width: '51px',
                height: '40px',
                maxWidth: 'none',
                imageRendering: 'pixelated',
                transform: `scale(${dog.flipX ? -1 : 1}, 1)`,
                transition: 'none'
              }}
            />
          </div>
        ))}

        {/* Mice */}
        {miceRef.current.map((mouse) => (
          <div
            id={mouse.id}
            key={mouse.id}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: 0, top: 0, zIndex: Math.floor(mouse.y), transform: `translate3d(${mouse.x}px, ${mouse.y}px, 0) translate(-50%, -100%)`
            }}
          >
            <img
              src={MOUSE_IDLE}
              alt="Mouse"
              style={{
                width: '57px',
                height: '40px',
                maxWidth: 'none',
                imageRendering: 'pixelated',
                transform: `scale(${mouse.flipX ? -1 : 1}, 1)`,
                transition: 'none'
              }}
            />
          </div>
        ))}

        {/* Chickens */}
        {chickensRef.current.map((chicken) => (
          <div
            id={chicken.id}
            key={chicken.id}
            className="absolute flex flex-col items-center pointer-events-none"
            style={{
              left: 0, top: 0, zIndex: Math.floor(chicken.y), transform: `translate3d(${chicken.x}px, ${chicken.y}px, 0) translate(-50%, -100%)`
            }}
          >
            <img
              src={CHICKEN_IDLE}
              alt="Chicken"
              style={{
                width: '44px',
                height: '40px',
                maxWidth: 'none',
                imageRendering: 'pixelated',
                transform: `scale(${chicken.flipX ? -1 : 1}, 1)`,
                transition: 'none'
              }}
            />
          </div>
        ))}


        {/* Map Pets */}
        {mapPets.map((pet) => (
          <div
            id={pet.id}
            key={pet.id}
            className="absolute flex flex-col items-center z-10 pointer-events-none"
            style={{
              left: 0,
              top: 0,
              transform: `translate3d(${pet.x - 20}px, ${pet.y - 26}px, 0)`,
              willChange: 'transform'
            }}
          >
            <div className="relative flex flex-col items-center select-none">
              <img
                id={`${pet.id}-img`}
                src={pet.isWalking ? (pet.type === 'fox' ? FOX_WALK : pet.type === 'dog' ? DOG_WALK : pet.type === 'turtle' ? "/pets/turtle/green_walk_8fps.gif" : "/pets/snake/green_walk_8fps.gif") : (pet.type === 'fox' ? FOX_IDLE : pet.type === 'dog' ? DOG_IDLE : pet.type === 'turtle' ? "/pets/turtle/green_idle_8fps.gif" : "/pets/snake/green_idle_8fps.gif")}
                alt={pet.type}
                className="w-10 h-10 pixelated pointer-events-none drop-shadow-md"
                style={{
                  transform: `scaleX(${pet.flipX ? -1 : 1}) scale(${pet.scale})`,
                  willChange: 'transform'
                }}
              />
            </div>
          </div>
        ))}

        {/* Remote Players */}
        {otherPlayers.map((player) => {
          const latestMsg = getLatestMessage(player.user_id);
          const currentX = latestPositions.current[player.user_id]?.x ?? player.x;
          const currentY = latestPositions.current[player.user_id]?.y ?? player.y;
          const currentFlipX = latestPositions.current[player.user_id]?.flipX ?? player.flipX;

          const currentMapIdForRemote = latestPositions.current[player.user_id]?.mapId ?? player.mapId ?? "forest";

          return (
            <div
              id={`player-${player.user_id}`}
              key={player.user_id}
              className="absolute flex flex-col items-center z-10 pointer-events-none transition-transform duration-[100ms] ease-linear"
              style={{
                display: currentMapIdForRemote === currentMapId ? 'flex' : 'none',
                left: 0,
                top: 0,
                transform: `translate3d(${currentX}px, ${currentY}px, 0) translate(-50%, -100%)`,
                willChange: 'transform'
              }}
            >
              {latestMsg && (
                <div className="absolute bottom-full mb-1 bg-white text-black text-[10px] font-mono px-2 py-1 rounded-lg shadow-md whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis border border-gray-200">
                  {latestMsg}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
                </div>
              )}
              <span className="text-[10px] font-mono text-white/90 bg-black/50 px-1.5 py-0.5 rounded shadow-sm mb-1 whitespace-nowrap">
                {player.username}
              </span>
              <RemotePlayerSprite userId={player.user_id} username={player.username} initialFlipX={currentFlipX} initialIsWalking={player.isWalking} />
            </div>
          );
        })}

        {/* Local Player */}
        <div
          ref={playerRef}
          className="absolute flex flex-col items-center z-20"
          style={{
            left: 0,
            top: 0,
            transform: `translate3d(${localPos.current.x}px, ${localPos.current.y}px, 0) translate(-50%, -100%) ${isDeadRef.current ? 'rotate(90deg) translate(10px, 30px)' : ''}`,
            willChange: 'transform',
            transition: isDeadRef.current ? 'transform 0.5s ease-in-out' : 'none'
          }}
        >
          {getLatestMessage(sessionInfo.id) && (
            <div className="absolute bottom-full mb-1 bg-white text-black text-[10px] font-mono px-2 py-1 rounded-lg shadow-md whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis border border-gray-200">
              {getLatestMessage(sessionInfo.id)}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
            </div>
          )}
          <span className="text-[10px] font-mono text-green-300 bg-black/60 px-1.5 py-0.5 rounded shadow-sm mb-1 whitespace-nowrap">
            {sessionInfo.username}
          </span>
          <PlayerSprite username={sessionInfo.username} flipX={localSpriteState.flipX} isWalking={localSpriteState.isWalking} isDead={localHealth.current === 0} />
        </div>
      </div>

      {/* Minimap Overlay */}
      <div className="absolute top-24 left-[5%] md:left-[15%] flex flex-col gap-1 z-30 pointer-events-none transform-gpu w-[80px] md:w-[100px]">
        <div className="w-full h-[80px] md:h-[100px] bg-transparent border border-white/50 rounded-md relative overflow-hidden">
          {/* Remote Players on Minimap */}
          {otherPlayers.map(p => {
            const currentX = latestPositions.current[p.user_id]?.x ?? p.x;
            const currentY = latestPositions.current[p.user_id]?.y ?? p.y;
            return (
              <div
                id={`minimap-${p.user_id}`}
                key={`minimap-${p.user_id}`}
                className="absolute w-1.5 h-1.5 bg-red-500 rounded-full shadow-sm transition-all duration-[75ms] ease-linear"
                style={{
                  left: `${(currentX / MAP_WIDTH) * 100}%`,
                  top: `${(currentY / MAP_HEIGHT) * 100}%`,
                  transform: 'translate(-50%, -50%)'
                }}
              />
            );
          })}
          {/* Local Player on Minimap */}
          <div
            ref={minimapPlayerRef}
            className="absolute w-2 h-2 bg-green-400 rounded-full border border-white/50 shadow-sm z-10 transition-all duration-75 ease-linear"
            style={{
              left: `${(localPos.current.x / MAP_WIDTH) * 100}%`,
              top: `${(localPos.current.y / MAP_HEIGHT) * 100}%`,
              transform: 'translate(-50%, -50%)'
            }}
          />
        </div>

        {/* Local Health Bar */}
        <div className="w-full h-1.5 bg-black/60 border-[1px] border-black overflow-hidden pointer-events-none">
          <div
            ref={playerHealthBarRef}
            className="h-full bg-[#22c55e] transition-all duration-200"
            style={{ width: '100%' }}
          />
        </div>
      </div>

      {/* WASD Instructions Overlay (Stays fixed to screen) */}
      <div className="absolute top-4 left-4 text-[10px] font-mono text-white/50 bg-black/30 px-2 py-1 rounded hidden md:block z-30 pointer-events-none">
        WASD to move
      </div>

      {/* Mobile Touch D-Pad */}
      <div className="absolute bottom-6 left-6 grid grid-cols-3 gap-2 md:hidden z-30 opacity-60">
        <div />
        <button
          onPointerDown={(e) => { e.preventDefault(); keysPressed.current['w'] = true; }}
          onPointerUp={(e) => { e.preventDefault(); keysPressed.current['w'] = false; }}
          onPointerLeave={(e) => { e.preventDefault(); keysPressed.current['w'] = false; }}
          onContextMenu={(e) => e.preventDefault()}
          className="w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 active:bg-white/20 touch-none"
        >
          <ArrowUp size={20} />
        </button>
        <div />
        <button
          onPointerDown={(e) => { e.preventDefault(); keysPressed.current['a'] = true; }}
          onPointerUp={(e) => { e.preventDefault(); keysPressed.current['a'] = false; }}
          onPointerLeave={(e) => { e.preventDefault(); keysPressed.current['a'] = false; }}
          onContextMenu={(e) => e.preventDefault()}
          className="w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 active:bg-white/20 touch-none"
        >
          <ArrowLeft size={20} />
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); keysPressed.current['s'] = true; }}
          onPointerUp={(e) => { e.preventDefault(); keysPressed.current['s'] = false; }}
          onPointerLeave={(e) => { e.preventDefault(); keysPressed.current['s'] = false; }}
          onContextMenu={(e) => e.preventDefault()}
          className="w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 active:bg-white/20 touch-none"
        >
          <ArrowDown size={20} />
        </button>
        <button
          onPointerDown={(e) => { e.preventDefault(); keysPressed.current['d'] = true; }}
          onPointerUp={(e) => { e.preventDefault(); keysPressed.current['d'] = false; }}
          onPointerLeave={(e) => { e.preventDefault(); keysPressed.current['d'] = false; }}
          onContextMenu={(e) => e.preventDefault()}
          className="w-12 h-12 bg-black/50 text-white rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10 active:bg-white/20 touch-none"
        >
          <ArrowRight size={20} />
        </button>
      </div>

      {/* Global Chat UI Layer */}

      {/* Game Over Screen */}
      {showGameOver && (
        <div
          className="fixed inset-0 z-[9999] bg-transparent flex flex-col items-center justify-center pointer-events-auto"
          style={{ animation: 'fadeInGameOver 1.5s ease-in forwards' }}
        >
          <style>{`
            @keyframes fadeInGameOver {
              from { opacity: 0; }
              to { opacity: 1; }
            }
          `}</style>
          <h1
            className="text-6xl md:text-8xl text-[#888888] font-bold mb-8 tracking-widest drop-shadow-[4px_4px_0px_rgba(0,0,0,0.8)] text-center leading-snug"
            style={{ fontFamily: 'var(--font-press-start-2p), "Press Start 2P", monospace', textShadow: '4px 4px 0px #000, -2px -2px 0px #000, 2px -2px 0px #000, -2px 2px 0px #000, 2px 2px 0px #000' }}
          >
            GAME<br />OVER
          </h1>
          <button
            onClick={handleRespawn}
            className="px-8 py-4 bg-transparent text-white hover:scale-105 hover:text-gray-300 transition-all text-xl md:text-2xl uppercase tracking-widest drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]"
            style={{ fontFamily: 'var(--font-press-start-2p), "Press Start 2P", monospace', textShadow: '2px 2px 0px #000, -1px -1px 0px #000, 1px -1px 0px #000, -1px 1px 0px #000, 1px 1px 0px #000' }}
          >
            START AGAIN
          </button>
        </div>
      )}
    </div>
  );
}
