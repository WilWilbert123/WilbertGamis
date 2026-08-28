import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

# 1. Update game loop to update pets
game_loop_pet_update = """
      // --- MAP PETS UPDATE ---
      const now = Date.now();
      const dt = 0.016; // approx 60fps delta
      
      petsRef.current.forEach((pet) => {
        let { x, y, vx, vy, speed, nextActionTime, targetX, targetY, isWalking, flipX } = pet;
        
        if (now > nextActionTime) {
          const action = Math.random();
          if (action < 0.4) {
            // walk left
            targetX = Math.max(0, x - 100 - Math.random() * 200);
            nextActionTime = now + 1500 + Math.random() * 1500;
            isWalking = true;
          } else if (action < 0.8) {
            // walk right
            targetX = Math.min(MAP_WIDTH, x + 100 + Math.random() * 200);
            nextActionTime = now + 1500 + Math.random() * 1500;
            isWalking = true;
          } else {
            // stop
            targetX = x;
            nextActionTime = now + pet.idleDuration;
            isWalking = false;
          }
        }
        
        if (isWalking && targetX !== undefined) {
          const dx = targetX - x;
          const distanceX = Math.abs(dx);
          if (distanceX > 5) {
            vx = Math.sign(dx) * Math.min(speed, distanceX);
            flipX = vx < 0;
            x += vx * dt;
          } else {
            isWalking = false;
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
      // --- END MAP PETS UPDATE ---
"""
content = content.replace("requestAnimationFrame(gameLoop);", game_loop_pet_update + "\n      requestAnimationFrame(gameLoop);")

# 2. Render pets in JSX
render_pets = """
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
"""
content = content.replace("{/* Remote Players */}", render_pets + "\n        {/* Remote Players */}")

with open("global-chat-game.tsx", "w") as f:
    f.write(content)

