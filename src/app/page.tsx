import { DashboardShell } from "@/components/layout/dashboard-shell";

export default function DashboardPage() {
  return (
    <DashboardShell>
      <div className="rounded-2xl border border-zinc-800 p-6">
        <h2 className="text-xl font-semibold">Dashboard Content</h2>
        <p className="mt-2 text-sm">
          Header and footer are working correctly.
        </p>
      </div>
    </DashboardShell>
  );
}