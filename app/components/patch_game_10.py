import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

old_remote = """              {latestMsg && (
                <div className="absolute bottom-full mb-1 bg-white text-black text-[10px] font-mono px-2 py-1 rounded-lg shadow-md whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis border border-gray-200">
                  {latestMsg}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
                </div>
              )}
              <span className="text-[10px] font-mono text-white/90 bg-black/50 px-1.5 py-0.5 rounded shadow-sm mb-1 whitespace-nowrap">
                {player.username}
              </span>"""

new_remote = """              {latestMsg && (
                <div className="absolute bottom-full mb-1 bg-white text-black text-[10px] font-mono px-2 py-1 rounded-lg shadow-md whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis border border-gray-200">
                  {latestMsg}
                  <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
                </div>
              )}
              {/* Remote Player Health Bar */}
              <div className="w-8 h-1.5 bg-black/60 mb-0.5 border-[1px] border-black overflow-hidden pointer-events-none">
                <div 
                  id={`healthbar-${player.user_id}`}
                  className="h-full bg-[#22c55e] transition-all duration-200" 
                  style={{ width: '100%' }}
                />
              </div>
              <span className="text-[10px] font-mono text-white/90 bg-black/50 px-1.5 py-0.5 rounded shadow-sm mb-1 whitespace-nowrap">
                {player.username}
              </span>"""

if old_remote.strip() in content:
    content = content.replace(old_remote.strip(), new_remote.strip())
else:
    print("Remote not found")

old_local = """          {getLatestMessage(sessionInfo.id) && (
            <div className="absolute bottom-full mb-1 bg-white text-black text-[10px] font-mono px-2 py-1 rounded-lg shadow-md whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis border border-gray-200">
              {getLatestMessage(sessionInfo.id)}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
            </div>
          )}
          <span className="text-[10px] font-mono text-green-300 bg-black/60 px-1.5 py-0.5 rounded shadow-sm mb-1 whitespace-nowrap">
            {sessionInfo.username}
          </span>"""

new_local = """          {getLatestMessage(sessionInfo.id) && (
            <div className="absolute bottom-full mb-1 bg-white text-black text-[10px] font-mono px-2 py-1 rounded-lg shadow-md whitespace-nowrap max-w-[150px] overflow-hidden text-ellipsis border border-gray-200">
              {getLatestMessage(sessionInfo.id)}
              <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-white" />
            </div>
          )}
          {/* Local Player Health Bar */}
          <div className="w-8 h-1.5 bg-black/60 mb-0.5 border-[1px] border-black overflow-hidden pointer-events-none">
            <div 
              ref={playerHealthBarRef}
              className="h-full bg-[#22c55e] transition-all duration-200" 
              style={{ width: '100%' }}
            />
          </div>
          <span className="text-[10px] font-mono text-green-300 bg-black/60 px-1.5 py-0.5 rounded shadow-sm mb-1 whitespace-nowrap">
            {sessionInfo.username}
          </span>"""

if old_local.strip() in content:
    content = content.replace(old_local.strip(), new_local.strip())
else:
    print("Local not found")

with open("global-chat-game.tsx", "w") as f:
    f.write(content)
print("done")
