import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

# 1. Update GamePet interface
old_interface = """  walkDuration: number;
  nextActionTime: number;
  targetX?: number;
  targetY?: number;
}"""
new_interface = """  walkDuration: number;
  nextActionTime: number;
  targetX?: number;
  targetY?: number;
  lastHitTimes?: Record<string, number>;
}"""
if old_interface in content:
    content = content.replace(old_interface, new_interface)
else:
    print("Could not find GamePet interface")

# 2. Update hit detection logic
old_hit_logic = """            if (minDist < 30) {
                 let damage = 1;
                 if (pet.type === 'dog') damage = 3;
                 if (pet.type === 'fox') damage = 2;
                 if (pet.type === 'snake') damage = 1;

               if (closestPlayerId === "local") {
                 if (petNow - lastHitTime.current > 1000) { // 1 second cooldown
                   localHealth.current = Math.max(0, localHealth.current - damage);
                   lastHitTime.current = petNow;
                   showHitEffect(x, y, damage, pet.type);
                   showHitEffect(x, y, damage, pet.type);
                   
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
                   showHitEffect(x, y, damage, pet.type);
                   showHitEffect(x, y, damage, pet.type);
                   
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
            }"""

new_hit_logic = """            if (minDist < 30) {
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
                 } else {
                   // Remote player hit
                   if (!playersHealth.current[closestPlayerId]) {
                     playersHealth.current[closestPlayerId] = { hp: 100, lastHitTime: 0 };
                   }
                   
                   const remoteStats = playersHealth.current[closestPlayerId];
                   remoteStats.hp = Math.max(0, remoteStats.hp - damage);
                   
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
            }"""

if old_hit_logic in content:
    content = content.replace(old_hit_logic, new_hit_logic)
else:
    print("Could not find hit logic")

with open("global-chat-game.tsx", "w") as f:
    f.write(content)
print("Done updating hit logic")
