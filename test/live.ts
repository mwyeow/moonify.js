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

const moonify = new Moonify({
  lastfmApiKey: apiKey,
  spotifyClientId: process.env.SPOTIFY_CLIENT_ID,
  spotifyClientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});

async function run() {
  console.log(`Checking now playing for ${username}...`);
  const res = await moonify.getCurrentlyPlaying(username);

  if (!res) {
    console.log(
      "No track is currently playing (that or user scrobbles are empty).",
    );
    return;
  }

  console.log("Result:", {
    track: res.trackName,
    artist: res.artistName,
    trackUrl: res.trackUrl,
    artistUrl: res.artistUrl,
    isOnRepeat: res.isOnRepeat,
    repeatCount: res.repeatCount,
  });
}

run().catch(console.error);
