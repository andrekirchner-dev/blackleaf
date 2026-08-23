"use client";

import { useEffect, useState } from "react";
import { Bell, Heart, MessageCircle, UserPlus, Check } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";
import {
  getNotifications,
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { AppNotification } from "@/lib/types";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { MotionPage, MotionItem } from "@/components/ui/motion-wrapper";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { Timestamp } from "firebase/firestore";

function NotificationIcon({ type }: { type: AppNotification["type"] }) {
  if (type === "like") {
    return (
      <div className="w-9 h-9 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center shrink-0">
        <Heart size={15} className="text-rose-400" />
      </div>
    );
  }
  if (type === "comment") {
    return (
      <div className="w-9 h-9 rounded-full bg-blue-500/10 border border-blue-500/20 flex items-center justify-center shrink-0">
        <MessageCircle size={15} className="text-blue-400" />
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
      <UserPlus size={15} className="text-primary" />
    </div>
  );
}

function notificationText(n: AppNotification): string {
  if (n.type === "like") return `${n.fromHandle} curtiu seu post`;
  if (n.type === "comment") return `${n.fromHandle} comentou no seu post`;
  return `${n.fromHandle} começou a te seguir`;
}

function safeFormatDistance(ts: Timestamp | undefined): string {
  if (!ts) return "";
  try {
    return formatDistanceToNow(ts.toDate(), { addSuffix: true, locale: ptBR });
  } catch {
    return "";
  }
}

function NotificationItem({
  notification,
  userId,
  onRead,
}: {
  notification: AppNotification;
  userId: string;
  onRead: (id: string) => void;
}) {
  async function handleClick() {
    if (!notification.read) {
      await markNotificationRead(userId, notification.id);
      onRead(notification.id);
    }
  }

  return (
    <Link
      href={`/community/${notification.fromUserId}`}
      onClick={handleClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 border-b border-border/40 last:border-0 transition-colors hover:bg-muted/20",
        !notification.read && "bg-primary/5 border-l-2 border-l-primary/40"
      )}
    >
      <NotificationIcon type={notification.type} />
      <div className="flex-1 min-w-0">
        <p className={cn(
          "text-sm leading-snug",
          notification.read ? "text-foreground/70" : "text-foreground font-medium"
        )}>
          {notificationText(notification)}
        </p>
        <p className="text-[11px] text-muted-foreground mt-0.5">
          {safeFormatDistance(notification.createdAt)}
        </p>
      </div>
      {!notification.read && (
        <div className="w-2 h-2 rounded-full bg-primary shrink-0" />
      )}
    </Link>
  );
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (!user) return;
    getNotifications(user.uid)
      .then(setNotifications)
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user]);

  function handleRead(id: string) {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  async function handleMarkAll() {
    if (!user) return;
    setMarkingAll(true);
    try {
      await markAllNotificationsRead(user.uid);
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } finally {
      setMarkingAll(false);
    }
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <MotionPage>
      <div className="max-w-2xl mx-auto space-y-5">
        {/* Header */}
        <MotionItem>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Bell size={20} className="text-primary" />
              <h1 className="text-xl font-bold">Notificações</h1>
              {unreadCount > 0 && (
                <span className="text-[10px] bg-primary text-primary-foreground rounded-full px-2 py-0.5 font-semibold">
                  {unreadCount}
                </span>
              )}
            </div>
            {unreadCount > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleMarkAll}
                disabled={markingAll}
                className="gap-1.5 text-xs border-border"
              >
                <Check size={12} />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        </MotionItem>

        {/* List */}
        <MotionItem>
          <div className="bg-card border border-border rounded-2xl overflow-hidden">
            {loading ? (
              <div className="divide-y divide-border/40">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex items-center gap-3 px-4 py-3">
                    <Skeleton className="w-9 h-9 rounded-full shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <Skeleton className="h-3.5 w-48 rounded" />
                      <Skeleton className="h-2.5 w-24 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-16 text-center">
                <Bell size={32} className="mx-auto text-muted-foreground/20 mb-3" />
                <p className="text-sm text-muted-foreground">Nenhuma notificação ainda</p>
              </div>
            ) : (
              <div>
                {notifications.map((n) => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    userId={user?.uid ?? ""}
                    onRead={handleRead}
                  />
                ))}
              </div>
            )}
          </div>
        </MotionItem>
      </div>
    </MotionPage>
  );
}
