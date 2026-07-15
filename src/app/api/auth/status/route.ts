import { NextResponse } from "next/server";
import { getSession } from "@/lib/get-session";

/** GET /api/auth/status — whether the user has connected WHOOP */
export async function GET() {
  const session = await getSession();
  return NextResponse.json({
    connected: Boolean(session.tokens?.accessToken),
    user: session.user
      ? {
          firstName: session.user.firstName,
          lastName: session.user.lastName,
          email: session.user.email,
        }
      : null,
  });
}
