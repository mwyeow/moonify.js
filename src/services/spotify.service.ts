import { MoonifyAuthError } from "../errors/index.js";
import { requestJson } from "../http/fetcher.js";
import {
  SpotifyAuthTokenResponse,
  SpotifySearchTrackResponse,
  SpotifyTrackMatch,
} from "../types/spotify.types.js";

export class SpotifyService {
  private clientId?: string;
  private clientSecret?: string;
  private timeoutMs: number;
  private token: string | null = null;
  private tokenExpiresAt = 0;

  constructor(clientId?: string, clientSecret?: string, timeoutMs = 8000) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.timeoutMs = timeoutMs;
  }

  public get isConfigured(): boolean {
    return Boolean(this.clientId && this.clientSecret);
  }

  private async getAccessToken(): Promise<string | null> {
    if (!this.isConfigured) return null;

    if (this.token && Date.now() < this.tokenExpiresAt) {
      return this.token;
    }

    try {
      const credentials = btoa(`${this.clientId}:${this.clientSecret}`);

      const data = await requestJson<SpotifyAuthTokenResponse>(
        "spotify",
        "https://accounts.spotify.com/api/token",
        {
          method: "POST",
          headers: {
            Authorization: `Basic ${credentials}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: "grant_type=client_credentials",
          timeoutMs: this.timeoutMs,
        },
      );

      this.token = data.access_token;
      this.tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
      return this.token;
    } catch (error) {
      throw new MoonifyAuthError("spotify", (error as Error).message);
    }
  }

  public async resolveTrack(
    track: string,
    artist: string,
  ): Promise<SpotifyTrackMatch> {
    if (!this.isConfigured) {
      return { trackUrl: null, artistUrl: null };
    }

    try {
      const token = await this.getAccessToken();
      if (!token) return { trackUrl: null, artistUrl: null };

      const query = encodeURIComponent(`track:${track} artist:${artist}`);
      const data = await requestJson<SpotifySearchTrackResponse>(
        "spotify",
        `https://api.spotify.com/v1/search?q=${query}&type=track&limit=1`,
        {
          headers: { Authorization: `Bearer ${token}` },
          timeoutMs: this.timeoutMs,
        },
      );

      const item = data.tracks?.items?.[0];
      if (!item) return { trackUrl: null, artistUrl: null };

      return {
        trackUrl: item.external_urls?.spotify || null,
        artistUrl: item.artists?.[0]?.external_urls?.spotify || null,
      };
    } catch {
      return { trackUrl: null, artistUrl: null };
    }
  }
}
