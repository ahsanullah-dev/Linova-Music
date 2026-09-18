# LINOVA MUSIC — Product Requirements Document (PRD)

## 1. Executive Summary
LINOVA MUSIC is a modern, high-performance, dark-first music web application and installable Progressive Web Application (PWA). It provides a Spotify-caliber streaming experience with music discovery, persistent global playback, user libraries, custom playlists, offline music downloads via client-side storage, and a provider-agnostic catalog architecture.

## 2. Target Audience & Form Factors
- **Desktop Web & Desktop App (PWA):** Sidebar layout, wide-screen hero carousels, persistent bottom player, queue drawer, keyboard shortcuts.
- **Mobile Web & Mobile App (PWA):** Touch-optimized bottom navigation, swipeable drawers, expandable bottom-sheet player, offline playback.

## 3. Core Functional Requirements

### 3.1 Music Discovery & Catalog
- Dynamic Home page with personalized greeting, trending songs, popular artists, new releases, and curated playlists.
- Instant search across tracks, artists, albums, and playlists with debouncing.
- Artist pages with bio, top tracks, discography, and related artists.
- Album pages with tracklist, total duration, and release metadata.

### 3.2 Persistent Playback Engine
- Persistent audio player supporting Play, Pause, Next, Previous, Seek, Volume, Mute, Shuffle, and Repeat (Off / All / One).
- Dynamic Queue management: Play Next, Add to Queue, Reorder Queue, Clear Queue.
- Expanded Fullscreen Player and synchronized Lyrics panel.
- Media Session API integration for OS lock screen and keyboard media keys control.

### 3.3 Offline Music & Downloads
- Client-side audio Blob and metadata persistence using IndexedDB.
- Offline playback fallback in `PlayerAdapter` when disconnected from network.
- Dedicated "Downloaded Music" section in user Library.
- Offline storage management and cache clearing in Settings.

### 3.4 User Library & Personalization
- User registration, login, and secure JWT session management.
- Liked Songs collection with instant toggle.
- Saved Albums and Saved Artists.
- Custom user playlists (Create, Rename, Delete, Add Track, Remove Track, Reorder).
- Listening history logging and rule-based recommendations ("Because you listened to X", "Similar Artists").

### 3.5 PWA & App Capabilities
- Web App Manifest and Service Worker for offline app shell and installable desktop/mobile experience.
- Responsive breakpoints (mobile, tablet, desktop, ultra-wide).
