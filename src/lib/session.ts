import { SessionOptions } from "iron-session";

export type WhoopTokens = {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // unix ms
  tokenType: string;
  scopes: string;
};

export type AppSession = {
  tokens?: WhoopTokens;
  oauthState?: string;
  user?: {
    userId: number;
    firstName: string;
    lastName: string;
    email: string;
  };
};

export const sessionOptions: SessionOptions = {
  password: process.env.SESSION_SECRET || "dev-only-session-secret-min-32-characters!!",
  cookieName: "whoop_dashboard_session",
  cookieOptions: {
    secure: process.env.NODE_ENV === "production",
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  },
};
