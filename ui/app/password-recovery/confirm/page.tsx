"use client";

import { passwordResetConfirm } from "@/actions/password/password-reset-action";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/ui/submitButton";
import { passwordResetConfirmSchema } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Lock } from "lucide-react";
import Link from "next/link";
import { notFound, useSearchParams } from "next/navigation";
import { Suspense, startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type PasswordResetConfirmInputs = z.infer<typeof passwordResetConfirmSchema>;

function ResetPasswordForm() {
	const [state, dispatch] = useActionState(passwordResetConfirm, undefined);
	const searchParams = useSearchParams();
	const token = searchParams.get("token");

	if (!token) {
		notFound();
	}

	const {
		register: registerField,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<PasswordResetConfirmInputs>({
		resolver: zodResolver(passwordResetConfirmSchema),
		mode: "onBlur",
		defaultValues: {
			password: "",
			passwordConfirm: "",
			token,
		},
	});

	useEffect(() => {
		if (state?.errors) {
			for (const [key, message] of Object.entries(state.errors)) {
				setError(key as keyof PasswordResetConfirmInputs, {
					type: "server",
					message: Array.isArray(message) ? message[0] : message,
				});
			}
		}
	}, [state, setError]);

	const onSubmit = (data: PasswordResetConfirmInputs) => {
		const formData = new FormData();
		formData.append("password", data.password);
		formData.append("passwordConfirm", data.passwordConfirm);
		formData.append("resetToken", data.token);
		startTransition(() => {
			dispatch(formData);
		});
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50 via-gray-50 to-gray-100 dark:from-blue-950/20 dark:via-gray-950 dark:to-gray-900 px-4 py-12">
			<Card className="w-full max-w-md rounded-2xl shadow-2xl border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in duration-500">
				<CardHeader className="text-center space-y-1 pb-2 pt-8">
					<div className="mx-auto bg-blue-500/10 p-4 rounded-2xl w-fit mb-4 ring-1 ring-blue-500/20">
						<Lock className="h-10 w-10 text-blue-600 dark:text-blue-400" />
					</div>
					<CardTitle className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
						Restablecer Contraseña
					</CardTitle>
					<CardDescription className="text-gray-500 dark:text-gray-400 text-base">
						Ingresá tu nueva contraseña y confirmála.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-8 pt-4">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-sm font-semibold ml-1 text-gray-700 dark:text-gray-300"
							>
								Nueva Contraseña
							</Label>
							<PasswordInput
								{...registerField("password")}
								id="password"
								placeholder="••••••••"
								autoComplete="new-password"
								className={cn(
									errors.password &&
										"border-red-500 focus:ring-red-500/20 bg-red-50/30",
								)}
							/>
							{errors.password && (
								<p
									className="text-xs font-semibold text-red-500 ml-1 mt-1 flex items-center gap-1 animate-in slide-in-from-top-1"
									role="alert"
								>
									<span
										className="w-1 h-1 rounded-full bg-red-500"
										aria-hidden="true"
									/>
									{errors.password.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="passwordConfirm"
								className="text-sm font-semibold ml-1 text-gray-700 dark:text-gray-300"
							>
								Confirmar Contraseña
							</Label>
							<PasswordInput
								{...registerField("passwordConfirm")}
								id="passwordConfirm"
								placeholder="••••••••"
								autoComplete="new-password"
								className={cn(
									errors.passwordConfirm &&
										"border-red-500 focus:ring-red-500/20 bg-red-50/30",
								)}
							/>
							{errors.passwordConfirm && (
								<p
									className="text-xs font-semibold text-red-500 ml-1 mt-1 flex items-center gap-1 animate-in slide-in-from-top-1"
									role="alert"
								>
									<span
										className="w-1 h-1 rounded-full bg-red-500"
										aria-hidden="true"
									/>
									{errors.passwordConfirm.message}
								</p>
							)}
						</div>

						<input type="hidden" {...registerField("token")} />

						<div className="pt-2">
							<SubmitButton
								text="Restablecer Contraseña"
								className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
							/>
						</div>

						{state?.server_validation_error && (
							<div className="bg-red-50 dark:bg-red-900/10 py-3 px-4 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in">
								<p className="text-sm font-semibold text-red-600 dark:text-red-400 text-center">
									{state.server_validation_error}
								</p>
							</div>
						)}

						{state?.server_error && (
							<div className="bg-red-50 dark:bg-red-900/10 py-3 px-4 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in">
								<p className="text-sm font-semibold text-red-600 dark:text-red-400 text-center">
									{state.server_error}
								</p>
							</div>
						)}

						<div className="text-center text-sm pt-2">
							<Link
								href="/login"
								className="text-blue-600 dark:text-blue-400 font-bold hover:underline decoration-2 underline-offset-4 transition-all"
							>
								Volver al inicio de sesión
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}

export default function Page() {
	return (
		<Suspense
			fallback={
				<div className="flex min-h-screen items-center justify-center">
					Cargando formulario...
				</div>
			}
		>
			<ResetPasswordForm />
		</Suspense>
	);
}
