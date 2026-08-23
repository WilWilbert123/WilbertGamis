"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LiveViewCount() {
  const [count, setCount] = useState(1);

  useEffect(() => {
    // Connect to a Supabase Presence channel
    const channel = supabase.channel('global-visitors', {
      config: {
        presence: {
          // Use a random key for each visitor session
          key: Math.random().toString(36).substring(2, 15),
        },
      },
    });

    // Listen for presence state changes (when people join or leave)
    channel.on('presence', { event: 'sync' }, () => {
      const state = channel.presenceState();
      // Count the number of distinct visitor keys
      const numUsers = Object.keys(state).length;
      const finalCount = numUsers > 0 ? numUsers : 1;
      setCount(finalCount);
      
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('live-view-sync', { detail: finalCount }));
      }
    });

    // Subscribe to the channel and track this user
    channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.track({
          online_at: new Date().toISOString(),
        });
      }
    });

    return () => {
      // Clean up and untrack when the user closes the tab
      channel.unsubscribe();
    };
  }, []);

  return (
    <span className="inline-flex items-center gap-2 text-xs text-green-500 translate-y-[2px] md:translate-y-0">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
      </span>
      {count} {count === 1 ? '' : ''}
    </span>
  );
}
