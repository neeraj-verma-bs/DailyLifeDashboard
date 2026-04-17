"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { loginSchema, type LoginInput } from "@/features/auth/schema";
import { useLoginMutation } from "@/features/auth/api";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

export default function LoginPage() {
  const router = useRouter();
  const [login, { isLoading }] = useLoginMutation();
  const { register, handleSubmit, formState: { errors } } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginInput) => {
    try {
      await login(values).unwrap();
      router.replace("/dashboard");
    } catch (err: unknown) {
      const msg = (err as { data?: { error?: { message?: string } } })?.data?.error?.message ?? "Login failed";
      toast.error(msg);
    }
  };

  return (
    <>
      <h1 className="text-xl font-semibold mb-4">Log in</h1>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
        <div>
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1" htmlFor="email">Email</label>
          <Input id="email" type="email" autoComplete="email" {...register("email")} />
          {errors.email && <p className="text-xs text-red-400 mt-1">{errors.email.message}</p>}
        </div>
        <div>
          <label className="block text-xs text-[var(--color-text-secondary)] mb-1" htmlFor="password">Password</label>
          <Input id="password" type="password" autoComplete="current-password" {...register("password")} />
          {errors.password && <p className="text-xs text-red-400 mt-1">{errors.password.message}</p>}
        </div>
        <Button type="submit" disabled={isLoading} className="w-full">
          {isLoading ? "Logging in…" : "Log in"}
        </Button>
      </form>
      <p className="mt-4 text-sm text-[var(--color-text-secondary)]">
        No account? <Link className="text-[var(--color-accent-primary)] hover:underline" href="/register">Create one</Link>
      </p>
    </>
  );
}
