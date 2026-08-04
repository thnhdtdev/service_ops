"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleAlert, Eye, EyeOff, LockKeyhole, Mail } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema";
import { PATHS } from "@/constants/routes";

export function LoginForm() {
	const router = useRouter();
	const [loginError, setLoginError] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const {
		register,
		handleSubmit,
		formState: { errors, isSubmitting }
	} = useForm<LoginSchema>({
		resolver: zodResolver(loginSchema),
		defaultValues: {
			email: "",
			password: ""
		}
	});

	async function onSubmit(values: LoginSchema) {
		setLoginError("");

		try {
			const supabase = createClient();

			const { error } = await supabase.auth.signInWithPassword({
				email: values.email,
				password: values.password
			});

			if (error) {
				setLoginError("Đăng nhập thất bại. Vui lòng kiểm tra email, mật khẩu và thử lại.");
				return;
			}

			router.push(PATHS.HOME);
			router.refresh();
		} catch {
			setLoginError("Không thể đăng nhập lúc này. Vui lòng thử lại sau.");
		}
	}

	return (
		<div className="w-full">
			<header>
				<h1 className="text-foreground text-4xl font-bold tracking-[-0.03em]">Đăng nhập</h1>
				<p className="text-muted-foreground mt-4 text-base leading-7">
					Tiếp tục vào không gian vận hành ServiceOps.
				</p>
			</header>

			<form
				onSubmit={handleSubmit(onSubmit, () => setLoginError(""))}
				className="mt-9"
				aria-busy={isSubmitting}
				noValidate
			>
				<FieldGroup className="gap-5">
					{loginError ? (
						<div
							role="alert"
							className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm leading-5"
						>
							<CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
							<p>{loginError}</p>
						</div>
					) : null}

					<Field data-invalid={!!errors.email} className="gap-2.5">
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<div className="relative">
							<Mail
								aria-hidden="true"
								className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
							/>
							<Input
								id="email"
								type="email"
								autoComplete="email"
								placeholder="ten@cuahang.vn"
								className="bg-card h-12 rounded-lg pl-10"
								disabled={isSubmitting}
								aria-invalid={!!errors.email}
								aria-describedby={errors.email ? "email-error" : undefined}
								{...register("email")}
							/>
						</div>
						<FieldError id="email-error" errors={[errors.email]} />
					</Field>

					<Field data-invalid={!!errors.password} className="gap-2.5">
						<FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
						<div className="relative">
							<LockKeyhole
								aria-hidden="true"
								className="text-muted-foreground pointer-events-none absolute top-1/2 left-3.5 size-4 -translate-y-1/2"
							/>
							<Input
								id="password"
								type={showPassword ? "text" : "password"}
								autoComplete="current-password"
								placeholder="Nhập mật khẩu"
								className="bg-card h-12 rounded-lg pr-12 pl-10"
								disabled={isSubmitting}
								aria-invalid={!!errors.password}
								aria-describedby={errors.password ? "password-error" : undefined}
								{...register("password")}
							/>
							<Button
								type="button"
								variant="ghost"
								size="icon"
								className="text-muted-foreground hover:text-foreground absolute top-1/2 right-1.5 size-9 -translate-y-1/2"
								onClick={() => setShowPassword((current) => !current)}
								disabled={isSubmitting}
								aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
								aria-pressed={showPassword}
							>
								{showPassword ? (
									<EyeOff aria-hidden="true" />
								) : (
									<Eye aria-hidden="true" />
								)}
							</Button>
						</div>
						<FieldError id="password-error" errors={[errors.password]} />
					</Field>

					<Button
						type="submit"
						size="lg"
						className="mt-1 h-12 w-full rounded-lg"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
						{!isSubmitting ? (
							<ArrowRight aria-hidden="true" data-icon="inline-end" />
						) : null}
					</Button>
				</FieldGroup>
			</form>

			<div className="mt-8 border-t pt-5">
				<p className="text-muted-foreground text-sm leading-6">
					Chưa có tài khoản? Liên hệ quản lý cửa hàng để được cấp quyền.
				</p>
			</div>
		</div>
	);
}
