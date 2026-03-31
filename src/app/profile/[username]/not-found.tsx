import { HomeIcon } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function ProfileNotFound() {
  return (
    <div className="mx-auto flex min-h-[78vh] max-w-2xs flex-col items-center justify-center px-6 py-12 text-center">
      <img
        src="/not-found-minimal.svg"
        alt="User not found illustration"
        className="w-full max-w-3xl"
      />

      <div className="mt-8 space-y-3">
        <p className="text-sm font-medium uppercase tracking-[0.3em] text-muted-foreground">
          404
        </p>
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
          User not found
        </h1>
        <p className="mx-auto max-w-md text-sm leading-6 text-muted-foreground sm:text-base">
          The user you&apos;re looking for doesn&apos;t exist.
        </p>
      </div>

      <div className="mt-6">
        <Button asChild size="lg" className="gap-2 rounded-full px-6">
          <a href="/">
            <HomeIcon className="size-4" />
            Back to home
          </a>
        </Button>
      </div>
    </div>
  );
}
