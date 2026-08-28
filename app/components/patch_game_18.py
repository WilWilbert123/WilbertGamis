import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

old_block = """                 if (closestPlayerId === "local") {
                   localHealth.current = Math.max(0, localHealth.current - damage);
                   
                   if (playerHealthBarRef.current) {"""

new_block = """                 if (closestPlayerId === "local") {
                   localHealth.current = Math.max(0, localHealth.current - damage);
                   
                   if (localHealth.current === 0) {
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
                   }
                   
                   if (playerHealthBarRef.current) {"""

if old_block in content:
    content = content.replace(old_block, new_block)
else:
    print("Could not find the block to replace")

with open("global-chat-game.tsx", "w") as f:
    f.write(content)
print("done")
