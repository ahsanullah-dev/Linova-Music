import React, { Suspense, lazy } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { AppShell } from '../components/layout/AppShell.jsx';
import { HomePage } from '../pages/Home/HomePage.jsx';
import { Loader2 } from 'lucide-react';

// Everything except the landing page is code-split: previously every route
// (including the AI chat page, settings, artist/album/playlist pages) was
// imported eagerly, so the very first page load had to download and parse
// all of them before the app could paint anything. Splitting these into
// separate chunks means the initial bundle only contains what Home needs.
const SearchPage = lazy(() => import('../pages/Search/SearchPage.jsx').then(m => ({ default: m.SearchPage })));
const ArtistPage = lazy(() => import('../pages/Artist/ArtistPage.jsx').then(m => ({ default: m.ArtistPage })));
const AlbumPage = lazy(() => import('../pages/Album/AlbumPage.jsx').then(m => ({ default: m.AlbumPage })));
const PlaylistPage = lazy(() => import('../pages/Playlist/PlaylistPage.jsx').then(m => ({ default: m.PlaylistPage })));
const LibraryPage = lazy(() => import('../pages/Library/LibraryPage.jsx').then(m => ({ default: m.LibraryPage })));
const SettingsPage = lazy(() => import('../pages/Settings/SettingsPage.jsx').then(m => ({ default: m.SettingsPage })));
const ProviderStatusPage = lazy(() => import('../pages/Status/ProviderStatusPage.jsx').then(m => ({ default: m.ProviderStatusPage })));
const AIChatPage = lazy(() => import('../pages/AI/AIChatPage.jsx').then(m => ({ default: m.AIChatPage })));

const RouteFallback = () => (
  <div className="flex items-center justify-center h-full py-24">
    <Loader2 className="w-6 h-6 text-linova-primary animate-spin" />
  </div>
);

const withSuspense = (element) => <Suspense fallback={<RouteFallback />}>{element}</Suspense>;

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomePage /> },
      { path: 'search', element: withSuspense(<SearchPage />) },
      { path: 'artist/:id', element: withSuspense(<ArtistPage />) },
      { path: 'album/:id', element: withSuspense(<AlbumPage />) },
      { path: 'playlist/:id', element: withSuspense(<PlaylistPage />) },
      { path: 'library', element: withSuspense(<LibraryPage />) },
      { path: 'settings', element: withSuspense(<SettingsPage />) },
      { path: 'status', element: withSuspense(<ProviderStatusPage />) },
      { path: 'ai', element: withSuspense(<AIChatPage />) },
      { path: '*', element: <Navigate to="/" replace /> }
    ]
  }
]);
