# Moonify.JS

<p align="center">
  <a href="https://discord.gg/Bjgx9gaaHG">
    <img src="https://img.shields.io/discord/1338630753512325242?color=5865F2&logo=discord&logoColor=white" alt="Discord" />
  </a>
  <a href="https://www.npmjs.com/package/moonify.js">
    <img src="https://img.shields.io/npm/v/moonify.js?color=CB3837&logo=npm" alt="npm version" />
  </a>
  <a href="https://www.npmjs.com/package/moonify.js">
    <img src="https://img.shields.io/npm/dt/moonify.js?color=blue" alt="npm downloads" />
  </a>
  <a href="https://github.com/mwyeow/moonify.js/graphs/contributors">
    <img src="https://img.shields.io/github/contributors/mwyeow/moonify.js?color=teal" alt="Contributors" />
  </a>
  <a href="https://github.com/mwyeow/moonify.js/commits/main">
    <img src="https://img.shields.io/github/last-commit/mwyeow/moonify.js" alt="Last Commit" />
  </a>
  <img src="https://img.shields.io/badge/license-MIT-green.svg" alt="License" />
</p>

A lightweight TypeScript client to fetch currently playing scrobbles from Last.fm and automatically enrich them with Spotify track links, artist URLs, and repeat tracking.

---

## Features

- Fetches live playback status via Last.fm API.
- Automatically searches Spotify for track and artist links.
- Gracefully falls back to Last.fm URLs if Spotify credentials are unset or the track is not found.
- Detects whether the current track is on repeat across the user's latest scrobbles.
- Zero external runtime dependencies (uses native web APIs: `fetch`, `AbortController`, `btoa`).
- Works across Node.js (18+), Bun, and Deno.

---

## Installation

```bash
# using bun
bun add moonify.js

# using npm
npm install moonify.js

# using pnpm
pnpm add moonify.js

```

---

## Quick Start

```typescript
import { Moonify } from "moonify.js";

const moonify = new Moonify({
  lastfmApiKey: process.env.LASTFM_API_KEY!,
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID, // optional
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET, // optional
  requestTimeoutMs: 8000, // optional (default: 8000)
});

async function run() {
  const result = await moonify.getCurrentlyPlaying("some_username");

  if (!result) {
    console.log("No track is playing right now.");
    return;
  }

  console.log(`${result.trackName} by ${result.artistName}`);
  console.log(`Listen here: ${result.trackUrl}`);

  if (result.isOnRepeat) {
    console.log(`Repeated ${result.repeatCount} times recently.`);
  }
}

run();
```

---

## Response Object

`getCurrentlyPlaying(username)` resolves to `null` if nothing is playing or user scrobbles are empty. When active, it returns:

| Field              | Type      | Description                                              |
| ------------------ | --------- | -------------------------------------------------------- |
| `trackName`        | `string`  | Track name                                               |
| `artistName`       | `string`  | Artist name                                              |
| `trackUrl`         | `string`  | Spotify track URL (falls back to Last.fm URL)            |
| `artistUrl`        | `string`  | Spotify artist URL (falls back to Last.fm URL)           |
| `lastFmTrackUrl`   | `string`  | Guaranteed Last.fm track URL                             |
| `lastFmArtistUrl`  | `string`  | Guaranteed Last.fm artist URL                            |
| `spotifyTrackUrl`  | `string`  | Direct Spotify track URL (null if unfound/unconfigured)  |
| `spotifyArtistUrl` | `string`  | Direct Spotify artist URL (null if unfound/unconfigured) |
| `isOnRepeat`       | `boolean` | `true` if repeated 2+ times in recent 10 tracks          |
| `repeatCount`      | `number`  | Total repeat count in recent tracks                      |

## Contributing

Contributions are always welcome!
If you've found a bug, have an idea, or want to improve MoonifyJS, feel free to open an issue or pull request.
Thanks for helping out! <3
