<p align="center">
  <img src="https://github.com/user-attachments/assets/25066cc7-6966-489c-aa77-daf52a4a9810" alt="moonify.js logo" width="550" />
</p>

<p align="center">
  <a href="https://discord.gg/Bjgx9gaaHG"><img src="https://img.shields.io/discord/1338630753512325242?color=5865F2&logo=discord&logoColor=white" alt="Discord" /></a>
  <a href="https://www.npmjs.com/package/@mwyeow/moonify.js"><img src="https://img.shields.io/npm/v/@mwyeow/moonify.js?color=CB3837&logo=npm" alt="npm version" /></a>
  <a href="https://www.npmjs.com/package/@mwyeow/moonify.js"><img src="https://img.shields.io/npm/dt/@mwyeow/moonify.js?color=blue" alt="npm downloads" /></a>
  <a href="https://github.com/mwyeow/moonify.js/graphs/contributors"><img src="https://img.shields.io/github/contributors/mwyeow/moonify.js?color=teal" alt="Contributors" /></a>
  <a href="https://github.com/mwyeow/moonify.js/commits/main"><img src="https://img.shields.io/github/last-commit/mwyeow/moonify.js" alt="Last Commit" /></a>
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
</p>

A lightweight TypeScript client for Last.fm and Spotify, providing scrobble history, user profiles, track information, artwork, and links in one simple package.

---

## Features

- Fetches live playback status via the Last.fm API.
- Searches Spotify for track links, artist URLs, album names, and cover art.
- Falls back to Last.fm artwork and URLs when needed.
- Resolves recent scrobbles with customisable limits and playback flags.
- Retrieves Last.fm user profiles.
- Detects whether the current track is on repeat.
- Zero external runtime dependencies.
- Works with Node.js 18+, Bun, and Deno.
-

---

## Installation

### API Keys

- **Last.fm:** Get your API key and secret from the [Last.fm API account page](https://www.last.fm/api/account/create).
- **Spotify:** Create an app in the [Spotify Developer Dashboard](https://developer.spotify.com/dashboard) to get your Client ID and Client Secret.

```bash
# using bun
bun add @mwyeow/moonify.js

# using npm
npm install @mwyeow/moonify.js

# using pnpm
pnpm add @mwyeow/moonify.js
```

---

## Quick Start

```typescript
import { Moonify } from "@mwyeow/moonify.js";

const moonify = new Moonify({
  lastfmApiKey: process.env.LASTFM_API_KEY!,
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID, // optional
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET, // optional
  requestTimeoutMs: 8000, // optional (default: 8000)
});

async function run() {
  // fetch currently playing track
  const current = await moonify.getCurrentlyPlaying("some_username");

  if (current) {
    console.log(`${current.trackName} by ${current.artistName}`);
    console.log(`Album: ${current.albumName}`);
    console.log(`Cover Art: ${current.coverArtUrl}`);
    console.log(`Listen: ${current.trackUrl}`);

    if (current.isOnRepeat) {
      console.log(`Repeated ${current.repeatCount} times recently.`);
    }
  }

  // fetch recent scrobbles
  const recents = await moonify.getRecentTracks("some_username", 5);
  for (const track of recents) {
    console.log(
      `${track.trackName} - ${track.artistName} (Playing: ${track.isPlaying})`,
    );
  }

  // fetch user profile
  const profile = await moonify.getUserProfile("some_username");
  if (profile) {
    console.log(
      `${profile.username} has ${profile.playCount.toLocaleString()} total scrobbles`,
    );
  }
}

run();
```

---

## Reference

### `moonify.getCurrentlyPlaying(username)`

Resolves to `null` if nothing is playing or if the user's scrobble history is empty. When active, it returns:

| Field              | Type      | Description                                                     |
| ------------------ | --------- | --------------------------------------------------------------- |
| `trackName`        | `string`  | Track name                                                      |
| `artistName`       | `string`  | Artist name                                                     |
| `albumName`        | `string`  | Spotify album title (falls back to Last.fm album)               |
| `coverArtUrl`      | `string`  | Spotify high-resolution cover art (falls back to Last.fm image) |
| `trackUrl`         | `string`  | Spotify track URL (falls back to Last.fm URL)                   |
| `artistUrl`        | `string`  | Spotify artist URL (falls back to Last.fm URL)                  |
| `lastFmTrackUrl`   | `string`  | Last.fm track URL                                               |
| `lastFmArtistUrl`  | `string`  | Last.fm artist URL                                              |
| `spotifyTrackUrl`  | `string`  | Direct Spotify track URL                                        |
| `spotifyArtistUrl` | `string`  | Direct Spotify artist URL                                       |
| `isOnRepeat`       | `boolean` | `true` if repeated 2+ times in recent tracks                    |
| `repeatCount`      | `number`  | Total repeat occurrences in recent scrobbles                    |

---

### `moonify.getRecentTracks(username, limit?)`

Retrieves an array of recent scrobbles up to the specified `limit` (default: `5`), fully enriched with artwork, album metadata, and playback states:

| Field              | Type      | Description                                                     |
| ------------------ | --------- | --------------------------------------------------------------- |
| `trackName`        | `string`  | Track name                                                      |
| `artistName`       | `string`  | Artist name                                                     |
| `albumName`        | `string`  | Spotify album title (falls back to Last.fm album)               |
| `coverArtUrl`      | `string`  | Spotify high-resolution cover art (falls back to Last.fm image) |
| `trackUrl`         | `string`  | Spotify track URL (falls back to Last.fm URL)                   |
| `artistUrl`        | `string`  | Spotify artist URL (falls back to Last.fm URL)                  |
| `lastFmTrackUrl`   | `string`  | Last.fm track URL                                               |
| `lastFmArtistUrl`  | `string`  | Last.fm artist URL                                              |
| `spotifyTrackUrl`  | `string`  | Direct Spotify track URL                                        |
| `spotifyArtistUrl` | `string`  | Direct Spotify artist URL                                       |
| `isPlaying`        | `boolean` | `true` if this track is actively scrobbling right now           |

---

### `moonify.getUserProfile(username)`

Resolves user profile details and scrobble statistics via Last.fm's `user.getinfo` endpoint. Returns `null` if the user is not found:

| Field          | Type     | Description                         |
| -------------- | -------- | ----------------------------------- |
| `username`     | `string` | Last.fm username                    |
| `url`          | `string` | Profile URL on Last.fm              |
| `avatarUrl`    | `string` | High-resolution avatar URL          |
| `country`      | `string` | Country listed on profile           |
| `playCount`    | `number` | Total lifetime scrobble count       |
| `registeredAt` | `number` | Account registration Unix timestamp |

---

## Contributing

Contributions are always welcome!
If you've found a bug, have an idea, or want to improve MoonifyJS, feel free to open an issue or pull request.
Thanks for helping out! <3
