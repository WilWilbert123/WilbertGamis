import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

old_impact = """      // Pixel Particle Impact Effect
      const impactContainer = document.createElement('div');
      impactContainer.className = 'absolute pointer-events-none z-[999]';
      impactContainer.style.left = `${x}px`;
      impactContainer.style.top = `${y - 20}px`;
      
      // Central flash
      const flash = document.createElement('div');
      flash.className = 'absolute bg-white';
      flash.style.width = '14px';
      flash.style.height = '14px';
      flash.style.left = '-7px';
      flash.style.top = '-7px';
      flash.animate([
        { transform: 'scale(0) rotate(45deg)', opacity: 1 },
        { transform: 'scale(1.5) rotate(45deg)', opacity: 0 }
      ], { duration: 150, easing: 'ease-out' });
      impactContainer.appendChild(flash);
      
      // 8-directional pixel explosion
      const angles = [0, 45, 90, 135, 180, 225, 270, 315];
      angles.forEach(angle => {
        const p = document.createElement('div');
        // Make diagonal particles red, cardinal particles yellow
        p.className = angle % 90 === 0 ? 'absolute bg-yellow-400' : 'absolute bg-red-500';
        p.style.width = '6px';
        p.style.height = '6px';
        p.style.left = '-3px';
        p.style.top = '-3px';
        
        const rad = angle * (Math.PI / 180);
        const dist = 30; // explosion radius
        const targetX = Math.cos(rad) * dist;
        const targetY = Math.sin(rad) * dist;
        
        p.animate([
          { transform: 'translate(0, 0) scale(1)', opacity: 1 },
          { transform: `translate(${targetX}px, ${targetY}px) scale(0)`, opacity: 0 }
        ], { duration: 300, easing: 'cubic-bezier(0.25, 1, 0.5, 1)' });
        
        impactContainer.appendChild(p);
      });
      
      worldRef.current.appendChild(dmgEl);
      worldRef.current.appendChild(impactContainer);
      
      dmgEl.animate([
        { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
        { transform: 'translate(-50%, -30px) scale(1.5)', opacity: 0 }
      ], { duration: 800, easing: 'ease-out' });
      
      setTimeout(() => {
        if (dmgEl.parentNode) dmgEl.parentNode.removeChild(dmgEl);
        if (impactContainer.parentNode) impactContainer.parentNode.removeChild(impactContainer);
      }, 800);"""


new_impact = """      // Crescent Slash Strike Effect
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
      }, 800);"""

if old_impact.strip() in content:
    content = content.replace(old_impact.strip(), new_impact.strip())
else:
    print("Could not find old_impact")

with open("global-chat-game.tsx", "w") as f:
    f.write(content)
print("done")
