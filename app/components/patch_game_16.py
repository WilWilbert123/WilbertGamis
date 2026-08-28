import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

# We need to replace the entire showHitEffect function
old_start = "const showHitEffect = (x: number, y: number, damage: number, petType: string) => {"
old_end = "    };"

# Find the block
start_idx = content.find(old_start)
if start_idx != -1:
    end_idx = content.find(old_end, start_idx) + len(old_end)
    old_block = content[start_idx:end_idx]

    new_block = """const showHitEffect = (x: number, y: number, damage: number, petType: string) => {
      if (!worldRef.current) return;
      
      // Damage Number (floats up from the pet)
      const dmgEl = document.createElement('div');
      dmgEl.className = 'absolute text-red-500 font-bold pointer-events-none select-none z-[999]';
      dmgEl.style.left = `${x}px`;
      dmgEl.style.top = `${y - 40}px`;
      dmgEl.style.fontFamily = "'Press Start 2P', monospace";
      dmgEl.style.fontSize = '10px';
      dmgEl.style.textShadow = '1px 1px 0 #000, -1px -1px 0 #000, 1px -1px 0 #000, -1px 1px 0 #000';
      dmgEl.innerText = `-${damage}`;
      worldRef.current.appendChild(dmgEl);
      dmgEl.animate([
        { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
        { transform: 'translate(-50%, -30px) scale(1.5)', opacity: 0 }
      ], { duration: 800, easing: 'ease-out' });
      setTimeout(() => { if (dmgEl.parentNode) dmgEl.parentNode.removeChild(dmgEl); }, 800);

      // Cross Strike Effect (from reference image)
      const crossStrike = document.createElement('div');
      crossStrike.className = 'absolute pointer-events-none z-[999] flex items-center justify-center';
      crossStrike.style.left = `${x}px`;
      crossStrike.style.top = `${y - 20}px`;
      crossStrike.style.width = '40px';
      crossStrike.style.height = '40px';
      crossStrike.style.marginLeft = '-20px';
      crossStrike.style.marginTop = '-20px';
      crossStrike.style.filter = 'drop-shadow(2px 2px 0 rgba(0,0,0,0.8))';

      // Broken Circle - Top & Bottom arcs
      const arc1 = document.createElement('div');
      arc1.style.position = 'absolute';
      arc1.style.width = '28px';
      arc1.style.height = '28px';
      arc1.style.left = '6px';
      arc1.style.top = '6px';
      arc1.style.borderRadius = '50%';
      arc1.style.border = '4px solid transparent';
      arc1.style.borderTopColor = '#ff7a00';
      arc1.style.borderBottomColor = '#ff7a00';
      crossStrike.appendChild(arc1);

      // Broken Circle - Left & Right arcs
      const arc2 = document.createElement('div');
      arc2.style.position = 'absolute';
      arc2.style.width = '28px';
      arc2.style.height = '28px';
      arc2.style.left = '6px';
      arc2.style.top = '6px';
      arc2.style.borderRadius = '50%';
      arc2.style.border = '4px solid transparent';
      arc2.style.borderLeftColor = '#ffea00';
      arc2.style.borderRightColor = '#ffea00';
      crossStrike.appendChild(arc2);

      // Diagonal Spike 1 (Top-Left to Bottom-Right)
      const spikeX1 = document.createElement('div');
      spikeX1.style.position = 'absolute';
      spikeX1.style.width = '40px';
      spikeX1.style.height = '6px';
      spikeX1.style.left = '0px';
      spikeX1.style.top = '17px';
      spikeX1.style.background = 'linear-gradient(90deg, #ff7a00 0%, #ffea00 30%, #ffea00 70%, #ff7a00 100%)';
      spikeX1.style.transform = 'rotate(45deg)';
      spikeX1.style.clipPath = 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)';
      crossStrike.appendChild(spikeX1);

      // Diagonal Spike 2 (Top-Right to Bottom-Left)
      const spikeX2 = document.createElement('div');
      spikeX2.style.position = 'absolute';
      spikeX2.style.width = '40px';
      spikeX2.style.height = '6px';
      spikeX2.style.left = '0px';
      spikeX2.style.top = '17px';
      spikeX2.style.background = 'linear-gradient(90deg, #ff7a00 0%, #ffea00 30%, #ffea00 70%, #ff7a00 100%)';
      spikeX2.style.transform = 'rotate(-45deg)';
      spikeX2.style.clipPath = 'polygon(10% 0, 90% 0, 100% 50%, 90% 100%, 10% 100%, 0 50%)';
      crossStrike.appendChild(spikeX2);

      // Vertical Spike
      const spikeV = document.createElement('div');
      spikeV.style.position = 'absolute';
      spikeV.style.width = '4px';
      spikeV.style.height = '48px';
      spikeV.style.left = '18px';
      spikeV.style.top = '-4px';
      spikeV.style.background = 'linear-gradient(180deg, #ff7a00 0%, #ffea00 30%, #ffea00 70%, #ff7a00 100%)';
      spikeV.style.clipPath = 'polygon(50% 0, 100% 10%, 100% 90%, 50% 100%, 0 90%, 0 10%)';
      crossStrike.appendChild(spikeV);

      worldRef.current.appendChild(crossStrike);

      // Pop Animation
      crossStrike.animate([
        { transform: 'scale(0.3) rotate(-15deg)', opacity: 1 },
        { transform: 'scale(1.2) rotate(15deg)', opacity: 0 }
      ], { duration: 300, easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)' });

      setTimeout(() => {
        if (crossStrike.parentNode) crossStrike.parentNode.removeChild(crossStrike);
      }, 300);
    };"""

    content = content.replace(old_block, new_block)
    
    with open("global-chat-game.tsx", "w") as f:
        f.write(content)
    print("Done updating to Cross Strike")
else:
    print("Could not find the function block")
