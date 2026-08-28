import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

# 1. Add health ref and lastHitTime
old_refs = """
  const playerRef = useRef<HTMLDivElement>(null);
  const minimapPlayerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
"""
new_refs = """
  const playerRef = useRef<HTMLDivElement>(null);
  const playerHealthBarRef = useRef<HTMLDivElement>(null);
  const localHealth = useRef(100);
  const lastHitTime = useRef(0);
  const minimapPlayerRef = useRef<HTMLDivElement>(null);
  const worldRef = useRef<HTMLDivElement>(null);
"""
if old_refs.strip() in content:
    content = content.replace(old_refs.strip(), new_refs.strip())

# 2. Add health bar to the player UI
old_player_ui = """
        {/* Local Player Character */}
        <div 
          ref={playerRef}
          className="absolute origin-bottom pointer-events-auto"
          style={{ 
            zIndex: Math.floor(localPos.current.y),
            transform: `translate3d(${localPos.current.x}px, ${localPos.current.y}px, 0) translate(-50%, -100%)`
          }}
        >
          <div className="flex flex-col items-center">
            {/* Nameplate */}
            <div className="mb-1 px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-xs rounded-full whitespace-nowrap backdrop-blur-sm pointer-events-none">
              {sessionInfo.username}
            </div>
            {/* Sprite */}
            <div className="relative pointer-events-none">
"""

new_player_ui = """
        {/* Local Player Character */}
        <div 
          ref={playerRef}
          className="absolute origin-bottom pointer-events-auto"
          style={{ 
            zIndex: Math.floor(localPos.current.y),
            transform: `translate3d(${localPos.current.x}px, ${localPos.current.y}px, 0) translate(-50%, -100%)`
          }}
        >
          <div className="flex flex-col items-center">
            {/* Health Bar */}
            <div className="w-8 h-1.5 bg-black/50 rounded-full mb-1 border border-white/20 overflow-hidden pointer-events-none">
              <div 
                ref={playerHealthBarRef}
                className="h-full bg-green-500 transition-all duration-200" 
                style={{ width: '100%' }}
              />
            </div>
            {/* Nameplate */}
            <div className="mb-1 px-2 py-0.5 bg-black/60 text-white text-[10px] sm:text-xs rounded-full whitespace-nowrap backdrop-blur-sm pointer-events-none">
              {sessionInfo.username}
            </div>
            {/* Sprite */}
            <div className="relative pointer-events-none">
"""
if old_player_ui.strip() in content:
    content = content.replace(old_player_ui.strip(), new_player_ui.strip())

# 3. Add hit detection in game loop
old_chase_logic = """
          if (minDist < 250) { // Chase range
            isChasing = true;
            targetX = closestPlayerX;
            targetY = closestPlayerY;
            isWalking = true;
            nextActionTime = petNow + 2000; // Delay normal actions while chasing
          }
"""

new_chase_logic = """
          if (minDist < 250) { // Chase range
            isChasing = true;
            targetX = closestPlayerX;
            targetY = closestPlayerY;
            isWalking = true;
            nextActionTime = petNow + 2000; // Delay normal actions while chasing
            
            // Hit detection for local player
            if (minDist < 30 && closestPlayerX === localPos.current.x && closestPlayerY === localPos.current.y) {
               if (petNow - lastHitTime.current > 1000) { // 1 second cooldown
                 let damage = 1;
                 if (pet.type === 'dog') damage = 3;
                 if (pet.type === 'fox') damage = 2;
                 if (pet.type === 'snake') damage = 1;
                 
                 localHealth.current = Math.max(0, localHealth.current - damage);
                 lastHitTime.current = petNow;
                 
                 // Update visual health bar without triggering react render
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
               }
            }
          }
"""
if old_chase_logic.strip() in content:
    content = content.replace(old_chase_logic.strip(), new_chase_logic.strip())

with open("global-chat-game.tsx", "w") as f:
    f.write(content)
print("done")
