import { initialState, type SaveState } from './progress';

const KEY = 'codequest.save';

/** Progress lives only in this device's WebView storage. Reads and writes are
 * wrapped because storage can be unavailable or full; the game still runs,
 * it just won't remember. */
export function loadState(): SaveState {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as Partial<SaveState>;
    if (parsed.v !== 1) return initialState();
    const base = initialState();
    return {
      ...base,
      ...parsed,
      streak: { ...base.streak, ...parsed.streak },
      stats: { ...base.stats, ...parsed.stats },
      settings: { ...base.settings, ...parsed.settings },
      today: { ...base.today, ...parsed.today },
      // Saves from before the intro existed: skip it for anyone who has played.
      onboarded: parsed.onboarded ?? Object.keys(parsed.lessons ?? {}).length > 0,
    };
  } catch {
    return initialState();
  }
}

export function saveState(s: SaveState): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(s));
  } catch {
    // Storage unavailable: keep playing without saving.
  }
}

export function resetState(): SaveState {
  try {
    localStorage.removeItem(KEY);
  } catch {
    // ignore
  }
  return initialState();
}
