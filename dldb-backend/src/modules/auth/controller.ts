import type { RequestHandler } from "express";
import { getValidated } from "../../middleware/validate.js";
import type { ChangePasswordInput, LoginInput, RegisterInput, UpdateMeInput } from "./schema.js";
import { changePassword, getUserById, loginUser, registerUser, updateMe } from "./service.js";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "../../lib/tokens.js";
import { UnauthorizedError } from "../../lib/errors.js";

export const register: RequestHandler = async (req, res) => {
  const input = getValidated<RegisterInput>(req);
  const user = await registerUser(input);
  const userId = user._id.toString();
  res.status(201).json({
    user: user.toJSON(),
    accessToken: signAccessToken(userId),
    refreshToken: signRefreshToken(userId),
  });
};

export const login: RequestHandler = async (req, res) => {
  const input = getValidated<LoginInput>(req);
  const user = await loginUser(input);
  const userId = user._id.toString();
  res.json({
    user: user.toJSON(),
    accessToken: signAccessToken(userId),
    refreshToken: signRefreshToken(userId),
  });
};

export const refresh: RequestHandler = async (req, res) => {
  const token = req.body?.refreshToken as string | undefined;
  if (!token) throw new UnauthorizedError("Missing refresh token");
  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new UnauthorizedError("Invalid or expired refresh token");
  }
  res.json({ accessToken: signAccessToken(decoded.sub) });
};

export const logout: RequestHandler = async (_req, res) => {
  res.json({ ok: true });
};

export const me: RequestHandler = async (req, res) => {
  const user = await getUserById(req.user!.id);
  res.json({ user: user.toJSON() });
};

export const patchMe: RequestHandler = async (req, res) => {
  const input = getValidated<UpdateMeInput>(req);
  const user = await updateMe(req.user!.id, input);
  res.json(user.toJSON());
};

export const patchPassword: RequestHandler = async (req, res) => {
  const input = getValidated<ChangePasswordInput>(req);
  await changePassword(req.user!.id, input.currentPassword, input.newPassword);
  res.status(204).end();
};
