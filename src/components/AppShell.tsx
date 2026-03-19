"use client";

import { useSearchParams } from "next/navigation";
import { ReactNode } from "react";
import { SearchUIProvider, useSearchUI } from "./SearchUIProvider";
import { NotificationRealtimeProvider } from "./NotificationRealtimeProvider";

type AppShellProps = {
  navbar: ReactNode;
  sidebar: ReactNode;
  children: ReactNode;
};

function AppShellContent({ navbar, sidebar, children }: AppShellProps) {
  const searchParams = useSearchParams();
  const { isSearchFocused } = useSearchUI();
  const query = searchParams.get("q")?.trim() ?? "";
  const isSearchActive = query.length > 0;

  return (
    <div className="min-h-screen">
      {navbar}
      <main className="relative py-8">
        {isSearchFocused && !isSearchActive ? (
          <div className="pointer-events-none fixed inset-x-0 top-16 bottom-0 z-50 bg-background/55 backdrop-blur-sm" />
        ) : null}
        <div className="relative z-40 max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {!isSearchActive ? (
              <div className="hidden lg:block lg:col-span-3">
                {sidebar}
              </div>
            ) : null}
            <div className={isSearchActive ? "lg:col-span-12" : "lg:col-span-9"}>
              {children}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function AppShell({ navbar, sidebar, children }: AppShellProps) {
  return (
    <NotificationRealtimeProvider>
      <SearchUIProvider>
        <AppShellContent navbar={navbar} sidebar={sidebar}>
          {children}
        </AppShellContent>
      </SearchUIProvider>
    </NotificationRealtimeProvider>
  );
}
