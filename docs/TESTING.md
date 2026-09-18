# LINOVA MUSIC — Testing Strategy

## 1. Backend Verification
- Health endpoint check (`/api/health`).
- Authentication lifecycle tests (Registration, Login, Auth Token verification).
- Music catalog provider contract tests (normalized response structure).
- Playlist CRUD and reordering integrity tests.
- Listening history logging & recommendation generator test.

## 2. Frontend & Player Verification
- Component rendering (AppShell, Navigation, Player Bar, Search results).
- Audio playback adapter state flow (play, pause, next, seek, volume).
- Offline storage & IndexedDB persistence test (audio download, cache lookup, offline play).
- Responsive breakpoint layout validation (Desktop wide, Tablet, Mobile).
