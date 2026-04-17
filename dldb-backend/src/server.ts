import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import helmet from "helmet";
import { env } from "./config/env.js";
import { connectDb } from "./config/db.js";
import { errorHandler } from "./middleware/errorHandler.js";
import { requestLogger } from "./middleware/requestLogger.js";
import { authRouter } from "./modules/auth/route.js";
import { tagsRouter } from "./modules/tags/route.js";
import { entriesRouter } from "./modules/entries/route.js";
import { dashboardRouter } from "./modules/dashboard/route.js";
import { recurringRouter } from "./modules/recurring/route.js";
import { goalsRouter } from "./modules/goals/route.js";
import { notificationsRouter } from "./modules/notifications/route.js";
import { tickRecurring } from "./modules/recurring/service.js";

async function main() {
  await connectDb();

  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN, credentials: true }));
  app.use(express.json());
  app.use(cookieParser());
  app.use(requestLogger);

  app.get("/healthz", (_req, res) => {
    res.json({ ok: true });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/tags", tagsRouter);
  app.use("/api/entries", entriesRouter);
  app.use("/api/dashboard", dashboardRouter);
  app.use("/api/recurring", recurringRouter);
  app.use("/api/goals", goalsRouter);
  app.use("/api/notifications", notificationsRouter);

  app.use(errorHandler);

  app.listen(env.PORT, () => {
    console.log(`[dldb-backend] listening on :${env.PORT}`);
  });

  tickRecurring().catch(console.error);
  setInterval(() => tickRecurring().catch(console.error), 60_000);
}

main().catch((err) => {
  console.error("[dldb-backend] fatal:", err);
  process.exit(1);
});
