import React, { useState } from 'react';
import { X, ListPlus, Loader2, Image as ImageIcon } from 'lucide-react';
import { useAppStore } from '../../stores/appStore.js';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { useNavigate } from 'react-router-dom';

const DEFAULT_COVERS = [
  'https://images.unsplash.com/photo-1518609878373-06d740f60d8b?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
  'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=500&auto=format&fit=crop&q=80'
];

export const CreatePlaylistModal = () => {
  const navigate = useNavigate();
  const { isCreatePlaylistOpen, closeCreatePlaylistModal, showToast } = useAppStore();
  const { createPlaylist } = useLibraryStore();

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCover, setSelectedCover] = useState(DEFAULT_COVERS[0]);
  const [isLoading, setIsLoading] = useState(false);

  if (!isCreatePlaylistOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setIsLoading(true);

    try {
      const playlist = await createPlaylist({
        name: name.trim(),
        description: description.trim(),
        coverImage: selectedCover
      });
      showToast('Playlist created successfully!', 'success');
      closeCreatePlaylistModal();
      navigate(`/playlist/${playlist._id}`);
    } catch (error) {
      showToast('Failed to create playlist', 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-md bg-background-card border border-white/10 rounded-3xl p-6 shadow-2xl relative">
        <button
          onClick={closeCreatePlaylistModal}
          className="absolute top-5 right-5 p-1.5 rounded-full hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-linova-primary/20 text-linova-primary flex items-center justify-center">
            <ListPlus className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Create New Playlist</h3>
            <p className="text-xs text-gray-400">Add a custom vibe to your personal music library.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Playlist Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Midnight Cyber Vibes"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-linova-primary transition-colors"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-1">Description (Optional)</label>
            <textarea
              rows={2}
              placeholder="Give your playlist a mood or description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-linova-primary transition-colors resize-none"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-gray-300 block mb-2">Select Cover Artwork</label>
            <div className="grid grid-cols-5 gap-2">
              {DEFAULT_COVERS.map((url, i) => (
                <div
                  key={i}
                  onClick={() => setSelectedCover(url)}
                  className={`aspect-square rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${
                    selectedCover === url ? 'border-linova-primary scale-105 shadow-md shadow-linova-primary/30' : 'border-transparent opacity-60 hover:opacity-100'
                  }`}
                >
                  <img src={url} alt="Cover option" className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading || !name.trim()}
            className="w-full py-3 rounded-xl bg-linova-primary hover:bg-linova-primary/90 font-bold text-sm text-white shadow-lg shadow-linova-primary/30 flex items-center justify-center gap-2 mt-2 transition-all hover:scale-[1.02] disabled:opacity-50"
          >
            {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>Create Playlist</span>
          </button>
        </form>
      </div>
    </div>
  );
};
