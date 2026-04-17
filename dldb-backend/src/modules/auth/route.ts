import { Router } from "express";
import { validate } from "../../middleware/validate.js";
import { requireAuth } from "../../middleware/requireAuth.js";
import { changePasswordSchema, loginSchema, registerSchema, updateMeSchema } from "./schema.js";
import { login, logout, me, patchMe, patchPassword, refresh, register } from "./controller.js";

export const authRouter = Router();

authRouter.post("/register", validate(registerSchema), register);
authRouter.post("/login", validate(loginSchema), login);
authRouter.post("/refresh", refresh);
authRouter.post("/logout", logout);
authRouter.get("/me", requireAuth, me);
authRouter.patch("/me", requireAuth, validate(updateMeSchema), patchMe);
authRouter.patch("/me/password", requireAuth, validate(changePasswordSchema), patchPassword);
