import { Card, CardContent } from "@/components/ui/card";
import { Dog } from "lucide-react";
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex items-center justify-center py-24">
      <Card className="max-w-md">
        <CardContent className="flex flex-col items-center pt-8 pb-6 text-center">
          <Dog className="mb-4 h-12 w-12 text-muted-foreground" />
          <h2 className="text-lg font-semibold">Page Not Found</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cooper couldn&apos;t sniff out that page. It might have been moved or doesn&apos;t exist.
          </p>
          <Link
            href="/"
            className="mt-4 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to Command Center
          </Link>
        </CardContent>
      </Card>
    </div>
  );
}
