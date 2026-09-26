"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Field } from "@/components/ui/Field";
import { Input } from "@/components/ui/Input";
import { useRegister } from "@/hooks/useAuth";
import { getErrorCode, getErrorMessage, getFieldErrors } from "@/lib/api";
import { registerSchema, type RegisterValues } from "@/schemas/auth";

export default function RegisterPage() {
  const registerUser = useRegister();
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<RegisterValues>({ resolver: zodResolver(registerSchema) });

  const onSubmit = (values: RegisterValues) =>
    registerUser.mutate(values, {
      onError: (error) => {
        if (getErrorCode(error) === "EMAIL_TAKEN") {
          setError("email", { message: getErrorMessage(error) });
          return;
        }
        for (const [field, message] of Object.entries(getFieldErrors(error))) {
          if (field === "name" || field === "email" || field === "password") {
            setError(field, { message });
          }
        }
      },
    });

  // Field errors are shown inline; only show the banner for other failures.
  const showBanner =
    registerUser.isError &&
    getErrorCode(registerUser.error) !== "EMAIL_TAKEN" &&
    getErrorCode(registerUser.error) !== "VALIDATION_ERROR";

  return (
    <Card className="p-6 sm:p-10">
      <h2 className="text-2xl font-semibold tracking-tight text-slate-900">Create an account</h2>
      <p className="mt-2 text-sm text-slate-500">Start tracking your income and expenses.</p>

      <form className="mt-8 space-y-5" noValidate onSubmit={handleSubmit(onSubmit)}>
        {showBanner && <Alert>{getErrorMessage(registerUser.error)}</Alert>}

        <Field label="Name" htmlFor="name" error={errors.name?.message}>
          <Input
            className="h-11"
            id="name"
            autoComplete="name"
            aria-invalid={!!errors.name}
            {...register("name")}
          />
        </Field>

        <Field label="Email" htmlFor="email" error={errors.email?.message}>
          <Input
            className="h-11"
            id="email"
            type="email"
            autoComplete="email"
            aria-invalid={!!errors.email}
            {...register("email")}
          />
        </Field>

        <Field
          label="Password"
          htmlFor="password"
          error={errors.password?.message}
          hint="At least 8 characters."
        >
          <Input
            className="h-11"
            id="password"
            type="password"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            {...register("password")}
          />
        </Field>

        <Button type="submit" className="h-11 w-full" loading={registerUser.isPending}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-slate-500">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-brand-600 hover:text-brand-500">
          Log in
        </Link>
      </p>
    </Card>
  );
}
