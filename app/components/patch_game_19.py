import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

# Add isDeadRef
if "const keysPressed = useRef<{ [key: string]: boolean }>({});" in content:
    content = content.replace(
        "const keysPressed = useRef<{ [key: string]: boolean }>({});",
        "const keysPressed = useRef<{ [key: string]: boolean }>({});\n  const isDeadRef = useRef(false);"
    )
else:
    print("Could not find keysPressed")

# Add death logic
old_death = """                   if (localHealth.current === 0) {
                     // Respawn Logic
                     localHealth.current = 100;
                     localPos.current.x = 1000;
                     localPos.current.y = 1000;
                     localPos.current.mapId = "forest";
                     setCurrentMapId("forest");
                     
                     // Broadcast teleport so other clients move us immediately
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
                     }
                   }"""

new_death = """                   if (localHealth.current === 0 && !isDeadRef.current) {
                     // Start Death Sequence
                     isDeadRef.current = true;
                     
                     if (playerRef.current) {
                       playerRef.current.style.transition = 'transform 0.5s ease-out';
                       playerRef.current.style.transform = `scaleX(${localPos.current.flipX ? -1 : 1}) rotate(90deg)`;
                     }

                     setTimeout(() => {
                       const topEyelid = document.getElementById('death-eyelid-top');
                       const bottomEyelid = document.getElementById('death-eyelid-bottom');
                       if (topEyelid && bottomEyelid) {
                         topEyelid.style.height = '50%';
                         bottomEyelid.style.height = '50%';
                       }
                       
                       setTimeout(() => {
                         // Respawn Logic after fade to black
                         localHealth.current = 100;
                         localPos.current.x = 1000;
                         localPos.current.y = 1000;
                         localPos.current.mapId = "forest";
                         setCurrentMapId("forest");
                         
                         // Broadcast teleport so other clients move us immediately
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
                         }

                         if (playerHealthBarRef.current) {
                           playerHealthBarRef.current.style.width = '100%';
                           playerHealthBarRef.current.style.backgroundColor = '#22c55e';
                         }

                         if (playerRef.current) {
                           playerRef.current.style.transition = 'none';
                           playerRef.current.style.transform = `scaleX(${localPos.current.flipX ? -1 : 1})`;
                         }
                         
                         setTimeout(() => {
                            if (topEyelid && bottomEyelid) {
                              topEyelid.style.height = '0%';
                              bottomEyelid.style.height = '0%';
                            }
                            
                            setTimeout(() => {
                              isDeadRef.current = false;
                            }, 1000);
                         }, 500);

                       }, 2000);
                     }, 1000);
                   }"""

if old_death in content:
    content = content.replace(old_death, new_death)
else:
    print("Could not find death logic")

# Prevent movement
old_move = """      let dx = 0;
      let dy = 0;
      let currentMoveSpeed = PLAYER_SPEED;
      
      // Basic movement
      if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= currentMoveSpeed;
      if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += currentMoveSpeed;
      if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= currentMoveSpeed;
      if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += currentMoveSpeed;"""

new_move = """      let dx = 0;
      let dy = 0;
      let currentMoveSpeed = PLAYER_SPEED;
      
      // Basic movement (blocked if dead)
      if (!isDeadRef.current) {
        if (keysPressed.current['w'] || keysPressed.current['arrowup']) dy -= currentMoveSpeed;
        if (keysPressed.current['s'] || keysPressed.current['arrowdown']) dy += currentMoveSpeed;
        if (keysPressed.current['a'] || keysPressed.current['arrowleft']) dx -= currentMoveSpeed;
        if (keysPressed.current['d'] || keysPressed.current['arrowright']) dx += currentMoveSpeed;
      }"""

if old_move in content:
    content = content.replace(old_move, new_move)
else:
    print("Could not find movement logic")

# Add eyelids
old_eyelids = """        </>
      )}
    </div>
  );
}"""

new_eyelids = """        </>
      )}

      {/* Cinematic Death Eyelids */}
      <div 
        id="death-eyelid-top"
        className="fixed top-0 left-0 w-full bg-black z-[9999] pointer-events-none"
        style={{ height: '0%', transition: 'height 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
      <div 
        id="death-eyelid-bottom"
        className="fixed bottom-0 left-0 w-full bg-black z-[9999] pointer-events-none"
        style={{ height: '0%', transition: 'height 1.5s cubic-bezier(0.4, 0, 0.2, 1)' }}
      />
    </div>
  );
}"""

if old_eyelids in content:
    content = content.replace(old_eyelids, new_eyelids)
else:
    print("Could not find end of file")

with open("global-chat-game.tsx", "w") as f:
    f.write(content)
print("done")
