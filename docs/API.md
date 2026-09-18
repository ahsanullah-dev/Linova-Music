# LINOVA MUSIC — API Specification

## Base URL: `/api`

### 1. Authentication (`/api/auth`)
- `POST /register`: `{ name, email, password }` -> `{ token, user }`
- `POST /login`: `{ email, password }` -> `{ token, user }`
- `GET /me`: Header `Authorization: Bearer <token>` -> `{ user }`
- `PATCH /profile`: Update name, avatar, preferences -> `{ user }`

### 2. Music Catalog & Discovery (`/api/music`)
- `GET /home`: Returns dynamic sections (trending, new releases, artists, playlists).
- `GET /search?q=<query>&type=<tracks|artists|albums|all>`: Search catalog.
- `GET /tracks/:id`: Track details & playback info.
- `GET /artists/:id`: Artist profile, top tracks, albums.
- `GET /albums/:id`: Album info & full tracklist.
- `GET /recommendations`: Rule-based recommendations tailored to user signals.
- `GET /status`: Music provider health, active provider, capabilities.

### 3. User Library (`/api/library`)
- `GET /liked`: List user's liked tracks.
- `POST /liked/:trackId`: Like a track.
- `DELETE /liked/:trackId`: Remove like from a track.
- `GET /saved-albums`: List saved albums.
- `POST /saved-albums/:albumId`: Save album.
- `DELETE /saved-albums/:albumId`: Remove saved album.
- `GET /saved-artists`: List saved artists.
- `POST /saved-artists/:artistId`: Follow artist.
- `DELETE /saved-artists/:artistId`: Unfollow artist.

### 4. Playlists (`/api/playlists`)
- `GET /`: List current user's playlists.
- `POST /`: Create playlist `{ name, description, coverImage }`.
- `GET /:id`: Get playlist by ID with tracks.
- `PATCH /:id`: Update playlist metadata.
- `DELETE /:id`: Delete playlist.
- `POST /:id/tracks`: Add track `{ track }`.
- `DELETE /:id/tracks/:trackId`: Remove track from playlist.
- `PATCH /:id/reorder`: Reorder tracks `{ sourceIndex, destinationIndex }`.

### 5. Listening History & Lyrics (`/api/history`, `/api/lyrics`)
- `GET /history`: Get recent listening events.
- `POST /history`: Record playback event `{ trackId, completionPercentage }`.
- `GET /lyrics?trackId=<id>&title=<title>&artist=<artist>`: Get synced or plain lyrics.
