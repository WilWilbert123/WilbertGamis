import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

old_claw = """      // Claw Effect (appears on the pet)
      const clawEl = document.createElement('div');
      clawEl.className = 'absolute text-red-500 font-black pointer-events-none select-none z-[999] italic tracking-tighter';
      clawEl.style.left = `${x}px`;
      clawEl.style.top = `${y - 20}px`;
      clawEl.style.fontSize = '24px';
      clawEl.innerText = '///';
      
      worldRef.current.appendChild(dmgEl);
      worldRef.current.appendChild(clawEl);
      
      dmgEl.animate([
        { transform: 'translate(-50%, 0) scale(1)', opacity: 1 },
        { transform: 'translate(-50%, -30px) scale(1.5)', opacity: 0 }
      ], { duration: 800, easing: 'ease-out' });
      
      clawEl.animate([
        { transform: 'translate(-50%, -50%) scale(0.5) rotate(45deg)', opacity: 0.8 },
        { transform: 'translate(-50%, -50%) scale(1.5) rotate(45deg)', opacity: 0 }
      ], { duration: 400, easing: 'ease-out' });
      
      setTimeout(() => {
        if (dmgEl.parentNode) dmgEl.parentNode.removeChild(dmgEl);
        if (clawEl.parentNode) clawEl.parentNode.removeChild(clawEl);
      }, 800);"""

new_claw = """      // Pixel Particle Impact Effect
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

if old_claw.strip() in content:
    content = content.replace(old_claw.strip(), new_claw.strip())
else:
    print("Could not find old_claw")

with open("global-chat-game.tsx", "w") as f:
    f.write(content)
print("done")
