import type { ProfileData, Highlight, FeedImage } from "./types";

export interface SavedSession {
  version: number;
  savedAt: string;
  profile:    ProfileData;
  highlights: Highlight[];
  feed:       FeedImage[];
}

const KEY = "instapreview-session";

/** Save the current state to localStorage. Returns bytes used or throws on quota. */
export function saveSession(
  profile: ProfileData,
  highlights: Highlight[],
  feed: FeedImage[],
): { ok: true; bytes: number } | { ok: false; error: string } {
  const session: SavedSession = {
    version:    1,
    savedAt:    new Date().toISOString(),
    profile,
    highlights,
    feed,
  };
  try {
    const json = JSON.stringify(session);
    localStorage.setItem(KEY, json);
    return { ok: true, bytes: json.length };
  } catch (e: any) {
    // QuotaExceededError — too many large base64 images
    if (e?.name === "QuotaExceededError" || e?.code === 22) {
      return {
        ok: false,
        error:
          "Sessão muito grande para salvar (imagens pesadas). " +
          "Tente remover algumas fotos do feed ou use imagens menores.",
      };
    }
    return { ok: false, error: e?.message || "Erro desconhecido ao salvar." };
  }
}

/** Load the saved session from localStorage. */
export function loadSession(): SavedSession | null {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SavedSession;
    // Basic validation
    if (!parsed.profile || !Array.isArray(parsed.highlights) || !Array.isArray(parsed.feed)) {
      return null;
    }
    return parsed;
  } catch {
    return null;
  }
}

/** Clear saved session. */
export function clearSession(): void {
  try { localStorage.removeItem(KEY); } catch {}
}

/** Check if there's a saved session without loading it fully. */
export function hasSavedSession(): boolean {
  try { return !!localStorage.getItem(KEY); } catch { return false; }
}

/** Format bytes for display (e.g. 1.2 MB). */
export function formatBytes(bytes: number): string {
  if (bytes < 1024)       return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/** Get approximate size of saved session. */
export function savedSessionSize(): number {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? raw.length : 0;
  } catch { return 0; }
}
