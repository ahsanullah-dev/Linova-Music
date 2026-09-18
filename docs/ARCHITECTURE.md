# LINOVA MUSIC — System Architecture Document

## 1. High-Level Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                              LINOVA MUSIC CLIENT                                  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                        React 18 + Vite + Tailwind CSS                       |  |
|  |                                                                             |  |
|  |  +-------------------+  +-------------------+  +-------------------------+  |  |
|  |  |   UI Components   |  |   Zustand Stores  |  |     Player Adapter      |  |  |
|  |  | (Shell, Cards,    |  | (Player, Auth,    |  | (HTML5 Audio, Embeds,   |  |  |
|  |  |  Lyrics, Modals)  |  |  Offline, App)    |  |  IndexedDB offline blob)|  |  |
|  |  +-------------------+  +-------------------+  +-------------------------+  |  |
|  |                               |                             |               |  |
|  |                    IndexedDB Storage Layer                  |               |  |
|  |               (Offline Audio Blobs & Metadata)              |               |  |
|  +-----------------------------------------------------------------------------+  |
+----------------------------------------|------------------------------------------+
                                         | REST API (HTTP / JSON)
                                         v
+-----------------------------------------------------------------------------------+
|                              LINOVA MUSIC SERVER                                  |
|                                                                                   |
|  +-----------------------------------------------------------------------------+  |
|  |                      Express.js REST API + Middleware                       |  |
|  |                     (Auth, RateLimit, Helmet, Cors)                         |  |
|  +-----------------------------------------------------------------------------+  |
|            |                                   |                    |             |
|            v                                   v                    v             |
|   +------------------+                +------------------+ +--------------------+ |
|   |  Auth & User API |                |  Music Discovery | | Rule Recommendation| |
|   +------------------+                +------------------+ +--------------------+ |
|            |                                   |                                  |
|            v                                   v                                  |
|   +------------------+                +-----------------------------------------+ |
|   | MongoDB Database |                |         Music Provider Adapter          | |
|   | (Users, Playlists|                +-----------------------------------------+ |
|   |  Likes, History) |                | MockProvider  |  YouTubeMusicProvider   | |
|   +------------------+                +-----------------------------------------+ |
+-----------------------------------------------------------------------------------+
```

## 2. Frontend Layer Architecture
- **Framework:** React 18 with Vite for lightning fast HMR and optimized builds.
- **Styling:** Custom Tailwind CSS configuration with Spotify-inspired Linova dark theme tokens.
- **State Management:**
  - `playerStore`: Tracks, playback state, queue, shuffle/repeat, audio progress.
  - `authStore`: Current user session and authentication token.
  - `offlineStore`: Local offline downloads tracking and IndexedDB synchronization.
  - `appStore`: UI dialogs, toasts, active tabs, theme.
- **Offline Storage:** Browser `IndexedDB` storing binary audio Blobs for offline playback.

## 3. Backend Layer Architecture
- **Server:** Node.js + Express.
- **Data Persistence:** MongoDB via Mongoose with an in-memory/file fallback for zero-dependency standalone execution.
- **Provider Layer:** Abstract `MusicProvider` interface with `MockMusicProvider` and experimental `YouTubeMusicProvider`.
