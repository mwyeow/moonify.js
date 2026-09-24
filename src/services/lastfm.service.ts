import { requestJson } from "../http/fetcher.js";
import {
  LastFmRawTrack,
  LastFmRecentTracksResponse,
  LastFmUserInfoResponse,
} from "../types/lastfm.types.js";

export class LastFmService {
  private apiKey: string;
  private timeoutMs: number;

  constructor(apiKey: string, timeoutMs = 8000) {
    this.apiKey = apiKey;
    this.timeoutMs = timeoutMs;
  }

  public async getRecentTracks(
    username: string,
    limit = 10,
  ): Promise<LastFmRawTrack[]> {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getrecenttracks&user=${encodeURIComponent(
      username,
    )}&api_key=${this.apiKey}&format=json&limit=${limit}`;

    const data = await requestJson<LastFmRecentTracksResponse>("lastfm", url, {
      timeoutMs: this.timeoutMs,
    });

    const raw = data.recenttracks?.track;
    if (!raw) return [];

    return Array.isArray(raw) ? raw : [raw];
  }

  public async getUserInfo(
    username: string,
  ): Promise<LastFmUserInfoResponse["user"] | null> {
    const url = `https://ws.audioscrobbler.com/2.0/?method=user.getinfo&user=${encodeURIComponent(
      username,
    )}&api_key=${this.apiKey}&format=json`;

    const data = await requestJson<LastFmUserInfoResponse>("lastfm", url, {
      timeoutMs: this.timeoutMs,
    });

    return data.user || null;
  }
}
