"use client";

import { useState } from "react";
import toast from "react-hot-toast";

export function useFollow(
  targetUserId: string,
  initialFollowing: boolean,
  initialCount: number
) {
  const [following, setFollowing] = useState(initialFollowing);
  const [count, setCount] = useState(initialCount);
  const [isLoading, setIsLoading] = useState(false);

  const toggle = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/follow", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });
      const json = await res.json();
      setFollowing(json.following);
      setCount(json.followerCount);
    } catch {
      toast.error("Gagal memproses follow");
    } finally {
      setIsLoading(false);
    }
  };

  return { following, count, isLoading, toggle };
}
