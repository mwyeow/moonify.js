import { LastFmService } from "./services/lastfm.service.js";
import { SpotifyService } from "./services/spotify.service.js";
import { MoonifyConfig } from "./types/config.js";
import { ResolvedCurrentlyPlaying } from "./types/results.js";
import { normalizeString } from "./utils/normalise.js";

export class Moonify {
  private lastfm: LastFmService;
  private spotify: SpotifyService;

  constructor(config: MoonifyConfig) {
    if (!config.lastfmApiKey) {
      throw new Error("lastfm api key is required.");
    }

    this.lastfm = new LastFmService(
      config.lastfmApiKey,
      config.requestTimeoutMs,
    );
    this.spotify = new SpotifyService(
      config.spotifyClientId,
      config.spotifyClientSecret,
      config.requestTimeoutMs,
    );
  }

  public async getCurrentlyPlaying(
    username: string,
  ): Promise<ResolvedCurrentlyPlaying | null> {
    const tracks = await this.lastfm.getRecentTracks(username, 10);
    if (tracks.length === 0) return null;

    const currentTrack = tracks[0];
    const isNowPlaying = currentTrack["@attr"]?.nowplaying === "true";
    if (!isNowPlaying) return null;

    const trackName = currentTrack.name;
    const artistName =
      currentTrack.artist["#text"] ||
      currentTrack.artist.name ||
      "Unknown Artist";

    const lastFmTrackUrl = currentTrack.url;
    const lastFmArtistUrl = `https://www.last.fm/music/${encodeURIComponent(artistName)}`;

    const spotifyMatch = await this.spotify.resolveTrack(trackName, artistName);

    const normTrack = normalizeString(trackName);
    const normArtist = normalizeString(artistName);

    let repeatCount = 0;
    for (let i = 1; i < tracks.length; i++) {
      const item = tracks[i];
      const tName = normalizeString(item.name || "");
      const tArtist = normalizeString(
        item.artist["#text"] || item.artist.name || "",
      );

      if (tName === normTrack && tArtist === normArtist) {
        repeatCount++;
      }
    }

    return {
      trackName,
      artistName,
      trackUrl: spotifyMatch.trackUrl || lastFmTrackUrl,
      artistUrl: spotifyMatch.artistUrl || lastFmArtistUrl,
      lastFmTrackUrl,
      lastFmArtistUrl,
      spotifyTrackUrl: spotifyMatch.trackUrl,
      spotifyArtistUrl: spotifyMatch.artistUrl,
      isOnRepeat: repeatCount >= 2,
      repeatCount,
    };
  }
}
