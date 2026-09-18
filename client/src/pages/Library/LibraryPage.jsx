import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useLibraryStore } from '../../stores/libraryStore.js';
import { useOfflineStore } from '../../stores/offlineStore.js';
import { useAppStore } from '../../stores/appStore.js';
import { usePlayerStore } from '../../stores/playerStore.js';
import { TrackRow } from '../../components/music/TrackRow.jsx';
import { PlaylistCard } from '../../components/music/PlaylistCard.jsx';
import { AlbumCard } from '../../components/music/AlbumCard.jsx';
import { ArtistCard } from '../../components/music/ArtistCard.jsx';
import {
  Heart,
  ArrowDownToLine,
  ListMusic,
  Disc,
  User,
  History,
  Play,
  Shuffle,
  Plus,
  HardDrive
} from 'lucide-react';

export const LibraryPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'liked';

  const {
    likedTracks,
    playlists,
    savedAlbums,
    savedArtists,
    history,
    isLoading
  } = useLibraryStore();

  const { downloadedTracks, storageUsage, refreshDownloads } = useOfflineStore();
  const { openCreatePlaylistModal } = useAppStore();
  const { playTrack, toggleShuffle } = usePlayerStore();

  useEffect(() => {
    refreshDownloads();
  }, []);

  const handleTabChange = (tabId) => {
    setSearchParams({ tab: tabId });
  };

  const handlePlayCollection = (tracks, shuffle = false) => {
    if (tracks && tracks.length > 0) {
      if (shuffle) toggleShuffle();
      playTrack(tracks[0], tracks);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Library Tabs Nav */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-white/5">
        {[
          { id: 'liked', label: 'Liked Songs', count: likedTracks.length, icon: Heart },
          { id: 'downloaded', label: 'Downloaded Offline', count: downloadedTracks.length, icon: ArrowDownToLine },
          { id: 'playlists', label: 'Playlists', count: playlists.length, icon: ListMusic },
          { id: 'albums', label: 'Albums', count: savedAlbums.length, icon: Disc },
          { id: 'artists', label: 'Artists', count: savedArtists.length, icon: User },
          { id: 'history', label: 'Recently Played', count: history.length, icon: History }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => handleTabChange(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                isActive
                  ? 'bg-linova-primary text-white shadow-md shadow-linova-primary/20'
                  : 'bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'fill-current' : ''}`} />
              <span>{tab.label}</span>
              {tab.count !== undefined && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-white/10 text-gray-400'
                }`}>
                  {tab.count}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Liked Songs Tab */}
      {activeTab === 'liked' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-pink-950/40 via-purple-950/40 to-background-card border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-indigo-500 to-pink-500 flex items-center justify-center text-white shadow-xl">
                <Heart className="w-8 h-8 fill-white" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white">Liked Songs</h2>
                <p className="text-xs text-gray-400 mt-1">{likedTracks.length} favorite tracks</p>
              </div>
            </div>

            {likedTracks.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePlayCollection(likedTracks, false)}
                  className="px-5 py-2.5 rounded-full bg-linova-primary text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play All</span>
                </button>
                <button
                  onClick={() => handlePlayCollection(likedTracks, true)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Shuffle"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {likedTracks.length === 0 ? (
            <div className="py-20 text-center text-gray-500 italic">
              You haven't liked any songs yet. Tap the heart on any track to save it here!
            </div>
          ) : (
            <div className="space-y-1">
              {likedTracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i}
                  contextQueue={likedTracks}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Downloaded Offline Tab */}
      {activeTab === 'downloaded' && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-6 rounded-3xl bg-gradient-to-r from-emerald-950/40 via-teal-950/40 to-background-card border border-white/5">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white shadow-xl">
                <ArrowDownToLine className="w-8 h-8" />
              </div>
              <div>
                <h2 className="text-2xl font-extrabold text-white">Downloaded for Offline</h2>
                <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                  <HardDrive className="w-3.5 h-3.5 text-emerald-400" />
                  <span>{downloadedTracks.length} tracks • {storageUsage.totalMB} MB stored locally</span>
                </div>
              </div>
            </div>

            {downloadedTracks.length > 0 && (
              <div className="flex items-center gap-3">
                <button
                  onClick={() => handlePlayCollection(downloadedTracks, false)}
                  className="px-5 py-2.5 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-lg hover:scale-105 transition-all"
                >
                  <Play className="w-4 h-4 fill-white" />
                  <span>Play Offline</span>
                </button>
                <button
                  onClick={() => handlePlayCollection(downloadedTracks, true)}
                  className="p-2.5 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
                  title="Shuffle Offline"
                >
                  <Shuffle className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {downloadedTracks.length === 0 ? (
            <div className="py-20 text-center space-y-2 text-gray-400">
              <ArrowDownToLine className="w-12 h-12 text-gray-600 mx-auto" />
              <h4 className="font-bold text-white text-base">No downloaded songs yet</h4>
              <p className="text-xs text-gray-500 max-w-sm mx-auto">
                Download your favorite songs and albums so you can keep listening even without an internet connection.
              </p>
            </div>
          ) : (
            <div className="space-y-1">
              {downloadedTracks.map((track, i) => (
                <TrackRow
                  key={track.id}
                  track={track}
                  index={i}
                  contextQueue={downloadedTracks}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Playlists Tab */}
      {activeTab === 'playlists' && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {/* Create Playlist Button Card */}
            <div
              onClick={openCreatePlaylistModal}
              className="glass-card aspect-square rounded-2xl flex flex-col items-center justify-center p-4 cursor-pointer hover:border-linova-primary/50 transition-all group text-center"
            >
              <div className="w-14 h-14 rounded-full bg-white/5 group-hover:bg-linova-primary group-hover:text-white flex items-center justify-center text-gray-400 mb-3 transition-colors shadow-lg">
                <Plus className="w-7 h-7" />
              </div>
              <h4 className="font-bold text-sm text-gray-200 group-hover:text-white">
                Create Playlist
              </h4>
              <p className="text-[11px] text-gray-500 mt-0.5">New custom collection</p>
            </div>

            {playlists.map((pl) => (
              <PlaylistCard key={pl._id} playlist={pl} />
            ))}
          </div>
        </div>
      )}

      {/* Albums Tab */}
      {activeTab === 'albums' && (
        <div className="space-y-6">
          {savedAlbums.length === 0 ? (
            <div className="py-20 text-center text-gray-500 italic">
              No saved albums yet. Save albums from the album pages!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {savedAlbums.map((item) => (
                <AlbumCard key={item.albumId || item._id} album={item.album || item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Artists Tab */}
      {activeTab === 'artists' && (
        <div className="space-y-6">
          {savedArtists.length === 0 ? (
            <div className="py-20 text-center text-gray-500 italic">
              No followed artists yet. Follow artists to keep up with new releases!
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {savedArtists.map((item) => (
                <ArtistCard key={item.artistId || item._id} artist={item.artist || item} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="space-y-6">
          {history.length === 0 ? (
            <div className="py-20 text-center text-gray-500 italic">
              No listening history yet. Start playing songs to see your playback trail!
            </div>
          ) : (
            <div className="space-y-1">
              {history.map((record, i) => (
                <TrackRow
                  key={`${record._id || record.trackId}-${i}`}
                  track={record.track}
                  index={i}
                  contextQueue={history.map(h => h.track)}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
