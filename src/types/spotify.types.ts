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

export interface SpotifyTrackItem {
  id: string;
  name: string;
  artists: SpotifyArtist[];
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
}
