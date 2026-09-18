import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, ListMusic } from 'lucide-react';

export const PlaylistCard = ({ playlist }) => {
  const navigate = useNavigate();

  if (!playlist) return null;

  return (
    <div
      onClick={() => navigate(`/playlist/${playlist._id || playlist.id}`)}
      className="linova-glass-card group p-3 rounded-2xl cursor-pointer flex flex-col transition-all duration-300 relative"
    >
      <div className="relative aspect-square w-full rounded-xl overflow-hidden mb-3 bg-black/40 shadow-inner">
        <img
          src={playlist.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80'}
          alt={playlist.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <div className="w-11 h-11 rounded-full bg-gradient-to-r from-linova-primary to-linova-cyan text-white flex items-center justify-center shadow-xl shadow-black/70 transform scale-90 group-hover:scale-100 transition-transform">
            <Play className="w-4 h-4 fill-white ml-0.5" />
          </div>
        </div>
      </div>

      <h4 className="text-sm font-bold text-gray-100 group-hover:text-linova-cyan truncate transition-colors">
        {playlist.name}
      </h4>
      <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">
        {playlist.description || `${playlist.trackCount || playlist.tracks?.length || 0} tracks`}
      </p>
    </div>
  );
};
