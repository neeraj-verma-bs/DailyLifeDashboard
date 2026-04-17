import type { RequestHandler } from "express";
import { verifyAccessToken } from "../lib/tokens.js";
import { cookieNames } from "../lib/cookies.js";
import { UnauthorizedError } from "../lib/errors.js";

export const requireAuth: RequestHandler = (req, _res, next) => {
  const token = req.cookies?.[cookieNames.ACCESS_COOKIE];
  if (!token) return next(new UnauthorizedError("Missing access token"));
  try {
    const decoded = verifyAccessToken(token);
    req.user = { id: decoded.sub };
    next();
  } catch {
    next(new UnauthorizedError("Invalid or expired access token"));
  }
};
