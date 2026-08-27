import re

with open('global-chat-game.tsx', 'r') as f:
    content = f.read()

# Replace broadcast remote player update
# playerEl.style.left = `${data.x}px`;
# playerEl.style.top = `${data.y}px`;
content = re.sub(
    r'playerEl\.style\.left = `\$\{data\.x\}px`;\s*playerEl\.style\.top = `\$\{data\.y\}px`;',
    r'playerEl.style.transform = `translate3d(${data.x}px, ${data.y}px, 0) translate(-50%, -100%)`;',
    content
)

# Replace pet updates:
# el.style.left = `${cat.x}px`;
# el.style.top = `${cat.y}px`;
content = re.sub(
    r'el\.style\.left = `\$\{([a-z]+)\.x\}px`;\s*el\.style\.top = `\$\{([a-z]+)\.y\}px`;',
    r'el.style.transform = `translate3d(${\1.x}px, ${\1.y}px, 0) translate(-50%, -100%)`;',
    content
)

with open('global-chat-game.tsx', 'w') as f:
    f.write(content)
print("Done")
