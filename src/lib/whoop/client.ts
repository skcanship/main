import { getSession } from "@/lib/get-session";
import { refreshAccessToken } from "@/lib/whoop/oauth";
import { WHOOP_API_BASE } from "@/lib/whoop/oauth";
import type {
  CycleRecord,
  Paginated,
  RecoveryRecord,
  SleepRecord,
  UserProfile,
  WorkoutRecord,
} from "@/lib/whoop/types";
import type { WhoopTokens } from "@/lib/session";

const TOKEN_REFRESH_BUFFER_MS = 60_000; // refresh 1 min before expiry

function tokensFromResponse(data: {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
}): WhoopTokens {
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + data.expires_in * 1000,
    tokenType: data.token_type,
    scopes: data.scope ?? "",
  };
}

/**
 * Returns a valid access token, refreshing (and persisting the new
 * rotating refresh token) when the current access token is near expiry.
 */
export async function getValidAccessToken(): Promise<string> {
  const session = await getSession();

  if (!session.tokens?.accessToken || !session.tokens.refreshToken) {
    throw new AuthRequiredError("Not connected to WHOOP. Please connect your account.");
  }

  const { tokens } = session;
  const needsRefresh = Date.now() >= tokens.expiresAt - TOKEN_REFRESH_BUFFER_MS;

  if (!needsRefresh) {
    return tokens.accessToken;
  }

  try {
    const refreshed = await refreshAccessToken(tokens.refreshToken);
    session.tokens = tokensFromResponse(refreshed);
    await session.save();
    return session.tokens.accessToken;
  } catch (err) {
    // Clear broken tokens so the user can re-auth
    session.tokens = undefined;
    session.user = undefined;
    await session.save();
    throw new AuthRequiredError(
      `Session expired and refresh failed. Please reconnect WHOOP. (${err instanceof Error ? err.message : "unknown"})`
    );
  }
}

export class AuthRequiredError extends Error {
  status = 401;
  constructor(message: string) {
    super(message);
    this.name = "AuthRequiredError";
  }
}

async function whoopFetch<T>(path: string, searchParams?: Record<string, string>): Promise<T> {
  const accessToken = await getValidAccessToken();
  const url = new URL(`${WHOOP_API_BASE}${path}`);
  if (searchParams) {
    for (const [key, value] of Object.entries(searchParams)) {
      if (value !== undefined && value !== "") {
        url.searchParams.set(key, value);
      }
    }
  }

  const res = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (res.status === 401) {
    throw new AuthRequiredError("WHOOP API returned 401. Please reconnect your account.");
  }

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`WHOOP API ${path} failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<T>;
}

/** Fetch recent recovery metrics (Recovery Score, HRV, resting HR) */
export async function fetchRecoveries(limit = 25): Promise<Paginated<RecoveryRecord>> {
  return whoopFetch<Paginated<RecoveryRecord>>("/v2/recovery", {
    limit: String(Math.min(limit, 25)),
  });
}

/** Fetch recent sleep sessions (duration, performance) */
export async function fetchSleeps(limit = 25): Promise<Paginated<SleepRecord>> {
  return whoopFetch<Paginated<SleepRecord>>("/v2/activity/sleep", {
    limit: String(Math.min(limit, 25)),
  });
}

/** Fetch physiological cycles (daily strain lives on cycle.score.strain) */
export async function fetchCycles(limit = 25): Promise<Paginated<CycleRecord>> {
  return whoopFetch<Paginated<CycleRecord>>("/v2/cycle", {
    limit: String(Math.min(limit, 25)),
  });
}

/** Fetch recent workout summaries */
export async function fetchWorkouts(limit = 25): Promise<Paginated<WorkoutRecord>> {
  return whoopFetch<Paginated<WorkoutRecord>>("/v2/activity/workout", {
    limit: String(Math.min(limit, 25)),
  });
}

/** Fetch basic user profile */
export async function fetchProfile(): Promise<UserProfile> {
  return whoopFetch<UserProfile>("/v2/user/profile/basic");
}

export { tokensFromResponse };
