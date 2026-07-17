import { getIronSession } from "iron-session";
import { cookies } from "next/headers";
import { AppSession, sessionOptions } from "@/lib/session";

export async function getSession() {
  const cookieStore = await cookies();
  return getIronSession<AppSession>(cookieStore, sessionOptions);
}
