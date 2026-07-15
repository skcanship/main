/**
 * WHOOP OAuth 2.0 helpers
 *
 * Auth URL:  https://api.prod.whoop.com/oauth/oauth2/auth
 * Token URL: https://api.prod.whoop.com/oauth/oauth2/token
 *
 * Scopes are space-delimited. `offline` is required for refresh tokens.
 * WHOOP uses rotating refresh tokens — always save the new refresh_token
 * returned from a refresh exchange.
 */

export const WHOOP_AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
export const WHOOP_TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
export const WHOOP_API_BASE = "https://api.prod.whoop.com/developer";

/** Scopes required for recovery, sleep, strain (cycles), workouts, and offline refresh */
export const WHOOP_SCOPES = [
  "read:recovery",
  "read:sleep",
  "read:cycles",
  "read:workout",
  "read:profile",
  "offline",
].join(" ");

export function getWhoopConfig() {
  const clientId = process.env.WHOOP_CLIENT_ID;
  const clientSecret = process.env.WHOOP_CLIENT_SECRET;
  const redirectUri = process.env.WHOOP_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "Missing WHOOP env vars. Set WHOOP_CLIENT_ID, WHOOP_CLIENT_SECRET, and WHOOP_REDIRECT_URI in .env.local"
    );
  }

  return { clientId, clientSecret, redirectUri };
}

/** Build the WHOOP authorization URL the browser should redirect to */
export function buildAuthorizationUrl(state: string): string {
  const { clientId, redirectUri } = getWhoopConfig();
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    scope: WHOOP_SCOPES,
    state,
  });
  return `${WHOOP_AUTH_URL}?${params.toString()}`;
}

export type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope?: string;
};

/** Exchange an authorization code for access + refresh tokens */
export async function exchangeCodeForTokens(code: string): Promise<TokenResponse> {
  const { clientId, clientSecret, redirectUri } = getWhoopConfig();

  const body = new URLSearchParams({
    grant_type: "authorization_code",
    code,
    client_id: clientId,
    client_secret: clientSecret,
    redirect_uri: redirectUri,
  });

  const res = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token exchange failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<TokenResponse>;
}

/**
 * Refresh an access token using the refresh token.
 * WHOOP rotates refresh tokens — the response includes a NEW refresh_token
 * that invalidates the previous one. Always persist both tokens.
 */
export async function refreshAccessToken(refreshToken: string): Promise<TokenResponse> {
  const { clientId, clientSecret } = getWhoopConfig();

  const body = new URLSearchParams({
    grant_type: "refresh_token",
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    scope: WHOOP_SCOPES,
  });

  const res = await fetch(WHOOP_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Token refresh failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<TokenResponse>;
}

/** Cryptographically random state string (>= 8 chars) for CSRF protection */
export function generateOAuthState(length = 24): string {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join("");
}
