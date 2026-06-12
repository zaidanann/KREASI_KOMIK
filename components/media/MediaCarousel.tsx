"use client";

import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import { useState, useCallback } from "react";
import { cn } from "@/utils/cn";

interface Media {
  id: string;
  url: string;
  type: "IMAGE" | "VIDEO";
  width?: number | null;
  height?: number | null;
  order: number;
}

export function MediaCarousel({ media }: { media: Media[] }) {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: false, dragFree: false });
  const [current, setCurrent] = useState(0);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
    setCurrent((c) => Math.max(0, c - 1));
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
    setCurrent((c) => Math.min(media.length - 1, c + 1));
  }, [emblaApi, media.length]);

  if (media.length === 0) return null;

  // Single media
  if (media.length === 1) {
    const m = media[0];
    return m.type === "VIDEO" ? (
      <video src={m.url} controls className="w-full max-h-[500px] object-contain bg-black rounded-xl" />
    ) : (
      <div className="relative w-full aspect-[4/3] bg-dark-300">
        <Image src={m.url} alt="Post media" fill className="object-cover" sizes="600px" />
      </div>
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {media.map((m) => (
            <div key={m.id} className="relative flex-[0_0_100%] min-w-0">
              {m.type === "VIDEO" ? (
                <video src={m.url} controls className="w-full max-h-[500px] object-contain bg-black" />
              ) : (
                <div className="relative w-full aspect-[4/3] bg-dark-300">
                  <Image src={m.url} alt="Post media" fill className="object-cover" sizes="600px" />
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Nav Buttons */}
      {current > 0 && (
        <button onClick={scrollPrev}
          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
          <ChevronLeft className="w-4 h-4 text-white" />
        </button>
      )}
      {current < media.length - 1 && (
        <button onClick={scrollNext}
          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 flex items-center justify-center hover:bg-black/80 transition-colors">
          <ChevronRight className="w-4 h-4 text-white" />
        </button>
      )}

      {/* Dots */}
      <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1">
        {media.map((_, i) => (
          <div key={i} className={cn("w-1.5 h-1.5 rounded-full transition-all", i === current ? "bg-white w-3" : "bg-white/40")} />
        ))}
      </div>
    </div>
  );
}
