export interface ResolvedCurrentlyPlaying {
  trackName: string;
  artistName: string;
  albumName: string | null;
  coverArtUrl: string | null;
  trackUrl: string;
  artistUrl: string;
  lastFmTrackUrl: string;
  lastFmArtistUrl: string;
  spotifyTrackUrl: string | null;
  spotifyArtistUrl: string | null;
  isOnRepeat: boolean;
  repeatCount: number;
}

export interface ResolvedTrackItem {
  trackName: string;
  artistName: string;
  albumName: string | null;
  coverArtUrl: string | null;
  trackUrl: string;
  artistUrl: string;
  lastFmTrackUrl: string;
  lastFmArtistUrl: string;
  spotifyTrackUrl: string | null;
  spotifyArtistUrl: string | null;
  isPlaying: boolean;
}

export interface LastFmUserProfile {
  username: string;
  url: string;
  avatarUrl: string | null;
  country: string | null;
  playCount: number;
  registeredAt: number | null;
}
