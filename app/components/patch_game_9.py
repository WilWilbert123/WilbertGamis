import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

# 1. Add playersHealth ref
old_refs = """
  const playerRef = useRef<HTMLDivElement>(null);
  const playerHealthBarRef = useRef<HTMLDivElement>(null);
  const localHealth = useRef(100);
  const lastHitTime = useRef(0);
"""
new_refs = """
  const playerRef = useRef<HTMLDivElement>(null);
  const playerHealthBarRef = useRef<HTMLDivElement>(null);
  const localHealth = useRef(100);
  const lastHitTime = useRef(0);
  const playersHealth = useRef<Record<string, {hp: number, lastHitTime: number}>>({});
"""
if old_refs.strip() in content:
    content = content.replace(old_refs.strip(), new_refs.strip())
else:
    print("Could not find old_refs")

# 2. Add health bar to remote players
old_remote_ui = """
              {latestMsg && (
                <div className="absolute bottom-full mb-1 bg-white text-black text-[10px] font-mono px-2 py-1 rounded-lg shadow-md whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis border border-gray-200">
                  {latestMsg}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
                </div>
              )}
              <div className="mb-1 px-2 py-0.5 bg-black/50 text-white text-[10px] sm:text-xs rounded-full whitespace-nowrap backdrop-blur-sm">
                {player.username}
              </div>
"""

new_remote_ui = """
              {latestMsg && (
                <div className="absolute bottom-full mb-1 bg-white text-black text-[10px] font-mono px-2 py-1 rounded-lg shadow-md whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis border border-gray-200">
                  {latestMsg}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
                </div>
              )}
              {/* Remote Player Health Bar */}
              <div className="w-8 h-1.5 bg-black/50 rounded-full mb-1 border border-white/20 overflow-hidden pointer-events-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
                <div 
                  id={`healthbar-${player.user_id}`}
                  className="h-full bg-green-500 transition-all duration-200" 
                  style={{ width: '100%', imageRendering: 'pixelated' }}
                />
              </div>
              <div className="mb-1 px-2 py-0.5 bg-black/50 text-white text-[10px] sm:text-xs rounded-full whitespace-nowrap backdrop-blur-sm shadow-sm">
                {player.username}
              </div>
"""
if old_remote_ui.strip() in content:
    content = content.replace(old_remote_ui.strip(), new_remote_ui.strip())
else:
    print("Could not find old_remote_ui")

# 3. Update the local player health bar to be pixelated
old_local_hp = """
            {/* Health Bar */}
            <div className="w-8 h-1.5 bg-black/50 rounded-full mb-1 border border-white/20 overflow-hidden pointer-events-none">
              <div 
                ref={playerHealthBarRef}
                className="h-full bg-green-500 transition-all duration-200" 
                style={{ width: '100%' }}
              />
            </div>
"""
new_local_hp = """
            {/* Health Bar */}
            <div className="w-8 h-1.5 bg-black/50 rounded-full mb-1 border border-white/20 overflow-hidden pointer-events-none shadow-[inset_0_1px_2px_rgba(0,0,0,0.5)]">
              <div 
                ref={playerHealthBarRef}
                className="h-full bg-green-500 transition-all duration-200" 
                style={{ width: '100%', imageRendering: 'pixelated' }}
              />
            </div>
"""
if old_local_hp.strip() in content:
    content = content.replace(old_local_hp.strip(), new_local_hp.strip())
else:
    print("Could not find old_local_hp")

# 4. Update chase logic to damage the closest player (local or remote)
old_chase = """
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

new_chase = """
          let closestPlayerId = "local";
          Object.values(latestPositions.current).forEach((p: any) => {
             // Only chase if they are on the same map (assuming amazon since pets are here)
             if (p.mapId === "amazon" || !p.mapId) {
               const dist = Math.hypot(p.x - x, p.y - y);
               if (dist < minDist) {
                 minDist = dist;
                 closestPlayerX = p.x;
                 closestPlayerY = p.y;
                 // Need to find the key for this player to store health
                 const foundKey = Object.keys(latestPositions.current).find(k => latestPositions.current[k] === p);
                 if (foundKey) closestPlayerId = foundKey;
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

               if (closestPlayerId === "local") {
                 if (petNow - lastHitTime.current > 1000) { // 1 second cooldown
                   localHealth.current = Math.max(0, localHealth.current - damage);
                   lastHitTime.current = petNow;
                   
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
               } else {
                 // Remote player hit
                 if (!playersHealth.current[closestPlayerId]) {
                   playersHealth.current[closestPlayerId] = { hp: 100, lastHitTime: 0 };
                 }
                 
                 const remoteStats = playersHealth.current[closestPlayerId];
                 if (petNow - remoteStats.lastHitTime > 1000) {
                   remoteStats.hp = Math.max(0, remoteStats.hp - damage);
                   remoteStats.lastHitTime = petNow;
                   
                   const healthBarEl = document.getElementById(`healthbar-${closestPlayerId}`);
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
                 }
               }
            }
          }
"""

# We need to replace the entire block that calculates closestPlayerX
full_old_chase = """
        if (pet.type === 'dog' || pet.type === 'fox' || pet.type === 'cat' || pet.type === 'snake') {
          let closestPlayerX = localPos.current.x;
          let closestPlayerY = localPos.current.y;
          let minDist = Math.hypot(closestPlayerX - x, closestPlayerY - y);
          
          Object.values(latestPositions.current).forEach((p: any) => {
             // Only chase if they are on the same map (assuming amazon since pets are here)
             if (p.mapId === "amazon" || !p.mapId) {
               const dist = Math.hypot(p.x - x, p.y - y);
               if (dist < minDist) {
                 minDist = dist;
                 closestPlayerX = p.x;
                 closestPlayerY = p.y;
               }
             }
          });
          
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
        }
"""

full_new_chase = """
        if (pet.type === 'dog' || pet.type === 'fox' || pet.type === 'cat' || pet.type === 'snake') {
          let closestPlayerX = localPos.current.x;
          let closestPlayerY = localPos.current.y;
          let minDist = Math.hypot(closestPlayerX - x, closestPlayerY - y);
""" + new_chase + """
        }
"""
if full_old_chase.strip() in content:
    content = content.replace(full_old_chase.strip(), full_new_chase.strip())
else:
    print("Could not find full_old_chase")

with open("global-chat-game.tsx", "w") as f:
    f.write(content)
print("done")
