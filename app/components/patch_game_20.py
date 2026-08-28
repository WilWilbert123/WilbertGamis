import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

# 1. Add state and handleRespawn
state_old = '  const [currentMapId, setCurrentMapId] = useState("forest");'
state_new = """  const [currentMapId, setCurrentMapId] = useState("forest");
  const [showGameOver, setShowGameOver] = useState(false);

  const handleRespawn = useCallback(() => {
    setShowGameOver(false);
    isDeadRef.current = false;
    
    localHealth.current = 100;
    localPos.current.x = 1000;
    localPos.current.y = 1000;
    localPos.current.mapId = "forest";
    setCurrentMapId("forest");
    
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
  }, [sessionInfo.id]);"""

if state_old in content:
    content = content.replace(state_old, state_new)
else:
    print("Could not find state block")

# 2. Update Death Logic
import re
death_pattern = re.compile(r'if \(localHealth\.current === 0 && !isDeadRef\.current\) \{.*?\}', re.DOTALL)
death_new = """if (localHealth.current === 0 && !isDeadRef.current) {
                    isDeadRef.current = true;
                    if (playerRef.current) {
                      playerRef.current.style.transition = 'transform 0.5s ease-out';
                      playerRef.current.style.transform = `scaleX(${localPos.current.flipX ? -1 : 1}) rotate(90deg)`;
                    }
                    setShowGameOver(true);
                  }"""
if death_pattern.search(content):
    content = death_pattern.sub(death_new, content, count=1)
else:
    print("Could not find death logic block")

# 3. Add Game Over UI at the end
ui_old = """      {/* Global Chat UI Layer */}
    </div>
  );
}"""

ui_new = """      {/* Global Chat UI Layer */}
      
      {/* Game Over Screen */}
      {showGameOver && (
        <div className="fixed inset-0 z-[9999] bg-black/60 backdrop-blur-md flex flex-col items-center justify-center">
          <h1 className="text-6xl font-bold text-red-500 mb-8 tracking-widest drop-shadow-[0_0_15px_rgba(239,68,68,0.8)] font-serif">YOU DIED</h1>
          <button 
            onClick={handleRespawn}
            className="px-8 py-4 bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg border-2 border-red-800 shadow-[0_0_15px_rgba(239,68,68,0.6)] hover:scale-105 transition-transform font-mono text-xl"
          >
            Start Again
          </button>
        </div>
      )}
    </div>
  );
}"""
if ui_old in content:
    content = content.replace(ui_old, ui_new)
else:
    print("Could not find ui block")

with open("global-chat-game.tsx", "w") as f:
    f.write(content)
print("done")
