// Lightweight session store backed by localStorage so the presenter view
// and the My Polls list stay in sync across navigations and tabs.

export type PastSession = {
  id: string;
  name: string; // formatted date label, e.g. "Apr 28, 2026 11:30 AM"
  endedAt: number;
  participants: number;
};

export type ActiveSession = {
  startedAt: number;
  name: string; // same formatted label as past sessions
};

type PollState = {
  active: ActiveSession | null;
  past: PastSession[];
};

const KEY = "nextgenpoll.sessions.v1";

type Store = Record<string, PollState>;

const read = (): Store => {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Store) : {};
  } catch {
    return {};
  }
};

const write = (store: Store) => {
  try {
    localStorage.setItem(KEY, JSON.stringify(store));
    // Notify same-tab listeners
    window.dispatchEvent(new Event("nextgenpoll:sessions"));
  } catch {
    /* noop */
  }
};

export const formatSessionLabel = (d = new Date()) =>
  d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });

export const getPollState = (pollId: string): PollState => {
  const store = read();
  return store[pollId] ?? { active: null, past: [] };
};

const setPollState = (pollId: string, state: PollState) => {
  const store = read();
  store[pollId] = state;
  write(store);
};

/** Mark a session as active (called when entering presenter view). */
export const ensureActiveSession = (pollId: string): ActiveSession => {
  const state = getPollState(pollId);
  if (state.active) return state.active;
  const active: ActiveSession = {
    startedAt: Date.now(),
    name: formatSessionLabel(),
  };
  setPollState(pollId, { ...state, active });
  return active;
};

/** Leave the page but keep the session active — no-op besides ensuring it exists. */
export const leaveSessionActive = (pollId: string) => {
  ensureActiveSession(pollId);
};

/** End current session: move active → past list. */
export const endActiveSession = (pollId: string) => {
  const state = getPollState(pollId);
  if (!state.active) return;
  const past: PastSession = {
    id: `${state.active.startedAt}`,
    name: state.active.name,
    endedAt: Date.now(),
  };
  setPollState(pollId, { active: null, past: [past, ...state.past] });
};

/** Subscribe to changes (cross-tab via 'storage', same-tab via custom event). */
export const subscribe = (cb: () => void) => {
  const handler = () => cb();
  window.addEventListener("storage", handler);
  window.addEventListener("nextgenpoll:sessions", handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener("nextgenpoll:sessions", handler);
  };
};
