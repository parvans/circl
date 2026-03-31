"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { useAuth } from "@clerk/nextjs";
import { getNotificationSummary } from "@/actions/notification.action";
import { usePathname } from "next/navigation";

type NotificationType = "FOLLOW" | "COMMENT" | "LIKE";

type NotificationSummary = Awaited<ReturnType<typeof getNotificationSummary>>;

type NotificationRealtimeContextValue = {
  unreadCount: number;
  refreshNotifications: () => Promise<void>;
  setUnreadCount: (count: number) => void;
};

const NotificationRealtimeContext = createContext<NotificationRealtimeContextValue | null>(null);

function playNotificationTone(type: NotificationType) {
  if (typeof window === "undefined") return;

  const AudioContextClass =
    window.AudioContext || (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;

  if (!AudioContextClass) return;

  const context = new AudioContextClass();
  const now = context.currentTime;

  const tonesByType: Record<NotificationType, number[]> = {
    FOLLOW: [523.25, 659.25],
    COMMENT: [392, 523.25, 659.25],
    LIKE: [659.25, 783.99],
  };

  tonesByType[type].forEach((frequency, index) => {
    const oscillator = context.createOscillator();
    const gain = context.createGain();
    const startAt = now + index * 0.12;
    const stopAt = startAt + 0.14;

    oscillator.type = "sine";
    oscillator.frequency.value = frequency;

    gain.gain.setValueAtTime(0.0001, startAt);
    gain.gain.exponentialRampToValueAtTime(0.08, startAt + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.0001, stopAt);

    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startAt);
    oscillator.stop(stopAt);
  });

  window.setTimeout(() => {
    void context.close();
  }, 800);
}

export function NotificationRealtimeProvider({ children }: { children: ReactNode }) {
  const { isSignedIn } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const isRefreshingRef = useRef(false);
  const previousSummaryRef = useRef<NotificationSummary | null>(null);

  const refreshNotifications = useCallback(async () => {
    if (isRefreshingRef.current) return;

    isRefreshingRef.current = true;

    if (!isSignedIn) {
      setUnreadCount(0);
      previousSummaryRef.current = null;
      isRefreshingRef.current = false;
      return;
    }

    try {
      const summary = await getNotificationSummary();
      const previousSummary = previousSummaryRef.current;

      setUnreadCount(summary.unreadCount);

      if (
        previousSummary &&
        summary.latestUnread &&
        summary.latestUnread.id !== previousSummary.latestUnread?.id &&
        summary.unreadCount > previousSummary.unreadCount
      ) {
        playNotificationTone(summary.latestUnread.type as NotificationType);
      }

      previousSummaryRef.current = summary;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [isSignedIn]);

  useEffect(() => {
    void refreshNotifications();

    if (!isSignedIn || pathname === "/notifications") return;

    const pollNotifications = () => {
      if (document.visibilityState !== "visible") return;
      void refreshNotifications();
    };

    const interval = window.setInterval(() => {
      pollNotifications();
    }, 5000);

    window.addEventListener("focus", pollNotifications);
    document.addEventListener("visibilitychange", pollNotifications);

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", pollNotifications);
      document.removeEventListener("visibilitychange", pollNotifications);
    };
  }, [isSignedIn, pathname, refreshNotifications]);

  return (
    <NotificationRealtimeContext.Provider
      value={{
        unreadCount,
        refreshNotifications,
        setUnreadCount,
      }}
    >
      {children}
    </NotificationRealtimeContext.Provider>
  );
}

export function useNotificationRealtime() {
  const context = useContext(NotificationRealtimeContext);

  if (!context) {
    throw new Error("useNotificationRealtime must be used within NotificationRealtimeProvider");
  }

  return context;
}
