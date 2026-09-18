# 🎧 LINOVA MUSIC — High-Fidelity Streaming Platform & AI Music Companion

**Linova Music** is a high-performance, Spotify-grade music streaming web application and Progressive Web Application (PWA). It features genuine high-definition audio playback, sub-second millisecond-synchronized lyrics, genre-clustered AI recommendations, a multi-source music provider architecture, offline IndexedDB downloads, and an interactive **Music AI Companion**.

---

## 🌟 What We Have Accomplished So Far

### 1. 🎵 Multi-Source Music Provider & Playback Architecture
- **Unified Engine (`YouTubeMusicProvider`)**: Integrated `ytmusic-api` as the dynamic catalog provider, removing hardcoded static playlists.
- **True Studio Audio Fidelity**: Direct, high-bitrate audio streaming with adaptive buffer management and playback resilience.
- **Accurate Search Engine**: Support for regional and global music searches (Bangla Band/Rock legends like *Artcell, Warfaze, Shironamhin, Aftermath, Meghdol*, Bollywood romance like *Arijit Singh, Atif Aslam*, and Global hits like *Coldplay, Ed Sheeran*).
- **Branding Sanitization**: Native Linova Music branding across the entire UI with zero external vendor watermarks.

### 2. 🎤 Millisecond-Synchronized Lyrics Engine
- **Accurate Timestamps (LRCLIB Integration)**: Queries millimeter-precise `[mm:ss.xx]` synchronized LRC timestamps, replacing fake interval timing.
- **Spotify-Style Middle Tab & Fullscreen Views**:
  - **In-Viewport Lyrics**: Lyrics now render cleanly in the central viewport without disruptive modals.
  - **Expand to Fullscreen**: Toggle between compact in-tab lyrics and full-screen visualizer with ambient glow.
  - **Interactive Lyric Seeking**: Click any line to instantly jump the audio to that exact second.
  - **Solid Deep Black Aesthetics**: Pure `#09090b` / `bg-black` backdrop eliminating blurry artifacts for high typography contrast.

### 3. 🖼️ Real HD Album Cover Artwork
- **True 1:1 Square Album Covers**: Direct extraction from high-res CDNs (`=w800-h800-l90-rj`), completely eliminating black 16:9 video letterboxes and pillarboxes.
- **Hotlink & Referrer Protection**: Automatic `referrerPolicy="no-referrer"` handling to prevent 403 CDN hotlink issues.

### 4. 🧠 Spotify-Grade AI Genre Recommendation Engine
- **Genre Clustering & Taste Profiler**: Uses an intelligent genre knowledge graph to score user listening history, search terms, and likes into authentic genre clusters (*Bangla Rock & Underground*, *Bangla Indie & Acoustic*, *Bollywood Romance*, *Global Rock/Pop*).
- **Curated Daily Mix Shelves**: Replaced raw string-matching queries with curated shelves (e.g. `🎸 Daily Mix • Bangla Rock & Alternative`, `🍃 Bangla Indie & Modern Band Vibes`).

### 5. 📱 Spotify Desktop UI & Color Grading
- **Refined Matte Charcoal Palette**: Designed with Spotify's signature `#121216` / `#181818` theme and emerald green `#1ed760` accents.
- **Now Playing & Singer Details Right Panel**:
  - Live track header and large high-resolution cover artwork.
  - Verified artist green checkmark.
  - "About the Artist" discography, avatar, and listener stats.
  - Next-in-Queue preview and quick lyrics preview.
  - Easily minimized / toggled across viewport sizes.

### 6. 🤖 Interactive Music AI DJ & Song Chat (New)
- **Conversational Music Intelligence**: Chat about song meanings, music trivia, artist discography, and genre history.
- **Instagram-Style Song Sharing**: Attach and send any song into the AI chat to request similar vibes.
- **Playable Chat Cards**: AI song recommendations render as fully playable audio cards right inside the chat stream.

### 7. 💾 Offline Storage & Library System
- **IndexedDB Downloads**: Save complete tracks offline for internet-free playback with `idb-keyval`.
- **User Library**: Liked songs, custom playlist manager, drag-and-drop queue, and persistent volume/player states.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [MongoDB](https://www.mongodb.com/) (Optional — runs with built-in standalone fallback store if MongoDB is not running locally)

### Installation
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server && npm install

# Install client dependencies
cd ../client && npm install
```

### Running Locally
```bash
# From the root directory:
npm run dev
```
- **Frontend App**: `http://localhost:5173`
- **Backend API**: `http://localhost:5000`

### Running Tests
```bash
cd server && npm test
```

---

## 🛠️ Architecture & Tech Stack
- **Frontend**: React 18, Vite, Tailwind CSS, Zustand, Lucide React, React Router DOM, idb-keyval
- **Backend**: Node.js, Express.js, `ytmusic-api`, LRCLIB API, Mongoose, JWT, Helmet, CORS
- **Playback Engine**: Custom YouTube Player Engine with 100ms high-frequency precision synchronization.
