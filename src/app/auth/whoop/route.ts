import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { buildAuthorizationUrl, generateOAuthState } from "@/lib/whoop/oauth";

function appOrigin(): string {
  const redirect = process.env.WHOOP_REDIRECT_URI || "http://localhost:3000/auth/whoop/callback";
  try {
    return new URL(redirect).origin;
  } catch {
    return "http://localhost:3000";
  }
}

/**
 * GET /auth/whoop
 * Starts the WHOOP OAuth 2.0 authorization code flow.
 * Redirects the browser to WHOOP's authorize URL with client_id, scope, state, etc.
 */
export async function GET() {
  try {
    const state = generateOAuthState(24);
    const session = await getSession();
    session.oauthState = state;
    await session.save();

    const url = buildAuthorizationUrl(state);
    return NextResponse.redirect(url);
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to start WHOOP OAuth";
    return NextResponse.redirect(`${appOrigin()}/?error=${encodeURIComponent(message)}`);
  }
}
