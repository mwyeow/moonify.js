import { describe, expect, it, afterEach } from "bun:test";
import { Moonify } from "../src/index.js";

function getUrlString(input: string | URL | Request): string {
  if (typeof input === "string") return input;
  if ("url" in input) return input.url;
  return input.toString();
}

describe("Moonify Client", () => {
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    globalThis.fetch = originalFetch;
  });

  it("throws when lastfm key is missing", () => {
    expect(() => new Moonify({ lastfmApiKey: "" })).toThrow(
      "lastfm api key is required.",
    );
  });

  it("returns null when no track is currently playing", async () => {
    globalThis.fetch = (async () =>
      new Response(
        JSON.stringify({
          recenttracks: {
            track: [
              {
                name: "Song A",
                artist: { "#text": "Artist B" },
                url: "https://www.last.fm/music/Artist+B/_/Song+A",
                "@attr": { nowplaying: "false" },
              },
            ],
          },
        }),
        { status: 200 },
      )) as unknown as typeof fetch;

    const client = new Moonify({ lastfmApiKey: "dummy" });
    const result = await client.getCurrentlyPlaying("testuser");

    expect(result).toBeNull();
  });

  it("resolves currently playing track and tracks repeat status", async () => {
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = getUrlString(input);

      if (url.includes("audioscrobbler.com")) {
        return new Response(
          JSON.stringify({
            recenttracks: {
              track: [
                {
                  name: "Song A",
                  artist: { "#text": "Artist B" },
                  url: "https://www.last.fm/music/Artist+B/_/Song+A",
                  "@attr": { nowplaying: "true" },
                },
                {
                  name: "Song A",
                  artist: { "#text": "Artist B" },
                  url: "https://www.last.fm/music/Artist+B/_/Song+A",
                },
                {
                  name: "Song A",
                  artist: { "#text": "Artist B" },
                  url: "https://www.last.fm/music/Artist+B/_/Song+A",
                },
              ],
            },
          }),
          { status: 200 },
        );
      }

      if (url.includes("accounts.spotify.com")) {
        return new Response(
          JSON.stringify({
            access_token: "test_token",
            expires_in: 3600,
          }),
          { status: 200 },
        );
      }

      if (url.includes("api.spotify.com")) {
        return new Response(
          JSON.stringify({
            tracks: {
              items: [
                {
                  external_urls: {
                    spotify: "https://open.spotify.com/track/123",
                  },
                  artists: [
                    {
                      external_urls: {
                        spotify: "https://open.spotify.com/artist/456",
                      },
                    },
                  ],
                },
              ],
            },
          }),
          { status: 200 },
        );
      }

      return new Response(null, { status: 404 });
    }) as unknown as typeof fetch;

    const client = new Moonify({
      lastfmApiKey: "dummy",
      spotifyClientId: "id",
      spotifyClientSecret: "secret",
    });

    const result = await client.getCurrentlyPlaying("testuser");

    expect(result).not.toBeNull();
    expect(result?.trackName).toBe("Song A");
    expect(result?.artistName).toBe("Artist B");
    expect(result?.trackUrl).toBe("https://open.spotify.com/track/123");
    expect(result?.artistUrl).toBe("https://open.spotify.com/artist/456");
    expect(result?.isOnRepeat).toBe(true);
    expect(result?.repeatCount).toBe(2);
  });
});
