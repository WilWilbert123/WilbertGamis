import sys, re
with open('/Users/wilbertgamis/.gemini/antigravity-ide/brain/024582b9-d575-4ffc-8dc7-ce8bafe8d033/scratch/generated_maps2.js', 'r') as f:
    new_maps = f.read().strip()

with open('global-chat-game.tsx', 'r') as f:
    content = f.read()

# I need to insert `new_maps` right before `export default function GlobalChatGame`
# Let's check if MAPS is still there
if 'const MAPS' in content:
    print("MAPS still there?!")
else:
    content = content.replace("export default function GlobalChatGame", new_maps + "\n\nexport default function GlobalChatGame")
    with open('global-chat-game.tsx', 'w') as f:
        f.write(content)
    print("Inserted MAPS")
