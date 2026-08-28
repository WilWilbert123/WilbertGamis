import re

with open("global-chat-game.tsx", "r") as f:
    content = f.read()

# 1. Remove usePets import
content = content.replace('import { usePets } from "./pet-system";\n', '')

# 2. Add GamePet interface
pet_interface = """
interface GamePet {
  id: string;
  type: "fox" | "dog" | "turtle" | "snake";
  x: number;
  y: number;
  vx: number;
  vy: number;
  flipX: boolean;
  isWalking: boolean;
  scale: number;
  speed: number;
  idleDuration: number;
  nextActionTime: number;
  targetX?: number;
  targetY?: number;
}
"""
content = content.replace("interface Player {", pet_interface + "\ninterface Player {")

# 3. Add PET_SPEEDS
pet_speeds = """
const PET_SPEEDS: Record<string, number> = {
  fox: 60,
  dog: 60,
  turtle: 20,
  snake: 30
};
"""
content = content.replace("interface GlobalChatGameProps {", pet_speeds + "\ninterface GlobalChatGameProps {")

# 4. Remove old usePets and useEffect
old_use_pets = """  const { spawnMapPets, clearPets } = usePets();

  // Spawn pets when map changes
  useEffect(() => {
    if (isPlaying) {
      if (currentMapId === "amazon") {
        spawnMapPets("amazon");
      } else {
        clearPets();
      }
    }
  }, [currentMapId, isPlaying, spawnMapPets, clearPets]);"""
content = content.replace(old_use_pets, "")

# 5. Add local pets state and logic
local_pets_logic = """  // Map Pets
  const [mapPets, setMapPets] = useState<GamePet[]>([]);
  const petsRef = useRef<GamePet[]>([]);

  // Spawn pets when map changes
  useEffect(() => {
    if (isPlaying && currentMapId === "amazon") {
      const amazonPets: { type: "fox" | "dog" | "turtle" | "snake", count: number }[] = [
        { type: "fox", count: 10 },
        { type: "dog", count: 12 },
        { type: "turtle", count: 9 },
        { type: "snake", count: 5 }
      ];
      
      const newPets: GamePet[] = [];
      amazonPets.forEach(({ type, count }) => {
        for (let i = 0; i < count; i++) {
          newPets.push({
            id: `pet-${type}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            x: Math.random() * MAP_WIDTH,
            y: Math.random() * MAP_HEIGHT,
            vx: 0,
            vy: 0,
            flipX: Math.random() > 0.5,
            isWalking: false,
            scale: 0.6 + Math.random() * 0.8,
            speed: PET_SPEEDS[type] + (Math.random() * 20 - 10),
            idleDuration: 4000 + Math.random() * 2000,
            nextActionTime: Date.now() + Math.random() * 3000
          });
        }
      });
      petsRef.current = newPets;
      setMapPets(newPets);
    } else {
      petsRef.current = [];
      setMapPets([]);
    }
  }, [currentMapId, isPlaying]);"""

content = content.replace('const [currentMapId, setCurrentMapId] = useState("forest");', 'const [currentMapId, setCurrentMapId] = useState("forest");\n\n' + local_pets_logic)

with open("global-chat-game.tsx", "w") as f:
    f.write(content)

