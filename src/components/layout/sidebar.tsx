"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CircleHelp, FileText } from "lucide-react";

import { APP_ROUTES } from "@/constants/routes";
import { cn } from "@/lib/utils";

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden h-screen w-[280px] shrink-0 border-r border-zinc-800 bg-zinc-950 text-zinc-50 lg:flex lg:flex-col">
      <div className="flex h-24 items-center gap-3 border-b border-zinc-800 px-7">
        <div className="flex size-12 items-center justify-center rounded-2xl bg-emerald-500 text-lg font-bold text-zinc-950">
          S
        </div>

        <div>
          <h1 className="text-lg font-bold leading-none">ServiceOps</h1>
          <p className="mt-1 text-sm text-zinc-400">Operations</p>
        </div>
      </div>

      <nav className="flex-1 space-y-2 px-5 py-5">
        {APP_ROUTES.map((route) => {
          const Icon = route.icon;

          const isActive =
            pathname === route.href ||
            (route.href !== "/" && pathname.startsWith(route.href));

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-zinc-300 transition-colors hover:bg-zinc-900 hover:text-white",
                isActive && "bg-zinc-800 text-white"
              )}
            >
              <Icon className="size-5" />
              <span>{route.title}</span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-800 p-5">
        <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-zinc-500">
          Support
        </p>

        <div className="space-y-2">
          <Link
            href="#"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <CircleHelp className="size-4" />
            Help Center
          </Link>

          <Link
            href="#"
            className="flex items-center gap-2 text-sm text-zinc-400 hover:text-white"
          >
            <FileText className="size-4" />
            Documentation
          </Link>
        </div>
      </div>
    </aside>
  );
}