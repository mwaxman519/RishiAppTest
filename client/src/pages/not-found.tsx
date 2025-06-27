import { Link } from "wouter";
import { Button } from "@/components/ui/button";

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <h1 className="text-6xl font-bold text-primary">404</h1>
      <h2 className="text-2xl font-semibold mt-4 mb-6">Page Not Found</h2>
      <p className="text-muted-foreground text-center max-w-md mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>
      <div className="flex gap-4">
        <Button asChild>
          <Link href="/">
            Go Home
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <a href="mailto:support@rishi.com">
            Contact Support
          </a>
        </Button>
      </div>
    </div>
  );
}