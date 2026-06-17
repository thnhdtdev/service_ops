import Link from "next/link";

import { PATHS } from "@/constants/paths";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Button>
        <Link href={PATHS.LOGIN}>Customer</Link>
      </Button>
    </main>
  );
}