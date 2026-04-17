import type { CookieOptions, Response } from "express";
import { env, isProd } from "../config/env.js";

const ACCESS_COOKIE = "auth";
const REFRESH_COOKIE = "refresh";
const ACCESS_MAX_AGE_MS = 15 * 60 * 1000;
const REFRESH_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;

function baseOptions(): CookieOptions {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: isProd,
    domain: env.COOKIE_DOMAIN,
  };
}

export function setAccessCookie(res: Response, token: string) {
  res.cookie(ACCESS_COOKIE, token, {
    ...baseOptions(),
    path: "/",
    maxAge: ACCESS_MAX_AGE_MS,
  });
}

export function setRefreshCookie(res: Response, token: string) {
  res.cookie(REFRESH_COOKIE, token, {
    ...baseOptions(),
    path: "/api/auth/refresh",
    maxAge: REFRESH_MAX_AGE_MS,
  });
}

export function clearAuthCookies(res: Response) {
  res.clearCookie(ACCESS_COOKIE, { ...baseOptions(), path: "/" });
  res.clearCookie(REFRESH_COOKIE, { ...baseOptions(), path: "/api/auth/refresh" });
}

export const cookieNames = { ACCESS_COOKIE, REFRESH_COOKIE } as const;
