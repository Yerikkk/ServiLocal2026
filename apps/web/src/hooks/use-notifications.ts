'use client';

/**
 * useNotifications hook
 *
 * Polls /api/notifications/unread-count every 30 seconds while the tab
 * is focused. Provides helpers to mark individual / all notifications read.
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api-client';

export type Notification = {
  id: string;
  type: string;
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  data?: Record<string, unknown> | null;
};

type NotificationsResponse = {
  items: Notification[];
  total: number;
  unreadCount: number;
  page: number;
  totalPages: number;
};

type UseNotificationsReturn = {
  unreadCount: number;
  notifications: Notification[];
  total: number;
  totalPages: number;
  loading: boolean;
  dropdownLoading: boolean;
  refreshCount: () => Promise<void>;
  loadDropdown: () => Promise<void>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
};

const POLL_INTERVAL = 30_000; // 30 s

export function useNotifications(enabled = true): UseNotificationsReturn {
  const [unreadCount, setUnreadCount]       = useState(0);
  const [notifications, setNotifications]   = useState<Notification[]>([]);
  const [total, setTotal]                   = useState(0);
  const [totalPages, setTotalPages]         = useState(1);
  const [loading, setLoading]               = useState(false);
  const [dropdownLoading, setDropdownLoading] = useState(false);
  const intervalRef                         = useRef<ReturnType<typeof setInterval> | null>(null);

  /* ── Fetch just the count ─────────────────── */
  const refreshCount = useCallback(async () => {
    if (!enabled) return;
    try {
      const data = await api.get<{ unreadCount: number }>('/api/notifications/unread-count');
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      // silently ignore (e.g. not logged in)
    }
  }, [enabled]);

  /* ── Fetch recent 10 for the dropdown ──────── */
  const loadDropdown = useCallback(async () => {
    if (!enabled) return;
    setDropdownLoading(true);
    try {
      const data = await api.get<NotificationsResponse>(
        '/api/notifications?limit=10&page=1'
      );
      setNotifications(data.items ?? []);
      setTotal(data.total ?? 0);
      setUnreadCount(data.unreadCount ?? 0);
      setTotalPages(data.totalPages ?? 1);
    } catch {
      // ignore
    } finally {
      setDropdownLoading(false);
    }
  }, [enabled]);

  /* ── Mark single as read ───────────────────── */
  const markAsRead = useCallback(async (id: string) => {
    try {
      await api.patch(`/api/notifications/${id}/read`);
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch { /* ignore */ }
  }, []);

  /* ── Mark all as read ─────────────────────── */
  const markAllAsRead = useCallback(async () => {
    try {
      await api.patch('/api/notifications/read-all');
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch { /* ignore */ }
  }, []);

  /* ── Polling ──────────────────────────────── */
  useEffect(() => {
    if (!enabled) return;

    // Initial fetch
    refreshCount();

    // Poll every 30 s
    intervalRef.current = setInterval(refreshCount, POLL_INTERVAL);

    // Pause polling when tab loses focus, resume when focused
    function onVisible() {
      if (document.visibilityState === 'visible') refreshCount();
    }
    document.addEventListener('visibilitychange', onVisible);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [enabled, refreshCount]);

  return {
    unreadCount,
    notifications,
    total,
    totalPages,
    loading,
    dropdownLoading,
    refreshCount,
    loadDropdown,
    markAsRead,
    markAllAsRead,
  };
}
