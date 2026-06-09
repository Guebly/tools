export interface BioLink {
  id:    string;
  label: string;
  url:   string;
}

export interface ProfileData {
  username:    string;
  displayName: string;
  bio:         string;
  link:        string;
  bioLinks:    BioLink[];
  posts:       string;
  autoCount:   boolean;
  followers:   string;
  following:   string;
  avatarUrl:   string | null;
  verified:    "none" | "blue" | "gold";
  category:    string;
  ctaLabel:    string;
  storyActive: boolean;
  viewMode:    "owner" | "visitor";
}

export interface Highlight {
  id:       string;
  name:     string;
  coverUrl: string | null;
}

export interface FeedImage {
  id:       string;
  url:      string;
  pinned:   boolean;
  archived: boolean;   // hidden from preview, kept in storage
}

export interface SavedProfile {
  version:    number;
  savedAt:    string;
  profile:    ProfileData;
  highlights: Highlight[];
  feed:       FeedImage[];
}

export type AppTheme   = "dark"  | "light";
export type IgTheme    = "light" | "dark";
export type DeviceView = "mobile" | "desktop";
export type SidebarTab = "profile" | "highlights" | "feed" | "analysis";

export interface FeedAnalysis {
  harmony: number;           // 0-100 score
  dominantColors: string[];
  palette: "warm" | "cool" | "neutral" | "vibrant";
  aesthetic: "minimal" | "colorful" | "professional" | "lifestyle";
  recommendations: string[];
}

export interface Template {
  id: string;
  name: string;
  niche: string;
  thumbnail?: string;
  profile: ProfileData;
  highlights: Highlight[];
  feed: FeedImage[];
}
