import React from 'react';
import { Maximize2, X, Sparkles, Mic2 } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore.js';
import { LyricsViewer } from './LyricsViewer.jsx';

export const MiddleLyricsView = () => {
  const { currentTrack, toggleLyrics, setIsExpanded, lyrics } = usePlayerStore();

  if (!currentTrack) return null;

  return (
    <div className="h-full flex flex-col rounded-2xl overflow-hidden bg-gradient-to-b from-indigo-950/40 via-[#121216] to-[#09090b] border border-white/5 shadow-2xl animate-in fade-in zoom-in-95 duration-200">
      {/* Top Action Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-white/5 bg-black/20 flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 rounded-xl overflow-hidden shadow-md flex-shrink-0 border border-white/10">
            <img
              src={currentTrack.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=300&auto=format&fit=crop&q=80'}
              alt={currentTrack.title}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <h3 className="text-sm font-bold text-white truncate">{currentTrack.title}</h3>
            <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
          </div>
        </div>

        {/* View Switchers: Fullscreen & Close */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsExpanded(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 hover:bg-white/15 text-gray-300 hover:text-white text-xs font-bold transition-all border border-white/5"
            title="Open Full Screen Player"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Full Screen</span>
          </button>

          <button
            onClick={toggleLyrics}
            className="p-1.5 rounded-full text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Close Lyrics View"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Center Synchronized Lyrics Display */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 sm:px-10 py-6 scrollbar-none">
        <LyricsViewer />
      </div>
    </div>
  );
};
