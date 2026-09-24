export interface SpotifyAuthTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

export interface SpotifyArtist {
  name: string;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyImage {
  url: string;
  height: number | null;
  width: number | null;
}

export interface SpotifyAlbum {
  name: string;
  images: SpotifyImage[];
  external_urls: {
    spotify: string;
  };
}

export interface SpotifyTrackItem {
  id: string;
  name: string;
  artists: SpotifyArtist[];
  album: SpotifyAlbum;
  external_urls: {
    spotify: string;
  };
}

export interface SpotifySearchTrackResponse {
  tracks?: {
    items: SpotifyTrackItem[];
  };
}

export interface SpotifyTrackMatch {
  trackUrl: string | null;
  artistUrl: string | null;
  albumName: string | null;
  coverArtUrl: string | null;
}
