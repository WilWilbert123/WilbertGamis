"use client";

import React, { useEffect, useState, useRef, useCallback } from "react";
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from "lucide-react";

interface Player {
  user_id: string;
  username: string;
  x: number;
  y: number;
  flipX: boolean;
  isWalking: boolean;
}

const CHICKEN_WALK = "https://raw.githubusercontent.com/tonybaloney/vscode-pets/main/media/chicken/white_walk_8fps.gif";
const CHICKEN_IDLE = "https://raw.githubusercontent.com/tonybaloney/vscode-pets/main/media/chicken/white_idle_8fps.gif";

interface GlobalChatGameProps {
  sessionInfo: { id: string; username: string };
  channelRef: React.MutableRefObject<any>;
  channelReadyRef: React.MutableRefObject<boolean>;
  sharedPresenceRef: React.MutableRefObject<any>;
  onlinePlayers: Player[];
  messages?: any[];
}

// Game Map Constants
const MAP_WIDTH = 2000;
const MAP_HEIGHT = 2000;
const MOVE_SPEED = 4;
const UPDATE_INTERVAL_MS = 200; // 200ms = 5 updates per second to be extremely safe with Supabase limits

export default function GlobalChatGame({ sessionInfo, channelRef, channelReadyRef, sharedPresenceRef, onlinePlayers, messages = [] }: GlobalChatGameProps) {
  // Local Player State
  const [isPlaying, setIsPlaying] = useState(false);

  // We use refs for local position to update instantly without React re-renders lagging the physics
  const localPos = useRef({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, flipX: false, isWalking: false });
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Refs for direct DOM manipulation (Performance optimization for Safari)
  const playerRef = useRef<HTMLDivElement>(null);
  const playerImgRef = useRef<HTMLImageElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const idleTrackTimeout = useRef<NodeJS.Timeout | null>(null);
  const latestPositions = useRef<Record<string, { x: number, y: number, flipX: boolean, isWalking: boolean }>>({});

  // Local Chickens (NPCs)
  const chickensRef = useRef(Array.from({ length: 5 }).map((_, i) => ({
    id: `chicken-${i}`,
    x: Math.random() * MAP_WIDTH,
    y: Math.random() * MAP_HEIGHT,
    targetX: Math.random() * MAP_WIDTH,
    targetY: Math.random() * MAP_HEIGHT,
    speed: 0.5 + Math.random() * 0.5,
    flipX: false,
    isWalking: false,
    nextMoveTime: 0
  })));

  // Last broadcasted state
  const lastBroadcast = useRef({ x: MAP_WIDTH / 2, y: MAP_HEIGHT / 2, time: 0, wasWalking: false });

  // Listen for broadcast events from other players
  useEffect(() => {
    const handlePlayerMove = (e: any) => {
      const data = e.detail;
      if (data.user_id === sessionInfo.id) return;

      // Store the absolute latest position for when React re-renders
      latestPositions.current[data.user_id] = { x: data.x, y: data.y, flipX: data.flipX, isWalking: data.isWalking };

      const playerEl = document.getElementById(`player-${data.user_id}`);
      if (playerEl) {
        playerEl.style.left = `${data.x}px`;
        playerEl.style.top = `${data.y}px`;
        const img = playerEl.querySelector('img');
        if (img) {
          img.style.transform = `scaleX(${data.flipX ? -1 : 1})`;
        }
        
        if (data.isWalking && !playerEl.classList.contains('is-walking')) {
          playerEl.classList.add('is-walking');
          const avatar = playerEl.querySelector('.avatar-container');
          if (avatar) avatar.classList.add('animate-bounce');
        } else if (!data.isWalking && playerEl.classList.contains('is-walking')) {
          playerEl.classList.remove('is-walking');
          const avatar = playerEl.querySelector('.avatar-container');
          if (avatar) avatar.classList.remove('animate-bounce');
        }
      }
    };
    window.addEventListener('player-move', handlePlayerMove);
    return () => window.removeEventListener('player-move', handlePlayerMove);
  }, [sessionInfo.id]);

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

    let animationFrameId: number;

    const gameLoop = (time: number) => {
      let moved = false;
      let dx = 0;
      let dy = 0;

      if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= MOVE_SPEED;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += MOVE_SPEED;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= MOVE_SPEED;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += MOVE_SPEED;

      if (dx !== 0 || dy !== 0) {
        moved = true;

        // Normalize diagonal movement
        if (dx !== 0 && dy !== 0) {
          const length = Math.sqrt(dx * dx + dy * dy);
          dx = (dx / length) * MOVE_SPEED;
          dy = (dy / length) * MOVE_SPEED;
        }

        localPos.current.x = Math.max(16, Math.min(MAP_WIDTH - 16, localPos.current.x + dx));
        localPos.current.y = Math.max(32, Math.min(MAP_HEIGHT - 32, localPos.current.y + dy));

        if (dx < 0) localPos.current.flipX = true;
        if (dx > 0) localPos.current.flipX = false;
      }

      localPos.current.isWalking = moved;

      // Update chickens
      chickensRef.current.forEach(chicken => {
        if (time > chicken.nextMoveTime) {
          if (chicken.isWalking) {
            chicken.isWalking = false;
            chicken.nextMoveTime = time + 1000 + Math.random() * 3000;
          } else {
            chicken.targetX = Math.max(0, Math.min(MAP_WIDTH, chicken.x + (Math.random() - 0.5) * 300));
            chicken.targetY = Math.max(0, Math.min(MAP_HEIGHT, chicken.y + (Math.random() - 0.5) * 300));
            chicken.isWalking = true;
            chicken.flipX = chicken.targetX < chicken.x;
            chicken.nextMoveTime = time + 5000;
          }
        }

        if (chicken.isWalking) {
          const cdx = chicken.targetX - chicken.x;
          const cdy = chicken.targetY - chicken.y;
          const cdist = Math.sqrt(cdx * cdx + cdy * cdy);
          if (cdist > 1) {
            chicken.x += (cdx / cdist) * chicken.speed;
            chicken.y += (cdy / cdist) * chicken.speed;

            const el = document.getElementById(chicken.id);
            if (el) {
              el.style.left = `${chicken.x}px`;
              el.style.top = `${chicken.y}px`;

              const img = el.querySelector('img');
              if (img) {
                img.style.transform = `scaleX(${chicken.flipX ? -1 : 1})`;
                if (img.src !== CHICKEN_WALK) img.src = CHICKEN_WALK;
              }
            }
          } else {
            chicken.isWalking = false;
            chicken.nextMoveTime = time + 1000 + Math.random() * 2000;
            const el = document.getElementById(chicken.id);
            if (el) {
              const img = el.querySelector('img');
              if (img && img.src !== CHICKEN_IDLE) img.src = CHICKEN_IDLE;
            }
          }
        }
      });

      // Direct DOM manipulation to avoid React re-render lag in Safari
      if (playerRef.current) {
        playerRef.current.style.left = `${localPos.current.x}px`;
        playerRef.current.style.top = `${localPos.current.y}px`;
        playerRef.current.style.transform = `translate(-50%, -100%)`;
      }

      if (playerImgRef.current) {
        playerImgRef.current.style.transform = `scaleX(${localPos.current.flipX ? -1 : 1})`;
      }
      
      const containerEl = playerRef.current;
      if (containerEl) {
        if (moved && !containerEl.classList.contains('is-walking')) {
          containerEl.classList.add('is-walking');
          const avatar = containerEl.querySelector('.avatar-container');
          if (avatar) avatar.classList.add('animate-bounce');
        } else if (!moved && containerEl.classList.contains('is-walking')) {
          containerEl.classList.remove('is-walking');
          const avatar = containerEl.querySelector('.avatar-container');
          if (avatar) avatar.classList.remove('animate-bounce');
        }
      }

      if (worldRef.current && containerRef.current) {
        // Calculate viewport size dynamically for responsiveness
        const rect = containerRef.current.getBoundingClientRect();
        const viewportWidth = rect.width;
        const viewportHeight = rect.height;

        let camX = localPos.current.x - viewportWidth / 2;
        let camY = localPos.current.y - viewportHeight / 2;
        camX = Math.max(0, Math.min(MAP_WIDTH - viewportWidth, camX));
        camY = Math.max(0, Math.min(MAP_HEIGHT - viewportHeight, camY));

        worldRef.current.style.transform = `translate(${-camX}px, ${-camY}px)`;
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
                isWalking: true
              }
            });
          }
          lastBroadcast.current.time = now;
          lastBroadcast.current.wasWalking = true;
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
                isWalking: false
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

            channelRef.current?.track({
              user_id: sessionInfo.id,
              username: sessionInfo.username,
              ...sharedPresenceRef.current
            });
          }, 1000);
        }
      }

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [isPlaying, sessionInfo, channelRef, channelReadyRef, sharedPresenceRef]);

  // Input Listeners
  useEffect(() => {
    if (!isPlaying) return;

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
  }, [isPlaying]);

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

  // Filter out ourselves from the online players list
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

  return (
    <div ref={containerRef} className="w-full h-full relative bg-white dark:bg-black overflow-hidden select-none">
      <style>{`
        @keyframes walk-left {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
        }
        @keyframes walk-right {
          0%, 100% { transform: translateY(-3px); }
          50% { transform: translateY(0); }
        }
        .is-walking .player-leg-l, .is-walking .player-arm-r {
          animation: walk-left 0.4s infinite;
        }
        .is-walking .player-leg-r, .is-walking .player-arm-l {
          animation: walk-right 0.4s infinite;
        }
      `}</style>
      
      {/* World Container (Moves with Camera) */}
      <div
        ref={worldRef}
        className="absolute inset-0 transition-transform duration-0 ease-linear"
        style={{ transform: `translate(0px, 0px)` }}
      >
        {/* RPG Town Map Background */}
        <div
          className="absolute top-0 left-0 pointer-events-none"
          style={{
            width: MAP_WIDTH,
            height: MAP_HEIGHT,
            backgroundImage: 'url(/rpg_map_large.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            imageRendering: 'pixelated'
          }}
        />

        {/* Semi-transparent overlay to make characters stand out */}
        <div className="absolute inset-0 bg-black/10 pointer-events-none" style={{ width: MAP_WIDTH, height: MAP_HEIGHT }} />

        {/* Chickens */}
        {chickensRef.current.map((chicken) => (
          <div
            id={chicken.id}
            key={chicken.id}
            className="absolute flex flex-col items-center z-0 pointer-events-none"
            style={{
              left: `${chicken.x}px`,
              top: `${chicken.y}px`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <img
              src={chicken.isWalking ? CHICKEN_WALK : CHICKEN_IDLE}
              alt="Chicken"
              className="w-10 h-10 pixelated"
              style={{
                transform: `scaleX(${chicken.flipX ? -1 : 1})`,
                filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))'
              }}
            />
          </div>
        ))}

        {/* Remote Players */}
        {otherPlayers.map((player) => {
          const latestMsg = getLatestMessage(player.user_id);
          const currentX = latestPositions.current[player.user_id]?.x ?? player.x;
          const currentY = latestPositions.current[player.user_id]?.y ?? player.y;
          const currentFlipX = latestPositions.current[player.user_id]?.flipX ?? player.flipX;

          const currentIsWalking = latestPositions.current[player.user_id]?.isWalking ?? player.isWalking;

          return (
            <div
              id={`player-${player.user_id}`}
              key={player.user_id}
              className={`absolute flex flex-col items-center z-10 pointer-events-none transition-all duration-200 ease-linear player-container ${currentIsWalking ? 'is-walking' : ''}`}
              style={{
                left: `${currentX}px`,
                top: `${currentY}px`,
                transform: 'translate(-50%, -100%)'
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
              
              {/* Avatar Container */}
              <div className={`relative flex flex-col items-center avatar-container ${currentIsWalking ? 'animate-bounce' : ''}`} style={{ animationDuration: '0.4s' }}>
                {/* Left Arm */}
                <div className="player-arm-l absolute top-6 -left-1 w-2.5 h-2.5 bg-white border border-gray-300 rounded-sm z-20 shadow-sm" />
                {/* Right Arm */}
                <div className="player-arm-r absolute top-6 -right-1 w-2.5 h-2.5 bg-white border border-gray-300 rounded-sm z-20 shadow-sm" />
                
                <img
                  src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${player.username}`}
                  alt={player.username}
                  className="w-10 h-10 pixelated relative z-10"
                  style={{
                    transform: `scaleX(${currentFlipX ? -1 : 1})`,
                    filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))'
                  }}
                />
                
                {/* Legs */}
                <div className="flex gap-1.5 -mt-1.5 z-0 relative">
                  <div className="player-leg-l w-2.5 h-3.5 bg-slate-700 rounded-sm overflow-hidden flex flex-col border border-black/20 shadow-sm">
                    <div className="flex-1" />
                    <div className="h-1.5 bg-amber-900" />
                  </div>
                  <div className="player-leg-r w-2.5 h-3.5 bg-slate-700 rounded-sm overflow-hidden flex flex-col border border-black/20 shadow-sm">
                    <div className="flex-1" />
                    <div className="h-1.5 bg-amber-900" />
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {/* Local Player */}
        <div
          ref={playerRef}
          className="absolute flex flex-col items-center z-20 player-container"
          style={{
            left: localPos.current.x,
            top: localPos.current.y,
            transform: `translate(-50%, -100%)`
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
          
          {/* Avatar Container */}
          <div className="relative flex flex-col items-center avatar-container" style={{ animationDuration: '0.4s' }}>
            {/* Left Arm */}
            <div className="player-arm-l absolute top-6 -left-1 w-2.5 h-2.5 bg-white border border-gray-300 rounded-sm z-20 shadow-sm" />
            {/* Right Arm */}
            <div className="player-arm-r absolute top-6 -right-1 w-2.5 h-2.5 bg-white border border-gray-300 rounded-sm z-20 shadow-sm" />
            
            <img
              ref={playerImgRef}
              src={`https://api.dicebear.com/7.x/pixel-art/svg?seed=${sessionInfo.username}`}
              alt={sessionInfo.username}
              className={`w-10 h-10 pixelated relative z-10 transition-transform`}
              style={{
                transform: `scaleX(${localPos.current.flipX ? -1 : 1})`,
                filter: 'drop-shadow(0px 2px 2px rgba(0,0,0,0.5))'
              }}
            />
            
            {/* Legs */}
            <div className="flex gap-1.5 -mt-1.5 z-0 relative">
              <div className="player-leg-l w-2.5 h-3.5 bg-slate-700 rounded-sm overflow-hidden flex flex-col border border-black/20 shadow-sm">
                 <div className="flex-1" />
                 <div className="h-1.5 bg-amber-900" />
              </div>
              <div className="player-leg-r w-2.5 h-3.5 bg-slate-700 rounded-sm overflow-hidden flex flex-col border border-black/20 shadow-sm">
                 <div className="flex-1" />
                 <div className="h-1.5 bg-amber-900" />
              </div>
            </div>
          </div>
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
    </div>
  );
}
