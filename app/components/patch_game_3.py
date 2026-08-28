import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

# 1. Update GamePet interface
content = content.replace(
    "idleDuration: number;\n  nextActionTime: number;",
    "idleDuration: number;\n  walkDuration: number;\n  nextActionTime: number;"
)

# 2. Update pet spawning logic
old_spawning = """
      const newPets: GamePet[] = [];
      amazonPets.forEach(({ type, count }) => {
        for (let i = 0; i < count; i++) {
          newPets.push({
            id: `pet-${type}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            x: Math.random() * MAP_WIDTH,
            y: Math.random() * MAP_HEIGHT,
            vx: 0,
            vy: 0,
            flipX: Math.random() > 0.5,
            isWalking: false,
            scale: 0.6 + Math.random() * 0.8,
            speed: PET_SPEEDS[type] + (Math.random() * 20 - 10),
            idleDuration: 4000 + Math.random() * 2000,
            nextActionTime: Date.now() + Math.random() * 3000
          });
        }
      });
"""

new_spawning = """
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
"""
content = content.replace(old_spawning.strip(), new_spawning.strip())

# 3. Update game loop target generation
old_loop_logic = """
        if (petNow > nextActionTime) {
          const action = Math.random();
          if (action < 0.4) {
            // walk left
            targetX = Math.max(0, x - 100 - Math.random() * 200);
            nextActionTime = petNow + 1500 + Math.random() * 1500;
            isWalking = true;
          } else if (action < 0.8) {
            // walk right
            targetX = Math.min(MAP_WIDTH, x + 100 + Math.random() * 200);
            nextActionTime = petNow + 1500 + Math.random() * 1500;
            isWalking = true;
          } else {
"""

new_loop_logic = """
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
"""
content = content.replace(old_loop_logic.strip(), new_loop_logic.strip())

with open("global-chat-game.tsx", "w") as f:
    f.write(content)

