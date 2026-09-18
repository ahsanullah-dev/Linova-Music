import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck } from 'lucide-react';

export const ArtistCard = ({ artist }) => {
  const navigate = useNavigate();

  if (!artist) return null;

  return (
    <div
      onClick={() => navigate(`/artist/${artist.id}`)}
      className="linova-glass-card group p-4 rounded-2xl cursor-pointer flex flex-col items-center text-center transition-all duration-300"
    >
      <div className="relative w-28 h-28 sm:w-32 sm:h-32 rounded-full overflow-hidden mb-3 bg-black/40 shadow-xl group-hover:scale-105 group-hover:ring-2 group-hover:ring-linova-primary/50 transition-all duration-500">
        <img
          src={artist.avatar || 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80'}
          alt={artist.name}
          referrerPolicy="no-referrer"
          loading="lazy"
          onError={(e) => {
            e.currentTarget.src = 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=500&auto=format&fit=crop&q=80';
          }}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="flex items-center gap-1 max-w-full">
        <h4 className="text-sm font-bold text-gray-100 group-hover:text-linova-cyan truncate transition-colors">
          {artist.name}
        </h4>
        {artist.verified && (
          <BadgeCheck className="w-4 h-4 text-linova-cyan fill-linova-cyan/20 flex-shrink-0" />
        )}
      </div>

      <p className="text-[11px] text-gray-400 mt-1 truncate max-w-full">
        {artist.monthlyListeners || 'Verified Artist'}
      </p>
    </div>
  );
};
