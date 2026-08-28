import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

old_logic = """
        if (pet.type === 'dog' || pet.type === 'fox' || pet.type === 'cat' || pet.type === 'snake') {
          const px = localPos.current.x;
          const py = localPos.current.y;
          const distToPlayer = Math.hypot(px - x, py - y);
          
          if (distToPlayer < 250) { // Chase range
            isChasing = true;
            targetX = px;
            targetY = py;
            isWalking = true;
            nextActionTime = petNow + 2000; // Delay normal actions while chasing
          }
        }
"""

new_logic = """
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
          }
        }
"""

if old_logic.strip() in content:
    content = content.replace(old_logic.strip(), new_logic.strip())
    with open("global-chat-game.tsx", "w") as f:
        f.write(content)
    print("Replaced successfully!")
else:
    print("Could not find old_logic in content.")

