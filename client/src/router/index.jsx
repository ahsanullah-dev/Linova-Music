import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.jsx';
import { HomePage } from '../pages/Home/HomePage.jsx';
import { SearchPage } from '../pages/Search/SearchPage.jsx';
import { ArtistPage } from '../pages/Artist/ArtistPage.jsx';
import { AlbumPage } from '../pages/Album/AlbumPage.jsx';
import { PlaylistPage } from '../pages/Playlist/PlaylistPage.jsx';
import { LibraryPage } from '../pages/Library/LibraryPage.jsx';
import { SettingsPage } from '../pages/Settings/SettingsPage.jsx';
import { ProviderStatusPage } from '../pages/Status/ProviderStatusPage.jsx';
import { AIChatPage } from '../pages/AI/AIChatPage.jsx';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: <SearchPage /> },
      { path: 'artist/:id', element: <ArtistPage /> },
      { path: 'album/:id', element: <AlbumPage /> },
      { path: 'playlist/:id', element: <PlaylistPage /> },
      { path: 'library', element: <LibraryPage /> },
      { path: 'settings', element: <SettingsPage /> },
      { path: 'status', element: <ProviderStatusPage /> },
      { path: 'ai', element: <AIChatPage /> },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
