"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useLogin } from "@/hooks/useAuth";
import { getErrorMessage } from "@/lib/api";
import { loginSchema, type LoginValues } from "@/schemas/auth";

export default function LoginPage() {
  const login = useLogin();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({ resolver: zodResolver(loginSchema) });

  return (
    <Card className="p-6 sm:p-8">
      <h2 className="text-lg font-semibold text-slate-900">Log in</h2>
      <p className="mt-1 text-sm text-slate-500">Welcome back. Enter your details to continue.</p>

      <form
        className="mt-6 space-y-4"
        noValidate
        onSubmit={handleSubmit((values) => login.mutate(values))}
      >
        {login.isError && <Alert>{getErrorMessage(login.error)}</Alert>}

        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field label="Password" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        <Button type="submit" className="w-full" loading={login.isPending}>
          Log in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Don&apos;t have an account?{" "}
        <Link href="/register" className="font-medium text-indigo-600 hover:text-indigo-500">
          Sign up
        </Link>
      </p>
    </Card>
  );
}
