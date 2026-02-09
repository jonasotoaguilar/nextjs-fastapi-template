"use client";

import { register } from "@/actions/auth/register-action";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";
import { SubmitButton } from "@/components/ui/submitButton";
import { registerSchema } from "@/lib/definitions";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { Mail, UserPlus } from "lucide-react";
import Link from "next/link";
import { startTransition, useActionState, useEffect } from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";

type RegisterInputs = z.infer<typeof registerSchema>;

export default function RegisterPage() {
	const [state, dispatch] = useActionState(register, undefined);

	const {
		register: registerField,
		handleSubmit,
		formState: { errors },
		setError,
	} = useForm<RegisterInputs>({
		resolver: zodResolver(registerSchema),
		mode: "onBlur",
		defaultValues: {
			email: "",
			password: "",
			passwordConfirm: "",
		},
	});

	useEffect(() => {
		if (state?.errors) {
			for (const [key, message] of Object.entries(state.errors)) {
				setError(key as keyof RegisterInputs, {
					type: "server",
					message: Array.isArray(message) ? message[0] : message,
				});
			}
		}
	}, [state, setError]);

	const onSubmit = (data: RegisterInputs) => {
		const formData = new FormData();
		formData.append("email", data.email);
		formData.append("password", data.password);
		formData.append("passwordConfirm", data.passwordConfirm);
		startTransition(() => {
			dispatch(formData);
		});
	};

	return (
		<div className="flex min-h-screen w-full items-center justify-center bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-50 via-gray-50 to-gray-100 dark:from-blue-950/20 dark:via-gray-950 dark:to-gray-900 px-4 py-12">
			<Card className="w-full max-w-md rounded-2xl shadow-2xl border-none bg-white/90 dark:bg-gray-800/90 backdrop-blur-md overflow-hidden animate-in fade-in zoom-in duration-500">
				<CardHeader className="text-center space-y-1 pb-2 pt-8">
					<div className="mx-auto bg-blue-500/10 p-4 rounded-2xl w-fit mb-4 ring-1 ring-blue-500/20">
						<UserPlus className="h-10 w-10 text-blue-600 dark:text-blue-400" />
					</div>
					<CardTitle className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
						Crear cuenta
					</CardTitle>
					<CardDescription className="text-gray-500 dark:text-gray-400 text-base">
						Ingresá tus datos para empezar tu experiencia.
					</CardDescription>
				</CardHeader>
				<CardContent className="p-8 pt-4">
					<form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
						<div className="space-y-2">
							<Label
								htmlFor="email"
								className="text-sm font-semibold ml-1 text-gray-700 dark:text-gray-300"
							>
								Email
							</Label>
							<div className="relative group">
								<Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
								<Input
									{...registerField("email")}
									id="email"
									type="email"
									placeholder="ejemplo@correo.com"
									autoComplete="email"
									className={cn(
										"pl-11 h-12 bg-gray-50/50 dark:bg-gray-900/50 border-gray-200 dark:border-gray-700 focus:ring-2 focus:ring-blue-500/20 transition-all rounded-xl",
										errors.email &&
											"border-red-500 focus:ring-red-500/20 bg-red-50/30",
									)}
								/>
							</div>
							{errors.email && (
								<p
									className="text-xs font-semibold text-red-500 ml-1 mt-1 flex items-center gap-1 animate-in slide-in-from-top-1"
									role="alert"
								>
									<span
										className="w-1 h-1 rounded-full bg-red-500"
										aria-hidden="true"
									/>
									{errors.email.message}
								</p>
							)}
						</div>

						<div className="space-y-2">
							<Label
								htmlFor="password"
								className="text-sm font-semibold ml-1 text-gray-700 dark:text-gray-300"
							>
								Contraseña
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

						<div className="pt-4">
							<SubmitButton
								text="Registrarse"
								className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg shadow-blue-500/30 active:scale-[0.98] disabled:opacity-70 disabled:active:scale-100"
							/>
						</div>

						{state?.server_validation_error && (
							<div
								className="bg-red-50 dark:bg-red-900/10 py-3 px-4 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in"
								role="alert"
								aria-live="polite"
							>
								<p className="text-sm font-semibold text-red-600 dark:text-red-400 text-center">
									{state.server_validation_error}
								</p>
							</div>
						)}

						{state?.server_error && (
							<div
								className="bg-red-50 dark:bg-red-900/10 py-3 px-4 rounded-xl border border-red-100 dark:border-red-900/30 animate-in fade-in"
								role="alert"
								aria-live="polite"
							>
								<p className="text-sm font-semibold text-red-600 dark:text-red-400 text-center">
									{state.server_error}
								</p>
							</div>
						)}

						<div className="text-center text-sm pt-2">
							<span className="text-gray-500 dark:text-gray-400">
								¿Ya tenés cuenta?{" "}
							</span>
							<Link
								href="/login"
								className="text-blue-600 dark:text-blue-400 font-bold hover:underline decoration-2 underline-offset-4 transition-all"
							>
								Iniciá sesión
							</Link>
						</div>
					</form>
				</CardContent>
			</Card>
		</div>
	);
}
