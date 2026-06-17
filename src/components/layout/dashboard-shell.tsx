import { cookies } from "next/headers";

import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/layout/header";
import { AppSidebar } from "@/components/layout/sidebar";


type DashboardShellProps = {
  children: React.ReactNode;
};

export async function DashboardShell({ children }: DashboardShellProps) {
const cookieStore = await cookies();
const supabase = createClient(cookieStore);

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const currentUser = user
    ? {
        name: user.user_metadata?.full_name || user.email?.split("@")[0] || "User",
        email: user.email || "",
      }
    : null;

  return (
    <div className="min-h-screen bg-black text-zinc-50">
      <div className="flex">
        <AppSidebar />

        <div className="flex min-h-screen flex-1 flex-col">
          <AppHeader user={currentUser} />
          <main className="flex-1 p-5 lg:p-7">{children}</main>
        </div>
      </div>
    </div>
  );
}