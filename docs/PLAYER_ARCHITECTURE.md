# LINOVA MUSIC — Player Architecture & Offline Storage

## 1. Player Engine Architecture
The playback system is decoupled from specific pages, UI components, and catalog sources.

```
+-------------------------------------------------------------------------------+
|                               usePlayerStore                                  |
|  - currentTrack, isPlaying, position, duration, volume, isMuted               |
|  - queue, originalQueue, currentIndex, shuffle, repeatMode ('off'|'all'|'one')|
+-------------------------------------------------------------------------------+
                                        |
                                        v
+-------------------------------------------------------------------------------+
|                                PlayerAdapter                                  |
|  - Checks if audio exists in IndexedDB (Offline Storage)                      |
|  - If offline blob exists: plays from URL.createObjectURL(blob)              |
|  - If online stream: plays via HTML5 Audio element or Embed adapter           |
|  - Listens to timeupdate, ended, error, play, pause events                     |
|  - Dispatches MediaSession API actions (Lock screen / Media keys)             |
+-------------------------------------------------------------------------------+
```

## 2. Queue Operations
- `playNow(track)`: Plays the track immediately and builds default queue context.
- `playNext(track)`: Inserts track immediately following current index in queue.
- `addToQueue(track)`: Appends track to the end of the queue.
- `removeFromQueue(index)`: Removes item at specific index.
- `clearQueue()`: Empties future queue items.
- `reorderQueue(from, to)`: Drag-and-drop / index swap for queue.
- `skipNext()`: Handles repeat mode ('one' replays, 'all' wraps around, 'off' stops at end).
- `skipPrevious()`: If current position > 3s, restarts current song; otherwise goes to previous.

## 3. Offline Music Storage Subsystem
- **Technology:** Browser `IndexedDB` with custom repository `offlineStorage.js`.
- **Workflow:**
  1. User clicks "Download" on track or album.
  2. Audio binary data is fetched via `fetch(audioUrl)` and converted to `Blob`.
  3. `offlineStorage.saveTrack({ id, track, blob, timestamp })` commits to IndexedDB.
  4. Track gets flagged with `isDownloaded: true` across all UI cards and rows.
  5. User can play the track in offline mode without internet.
