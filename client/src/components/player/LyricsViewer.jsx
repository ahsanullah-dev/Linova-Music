import React, { useRef, useEffect } from 'react';
import { usePlayerStore } from '../../stores/playerStore.js';
import { Loader2, Mic2 } from 'lucide-react';

export const LyricsViewer = () => {
  const { lyrics, isLoadingLyrics, position, seek, currentTrack } = usePlayerStore();
  const activeLineRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    if (activeLineRef.current) {
      activeLineRef.current.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
      });
    }
  }, [position]);

  if (isLoadingLyrics) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-3 py-16">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
        <span className="text-sm font-medium">Fetching synchronized lyrics...</span>
      </div>
    );
  }

  if (!lyrics || !lyrics.lines || lyrics.lines.length === 0) {
    return (
      <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-2 py-16">
        <Mic2 className="w-10 h-10 text-gray-600 mb-2" />
        <p className="text-base font-bold text-gray-300">Looks like we don't have the lyrics for this song yet.</p>
        <p className="text-xs text-gray-500">Enjoy the full 320kbps high-fidelity audio stream on Linova Music.</p>
      </div>
    );
  }

  const isSynced = lyrics.synced !== false;

  // Find active line index based on current position for synced lyrics
  let activeIndex = -1;
  if (isSynced) {
    for (let i = 0; i < lyrics.lines.length; i++) {
      if (position >= lyrics.lines[i].time) {
        activeIndex = i;
      } else {
        break;
      }
    }
  }

  return (
    <div
      ref={containerRef}
      className="h-full overflow-y-auto px-4 sm:px-8 pt-4 pb-32 space-y-6 text-left max-w-2xl mx-auto scrollbar-none select-none"
    >
      <div className="pb-2">
        {isSynced ? (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-extrabold tracking-wide uppercase">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Synchronized Lyrics
          </span>
        ) : (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-gray-400 text-[11px] font-medium">
            Lyrics • Sing Along
          </span>
        )}
      </div>

      {lyrics.lines.map((line, idx) => {
        const isActive = isSynced && idx === activeIndex;
        const isPast = isSynced && idx < activeIndex;

        return (
          <p
            key={idx}
            ref={isActive ? activeLineRef : null}
            onClick={() => {
              if (isSynced && line.time !== undefined) {
                seek(line.time);
              }
            }}
            className={`text-xl sm:text-2xl md:text-3xl font-extrabold transition-all duration-300 origin-left py-1 ${
              !isSynced
                ? 'text-white/80 leading-relaxed'
                : isActive
                ? 'text-white scale-105 drop-shadow-[0_0_24px_rgba(16,185,129,0.6)] opacity-100 cursor-pointer'
                : isPast
                ? 'text-white/60 hover:text-white/90 cursor-pointer'
                : 'text-white/20 hover:text-white/50 cursor-pointer'
            }`}
          >
            {line.text}
          </p>
        );
      })}
    </div>
  );
};
