import { LoginForm } from "@/features/auth/components/login-form";
import { PATHS } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

export default async function LoginPage() {
	const supabase = await createClient();
	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (user) {
		redirect(PATHS.HOME);
	}

	return (
		<main className="bg-muted/40 flex min-h-screen items-center justify-center px-4">
			<LoginForm />
		</main>
	);
}
