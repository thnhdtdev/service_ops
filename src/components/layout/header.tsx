"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, LogIn, LogOut, Menu, Plus, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";
import { APP_ROUTES, PATHS } from "@/constants/routes";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";

type HeaderUser = {
  name: string;
  email: string;
} | null;

type AppHeaderProps = {
  user: HeaderUser;
};

function getPageTitle(pathname: string) {
  if (pathname === PATHS.CREATE_ORDER) return "Create Order";

  if (pathname.startsWith("/orders/") && pathname !== PATHS.CREATE_ORDER) {
    return "Order Detail";
  }

  const route = APP_ROUTES.find((item) => item.href === pathname);

  return route?.title ?? "Dashboard";
}

function getPageDescription(pathname: string) {
  if (pathname === PATHS.DASHBOARD) {
    return "Overview of today orders and business performance.";
  }

  if (pathname === PATHS.ORDERS) {
    return "Manage service orders, payment status, and processing status.";
  }

  if (pathname === PATHS.CREATE_ORDER) {
    return "Create a new laundry or shoe care service order.";
  }

  if (pathname === PATHS.CUSTOMERS) {
    return "Manage customer information and order history.";
  }

  if (pathname === PATHS.SERVICES) {
    return "Manage service pricing and availability.";
  }

  if (pathname === PATHS.REPORTS) {
    return "View revenue, order statistics, and unpaid orders.";
  }

  if (pathname === PATHS.SETTINGS) {
    return "Manage system settings and business information.";
  }

  return "Manage your laundry and shoe care operations.";
}

export function AppHeader({ user }: AppHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const pageTitle = getPageTitle(pathname);
  const pageDescription = getPageDescription(pathname);

  async function handleLogout() {
    const supabase = createClient();

    await supabase.auth.signOut();

    router.push(PATHS.LOGIN);
    router.refresh();
  }

  return (
    <header className="flex min-h-24 items-center justify-between border-b border-zinc-800 bg-zinc-950 px-5 py-4 text-zinc-50 lg:px-7">
      <div className="flex items-center gap-4">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="text-zinc-300 hover:bg-zinc-900 hover:text-white lg:hidden"
            >
              <Menu className="size-5" />
              <span className="sr-only">Open sidebar</span>
            </Button>
          </SheetTrigger>
        </Sheet>

        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white lg:text-3xl">
            {pageTitle}
          </h1>
          <p className="mt-1 max-w-2xl text-sm text-zinc-400">
            {pageDescription}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <Button
          asChild
          className="bg-emerald-500 text-zinc-950 hover:bg-emerald-400"
        >
          <Link href={PATHS.CREATE_ORDER}>
            <Plus className="mr-2 size-4" />
            <span className="hidden sm:inline">Create Order</span>
            <span className="sm:hidden">Create</span>
          </Link>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden text-zinc-300 hover:bg-zinc-900 hover:text-white sm:inline-flex"
        >
          <Bell className="size-5" />
          <span className="sr-only">Notifications</span>
        </Button>

        <Button
          variant="ghost"
          size="icon"
          className="hidden text-zinc-300 hover:bg-zinc-900 hover:text-white sm:inline-flex"
          asChild
        >
          <Link href={PATHS.SETTINGS}>
            <Settings className="size-5" />
            <span className="sr-only">Settings</span>
          </Link>
        </Button>

        {user ? (
          <div className="ml-2 flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 px-3 py-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-emerald-500 text-zinc-950">
              <User className="size-4" />
            </div>

            <div className="hidden text-left md:block">
              <p className="max-w-32 truncate text-sm font-semibold text-white">
                {user.name}
              </p>
              <p className="max-w-32 truncate text-xs text-zinc-400">
                {user.email}
              </p>
            </div>

            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              className="text-zinc-300 hover:bg-zinc-800 hover:text-white"
            >
              <LogOut className="size-4" />
              <span className="sr-only">Logout</span>
            </Button>
          </div>
        ) : (
          <Button asChild variant="outline" className="border-zinc-700 text-black">
            <Link href={PATHS.LOGIN}>
              <LogIn className="mr-2 size-4" />
              Login
            </Link>
          </Button>
        )}
      </div>
    </header>
  );
}