import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

old_hit = """    const showHitEffect = (x: number, y: number, damage: number, petType: string) => {
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
      
      // Crescent Slash Strike Effect
      const slash = document.createElement('div');
      slash.className = 'absolute pointer-events-none z-[999]';
      slash.style.left = `${x}px`;
      slash.style.top = `${y - 20}px`;
      slash.style.width = '40px';
      slash.style.height = '40px';
      slash.style.marginLeft = '-20px';
      slash.style.marginTop = '-20px';
      // The outer orange/red curve
      slash.style.borderStyle = 'solid';
      slash.style.borderWidth = '6px 6px 0 0';
      slash.style.borderColor = '#ff7a00 #ff0000 transparent transparent';
      slash.style.borderRadius = '50%';
      // Retro hard shadow
      slash.style.filter = 'drop-shadow(2px 2px 0 #000)';

      // The inner yellow core of the slash
      const slashCore = document.createElement('div');
      slashCore.style.position = 'absolute';
      slashCore.style.width = '100%';
      slashCore.style.height = '100%';
      slashCore.style.left = '0';
      slashCore.style.top = '0';
      slashCore.style.borderStyle = 'solid';
      slashCore.style.borderWidth = '2px 2px 0 0';
      slashCore.style.borderColor = '#ffea00 transparent transparent transparent';
      slashCore.style.borderRadius = '50%';
      slash.appendChild(slashCore);

      worldRef.current.appendChild(dmgEl);
      worldRef.current.appendChild(slash);
      
      dmgEl.animate([
        { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
        { transform: 'translate(-50%, -30px) scale(1.5)', opacity: 0 }
      ], { duration: 800, easing: 'ease-out' });

      // Fast slashing animation (rotates and expands)
      slash.animate([
        { transform: 'scale(0.3) rotate(-60deg)', opacity: 1 },
        { transform: 'scale(1.5) rotate(60deg)', opacity: 0 }
      ], { duration: 250, easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)' });
      
      setTimeout(() => {
        if (dmgEl.parentNode) dmgEl.parentNode.removeChild(dmgEl);
        if (slash.parentNode) slash.parentNode.removeChild(slash);
      }, 800);
    };"""


new_hit = """    const showHitEffect = (x: number, y: number, damage: number, petType: string) => {
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

      // Effect Container
      const effectContainer = document.createElement('div');
      effectContainer.className = 'absolute pointer-events-none z-[999]';
      effectContainer.style.left = `${x}px`;
      effectContainer.style.top = `${y - 20}px`;
      worldRef.current.appendChild(effectContainer);

      if (petType === 'fox') {
        // Crescent Slash Effect (Agile)
        const slash = document.createElement('div');
        slash.className = 'absolute pointer-events-none z-[999]';
        slash.style.width = '40px';
        slash.style.height = '40px';
        slash.style.marginLeft = '-20px';
        slash.style.marginTop = '-20px';
        slash.style.borderStyle = 'solid';
        slash.style.borderWidth = '6px 6px 0 0';
        slash.style.borderColor = '#ff7a00 #ff0000 transparent transparent';
        slash.style.borderRadius = '50%';
        slash.style.filter = 'drop-shadow(2px 2px 0 #000)';

        const slashCore = document.createElement('div');
        slashCore.style.position = 'absolute';
        slashCore.style.width = '100%';
        slashCore.style.height = '100%';
        slashCore.style.left = '0';
        slashCore.style.top = '0';
        slashCore.style.borderStyle = 'solid';
        slashCore.style.borderWidth = '2px 2px 0 0';
        slashCore.style.borderColor = '#ffea00 transparent transparent transparent';
        slashCore.style.borderRadius = '50%';
        slash.appendChild(slashCore);
        effectContainer.appendChild(slash);

        slash.animate([
          { transform: 'scale(0.3) rotate(-60deg)', opacity: 1 },
          { transform: 'scale(1.5) rotate(60deg)', opacity: 0 }
        ], { duration: 250, easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)' });

      } else if (petType === 'dog') {
        // Heavy Impact Burst (like top-left image)
        const flash = document.createElement('div');
        flash.className = 'absolute bg-white';
        flash.style.width = '16px';
        flash.style.height = '16px';
        flash.style.left = '-8px';
        flash.style.top = '-8px';
        flash.style.boxShadow = '0 0 10px 5px #ffeb3b';
        flash.style.transform = 'rotate(45deg)';
        flash.animate([
          { transform: 'scale(0.5) rotate(45deg)', opacity: 1 },
          { transform: 'scale(2.5) rotate(90deg)', opacity: 0 }
        ], { duration: 200, easing: 'ease-out' });
        effectContainer.appendChild(flash);

        const angles = [0, 90, 180, 270];
        angles.forEach(angle => {
          const spike = document.createElement('div');
          spike.className = 'absolute bg-yellow-400 shadow-[2px_2px_0_0_rgba(0,0,0,1)]';
          spike.style.width = '4px';
          spike.style.height = '20px';
          spike.style.left = '-2px';
          spike.style.top = '-10px';
          
          const rad = angle * (Math.PI / 180);
          const dist = 30;
          const targetX = Math.cos(rad) * dist;
          const targetY = Math.sin(rad) * dist;
          
          spike.animate([
            { transform: `translate(0, 0) rotate(${angle}deg) scaleY(0.5)`, opacity: 1 },
            { transform: `translate(${targetX}px, ${targetY}px) rotate(${angle}deg) scaleY(1.5)`, opacity: 0 }
          ], { duration: 250, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' });
          effectContainer.appendChild(spike);
        });

      } else if (petType === 'snake') {
        // Double Cross Strike / Venom (like middle-left image)
        const slash1 = document.createElement('div');
        slash1.className = 'absolute bg-green-500';
        slash1.style.width = '35px';
        slash1.style.height = '4px';
        slash1.style.left = '-17.5px';
        slash1.style.top = '-2px';
        slash1.style.boxShadow = '2px 2px 0 #000';
        slash1.animate([
          { transform: 'scaleX(0.2) rotate(45deg)', opacity: 1 },
          { transform: 'scaleX(1.2) rotate(45deg)', opacity: 0 }
        ], { duration: 250, easing: 'ease-out' });
        
        const slash2 = document.createElement('div');
        slash2.className = 'absolute bg-green-400';
        slash2.style.width = '35px';
        slash2.style.height = '4px';
        slash2.style.left = '-17.5px';
        slash2.style.top = '-2px';
        slash2.style.boxShadow = '2px 2px 0 #000';
        slash2.animate([
          { transform: 'scaleX(0.2) rotate(-45deg)', opacity: 1 },
          { transform: 'scaleX(1.2) rotate(-45deg)', opacity: 0 }
        ], { duration: 250, easing: 'ease-out' });

        const splash = document.createElement('div');
        splash.className = 'absolute bg-purple-500 border border-black';
        splash.style.width = '12px';
        splash.style.height = '12px';
        splash.style.left = '-6px';
        splash.style.top = '-6px';
        splash.animate([
          { transform: 'scale(0.5) rotate(45deg)', opacity: 1 },
          { transform: 'scale(2) rotate(135deg)', opacity: 0 }
        ], { duration: 300, easing: 'ease-out' });
        
        effectContainer.appendChild(slash1);
        effectContainer.appendChild(slash2);
        effectContainer.appendChild(splash);
      }

      setTimeout(() => {
        if (effectContainer.parentNode) effectContainer.parentNode.removeChild(effectContainer);
      }, 800);
    };"""

if old_hit.strip() in content:
    content = content.replace(old_hit.strip(), new_hit.strip())
else:
    print("Could not find old_hit")

with open("global-chat-game.tsx", "w") as f:
    f.write(content)
print("done")
