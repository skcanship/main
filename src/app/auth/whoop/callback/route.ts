import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";
import { exchangeCodeForTokens } from "@/lib/whoop/oauth";
import { tokensFromResponse, fetchProfile } from "@/lib/whoop/client";

function appOrigin(): string {
  const redirect = process.env.WHOOP_REDIRECT_URI || "http://localhost:3000/auth/whoop/callback";
  return new URL(redirect).origin;
}

/**
 * GET /auth/whoop/callback
 * WHOOP redirects here with ?code=...&state=...
 * Exchanges the code for tokens and stores them in an encrypted session cookie.
 */
export async function GET(request: NextRequest) {
  const origin = appOrigin();
  const { searchParams } = request.nextUrl;
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  const error = searchParams.get("error");
  const errorDescription = searchParams.get("error_description");

  if (error) {
    const msg = errorDescription || error;
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(msg)}`);
  }

  if (!code) {
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent("Missing authorization code from WHOOP")}`
    );
  }

  const session = await getSession();

  // Validate CSRF state
  if (!state || !session.oauthState || state !== session.oauthState) {
    session.oauthState = undefined;
    await session.save();
    return NextResponse.redirect(
      `${origin}/?error=${encodeURIComponent("Invalid OAuth state — please try connecting again")}`
    );
  }

  try {
    const tokenData = await exchangeCodeForTokens(code);
    session.tokens = tokensFromResponse(tokenData);
    session.oauthState = undefined;
    await session.save();

    // Best-effort profile fetch (needs read:profile scope)
    try {
      const profile = await fetchProfile();
      session.user = {
        userId: profile.user_id,
        firstName: profile.first_name,
        lastName: profile.last_name,
        email: profile.email,
      };
      await session.save();
    } catch {
      // Profile is optional — dashboard still works without it
    }

    return NextResponse.redirect(`${origin}/dashboard`);
  } catch (err) {
    session.oauthState = undefined;
    await session.save();
    const message = err instanceof Error ? err.message : "Token exchange failed";
    return NextResponse.redirect(`${origin}/?error=${encodeURIComponent(message)}`);
  }
}
