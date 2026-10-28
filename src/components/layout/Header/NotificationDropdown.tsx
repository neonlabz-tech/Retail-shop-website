'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { getClientCookie, USER_COOKIE_NAME } from '@/lib/cookies';
import { handleImageError } from '@/lib/imageFallback';

export interface NotificationItem {
  productId?: string;
  name: string;
  slug?: string;
  image?: string;
  reviewUrl: string;
  reviewed?: boolean;
}

export interface NotificationData {
  _id: string;
  orderNumber: string;
  type: 'order_delivered' | 'order_update' | 'general';
  title: string;
  message: string;
  items: NotificationItem[];
  read: boolean;
  createdAt: string;
}

interface NotificationResponse {
  notifications: NotificationData[];
  unreadCount: number;
}

interface CachedNotificationRequest {
  request?: Promise<NotificationResponse>;
}

const notificationRequests = new Map<string, CachedNotificationRequest>();
const NOTIFICATION_POLL_INTERVAL = 30_000;

async function loadNotifications(email: string): Promise<NotificationResponse> {
  const cacheKey = email.trim().toLowerCase();
  const cached = notificationRequests.get(cacheKey);
  if (cached?.request) return cached.request;

  const entry = cached || {};
  const emailQuery = cacheKey ? `?email=${encodeURIComponent(cacheKey)}` : '';
  const request = (async () => {
    const response = await fetch(`/api/notifications${emailQuery}`, { cache: 'no-store' });
    if (!response.ok) {
      throw new Error(`Notifications request failed with HTTP ${response.status}`);
    }
    const result = await response.json();
    if (!result.success || !Array.isArray(result.notifications)) {
      throw new Error('Notifications request returned an invalid response');
    }
    return {
      notifications: result.notifications as NotificationData[],
      unreadCount: typeof result.unreadCount === 'number'
        ? result.unreadCount
        : result.notifications.filter((notification: NotificationData) => !notification.read).length,
    };
  })();

  entry.request = request;
  notificationRequests.set(cacheKey, entry);
  try {
    return await request;
  } finally {
    entry.request = undefined;
  }
}

function IconBell({ size = 22 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
      <path d="M13.73 21a2 2 0 0 1-3.46 0" />
    </svg>
  );
}

function formatRelativeTime(dateString: string): string {
  try {
    const date = new Date(dateString);
    const now = new Date();
    if (Number.isNaN(date.getTime())) return '';
    const diffMs = Math.max(0, now.getTime() - date.getTime());
    const diffMinutes = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMinutes / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMinutes < 1) return 'Just now';
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
  } catch {
    return '';
  }
}

function getNotificationBadge(notif: NotificationData) {
  const title = (notif.title || '').toLowerCase();
  const type = notif.type;

  if (type === 'order_delivered' || title.includes('delivered')) {
    return {
      bg: 'bg-[#ecfdf5] text-[#047857] border-[#a7f3d0]',
      dot: 'bg-[#10b981]',
      label: 'Delivered',
      icon: '📦',
    };
  }
  if (title.includes('shipped') || title.includes('dispatch')) {
    return {
      bg: 'bg-[#eff6ff] text-[#1d4ed8] border-[#bfdbfe]',
      dot: 'bg-[#3b82f6]',
      label: 'Shipped',
      icon: '🚚',
    };
  }
  if (title.includes('out for delivery') || title.includes('out_for_delivery')) {
    return {
      bg: 'bg-[#faf5ff] text-[#7e22ce] border-[#e9d5ff]',
      dot: 'bg-[#a855f7]',
      label: 'Out for Delivery',
      icon: '🛵',
    };
  }
  if (title.includes('placed') && title.includes('processing')) {
    return {
      bg: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
      dot: 'bg-[#f59e0b]',
      label: 'Placed & Processing',
      icon: '⚙️',
    };
  }
  if (title.includes('processing')) {
    return {
      bg: 'bg-[#fffbeb] text-[#b45309] border-[#fde68a]',
      dot: 'bg-[#f59e0b]',
      label: 'Processing',
      icon: '⚙️',
    };
  }
  if (title.includes('confirmed')) {
    return {
      bg: 'bg-[#ecfdf5] text-[#059669] border-[#a7f3d0]',
      dot: 'bg-[#10b981]',
      label: 'Confirmed',
      icon: '✅',
    };
  }
  if (title.includes('placed')) {
    return {
      bg: 'bg-[#eef2ff] text-[#4338ca] border-[#c7d2fe]',
      dot: 'bg-[#6366f1]',
      label: 'Order Placed',
      icon: '🎉',
    };
  }
  if (title.includes('cancelled')) {
    return {
      bg: 'bg-[#fef2f2] text-[#b91c1c] border-[#fecaca]',
      dot: 'bg-[#ef4444]',
      label: 'Cancelled',
      icon: '❌',
    };
  }
  if (title.includes('payment') || title.includes('paid') || title.includes('refund')) {
    return {
      bg: 'bg-[#f0fdf4] text-[#15803d] border-[#bbf7d0]',
      dot: 'bg-[#22c55e]',
      label: 'Payment Verified',
      icon: '💳',
    };
  }
  return {
    bg: 'bg-[#f3f4f6] text-[#374151] border-[#e5e7eb]',
    dot: 'bg-[#6b7280]',
    label: 'Order Update',
    icon: '🔔',
  };
}

interface NotificationDropdownProps {
  className?: string;
  iconColor?: string;
  hoverColor?: string;
  badgeColor?: string;
}

export function NotificationDropdown({
  className = '',
  iconColor = '#222',
  hoverColor = '#F15B41',
  badgeColor = '#F15B41',
}: NotificationDropdownProps) {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationData[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [notificationError, setNotificationError] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const hasFetchedNotificationsRef = useRef(false);
  const { user, isAuthenticated, isLoading, checkAuth } = useAuthStore();

  // Helper to reliably retrieve customer email across auth states and storage
  const getCustomerEmail = useCallback(() => {
    if (user?.email) return user.email;
    if (typeof document !== 'undefined') {
      try {
        const stored = getClientCookie(USER_COOKIE_NAME);
        if (stored) {
          const parsed = JSON.parse(stored);
          if (parsed?.email) return parsed.email;
        }
      } catch {}
      try {
        const recent = localStorage.getItem('customer_recent_email');
        if (recent) return recent;
      } catch {}
    }
    return '';
  }, [user?.email]);

  const isFetchingRef = useRef(false);
  const lastFetchedTimeRef = useRef(0);
  const hasInitialFetchedRef = useRef(false);
  const lastEmailRef = useRef<string | undefined>(user?.email);

  const fetchNotifications = useCallback(async (force = false): Promise<boolean> => {
    if (isFetchingRef.current) return false;

    // Throttle: don't fetch if fetched within last 15s unless forced
    const now = Date.now();
    if (!force && lastFetchedTimeRef.current > 0 && now - lastFetchedTimeRef.current < 15000) {
      return false;
    }

    const email = getCustomerEmail();
    if (!email) {
      setNotifications([]);
      setUnreadCount(0);
      setNotificationError(false);
      return false;
    }

    isFetchingRef.current = true;
    try {
      const data = await loadNotifications(email);
      setNotifications(data.notifications);
      setUnreadCount(data.unreadCount);
      setNotificationError(false);
      lastFetchedTimeRef.current = Date.now();
      return true;
    } catch (error) {
      console.error('Fetch notifications error:', error);
      setNotificationError(true);
    } finally {
      isFetchingRef.current = false;
    }
    return false;
  }, [getCustomerEmail]);

  // Ensure auth is hydrated on mount
  useEffect(() => {
    if (!user) {
      checkAuth();
    }
  }, [user, checkAuth]);

  // Initial fetch on mount & only when customer email actually changes
  useEffect(() => {
    if (isLoading) return;
    if (!hasInitialFetchedRef.current || lastEmailRef.current !== user?.email) {
      if (hasInitialFetchedRef.current) {
        lastFetchedTimeRef.current = 0;
      }
      hasInitialFetchedRef.current = true;
      lastEmailRef.current = user?.email;
      fetchNotifications(true);
    }
  }, [isLoading, user?.email, fetchNotifications]);

  useEffect(() => {
    if (isLoading || !getCustomerEmail()) return;

    const pollNotifications = () => {
      if (document.visibilityState === 'visible') {
        void fetchNotifications();
      }
    };
    const intervalId = window.setInterval(pollNotifications, NOTIFICATION_POLL_INTERVAL);
    document.addEventListener('visibilitychange', pollNotifications);

    return () => {
      window.clearInterval(intervalId);
      document.removeEventListener('visibilitychange', pollNotifications);
    };
  }, [getCustomerEmail, isLoading, fetchNotifications]);

  const markAsRead = useCallback(async (id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id }),
      });
    } catch {
      // Ignore
    }
  }, []);

  const markAllAsRead = useCallback(async () => {
    try {
      const email = getCustomerEmail();
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ markAllRead: true, email }),
      });
    } catch {
      // Ignore
    }
  }, [getCustomerEmail]);

  // Fetch when user clicks to OPEN the bell, and automatically clear the unread badge once viewed
  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
      // Auto-mark notifications as read after the customer views the dropdown
      if (unreadCount > 0) {
        const timer = setTimeout(() => {
          markAllAsRead();
        }, 1200);
        return () => clearTimeout(timer);
      }
    }
  }, [isOpen, unreadCount, fetchNotifications, markAllAsRead]);

  // Listen to explicit refresh events (e.g. order placed or status changed)
  useEffect(() => {
    const handleCustomRefresh = () => {
      fetchNotifications(true);
    };

    window.addEventListener('notifications:refresh', handleCustomRefresh);
    return () => {
      window.removeEventListener('notifications:refresh', handleCustomRefresh);
    };
  }, [fetchNotifications]);

  // Outside click & Escape key listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') setIsOpen(false);
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  const dismissNotification = async (id: string) => {
    const notification = notifications.find((item) => item._id === id);
    if (!notification) return;

    try {
      const email = getCustomerEmail();
      const response = await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notificationId: id, dismiss: true, email }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || 'Failed to dismiss notification');
      }

      setNotifications((previous) => previous.filter((item) => item._id !== id));
      if (!notification.read) {
        setUnreadCount((previous) => Math.max(0, previous - 1));
      }
    } catch (error) {
      console.error('Dismiss notification error:', error);
    }
  };

  const handleReviewClick = (notifId: string, reviewUrl: string) => {
    markAsRead(notifId);
    setIsOpen(false);
    router.push(reviewUrl);
  };

  return (
    <div ref={dropdownRef} className={`relative inline-flex items-center ${className}`}>
      {/* Bell Icon Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="View notifications and order updates"
        aria-expanded={isOpen}
        aria-haspopup="true"
        className="relative flex items-center justify-center bg-transparent border-0 p-0 cursor-pointer transition-colors duration-150 text-[#222222] hover:text-[#F15B41]"
        style={iconColor !== '#222' ? { color: iconColor } : undefined}
      >
        <IconBell />

        {/* ── Unread Badge Counter (Number visible when notification arrives) ── */}
        {unreadCount > 0 && (
          <span
            className="absolute -top-[7px] -right-[9px] min-w-[19px] h-[19px] px-[4px] rounded-full text-white text-[10.5px] font-black flex items-center justify-center leading-none shadow-md pointer-events-none select-none z-10"
            style={{ backgroundColor: badgeColor }}
          >
            <span
              className="absolute inset-0 rounded-full animate-ping opacity-70"
              style={{ backgroundColor: badgeColor }}
            />
            <span className="relative z-10 leading-none">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          </span>
        )}
      </button>

      {/* Notifications Dropdown Panel */}
      {isOpen && (
        <div
          className="fixed left-1/2 top-[calc(env(safe-area-inset-top)+74px)] max-h-[calc(100dvh-82px)] w-[calc(100vw-16px)] max-w-[420px] -translate-x-1/2 bg-white rounded-[16px] shadow-[0_20px_45px_-10px_rgba(0,0,0,0.18),0_10px_20px_-8px_rgba(0,0,0,0.1)] border border-[#e5e7eb] z-[250] overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150 sm:absolute sm:left-auto sm:top-[calc(100%+14px)] sm:right-0 sm:max-h-none sm:w-[380px] sm:translate-x-0 md:w-[420px]"
          onTouchStart={(event) => {
            const touch = event.touches[0];
            touchStart.current = { x: touch.clientX, y: touch.clientY };
          }}
          onTouchEnd={(event) => {
            const start = touchStart.current;
            const touch = event.changedTouches[0];
            touchStart.current = null;
            if (
              start &&
              Math.abs(touch.clientX - start.x) > 80 &&
              Math.abs(touch.clientX - start.x) > Math.abs(touch.clientY - start.y)
            ) {
              setIsOpen(false);
            }
          }}
        >
          {/* Header */}
          <div className="px-[18px] py-[14px] bg-[#f9fafb] border-b border-[#e5e7eb] flex items-center justify-between gap-[12px]">
            <div className="flex items-center gap-[8px]">
              <span className="text-[15px] font-bold text-[#111827]">Notifications</span>
              {unreadCount > 0 ? (
                <span className="bg-[#ecfdf5] text-[#059669] border border-[#a7f3d0] text-[11px] font-bold px-[7px] py-[1.5px] rounded-full">
                  {unreadCount} new
                </span>
              ) : (
                <span className="bg-gray-100 text-gray-500 text-[11px] font-medium px-[7px] py-[1.5px] rounded-full">
                  All caught up
                </span>
              )}
            </div>

            <div className="flex items-center gap-[12px]">
              {unreadCount > 0 && (
                <button
                  type="button"
                  onClick={markAllAsRead}
                  className="text-[12px] font-semibold text-[#4b5563] hover:text-[#111827] transition-colors cursor-pointer bg-transparent border-0 p-0"
                >
                  Mark all read
                </button>
              )}
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                aria-label="Close notifications"
                className="flex h-[28px] w-[28px] items-center justify-center rounded-full text-[#6b7280] hover:bg-gray-200 hover:text-[#111827] transition-colors cursor-pointer bg-transparent border-0 p-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          {/* Body: Notifications List */}
          <div className="max-h-[min(420px,calc(100dvh-210px))] overflow-y-auto divide-y divide-[#f3f4f6] sm:max-h-[420px]">
            {!isAuthenticated && !getCustomerEmail() && notifications.length === 0 ? (
              /* Unauthenticated Prompt */
              <div className="p-[28px_20px] text-center space-y-[12px]">
                <div className="w-[44px] h-[44px] mx-auto rounded-full bg-[#f3f4f6] text-[#6b7280] flex items-center justify-center">
                  <IconBell size={22} />
                </div>
                <div>
                  <h4 className="text-[14px] font-bold text-[#111827] m-0">Sign in for updates</h4>
                  <p className="text-[12px] text-[#6b7280] mt-[4px] m-0 leading-normal">
                    Log in to track your order deliveries and submit product reviews directly.
                  </p>
                </div>
                <Link
                  href="/login"
                  onClick={() => setIsOpen(false)}
                  className="inline-block bg-[#111827] hover:bg-[#000] text-white text-[12.5px] font-bold px-[18px] py-[8px] rounded-[8px] transition-colors no-underline"
                >
                  Sign In
                </Link>
              </div>
            ) : (
              <>
                {notificationError && (
                  <p
                    role="alert"
                    className="m-0 border-b border-[#fecaca] bg-[#fef2f2] px-[16px] py-[10px] text-[12px] text-[#b91c1c]"
                  >
                    Notifications could not be loaded. Close and reopen this panel to retry.
                  </p>
                )}
                {notifications.length === 0 ? (
                  /* Empty Notifications */
                  <div className="p-[36px_20px] text-center space-y-[10px]">
                    <div className="w-[48px] h-[48px] mx-auto rounded-full bg-[#ecfdf5] text-[#059669] flex items-center justify-center">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    </div>
                    <h4 className="text-[14px] font-bold text-[#111827] m-0">No new notifications</h4>
                    <p className="text-[12px] text-[#6b7280] max-w-[280px] mx-auto m-0 leading-normal">
                      When your order status updates or products are delivered, you will receive real-time notifications here.
                    </p>
                  </div>
                ) : (
                  /* Notifications Stream */
                  notifications.map((notif) => {
                    const isDelivered = notif.type === 'order_delivered';
                    const badge = getNotificationBadge(notif);

                    return (
                      <div
                        key={notif._id}
                        className={`p-[16px_18px] transition-colors relative ${
                          notif.read ? 'bg-white hover:bg-[#fafafa]' : 'bg-[#f0fdf4]/40 hover:bg-[#f0fdf4]/70'
                        }`}
                      >
                    {/* Header Row: Badge, Order # & Relative Time */}
                    <div className="flex items-center justify-between gap-[8px] mb-[6px]">
                      <div className="flex items-center gap-[6px] flex-wrap">
                        <span
                          className={`inline-flex items-center gap-[4px] border text-[10.5px] font-bold px-[7px] py-[1px] rounded-full uppercase tracking-wider ${badge.bg}`}
                        >
                          <span className={`w-[5px] h-[5px] rounded-full ${badge.dot}`} />
                          <span>{badge.icon} {badge.label}</span>
                        </span>

                        <span className="text-[12px] font-mono font-bold text-[#374151]">
                          #{notif.orderNumber}
                        </span>
                      </div>

                      <div className="flex items-center gap-[8px]">
                        <span className="text-[11px] text-[#9ca3af]">
                          {formatRelativeTime(notif.createdAt)}
                        </span>
                        <button
                          type="button"
                          onClick={() => dismissNotification(notif._id)}
                          aria-label={`Dismiss notification: ${notif.title}`}
                          title="Dismiss notification"
                          className="flex h-[22px] w-[22px] items-center justify-center rounded-full text-[#9ca3af] hover:bg-gray-100 hover:text-[#111827] transition-colors cursor-pointer border-0 bg-transparent p-0"
                        >
                          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                            <path d="M18 6 6 18M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Title & Message */}
                    <h5 className="text-[13.5px] font-bold text-[#111827] m-0 leading-snug">
                      {notif.title}
                    </h5>
                    <p className="text-[12.5px] text-[#4b5563] mt-[3px] mb-0 leading-relaxed">
                      {notif.message}
                    </p>

                    {/* Delivered Products: Direct Review Action Buttons */}
                    {isDelivered && notif.items?.some((item) => !item.reviewed) && (
                      <div className="mt-[12px] pt-[10px] border-t border-[#e5e7eb] space-y-[8px]">
                        <span className="text-[11px] font-bold text-[#059669] uppercase tracking-wider block">
                          Review your delivered items:
                        </span>
                        {notif.items.filter((item) => !item.reviewed).map((item, idx) => (
                          <div
                            key={idx}
                            className="bg-white border border-[#e5e7eb] rounded-[10px] p-[8px_10px] flex items-center justify-between gap-[10px] shadow-2xs hover:border-[#10b981] transition-all"
                          >
                            <div className="flex items-center gap-[10px] min-w-0">
                              {item.image ? (
                                <div className="w-[36px] h-[36px] rounded-[6px] bg-[#f9fafb] border border-[#f3f4f6] overflow-hidden shrink-0 relative">
                                  <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                    sizes="36px"
                                    onError={handleImageError}
                                  />
                                </div>
                              ) : (
                                <div className="w-[36px] h-[36px] rounded-[6px] bg-[#f3f4f6] text-[#9ca3af] flex items-center justify-center shrink-0 text-[14px]">
                                  📦
                                </div>
                              )}
                              <span className="text-[12.5px] font-semibold text-[#1f2937] truncate block">
                                {item.name}
                              </span>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleReviewClick(notif._id, item.reviewUrl)}
                              className="inline-flex items-center gap-[4px] bg-[#111827] hover:bg-[#000] text-white text-[11.5px] font-bold px-[10px] py-[6px] rounded-[6px] shrink-0 transition-transform hover:scale-105 cursor-pointer border-0"
                            >
                              <span>⭐ Write Review</span>
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Order Tracking / History Link for updates */}
                    {!isDelivered && (
                      <div className="mt-[8px] pt-[6px]">
                        <Link
                          href="/profile"
                          onClick={() => {
                            markAsRead(notif._id);
                            setIsOpen(false);
                          }}
                          className="inline-flex items-center gap-[4px] text-[11.5px] font-semibold text-[#2563eb] hover:text-[#1d4ed8] no-underline"
                        >
                          <span>Track shipment & view details →</span>
                        </Link>
                      </div>
                    )}
                      </div>
                    );
                  })
                )}
              </>
            )}
          </div>

          {/* Footer */}
          <div className="p-[10px_16px] bg-[#fafafa] border-t border-[#e5e7eb] flex items-center justify-between text-[12px]">
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              className="text-[#4b5563] hover:text-[#111827] font-semibold no-underline"
            >
              My Profile & Orders
            </Link>
            <span className="text-[#9ca3af]">•</span>
            <Link
              href="/shop"
              onClick={() => setIsOpen(false)}
              className="text-[#059669] hover:text-[#047857] font-semibold no-underline"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default NotificationDropdown;
