import React from 'react';
import { X, Trash2, Play, Music } from 'lucide-react';
import { usePlayerStore } from '../../stores/playerStore.js';

export const QueueDrawer = () => {
  const {
    isQueueOpen,
    toggleQueue,
    queue,
    currentIndex,
    currentTrack,
    playTrack,
    removeFromQueue,
    clearQueue
  } = usePlayerStore();

  if (!isQueueOpen) return null;

  return (
    <div className="fixed top-0 right-0 bottom-20 md:bottom-24 w-80 md:w-96 bg-background-elevated/95 backdrop-blur-2xl border-l border-white/10 z-40 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* Header */}
      <div className="p-4 border-b border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Music className="w-5 h-5 text-linova-primary" />
          <h3 className="font-bold text-white text-base">Play Queue</h3>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={clearQueue}
            className="text-xs text-gray-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5"
            title="Clear Queue"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Clear</span>
          </button>
          <button
            onClick={toggleQueue}
            className="p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            aria-label="Close Queue"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Content List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Currently Playing */}
        {currentTrack && (
          <div>
            <span className="text-[11px] font-bold text-linova-primary uppercase tracking-wider block mb-2">
              Now Playing
            </span>
            <div className="flex items-center gap-3 p-2.5 rounded-xl bg-linova-primary/10 border border-linova-primary/20">
              <img
                src={currentTrack.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'}
                alt={currentTrack.title}
                className="w-10 h-10 rounded-lg object-cover"
              />
              <div className="flex-1 min-w-0">
                <h5 className="text-sm font-bold text-white truncate">{currentTrack.title}</h5>
                <p className="text-xs text-gray-400 truncate">{currentTrack.artist}</p>
              </div>
            </div>
          </div>
        )}

        {/* Up Next List */}
        <div>
          <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block mb-2">
            Next In Queue ({Math.max(0, queue.length - currentIndex - 1)})
          </span>

          {queue.length <= currentIndex + 1 ? (
            <div className="py-6 text-center text-xs text-gray-500 italic">
              Queue is empty. Add songs from album or search!
            </div>
          ) : (
            <div className="space-y-1.5">
              {queue.slice(currentIndex + 1).map((track, relativeIdx) => {
                const actualIndex = currentIndex + 1 + relativeIdx;
                return (
                  <div
                    key={`${track.id}-${actualIndex}`}
                    className="group flex items-center gap-3 p-2 rounded-xl hover:bg-white/5 transition-colors select-none"
                  >
                    <img
                      src={track.artwork || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'}
                      alt={track.title}
                      className="w-9 h-9 rounded-lg object-cover"
                    />

                    <div
                      onClick={() => playTrack(track, queue)}
                      className="flex-1 min-w-0 cursor-pointer"
                    >
                      <h5 className="text-xs font-semibold text-gray-200 group-hover:text-linova-primary truncate">
                        {track.title}
                      </h5>
                      <p className="text-[11px] text-gray-400 truncate">{track.artist}</p>
                    </div>

                    <button
                      onClick={() => removeFromQueue(actualIndex)}
                      className="p-1 text-gray-500 hover:text-rose-400 opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
