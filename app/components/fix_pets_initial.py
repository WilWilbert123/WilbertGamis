import re

with open('global-chat-game.tsx', 'r') as f:
    content = f.read()

content = re.sub(
    r'left: `\$\{([a-z]+)\.x\}px`,\s*top: `\$\{([a-z]+)\.y\}px`,\s*zIndex: Math\.floor\([a-z]+\.y\),\s*transform: \'translate\(-50%, -100%\)\'',
    r"left: 0, top: 0, zIndex: Math.floor(\1.y), transform: `translate3d(${\1.x}px, ${\1.y}px, 0) translate(-50%, -100%)`",
    content
)

with open('global-chat-game.tsx', 'w') as f:
    f.write(content)
print("Done")
