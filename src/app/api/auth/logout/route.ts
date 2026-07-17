import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";

/** POST /api/auth/logout — clear WHOOP tokens from the session */
export async function POST() {
  const session = await getSession();
  session.tokens = undefined;
  session.user = undefined;
  session.oauthState = undefined;
  await session.save();
  return NextResponse.json({ ok: true });
}
