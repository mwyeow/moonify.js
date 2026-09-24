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
                  album: { "#text": "Album C" },
                  image: [
                    { size: "small", "#text": "https://lastfm.test/small.jpg" },
                    {
                      size: "extralarge",
                      "#text": "https://lastfm.test/large.jpg",
                    },
                  ],
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
                  album: {
                    name: "Album C (Spotify)",
                    images: [
                      {
                        url: "https://spotify.test/640x640.jpg",
                        height: 640,
                        width: 640,
                      },
                    ],
                    external_urls: {
                      spotify: "https://open.spotify.com/album/789",
                    },
                  },
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
    expect(result?.albumName).toBe("Album C (Spotify)");
    expect(result?.coverArtUrl).toBe("https://spotify.test/640x640.jpg");
    expect(result?.trackUrl).toBe("https://open.spotify.com/track/123");
    expect(result?.artistUrl).toBe("https://open.spotify.com/artist/456");
    expect(result?.isOnRepeat).toBe(true);
    expect(result?.repeatCount).toBe(2);
  });

  it("fetches recent tracks with limit and playback flags", async () => {
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = getUrlString(input);

      if (url.includes("method=user.getrecenttracks")) {
        return new Response(
          JSON.stringify({
            recenttracks: {
              track: [
                {
                  name: "Song 1",
                  artist: { "#text": "Artist 1" },
                  album: { "#text": "Album 1" },
                  url: "https://www.last.fm/music/Artist+1/_/Song+1",
                  image: [
                    {
                      size: "extralarge",
                      "#text": "https://lastfm.test/song1.jpg",
                    },
                  ],
                  "@attr": { nowplaying: "true" },
                },
                {
                  name: "Song 2",
                  artist: { "#text": "Artist 2" },
                  album: { "#text": "Album 2" },
                  url: "https://www.last.fm/music/Artist+2/_/Song+2",
                  image: [
                    {
                      size: "extralarge",
                      "#text": "https://lastfm.test/song2.jpg",
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

    const client = new Moonify({ lastfmApiKey: "dummy" });
    const recents = await client.getRecentTracks("testuser", 2);

    expect(recents.length).toBe(2);
    expect(recents[0].trackName).toBe("Song 1");
    expect(recents[0].isPlaying).toBe(true);
    expect(recents[0].coverArtUrl).toBe("https://lastfm.test/song1.jpg");
    expect(recents[1].trackName).toBe("Song 2");
    expect(recents[1].isPlaying).toBe(false);
  });

  it("fetches and parses user profile information", async () => {
    globalThis.fetch = (async (input: string | URL | Request) => {
      const url = getUrlString(input);

      if (url.includes("method=user.getinfo")) {
        return new Response(
          JSON.stringify({
            user: {
              name: "mwyeow",
              realname: "Mw Yeow",
              url: "https://www.last.fm/user/mwyeow",
              country: "United Kingdom",
              playcount: "12345",
              registered: {
                unixtime: "1609459200",
                "#text": 1609459200,
              },
              image: [
                { size: "large", "#text": "https://lastfm.test/avatar-lg.jpg" },
                {
                  size: "extralarge",
                  "#text": "https://lastfm.test/avatar-xl.jpg",
                },
              ],
            },
          }),
          { status: 200 },
        );
      }

      return new Response(null, { status: 404 });
    }) as unknown as typeof fetch;

    const client = new Moonify({ lastfmApiKey: "dummy" });
    const profile = await client.getUserProfile("mwyeow");

    expect(profile).not.toBeNull();
    expect(profile?.username).toBe("mwyeow");
    expect(profile?.country).toBe("United Kingdom");
    expect(profile?.playCount).toBe(12345);
    expect(profile?.registeredAt).toBe(1609459200);
    expect(profile?.avatarUrl).toBe("https://lastfm.test/avatar-xl.jpg");
  });
});
