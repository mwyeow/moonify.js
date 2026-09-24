export interface LastFmTrackArtist {
  "#text"?: string;
  name?: string;
  mbid?: string;
}

export interface LastFmTrackImage {
  "#text": string;
  size: "small" | "medium" | "large" | "extralarge" | "";
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
  image?: LastFmTrackImage[];
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

export interface LastFmUserInfoResponse {
  user?: {
    name: string;
    realname?: string;
    url: string;
    image?: LastFmTrackImage[];
    country?: string;
    playcount?: string | number;
    playlists?: string | number;
    registered?: {
      unixtime: string;
      "#text": number;
    };
  };
}
