import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

old_logic = """
        if (petNow > nextActionTime) {
          const action = Math.random();
          if (action < 0.4) {
            // walk left
            targetX = Math.max(0, x - 100 - Math.random() * 300);
            nextActionTime = petNow + pet.walkDuration;
            isWalking = true;
          } else if (action < 0.8) {
            // walk right
            targetX = Math.min(MAP_WIDTH, x + 100 + Math.random() * 300);
            nextActionTime = petNow + pet.walkDuration;
            isWalking = true;
          } else {
            // stop
            targetX = x;
            nextActionTime = petNow + pet.idleDuration;
            isWalking = false;
          }
        }
        
        if (isWalking && targetX !== undefined) {
          const dx = targetX - x;
          const distanceX = Math.abs(dx);
          if (distanceX > 5) {
            vx = Math.sign(dx) * Math.min(speed, distanceX);
            flipX = vx < 0;
            x += vx * petDt;
          } else {
            isWalking = false;
          }
        }
"""

new_logic = """
        let isChasing = false;
        
        if (pet.type === 'dog' || pet.type === 'fox' || pet.type === 'cat') {
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
          
          if (dist > 30) { // Stop slightly before hitting exact center
            const currentSpeed = isChasing ? speed * 1.6 : speed; // run slightly faster when chasing
            vx = (dx / dist) * Math.min(currentSpeed, dist);
            vy = (dy / dist) * Math.min(currentSpeed, dist);
            flipX = vx < 0;
            x += vx * petDt;
            y += vy * petDt;
            
            // Clamp y so they don't walk out of bounds or too high up
            y = Math.min(MAP_HEIGHT, Math.max(MAP_HEIGHT * 0.35, y));
          } else {
            isWalking = false;
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

