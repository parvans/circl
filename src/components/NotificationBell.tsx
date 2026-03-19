"use client";

import Link from "next/link";
import { BellIcon } from "lucide-react";
import { Button } from "./ui/button";
import { useNotificationRealtime } from "./NotificationRealtimeProvider";

type NotificationBellProps = {
  label?: string;
  className?: string;
  showLabelOnMobile?: boolean;
};

export default function NotificationBell({
  label = "Notifications",
  className = "flex items-center gap-2",
  showLabelOnMobile = false,
}: NotificationBellProps) {
  const { unreadCount } = useNotificationRealtime();

  return (
    <Button variant="ghost" className={className} asChild>
      <Link href="/notifications" className="relative">
        <span className="relative inline-flex">
          <BellIcon className="w-4 h-4" />
          {unreadCount > 0 ? (
            <span className="absolute -right-2.5 -top-2 inline-flex min-w-5 items-center justify-center rounded-full bg-red-500 px-1.5 py-0.5 text-[10px] font-semibold leading-none text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          ) : null}
        </span>
        <span className={showLabelOnMobile ? "" : "hidden lg:inline"}>{label}</span>
      </Link>
    </Button>
  );
}
