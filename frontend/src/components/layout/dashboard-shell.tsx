import { AppHeader } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";
import { PATHS } from "@/constants/routes";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

type DashboardShellProps = {
	children: React.ReactNode;
};

export async function DashboardShell({ children }: DashboardShellProps) {
	const supabase = await createClient();

	const {
		data: { user }
	} = await supabase.auth.getUser();

	if (!user) {
		redirect(PATHS.LOGIN);
	}

	const currentUser = {
		name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
		email: user.email || ""
	};

	return (
		<div className="bg-background text-foreground min-h-[100dvh]">
			<div className="flex min-h-[100dvh]">
				<AppSidebar />

				<div className="flex min-h-[100dvh] min-w-0 flex-1 flex-col">
					<AppHeader user={currentUser} />

					<main className="bg-muted/20 flex-1 px-4 py-5 sm:px-6 lg:px-8 lg:py-7">
						<div className="mx-auto w-full max-w-[1440px]">{children}</div>
					</main>
				</div>
			</div>
		</div>
	);
}
