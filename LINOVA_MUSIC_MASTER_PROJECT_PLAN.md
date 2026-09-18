# LINOVA MUSIC — Full Project Plan & Master Build Prompt

## 1. PROJECT IDENTITY

**Project name:** LINOVA MUSIC  
**Project type:** Full-stack Spotify-like music web application for experimental/personal development  
**Primary goal:** Build a polished, responsive, modern music application with a large music catalog experience, search, music discovery, playlists, library, queue, favorites, history, recommendations, lyrics UI, and persistent playback.

### Important project constraint

This is an experimental project with a **$0 development budget**.

The application must be designed so that its music-source integration is isolated behind a provider abstraction. The initial experimental provider may use YouTube Music metadata/search functionality through an unofficial integration such as `ytmusicapi`, but the application must **not** implement DRM bypassing, protected-stream extraction, downloading, caching, or redistribution of copyrighted audio.

For playback, use an authorized/embedded playback mechanism where applicable. Do not attempt to obtain hidden direct audio URLs from protected services.

The codebase must remain provider-independent so a future legal/licensed provider can replace the experimental provider without rewriting the application.

---

# 2. MASTER OBJECTIVE

Build LINOVA MUSIC as a complete music platform with the following experience:

- Modern dark-first music UI
- Responsive desktop/tablet/mobile layout
- Large searchable music catalog
- Home/discovery page
- Song, artist, album and playlist pages
- Persistent global music player
- Queue management
- Shuffle
- Repeat
- Previous/next
- Seek where supported by the playback mechanism
- Volume control
- Fullscreen/expanded player
- Lyrics interface
- Like/favorite songs
- Save albums/artists
- Create and manage playlists
- Recently played
- Continue listening
- Personalized recommendations
- Search suggestions
- Authentication
- User profile
- Settings
- PWA support
- Good loading/error/empty states
- Fast navigation
- Proper backend architecture
- Clean database schema
- Secure authentication
- Provider abstraction
- Strong error handling
- Maintainable code

The final application should feel like a real production-quality music product rather than a classroom CRUD project.

---

# 3. NON-GOALS

Do NOT build:

- Spotify scraping
- Spotify audio downloading
- YouTube/YouTube Music protected-stream extraction
- DRM circumvention
- Subscription/Premium bypass
- Hidden stream URL harvesting
- Downloading copyrighted music
- Audio redistribution without authorization
- Automated account abuse
- CAPTCHA bypass
- Rate-limit bypass
- Geo-restriction bypass
- Credential harvesting
- Storing third-party authentication passwords

If an external service does not permit a requested operation, design the feature around its permitted API/player/embedding mechanism or provide a clean fallback state.

---

# 4. RECOMMENDED TECHNOLOGY STACK

## Frontend

- React
- Vite
- JavaScript or TypeScript
- React Router
- Tailwind CSS
- Zustand for global player/app state
- Axios or native fetch
- Lucide React icons
- React Hook Form where useful

## Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT authentication
- bcrypt/bcryptjs for password hashing
- dotenv
- Helmet
- CORS
- express-rate-limit
- Morgan or structured logging

## Optional utilities

- Zod for request validation
- date-fns
- Axios
- uuid where needed

## Experimental music integration

Use a dedicated music-provider service layer.

Potential initial adapter:

```text
YouTubeMusicProvider
```

The provider may use a backend-side integration such as `ytmusicapi` for metadata/search/discovery where appropriate.

Do not expose provider credentials or internal provider logic to the browser.

---

# 5. HIGH-LEVEL ARCHITECTURE

```text
                         LINOVA MUSIC
                            |
              +-------------+-------------+
              |                           |
          React/Vite                  Browser
              |                           |
              +-------------+-------------+
                            |
                         REST API
                            |
                     Node + Express
                            |
        +-------------------+-------------------+
        |                   |                   |
      Auth               MongoDB          Music Provider
        |                   |                   |
     Users             User data       YouTubeMusicProvider
                         |             / Future providers
                         |
        +----------------+----------------+
        |
   Likes / Library / Playlists
   History / Preferences
   Recommendations
```

### Provider abstraction

Never make frontend components directly depend on `ytmusicapi`.

Use:

```text
server/
└── services/
    └── musicProvider/
        ├── MusicProvider.js
        ├── YouTubeMusicProvider.js
        ├── MockMusicProvider.js
        └── index.js
```

Example conceptual interface:

```js
searchTracks(query, options)
searchArtists(query, options)
searchAlbums(query, options)
getTrack(id)
getArtist(id)
getAlbum(id)
getPlaylist(id)
getHomeSections()
getRecommendations()
getPlaybackInfo(id)
```

The exact methods may evolve based on the selected provider's actual capabilities.

---

# 6. CORE DESIGN PRINCIPLE

Separate three types of data:

## A. External catalog data

Examples:

- Track title
- Artist
- Album
- Artwork
- External provider ID
- Provider URL
- Duration if available
- Availability information

## B. LINOVA MUSIC user data

Examples:

- User
- Likes
- Saved albums
- Saved artists
- Playlists
- Listening history
- Preferences
- Recently played
- Recommendation signals

## C. Playback state

Examples:

- Current track
- Queue
- Current index
- Shuffle state
- Repeat mode
- Position
- Volume
- Player state

Do not unnecessarily duplicate external catalog data in MongoDB.

Store stable provider IDs and user-specific references.

---

# 7. DATA MODEL

## User

```text
User
- _id
- name
- email
- passwordHash
- avatar
- createdAt
- updatedAt
- preferences
```

Preferences:

```text
theme
language
autoplay
explicitContentPreference
qualityPreference
```

---

## LikedSong

```text
LikedSong
- _id
- userId
- provider
- externalTrackId
- metadataSnapshot
- createdAt
```

Use a unique compound index:

```text
userId + provider + externalTrackId
```

---

## SavedAlbum

```text
SavedAlbum
- _id
- userId
- provider
- externalAlbumId
- metadataSnapshot
- createdAt
```

---

## SavedArtist

```text
SavedArtist
- _id
- userId
- provider
- externalArtistId
- metadataSnapshot
- createdAt
```

---

## Playlist

```text
Playlist
- _id
- userId
- name
- description
- coverImage
- isPublic
- tracks[]
- createdAt
- updatedAt
```

Playlist track:

```text
provider
externalTrackId
title
artist
album
artwork
position
addedAt
```

---

## ListeningHistory

```text
ListeningHistory
- _id
- userId
- provider
- externalTrackId
- metadataSnapshot
- playedAt
- completionPercentage
```

Add indexes for:

```text
userId + playedAt
userId + externalTrackId
```

Avoid creating excessive history records.

---

# 8. NORMALIZED MUSIC OBJECT

The frontend should use a normalized structure.

Example:

```js
{
  provider: "youtube-music",
  id: "external-id",
  title: "Song Title",
  artists: [
    {
      id: "artist-id",
      name: "Artist Name"
    }
  ],
  album: {
    id: "album-id",
    name: "Album Name"
  },
  artwork: {
    small: "...",
    medium: "...",
    large: "..."
  },
  duration: 213,
  externalUrl: "...",
  playable: true
}
```

Never scatter provider-specific property names throughout React components.

Normalize provider responses in the backend.

---

# 9. APPLICATION PAGES

## Public pages

```text
/
 /login
 /register
 /search
 /artist/:id
 /album/:id
 /playlist/:id
```

## Authenticated pages

```text
/home
/library
/liked
/playlists
/playlist/:id
/recently-played
/settings
/profile
```

Routing may use `/` as Home if authentication state is handled cleanly.

---

# 10. GLOBAL UI LAYOUT

Desktop:

```text
+------------------------------------------------------+
| Sidebar | Main Content                               |
|         |                                            |
| Home    |                                            |
| Search  |                                            |
| Library |                                            |
|         |                                            |
|         |                                            |
|         |                                            |
+---------+--------------------------------------------+
|                Persistent Music Player               |
+------------------------------------------------------+
```

Mobile:

```text
+--------------------------------+
| Header                         |
|                                |
| Main content                   |
|                                |
|                                |
|                                |
+--------------------------------+
| Mini Player                    |
+--------------------------------+
| Home Search Library             |
+--------------------------------+
```

The player must remain persistent between route changes.

---

# 11. HOME PAGE

Create a dynamic, polished home page.

Sections may include:

```text
Good evening / Good morning
Recently Played
Continue Listening
Made For You
Recommended For You
Trending
Popular Songs
Popular Artists
New Releases
Albums
Featured Playlists
Genres
```

Do not hard-code one static list.

The backend should return normalized home sections.

Example:

```js
{
  sections: [
    {
      id: "recently-played",
      title: "Recently Played",
      type: "tracks",
      items: []
    },
    {
      id: "trending",
      title: "Trending Now",
      type: "tracks",
      items: []
    }
  ]
}
```

If a provider cannot provide a section, gracefully omit it or replace it with another supported section.

---

# 12. SEARCH

Search must support:

- Songs
- Artists
- Albums
- Playlists where supported

Search UI:

```text
Search LINOVA MUSIC...
```

Display:

```text
Top result
Songs
Artists
Albums
Playlists
```

Implement:

- Debouncing
- Loading state
- Empty state
- Error state
- Search history
- Keyboard-friendly navigation
- Responsive results

Do not issue a provider request on every keystroke.

---

# 13. ARTIST PAGE

Show:

- Artist artwork
- Artist name
- Play button
- Shuffle button
- Popular tracks
- Albums
- Singles
- Related artists where supported

Use reusable components.

---

# 14. ALBUM PAGE

Show:

- Album artwork
- Album title
- Artist
- Release information where available
- Track count
- Track list
- Play
- Shuffle
- Save album

Track row:

```text
# | artwork | title | artist | duration | menu
```

---

# 15. PLAYLIST SYSTEM

Users must be able to:

- Create playlist
- Rename playlist
- Delete playlist
- Add tracks
- Remove tracks
- Reorder tracks
- Play playlist
- Shuffle playlist
- Like/save playlist if supported
- Change cover
- Add description

Implement optimistic UI only where rollback is safe.

---

# 16. LIKES / LIBRARY

Library tabs:

```text
Liked Songs
Playlists
Albums
Artists
Recently Played
```

Like/unlike must update immediately in UI and synchronize with backend.

Handle duplicate requests safely.

---

# 17. MUSIC PLAYER

The player is a central subsystem.

Features:

- Play
- Pause
- Previous
- Next
- Seek where supported
- Volume
- Mute
- Shuffle
- Repeat
- Queue
- Add to queue
- Remove from queue
- Clear queue
- Play next
- Mini player
- Expanded player
- Current track
- Artwork
- Artist
- Album
- Lyrics
- Playback errors

State:

```js
{
  currentTrack,
  queue,
  currentIndex,
  isPlaying,
  position,
  duration,
  volume,
  isMuted,
  shuffle,
  repeatMode
}
```

Repeat modes:

```text
off
all
one
```

---

# 18. QUEUE LOGIC

Queue operations:

```text
playNow(track)
playNext(track)
addToQueue(track)
removeFromQueue(index)
clearQueue()
moveQueueItem(from, to)
skipNext()
skipPrevious()
```

Shuffle should preserve the current track where practical.

Do not mutate the original playlist unnecessarily.

Use a stable queue model.

---

# 19. PLAYBACK ARCHITECTURE

Playback must be isolated from catalog/search.

```text
Catalog Provider
      |
      v
Track metadata
      |
      v
Player Adapter
      |
      v
Authorized playback / embedded player
```

Create:

```text
src/player/
  PlayerAdapter.js
  PlayerManager.js
  playbackState.js
```

The player should not know whether the catalog came from YouTube Music, a licensed provider, or mock data.

If playback is unavailable for a particular track, show:

```text
Playback unavailable
```

with a useful alternative action where possible.

Never implement protected audio extraction.

---

# 20. LYRICS

Lyrics must be a separate service.

```text
LyricsProvider
├── getLyrics(track)
└── searchLyrics(track)
```

Do not assume the music provider supplies lyrics.

Possible states:

```text
Lyrics available
Lyrics unavailable
Instrumental
Loading
Error
```

Do not scrape websites that prohibit it.

---

# 21. RECENTLY PLAYED

Record playback events only after a meaningful playback threshold, for example:

```text
10 seconds
```

or another configurable threshold.

Store:

- User
- Track ID
- Provider
- Played timestamp
- Completion percentage

Do not record every play/pause event.

---

# 22. RECOMMENDATION ENGINE

Version 1 should be rule-based.

Use signals such as:

```text
Recently played artists
Liked artists
Liked genres
Frequently played tracks
Recently played tracks
Playlist contents
```

Generate sections such as:

```text
Because you listened to X
More from X
Your recently played
Artists you may like
Similar music
```

Do not require ML for version 1.

Future versions can introduce ML/TinyML-style recommendation research separately.

---

# 23. BACKEND API

Example routes:

## Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/logout
```

## Music

```text
GET /api/music/search
GET /api/music/tracks/:id
GET /api/music/artists/:id
GET /api/music/albums/:id
GET /api/music/playlists/:id
GET /api/music/home
GET /api/music/recommendations
```

## Library

```text
GET    /api/library/liked
POST   /api/library/liked/:trackId
DELETE /api/library/liked/:trackId

GET    /api/library/albums
POST   /api/library/albums/:albumId
DELETE /api/library/albums/:albumId

GET    /api/library/artists
POST   /api/library/artists/:artistId
DELETE /api/library/artists/:artistId
```

## Playlists

```text
GET    /api/playlists
POST   /api/playlists
GET    /api/playlists/:id
PATCH  /api/playlists/:id
DELETE /api/playlists/:id
POST   /api/playlists/:id/tracks
DELETE /api/playlists/:id/tracks/:trackId
PATCH  /api/playlists/:id/reorder
```

## History

```text
GET  /api/history
POST /api/history
DELETE /api/history
```

## Lyrics

```text
GET /api/lyrics
```

---

# 24. BACKEND STRUCTURE

Use a clean layered architecture:

```text
server/
├── src/
│   ├── config/
│   │   ├── db.js
│   │   └── env.js
│   │
│   ├── controllers/
│   │
│   ├── middleware/
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── rateLimiter.js
│   │
│   ├── models/
│   │   ├── User.js
│   │   ├── Playlist.js
│   │   ├── LikedSong.js
│   │   ├── SavedAlbum.js
│   │   ├── SavedArtist.js
│   │   └── ListeningHistory.js
│   │
│   ├── routes/
│   │
│   ├── services/
│   │   ├── musicProvider/
│   │   ├── lyrics/
│   │   ├── recommendation/
│   │   └── history/
│   │
│   ├── utils/
│   ├── app.js
│   └── server.js
│
└── package.json
```

---

# 25. FRONTEND STRUCTURE

```text
client/
├── src/
│   ├── assets/
│   ├── components/
│   │   ├── common/
│   │   ├── music/
│   │   ├── player/
│   │   ├── playlist/
│   │   └── layout/
│   │
│   ├── pages/
│   │   ├── Home/
│   │   ├── Search/
│   │   ├── Artist/
│   │   ├── Album/
│   │   ├── Playlist/
│   │   ├── Library/
│   │   ├── Login/
│   │   ├── Register/
│   │   └── Settings/
│   │
│   ├── hooks/
│   ├── services/
│   │   ├── api.js
│   │   └── music.js
│   │
│   ├── stores/
│   │   ├── authStore.js
│   │   ├── playerStore.js
│   │   └── appStore.js
│   │
│   ├── router/
│   ├── utils/
│   ├── App.jsx
│   └── main.jsx
│
└── package.json
```

---

# 26. UI/UX REQUIREMENTS

Design language:

- Modern
- Minimal
- Premium-looking
- Dark-first
- High contrast
- Smooth transitions
- Rounded cards
- Strong typography
- Large artwork
- Clear hierarchy
- Responsive layouts

Do NOT copy Spotify's exact branding, logos, icons, proprietary assets, or distinctive visual identity.

LINOVA MUSIC must have its own visual identity.

Suggested colors:

```text
Background: near-black / dark neutral
Surface: dark gray
Primary accent: configurable
Text: high-contrast light
Muted text: gray
```

Keep the accent color centralized in the theme system.

---

# 27. RESPONSIVE DESIGN

Breakpoints should support:

```text
Mobile
Tablet
Desktop
Large desktop
```

Mobile requirements:

- Bottom navigation
- Compact player
- Touch-friendly controls
- Horizontally scrollable music sections
- Responsive track lists
- No horizontal overflow

Desktop:

- Sidebar
- Large content area
- Persistent player
- Queue panel
- Expanded player

---

# 28. COMPONENT SYSTEM

Build reusable components:

```text
AppShell
Sidebar
MobileNav
TopBar
SearchBar

Section
SectionHeader
HorizontalCarousel

TrackCard
TrackRow
ArtistCard
AlbumCard
PlaylistCard

PlayButton
LikeButton
MoreButton

MusicPlayer
MiniPlayer
ExpandedPlayer
QueuePanel
PlayerControls
ProgressBar
VolumeControl

LyricsPanel

LoadingSkeleton
EmptyState
ErrorState
Toast
Modal
Dropdown
```

Avoid duplicating player logic across pages.

---

# 29. STATE MANAGEMENT

Use Zustand or equivalent for global state.

Separate:

```text
auth state
player state
UI state
```

Player state should survive route navigation.

Persist only appropriate state:

```text
volume
repeat mode
shuffle preference
queue if desired
last track if useful
```

Do not persist sensitive authentication data insecurely.

---

# 30. AUTHENTICATION

Implement:

```text
Register
Login
Logout
Current user
Protected routes
```

Passwords:

- Never store plaintext passwords.
- Hash passwords using bcrypt/bcryptjs.
- Validate email.
- Validate password strength.

JWT/session handling must be designed securely.

If JWT is used, prefer secure HttpOnly cookies for production-oriented implementation rather than exposing long-lived tokens to JavaScript.

---

# 31. SECURITY

Implement:

- Helmet
- CORS configuration
- Rate limiting
- Input validation
- Authentication middleware
- Authorization checks
- MongoDB query sanitization
- Secure cookies where applicable
- Environment variables
- No provider secrets in frontend
- No password logging
- No token logging
- Error messages that don't leak secrets

Never commit:

```text
.env
API keys
JWT secrets
provider credentials
database passwords
```

Provide:

```text
.env.example
```

---

# 32. CACHING

Cache only appropriate metadata.

Potential caching:

```text
Search results: short TTL
Artist pages: short TTL
Album pages: short TTL
Home sections: short TTL
Recommendations: short TTL
```

Do not cache or store protected copyrighted audio.

Use in-memory caching initially if necessary.

Avoid adding Redis unless the application actually needs it.

---

# 33. ERROR HANDLING

Every external provider request must handle:

```text
timeout
rate limit
authentication failure
not found
unavailable content
invalid response
provider outage
network failure
```

Frontend should display understandable messages.

Example:

```text
We couldn't load this album right now.
Try again.
```

Do not expose raw stack traces to users.

---

# 34. LOADING STATES

Every dynamic page needs skeletons.

Examples:

```text
HomeSkeleton
SearchSkeleton
ArtistSkeleton
AlbumSkeleton
PlaylistSkeleton
PlayerSkeleton
```

Avoid blank screens while requests are pending.

---

# 35. EMPTY STATES

Examples:

### Empty liked songs

```text
Your liked songs will appear here.
Start exploring music and tap the heart icon.
```

### Empty playlist

```text
This playlist is empty.
Add songs to start building it.
```

### No search results

```text
No results found.
Try a different search.
```

---

# 36. PERFORMANCE

Optimize:

- Lazy-loaded routes
- Image lazy loading
- Proper image sizes
- Request debouncing
- Pagination where appropriate
- Avoid unnecessary React re-renders
- Memoize expensive components
- Keep player state isolated
- Avoid repeated provider calls
- Cache metadata when appropriate

Do not sacrifice maintainability for premature optimization.

---

# 37. ACCESSIBILITY

Implement:

- Semantic HTML
- Keyboard navigation
- Focus states
- ARIA labels for icon buttons
- Accessible dialogs
- Accessible dropdowns
- Sufficient contrast
- Screen-reader-friendly player controls

Icon-only buttons must have accessible labels.

---

# 38. PWA

After the core application works:

- Web manifest
- App icon
- Installable experience
- Service worker
- Offline shell where useful

Do NOT attempt to make protected music available offline.

Offline functionality should be limited to safe application data such as UI shell and possibly user-created metadata where appropriate.

---

# 39. SETTINGS

Settings page:

```text
Profile
Appearance
Playback
Language
Privacy
Account
```

Appearance:

```text
Dark
Light
System
```

Playback:

```text
Autoplay
Default volume
Repeat preference
```

Only implement settings that actually work.

---

# 40. ADMIN / DEVELOPMENT TOOLS

Optional development-only page:

```text
/provider-status
```

Show:

- Provider configured
- API reachable
- Last request
- Rate-limit status if available
- Supported capabilities
- Playback availability

Never expose provider secrets.

This page should be disabled or protected outside development.

---

# 41. PROVIDER CAPABILITY SYSTEM

Because providers differ, create a capability object:

```js
{
  search: true,
  tracks: true,
  albums: true,
  artists: true,
  playlists: true,
  recommendations: true,
  playback: true,
  lyrics: false,
  queue: true,
  userLibrary: false
}
```

The UI can adapt to capabilities.

Example:

If lyrics aren't available:

```text
Lyrics unavailable
```

If playback is unavailable:

```text
Playback unavailable
```

Do not pretend unsupported features work.

---

# 42. YOUTUBE MUSIC EXPERIMENTAL INTEGRATION

The YouTube Music integration should be treated as an experimental adapter.

Responsibilities:

```text
YouTubeMusicProvider
    |
    +-- search
    +-- track metadata
    +-- album metadata
    +-- artist metadata
    +-- playlist metadata
    +-- discovery data
```

Keep it server-side.

Do not expose `ytmusicapi` directly to the browser.

Do not make the rest of the application depend on its response format.

Normalize all responses.

If the integration becomes unavailable, the rest of the application should continue running with:

```text
MockMusicProvider
```

---

# 43. MOCK PROVIDER

Create a mock provider from the beginning.

```text
MockMusicProvider
```

It should contain a small static catalog.

Purpose:

- Frontend development without external API
- Automated testing
- UI testing
- Provider failure testing
- Development when external service is unavailable

Example:

```text
20 tracks
5 artists
5 albums
3 playlists
```

The exact catalog can use developer-created/demo metadata and audio where permitted.

---

# 44. API RESPONSE FORMAT

Use consistent responses.

Success:

```json
{
  "success": true,
  "data": {}
}
```

Error:

```json
{
  "success": false,
  "error": {
    "code": "RESOURCE_NOT_FOUND",
    "message": "The requested resource was not found."
  }
}
```

Do not return inconsistent response structures.

---

# 45. LOGGING

Development logs should include:

```text
request method
route
status
duration
provider error category
```

Never log:

```text
password
JWT
API secret
OAuth token
cookie contents
```

---

# 46. TESTING

Implement tests incrementally.

## Backend

Test:

- Auth
- Playlist creation
- Playlist modification
- Likes
- History
- Provider normalization
- API errors

## Frontend

Test:

- Player controls
- Queue
- Like button
- Search
- Playlist operations
- Protected routes

## Integration

Test:

```text
Login
→ Search
→ Open album
→ Play
→ Add to queue
→ Like
→ Add to playlist
→ Navigate
→ Verify player remains active
```

---

# 47. DEVELOPMENT PHASES

Do NOT attempt the entire application in one uncontrolled implementation.

## PHASE 0 — Requirements and provider architecture

Create:

```text
docs/
├── PRODUCT_REQUIREMENTS.md
├── ARCHITECTURE.md
├── PROVIDER_ARCHITECTURE.md
├── DATABASE.md
├── API.md
├── PLAYER_ARCHITECTURE.md
├── SECURITY.md
├── TESTING.md
└── ROADMAP.md
```

Confirm:

- $0 budget
- experimental scope
- provider abstraction
- no protected audio extraction
- mock provider availability

---

## PHASE 1 — Repository setup

Create:

```text
client/
server/
docs/
```

Configure:

- Git
- `.gitignore`
- `.env.example`
- README
- npm scripts

Verify both applications start.

---

## PHASE 2 — Backend foundation

Implement:

- Express
- MongoDB
- configuration
- error handler
- security middleware
- health endpoint

Test:

```text
GET /api/health
```

---

## PHASE 3 — Frontend foundation

Implement:

- React/Vite
- Tailwind
- Router
- Theme
- AppShell
- Sidebar
- Mobile navigation
- placeholder pages

Verify responsive layout.

---

## PHASE 4 — Authentication

Implement:

- Register
- Login
- Logout
- Current user
- Protected routes

Test authentication thoroughly.

---

## PHASE 5 — Mock music provider

Implement:

```text
MusicProvider interface
MockMusicProvider
normalization
```

Connect:

```text
Home
Search
Artist
Album
```

Do not add external provider complexity yet.

---

## PHASE 6 — Music UI system

Build:

- TrackCard
- TrackRow
- ArtistCard
- AlbumCard
- PlaylistCard
- reusable sections
- skeletons
- empty states

---

## PHASE 7 — Player engine

Implement:

- player store
- player adapter
- persistent player
- play/pause
- previous/next
- queue
- shuffle
- repeat
- volume
- progress
- mini player
- expanded player

Test using mock playback.

---

## PHASE 8 — Library

Implement:

- liked songs
- saved albums
- saved artists
- playlists
- recently played

---

## PHASE 9 — Playlist management

Implement:

- create
- rename
- delete
- add
- remove
- reorder
- play
- shuffle

---

## PHASE 10 — External music provider

Only after the application works with MockMusicProvider:

Implement:

```text
YouTubeMusicProvider
```

Requirements:

- backend-only integration
- normalized responses
- timeout handling
- rate-limit handling
- provider error mapping
- caching where appropriate
- capability detection

Test provider independently.

---

## PHASE 11 — Home/discovery

Connect real provider-supported discovery features.

Create dynamic sections.

Do not assume every provider supports every section.

---

## PHASE 12 — Lyrics

Add separate lyrics provider abstraction.

Implement:

```text
LyricsPanel
LyricsProvider
```

---

## PHASE 13 — Recommendations

Implement rule-based recommendation engine.

Use:

- history
- likes
- artists
- albums
- playlists

---

## PHASE 14 — Polish

Improve:

- animations
- transitions
- responsive behavior
- loading states
- empty states
- accessibility
- error messages
- visual consistency

---

## PHASE 15 — Performance

Measure:

- initial load
- route transitions
- API latency
- provider latency
- rendering
- image loading

Optimize only based on evidence.

---

## PHASE 16 — Security review

Review:

- auth
- cookies/tokens
- CORS
- rate limits
- validation
- provider secrets
- database access
- error leakage

---

## PHASE 17 — Testing

Run:

- unit tests
- integration tests
- end-to-end critical flow tests
- responsive checks

---

## PHASE 18 — Deployment

Only after the application is stable.

Target $0-tier services where available.

Possible categories:

```text
Frontend hosting
Backend hosting
MongoDB free tier
```

Do not assume a provider's free tier or current limits without checking its current documentation.

---

# 48. ANTIGRAVITY EXECUTION RULES

The coding agent must follow this workflow for EVERY phase:

```text
1. Inspect the existing repository.
2. Understand the current architecture.
3. Identify affected files.
4. Read relevant documentation.
5. Make a small complete implementation.
6. Run the application.
7. Run relevant tests.
8. Check frontend console errors.
9. Check backend errors.
10. Fix issues.
11. Refactor duplicated code.
12. Update documentation.
13. Verify the phase.
14. Only then continue to the next phase.
```

Do not blindly overwrite existing code.

Do not create duplicate components when an existing component can be extended safely.

Do not introduce a new dependency without a reason.

---

# 49. ANTIGRAVITY CODING RULES

The agent must:

- Prefer simple maintainable solutions.
- Use existing project conventions.
- Keep components reusable.
- Keep provider-specific logic isolated.
- Keep business logic out of UI components.
- Keep API calls out of presentation components where practical.
- Validate backend input.
- Handle asynchronous states.
- Avoid silent failures.
- Avoid hard-coded secrets.
- Avoid unnecessary global state.
- Avoid duplicated player logic.
- Avoid giant components.
- Use clear naming.
- Add comments only where they clarify non-obvious logic.
- Keep documentation synchronized with architecture.

---

# 50. DEFINITION OF DONE

A phase is NOT complete merely because code was written.

A phase is complete only when:

```text
Code implemented
+
Application starts
+
No obvious console errors
+
Backend starts
+
Relevant API endpoints work
+
Relevant UI works
+
Error states work
+
Responsive behavior checked
+
Tests pass where applicable
+
Documentation updated
```

---

# 51. FINAL ACCEPTANCE TEST

The final application should support this complete journey:

```text
Open LINOVA MUSIC
      ↓
Register / Login
      ↓
Home loads dynamically
      ↓
Search for an artist/song
      ↓
Open artist
      ↓
Open album
      ↓
See tracks
      ↓
Start playback through supported playback mechanism
      ↓
Player appears
      ↓
Navigate to another page
      ↓
Player remains active
      ↓
Add another song to queue
      ↓
Shuffle queue
      ↓
Enable repeat
      ↓
Like song
      ↓
Add song to playlist
      ↓
Open Library
      ↓
See liked song
      ↓
Open playlist
      ↓
Play playlist
      ↓
Check Recently Played
      ↓
See recommendation sections
      ↓
Open lyrics panel when available
```

---

# 52. FAILURE-RESILIENT DESIGN

The application must remain usable if:

```text
YouTube Music integration fails
Lyrics provider fails
Recommendation provider fails
One image fails
One track is unavailable
Database temporarily fails
Network request times out
```

For example:

```text
Provider unavailable
      ↓
Show cached/safe UI where possible
      ↓
Display retry action
      ↓
Do not crash entire application
```

---

# 53. FUTURE EXTENSIONS

Do not implement these initially unless the core application is stable:

- Collaborative playlists
- Social profiles
- Following artists
- Comments
- Advanced recommendation ML
- Audio analysis
- Mood detection
- Voice search
- AI playlist generation
- Offline application data
- Native mobile application
- Desktop application
- Multi-provider catalog
- Licensed commercial music provider
- Subscription system
- Admin CMS
- Analytics dashboard

The architecture should allow these later.

---

# 54. FUTURE MULTI-PROVIDER ARCHITECTURE

Eventually:

```text
                    MusicProvider
                         |
          +--------------+--------------+
          |              |              |
     YouTubeMusic    LicensedProvider   Mock
       Provider          Provider      Provider
          |              |              |
          +--------------+--------------+
                         |
                   Normalized Model
                         |
                     LINOVA MUSIC UI
```

This is a core architectural requirement.

---

# 55. README REQUIREMENTS

The final README must contain:

```text
Project overview
Features
Architecture
Tech stack
Folder structure
Environment variables
Local setup
Database setup
Provider setup
Development commands
Testing
Deployment
Known limitations
Provider limitations
Security notes
Roadmap
```

Do not claim unsupported capabilities.

---

# 56. ENVIRONMENT VARIABLES

Create `.env.example`.

Example categories:

```text
PORT=
MONGODB_URI=
JWT_SECRET=
CLIENT_URL=

MUSIC_PROVIDER=
YOUTUBE_MUSIC_ENABLED=

LYRICS_PROVIDER=
LYRICS_API_KEY=
```

Only include variables actually used by the application.

Never commit `.env`.

---

# 57. DEVELOPMENT COMMANDS

Root scripts should ideally support:

```text
npm run dev
npm run client
npm run server
npm run build
npm run test
```

If using workspaces, configure them cleanly.

The exact commands may be adapted to the generated repository structure.

---

# 58. IMPORTANT PRODUCT PRINCIPLES

### Principle 1 — Player first-class

The player is not an afterthought. It is a core application subsystem.

### Principle 2 — Provider independence

Never allow provider-specific code to spread throughout the frontend.

### Principle 3 — Graceful degradation

Unsupported features must degrade gracefully.

### Principle 4 — User data belongs to LINOVA MUSIC

Likes, playlists, history and preferences belong to LINOVA MUSIC, not the external catalog provider.

### Principle 5 — Do not duplicate external data unnecessarily

Store external IDs and small metadata snapshots where useful.

### Principle 6 — Security by default

Secrets stay on the server.

### Principle 7 — Build incrementally

A working Phase 1 is better than a half-finished Phase 10.

---

# 59. FIRST TASK FOR THE CODING AGENT

Before writing significant application code:

1. Inspect the repository.
2. Determine whether a project already exists.
3. Preserve useful existing work.
4. Create or update the project architecture.
5. Create the `docs/` directory.
6. Create:
   - `PRODUCT_REQUIREMENTS.md`
   - `ARCHITECTURE.md`
   - `PROVIDER_ARCHITECTURE.md`
   - `DATABASE.md`
   - `API.md`
   - `PLAYER_ARCHITECTURE.md`
   - `SECURITY.md`
   - `TESTING.md`
   - `ROADMAP.md`
7. Set up client and server.
8. Verify both run.
9. Implement Phase 1 only.
10. Do not jump ahead until Phase 1 is verified.

---

# 60. FINAL INSTRUCTION TO ANTIGRAVITY

You are the primary software engineering agent for this project.

Build LINOVA MUSIC incrementally according to this specification.

Do not treat this document as permission to implement every feature at once.

Follow the phases in order.

At the start of every phase:

```text
Inspect → Plan → Implement → Run → Test → Fix → Verify → Document
```

When an external provider capability is uncertain, inspect its current official documentation before implementing provider-dependent functionality.

Never invent an API endpoint, SDK method, authentication flow, playback capability, pricing plan, or provider restriction.

If an intended provider feature is unsupported, implement the nearest supported architecture and expose the limitation cleanly.

Never implement DRM circumvention, protected-stream extraction, unauthorized downloading, credential theft, subscription bypass, geo-restriction bypass, or rate-limit bypass.

The application must remain functional with `MockMusicProvider`.

The most important architectural rule is:

```text
LINOVA MUSIC UI
     ↓
LINOVA MUSIC API
     ↓
Provider abstraction
     ↓
External music service
```

NOT:

```text
LINOVA MUSIC UI
     ↓
ytmusicapi-specific implementation everywhere
```

Build a real, maintainable application—not a collection of disconnected demos.

The final result should be a polished Spotify-like music application under the LINOVA MUSIC brand, while keeping the external music source replaceable and respecting the capabilities and restrictions of whichever provider is used.
