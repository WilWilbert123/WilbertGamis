import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

# I want to read the petsRef.current.forEach block to see what exactly is there.
# Let's print out lines 990 to 1025.
lines = content.split('\n')
for i in range(990, 1020):
    if i < len(lines):
        print(f"{i}: {lines[i]}")

