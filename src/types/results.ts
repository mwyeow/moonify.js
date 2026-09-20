export interface ResolvedCurrentlyPlaying {
  trackName: string;
  artistName: string;
  trackUrl: string;
  artistUrl: string;
  lastFmTrackUrl: string;
  lastFmArtistUrl: string;
  spotifyTrackUrl: string | null;
  spotifyArtistUrl: string | null;
  isOnRepeat: boolean;
  repeatCount: number;
}
