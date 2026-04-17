import bcrypt from "bcrypt";
import { User, type UserDoc } from "./model.js";
import type { LoginInput, RegisterInput } from "./schema.js";
import { ConflictError, NotFoundError, UnauthorizedError, ValidationError } from "../../lib/errors.js";
import { seedSystemTags } from "../tags/seed.js";

const BCRYPT_ROUNDS = 10;

export async function registerUser(input: RegisterInput): Promise<UserDoc> {
  const existing = await User.findOne({ email: input.email }).lean();
  if (existing) throw new ConflictError("Email is already registered", "EMAIL_TAKEN");
  const passwordHash = await bcrypt.hash(input.password, BCRYPT_ROUNDS);
  const user = await User.create({
    name: input.name,
    email: input.email,
    passwordHash,
  });
  await seedSystemTags(user._id);
  return user;
}

export async function loginUser(input: LoginInput): Promise<UserDoc> {
  const user = await User.findOne({ email: input.email });
  if (!user) throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS");
  const ok = await bcrypt.compare(input.password, user.passwordHash);
  if (!ok) throw new UnauthorizedError("Invalid credentials", "INVALID_CREDENTIALS");
  return user;
}

export async function getUserById(id: string): Promise<UserDoc> {
  const user = await User.findById(id);
  if (!user) throw new NotFoundError("User not found", "USER_NOT_FOUND");
  return user;
}

export async function updateMe(
  userId: string,
  data: { name?: string; email?: string },
): Promise<UserDoc> {
  const user = await getUserById(userId);
  if (data.name !== undefined) user.name = data.name;
  if (data.email !== undefined) {
    const existing = await User.findOne({
      email: data.email,
      _id: { $ne: user._id },
    });
    if (existing) throw new ConflictError("Email already in use", "EMAIL_TAKEN");
    user.email = data.email;
  }
  await user.save();
  return user;
}

export async function changePassword(
  userId: string,
  currentPassword: string,
  newPassword: string,
): Promise<void> {
  const user = await User.findById(userId);
  if (!user) throw new NotFoundError("User not found", "USER_NOT_FOUND");
  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) throw new ValidationError("Current password is incorrect", "WRONG_PASSWORD");
  user.passwordHash = await bcrypt.hash(newPassword, 12);
  await user.save();
}
