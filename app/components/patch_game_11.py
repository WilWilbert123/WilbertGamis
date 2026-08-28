import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

# 1. We need to add the showHitEffect function inside the game loop useEffect.
old_gameLoop = """
  // Game Loop for Local Pets
  useEffect(() => {
    let animationFrameId: number;
"""

new_gameLoop = """
  // Game Loop for Local Pets
  useEffect(() => {
    let animationFrameId: number;
    
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
      
      // Claw Effect (appears on the pet)
      const clawEl = document.createElement('div');
      clawEl.className = 'absolute text-red-500 font-black pointer-events-none select-none z-[999] italic tracking-tighter';
      clawEl.style.left = `${x}px`;
      clawEl.style.top = `${y - 20}px`;
      clawEl.style.fontSize = '24px';
      clawEl.innerText = '///';
      
      worldRef.current.appendChild(dmgEl);
      worldRef.current.appendChild(clawEl);
      
      dmgEl.animate([
        { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
        { transform: 'translate(-50%, -30px) scale(1.5)', opacity: 0 }
      ], { duration: 800, easing: 'ease-out' });
      
      clawEl.animate([
        { transform: 'translate(-50%, -50%) scale(0.5) rotate(45deg)', opacity: 0.5 },
        { transform: 'translate(-50%, -50%) scale(1.5) rotate(45deg)', opacity: 0 }
      ], { duration: 400, easing: 'ease-out' });
      
      setTimeout(() => {
        if (dmgEl.parentNode) dmgEl.parentNode.removeChild(dmgEl);
        if (clawEl.parentNode) clawEl.parentNode.removeChild(clawEl);
      }, 800);
    };
"""
if old_gameLoop.strip() in content:
    content = content.replace(old_gameLoop.strip(), new_gameLoop.strip())
else:
    print("Could not find old_gameLoop")

# 2. Add the call to showHitEffect inside the hit detection logic.
# Wait, I need to make sure I inject it where the damage happens.
old_hit_detection = """
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
"""

new_hit_detection = """
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
                   showHitEffect(x, y, damage, pet.type);
"""
if old_hit_detection.strip() in content:
    content = content.replace(old_hit_detection.strip(), new_hit_detection.strip())
else:
    print("Could not find old_hit_detection local")

old_hit_remote = """
                 const remoteStats = playersHealth.current[closestPlayerId];
                 if (petNow - remoteStats.lastHitTime > 1000) {
                   remoteStats.hp = Math.max(0, remoteStats.hp - damage);
                   remoteStats.lastHitTime = petNow;
"""

new_hit_remote = """
                 const remoteStats = playersHealth.current[closestPlayerId];
                 if (petNow - remoteStats.lastHitTime > 1000) {
                   remoteStats.hp = Math.max(0, remoteStats.hp - damage);
                   remoteStats.lastHitTime = petNow;
                   showHitEffect(x, y, damage, pet.type);
"""
if old_hit_remote.strip() in content:
    content = content.replace(old_hit_remote.strip(), new_hit_remote.strip())
else:
    print("Could not find old_hit_remote")


with open("global-chat-game.tsx", "w") as f:
    f.write(content)
print("done")
