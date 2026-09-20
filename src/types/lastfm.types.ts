export interface LastFmTrackArtist {
  "#text"?: string;
  name?: string;
  mbid?: string;
}

export interface LastFmRawTrack {
  name: string;
  artist: LastFmTrackArtist;
  url: string;
  streamable?: string;
  mbid?: string;
  album?: {
    "#text"?: string;
  };
  "@attr"?: {
    nowplaying?: string;
  };
}

export interface LastFmRecentTracksResponse {
  recenttracks?: {
    track?: LastFmRawTrack | LastFmRawTrack[];
    "@attr"?: {
      user: string;
      totalPages: string;
      page: string;
      perPage: string;
      total: string;
    };
  };
}
