import mongoose from "mongoose";
import { env } from "./env.js";

export async function connectDb(): Promise<void> {
  mongoose.set("strictQuery", true);
  await mongoose.connect(env.MONGODB_URI);
  console.log("[dldb-backend] connected to mongodb");
}

export async function disconnectDb(): Promise<void> {
  await mongoose.disconnect();
}
