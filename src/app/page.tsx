import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function HomePage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-muted/40 p-6">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>ServiceOps</CardTitle>
            <Badge variant={"destructive"}>Ready</Badge>
          </div>
          <CardDescription>
            Laundry & Shoe Care
             Operations Management System
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            shadcn/ui has been installed successfully.
          </p>

          <div className="flex gap-2">
            <Button>Get Started</Button>
            <Button variant="outline">View Orders</Button>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}