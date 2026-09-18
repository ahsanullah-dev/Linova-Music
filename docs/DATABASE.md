# LINOVA MUSIC — Database Schema Design

## 1. Data Collections & Mongoose Schemas

### 1.1 User (`User.js`)
- `_id`: ObjectId
- `name`: String (required)
- `email`: String (unique, required, indexed)
- `passwordHash`: String (bcrypt hash)
- `avatar`: String (URL)
- `preferences`:
  - `theme`: String (`dark` | `amoled` | `system`)
  - `accentColor`: String (hex code)
  - `audioQuality`: String (`normal` | `high`)
  - `autoplay`: Boolean
- `createdAt`: Date
- `updatedAt`: Date

### 1.2 LikedSong (`LikedSong.js`)
- `userId`: ObjectId (ref User, indexed)
- `provider`: String
- `trackId`: String (external track ID)
- `track`: Object (normalized track snapshot: title, artist, album, artwork, duration)
- `createdAt`: Date
*Compound Unique Index:* `{ userId: 1, provider: 1, trackId: 1 }`

### 1.3 SavedAlbum (`SavedAlbum.js`)
- `userId`: ObjectId (ref User, indexed)
- `provider`: String
- `albumId`: String
- `album`: Object (normalized album snapshot)
- `createdAt`: Date

### 1.4 SavedArtist (`SavedArtist.js`)
- `userId`: ObjectId (ref User, indexed)
- `provider`: String
- `artistId`: String
- `artist`: Object (normalized artist snapshot)
- `createdAt`: Date

### 1.5 Playlist (`Playlist.js`)
- `_id`: ObjectId
- `userId`: ObjectId (ref User, indexed)
- `name`: String (required)
- `description`: String
- `coverImage`: String
- `isPublic`: Boolean (default true)
- `tracks`: Array of normalized Track objects with `addedAt` timestamp
- `createdAt`: Date
- `updatedAt`: Date

### 1.6 ListeningHistory (`ListeningHistory.js`)
- `userId`: ObjectId (ref User, indexed)
- `trackId`: String
- `provider`: String
- `track`: Object (snapshot)
- `playedAt`: Date (default Date.now)
- `completionPercentage`: Number
