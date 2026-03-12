import Link from "next/link";
import { HomeIcon } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[78vh] max-w-4xl flex-col items-center justify-center px-6 py-12 text-center">
      <img
        src="/not-found-minimal.svg"
        alt="Page not found illustration"
        className="w-full max-w-3xl"
      />

      <div className="mt-8 space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
          404 Error
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          Page not found
        </h1>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          The page you are looking for doesn&apos;t exist or has been moved.
        </p>
      </div>

      <div className="mt-6">
        <Button asChild size="lg" className="gap-2 rounded-full px-6">
          <Link href="/">
            <HomeIcon className="size-4" />
            Back to Home
          </Link>
        </Button>
      </div>
    </div>
  );
}
