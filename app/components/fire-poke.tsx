"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { Flame } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface FloatingFire {
  id: number;
  xPercent: number; // 10% to 90% across screen width
  size: number; // font size in px
  duration: number; // animation duration in seconds
  rotation: number;
}

export default function FirePoke() {
  const [count, setCount] = useState<number>(0);
  const [floatingFires, setFloatingFires] = useState<FloatingFire[]>([]);
  const [isClicking, setIsClicking] = useState(false);
  const nextId = useRef(0);
  const channelRef = useRef<any>(null);

  // Helper function to format numbers like 1.2k, 2k, etc.
  const formatCount = (num: number) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1).replace(/\.0$/, "") + "M";
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1).replace(/\.0$/, "") + "k";
    }
    return num.toString();
  };

  // Spawn a screen-wide floating fire effect starting from bottom of screen
  const triggerFloatingFire = useCallback(() => {
    const id = nextId.current++;
    // Spread horizontally across screen (10% to 90%)
    const xPercent = 10 + Math.random() * 80;
    const size = Math.floor(28 + Math.random() * 28); // 28px up to 56px (starts small, expands)
    const duration = 2.4 + Math.random() * 0.8; // 2.4s to 3.2s smooth floating animation
    const rotation = (Math.random() - 0.5) * 40;

    setFloatingFires((prev) => [...prev, { id, xPercent, size, duration, rotation }]);

    // Clean up fire object after animation completes
    setTimeout(() => {
      setFloatingFires((prev) => prev.filter((f) => f.id !== id));
    }, duration * 1000);
  }, []);

  useEffect(() => {
    // 1. Fetch initial count from Supabase
    const fetchInitialCount = async () => {
      const { data, error } = await supabase
        .from("pokes")
        .select("count")
        .eq("id", "fire-count")
        .single();

      if (data && !error) {
        setCount(Number(data.count));
      }
    };

    fetchInitialCount();

    // 2. Setup Realtime Broadcast channel for instant float animations across all visitors
    const channel = supabase.channel("fire-poke-room");
    channelRef.current = channel;

    channel
      .on("broadcast", { event: "fire-click" }, (payload) => {
        if (payload.payload?.newCount) {
          setCount(payload.payload.newCount);
        } else {
          setCount((prev) => prev + 1);
        }
        triggerFloatingFire();
      })
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table: "pokes", filter: "id=eq.fire-count" },
        (payload) => {
          if (payload.new && typeof payload.new.count === "number") {
            setCount(payload.new.count);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [triggerFloatingFire]);

  // Handle user click action
  const handlePoke = async () => {
    // Quick visual button bounce
    setIsClicking(true);
    setTimeout(() => setIsClicking(false), 200);

    // Optimistic local update & trigger floating fire bubble
    setCount((prev) => prev + 1);
    triggerFloatingFire();

    // Broadcast fire click in realtime to all online visitors
    if (channelRef.current) {
      channelRef.current.send({
        type: "broadcast",
        event: "fire-click",
        payload: { newCount: count + 1 },
      });
    }

    // Increment in Supabase database atomically via RPC function
    try {
      const { data, error } = await supabase.rpc("increment_poke", {
        poke_id: "fire-count",
      });

      if (error) {
        // Fallback: direct update
        const { data: updatedData } = await supabase
          .from("pokes")
          .update({ count: count + 1 })
          .eq("id", "fire-count")
          .select("count")
          .single();

        if (updatedData) {
          setCount(Number(updatedData.count));
        }
      } else if (data !== null) {
        setCount(Number(data));
      }
    } catch (err) {
      console.error("Error updating fire count:", err);
    }
  };

  return (
    <>
      {/* Screen-wide Floating Fires Container (Fixed across browser viewport) */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-[9999]">
        {floatingFires.map((fire) => (
          <span
            key={fire.id}
            className="fixed select-none animate-bubble-fire"
            style={{
              left: `${fire.xPercent}%`,
              bottom: "-50px",
              fontSize: `${fire.size}px`,
              animationDuration: `${fire.duration}s`,
            }}
          >
            🔥
          </span>
        ))}
      </div>

      {/* Interactive Fire Button */}
      <div className="relative inline-flex items-center">
        <button
          onClick={handlePoke}
          title="Send a Fire Poke! 🔥"
          className={`group relative flex items-center gap-1 px-1.5 py-1 rounded font-['Silkscreen'] text-xs font-bold transition-all duration-150 active:scale-90 bg-transparent text-foreground hover:opacity-80 ${
            isClicking ? "scale-125 text-orange-500" : ""
          }`}
        >
          <Flame
            size={16}
            className={`text-orange-500 transition-transform group-hover:scale-125 group-hover:rotate-12 ${
              isClicking ? "animate-bounce scale-125" : ""
            }`}
          />
          <span className="tabular-nums tracking-wider">{formatCount(count)}</span>
        </button>

        {/* Global Keyframes for Straight Vertical Floating Bubble Fire */}
        <style jsx global>{`
          @keyframes bubbleFire {
            0% {
              opacity: 0;
              transform: translateY(0) scale(0.3);
            }
            15% {
              opacity: 1;
              transform: translateY(-20vh) scale(0.9);
            }
            60% {
              opacity: 0.9;
              transform: translateY(-60vh) scale(1.7);
            }
            100% {
              opacity: 0;
              transform: translateY(-110vh) scale(2.4);
            }
          }
          .animate-bubble-fire {
            animation: bubbleFire linear forwards;
          }
        `}</style>
      </div>
    </>
  );
}
