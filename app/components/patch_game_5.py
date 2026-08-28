import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

lines = content.split('\n')
for i in range(1015, 1030):
    if i < len(lines):
        print(f"{i}: {lines[i]}")

