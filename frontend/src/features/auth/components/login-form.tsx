"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowRight, CircleAlert } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { loginSchema, type LoginSchema } from "@/features/auth/schemas/login.schema";
import { PATHS } from "@/constants/routes";

export function LoginForm() {
	const router = useRouter();
	const [loginError, setLoginError] = useState("");
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
				<p className="text-primary text-sm font-semibold">Chào mừng trở lại</p>
				<h1 className="text-foreground mt-2 text-3xl font-bold tracking-tight">
					Đăng nhập vào ServiceOps
				</h1>
				<p className="text-muted-foreground mt-3 text-sm leading-6">
					Dùng tài khoản được cấp để tiếp tục vào hệ thống.
				</p>
			</header>

			<form
				onSubmit={handleSubmit(onSubmit, () => setLoginError(""))}
				className="mt-8"
				aria-busy={isSubmitting}
				noValidate
			>
				<FieldGroup className="gap-6">
					{loginError ? (
						<div
							role="alert"
							className="border-destructive/30 bg-destructive/10 text-destructive flex items-start gap-2.5 rounded-md border px-3.5 py-3 text-sm leading-5"
						>
							<CircleAlert aria-hidden="true" className="mt-0.5 size-4 shrink-0" />
							<p>{loginError}</p>
						</div>
					) : null}

					<Field data-invalid={!!errors.email}>
						<FieldLabel htmlFor="email">Email</FieldLabel>
						<Input
							id="email"
							type="email"
							autoComplete="email"
							placeholder="ten@cuahang.vn"
							className="bg-card h-11"
							disabled={isSubmitting}
							aria-invalid={!!errors.email}
							aria-describedby={errors.email ? "email-error" : undefined}
							{...register("email")}
						/>
						<FieldError id="email-error" errors={[errors.email]} />
					</Field>

					<Field data-invalid={!!errors.password}>
						<FieldLabel htmlFor="password">Mật khẩu</FieldLabel>
						<Input
							id="password"
							type="password"
							autoComplete="current-password"
							placeholder="Nhập mật khẩu"
							className="bg-card h-11"
							disabled={isSubmitting}
							aria-invalid={!!errors.password}
							aria-describedby={errors.password ? "password-error" : undefined}
							{...register("password")}
						/>
						<FieldError id="password-error" errors={[errors.password]} />
					</Field>

					<Button
						type="submit"
						size="lg"
						className="mt-1 h-11 w-full"
						disabled={isSubmitting}
					>
						{isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
						{!isSubmitting ? (
							<ArrowRight aria-hidden="true" data-icon="inline-end" />
						) : null}
					</Button>
				</FieldGroup>
			</form>

			<p className="text-muted-foreground mt-8 text-center text-xs leading-5">
				Nếu chưa có tài khoản, hãy liên hệ quản lý cửa hàng.
			</p>
		</div>
	);
}
