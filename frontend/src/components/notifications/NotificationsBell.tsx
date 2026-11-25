'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bell, Check, Inbox } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { toast } from 'sonner';
import { CALM_EASE } from '@/components/ui/motion';
import { useAuth } from '@/hooks/useAuth';
import { useMarkNotificationRead, useNotifications } from '@/hooks/useNotifications';
import { extractApiError } from '@/lib/errors';
import { cn, formatRelativeTime } from '@/lib/utils';
import type { NotificationItem } from '@/types/api';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SimpleTooltip } from '@/components/ui/tooltip';
import { Skeleton } from '@/components/ui/skeleton';

function getTicketIdFromNotification(notification: NotificationItem): string {
  if (typeof notification.ticket === 'string') {
    return notification.ticket;
  }
  return notification.ticket?._id || '';
}

export function NotificationsBell() {
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const [open, setOpen] = useState(false);

  const notificationsQuery = useNotifications(isAuthenticated);
  const markRead = useMarkNotificationRead();

  const notifications = notificationsQuery.data ?? [];
  const unreadCount = notifications.filter((item) => !item.isRead).length;

  const handleNotificationClick = async (item: NotificationItem) => {
    if (!item.isRead) {
      try {
        await markRead.mutateAsync(item._id);
      } catch (error) {
        toast.error(extractApiError(error, 'Failed to mark notification as read').message);
      }
    }

    const ticketId = getTicketIdFromNotification(item);
    setOpen(false);
    if (ticketId) {
      router.push(user?.role === 'admin' ? `/admin/tickets/${ticketId}` : `/tickets/${ticketId}`);
    }
  };

  const handleMarkOnly = async (e: React.MouseEvent, notificationId: string) => {
    e.stopPropagation();
    try {
      await markRead.mutateAsync(notificationId);
    } catch (error) {
      toast.error(extractApiError(error, 'Failed to mark notification as read').message);
    }
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <SimpleTooltip
        label={unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'}
        side="bottom"
        enabled={!open}
      >
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            aria-label={
              unreadCount > 0 ? `Notifications (${unreadCount} unread)` : 'Notifications'
            }
            className="relative"
          >
            <motion.span
              whileHover={{ rotate: [0, -14, 14, -8, 6, 0] }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center justify-center"
            >
              <Bell className="h-4 w-4 text-muted" />
            </motion.span>
            <AnimatePresence>
              {unreadCount > 0 ? (
                <motion.span
                  key={unreadCount}
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.5, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 450, damping: 24 }}
                  className="absolute right-1 top-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold leading-none text-white"
                >
                  {unreadCount > 9 ? '9+' : unreadCount}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </Button>
        </PopoverTrigger>
      </SimpleTooltip>

      <PopoverContent align="end" className="w-80 overflow-hidden p-0 sm:w-96">
        <div className="flex items-center justify-between border-b border-border px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <span className="text-[13px] font-semibold text-foreground">Notifications</span>
            {unreadCount > 0 ? (
              <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[11px] font-medium text-accent">
                {unreadCount} unread
              </span>
            ) : null}
          </div>
        </div>

        <div className="max-h-80 overflow-y-auto divide-y divide-border">
          {notificationsQuery.isLoading ? (
            <div className="space-y-3 p-3.5">
              {Array.from({ length: 3 }).map((_, idx) => (
                <div key={idx} className="space-y-1.5">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="h-3 w-20" />
                </div>
              ))}
            </div>
          ) : notificationsQuery.isError ? (
            <div className="p-4 text-center space-y-2">
              <p className="text-[12px] text-muted">
                {extractApiError(notificationsQuery.error, 'Could not load notifications').message}
              </p>
              <Button
                variant="secondary"
                size="sm"
                onClick={() => {
                  void notificationsQuery.refetch();
                }}
              >
                Retry
              </Button>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-4 py-8 text-center">
              <Inbox className="mb-2 h-5 w-5 text-muted" aria-hidden="true" />
              <p className="text-[13px] font-medium text-foreground">You&apos;re all caught up</p>
              <p className="mt-0.5 text-[12px] text-muted">
                Ticket updates and comments will appear here.
              </p>
            </div>
          ) : (
            notifications.map((item, idx) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{
                  duration: 0.18,
                  delay: Math.min(idx * 0.035, 0.2),
                  ease: CALM_EASE,
                }}
                role="button"
                tabIndex={0}
                onClick={() => {
                  void handleNotificationClick(item);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    void handleNotificationClick(item);
                  }
                }}
                className={cn(
                  'flex w-full cursor-pointer items-start gap-2.5 px-3.5 py-3 text-left transition-colors duration-150 hover:bg-hover',
                  !item.isRead && 'bg-surface'
                )}
              >
                <span
                  className={cn(
                    'mt-1.5 h-2 w-2 shrink-0 rounded-full transition-colors duration-150',
                    item.isRead ? 'bg-transparent' : 'bg-accent'
                  )}
                  aria-label={item.isRead ? undefined : 'Unread'}
                />
                <div className="min-w-0 flex-1 space-y-1">
                  <p className="text-[13px] leading-snug text-foreground">{item.message}</p>
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[11px] text-muted">
                      {formatRelativeTime(item.createdAt)}
                    </span>
                    {!item.isRead ? (
                      <button
                        type="button"
                        onClick={(e) => {
                          void handleMarkOnly(e, item._id);
                        }}
                        className="inline-flex items-center gap-1 rounded-sm px-1.5 py-0.5 text-[11px] font-medium text-accent transition-colors duration-150 hover:bg-background"
                      >
                        <Check className="h-3 w-3" aria-hidden="true" />
                        Mark as read
                      </button>
                    ) : null}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}

