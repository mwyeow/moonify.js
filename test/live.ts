import { Moonify } from "../src/index.js";

const apiKey = process.env.LASTFM_API_KEY;
const username = process.env.LASTFM_USERNAME || process.argv[2];

if (!apiKey) {
  console.error("Last fm api key is missing.");
  process.exit(1);
}

if (!username) {
  console.error("No username for lastfm was provided.");
  process.exit(1);
}

(async () => {
  const moonify = new Moonify({
    lastfmApiKey: apiKey!,
    spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
    spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
  });

  console.log("Profile:");
  const profile = await moonify.getUserProfile(username);
  console.dir(profile, { depth: null, colors: true });

  console.log("\nCurrently Playing:");
  const current = await moonify.getCurrentlyPlaying(username);
  console.dir(current, { depth: null, colors: true });

  console.log("\nRecent Tracks:");
  const recents = await moonify.getRecentTracks(username, 4);
  console.dir(recents, { depth: null, colors: true });
})().catch(console.error);

export {};
