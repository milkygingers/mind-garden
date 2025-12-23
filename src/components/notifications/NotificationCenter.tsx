"use client";

/**
 * Notification Center Component
 * 
 * Shows in-app notifications and manages habit reminders
 */

import { useState, useEffect, useCallback } from "react";
import { Bell, X, Check, Clock, Settings, AlertCircle } from "lucide-react";
import Link from "next/link";
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  sendNotification,
  formatTime,
} from "@/lib/notifications";

interface Habit {
  id: string;
  name: string;
  icon: string;
  color: string;
  reminderEnabled: boolean;
  reminderTime: string | null;
  logs: Array<{ date: string; completed: boolean }>;
}

interface Notification {
  id: string;
  type: "reminder" | "info" | "success";
  title: string;
  message: string;
  habitId?: string;
  habitIcon?: string;
  habitColor?: string;
  timestamp: Date;
  read: boolean;
}

export function NotificationCenter() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [permissionStatus, setPermissionStatus] = useState<string>("default");
  const [shownReminders, setShownReminders] = useState<Set<string>>(new Set());

  // Load permission status
  useEffect(() => {
    if (isNotificationSupported()) {
      setPermissionStatus(getNotificationPermission());
    }
  }, []);

  // Fetch habits with reminders
  const fetchHabits = useCallback(async () => {
    try {
      const res = await fetch("/api/habits");
      if (res.ok) {
        const data = await res.json();
        setHabits(data.filter((h: Habit) => h.reminderEnabled && h.reminderTime));
      }
    } catch (error) {
      console.error("Failed to fetch habits:", error);
    }
  }, []);

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  // Check for reminders every minute
  useEffect(() => {
    const checkReminders = () => {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, "0")}:${now.getMinutes().toString().padStart(2, "0")}`;
      const today = now.toDateString();

      habits.forEach((habit) => {
        if (!habit.reminderTime) return;

        // Check if it's time for reminder
        if (habit.reminderTime === currentTime) {
          const reminderId = `${habit.id}-${today}`;
          
          // Don't show if already shown today
          if (shownReminders.has(reminderId)) return;

          // Check if habit is already completed today
          const completedToday = habit.logs.some(
            (log) => log.completed && new Date(log.date).toDateString() === today
          );

          if (completedToday) return;

          // Add to shown reminders
          setShownReminders((prev) => new Set([...prev, reminderId]));

          // Create in-app notification
          const notification: Notification = {
            id: reminderId,
            type: "reminder",
            title: `Time for ${habit.name}!`,
            message: `Don't forget to complete your habit today`,
            habitId: habit.id,
            habitIcon: habit.icon,
            habitColor: habit.color,
            timestamp: now,
            read: false,
          };

          setNotifications((prev) => [notification, ...prev]);

          // Send browser notification if permitted
          if (permissionStatus === "granted") {
            sendNotification(`${habit.icon} ${habit.name}`, {
              body: "Time to complete your habit!",
              tag: reminderId,
              onClick: () => {
                window.location.href = "/habits";
              },
            });
          }
        }
      });
    };

    // Check immediately and then every minute
    checkReminders();
    const interval = setInterval(checkReminders, 60000);

    return () => clearInterval(interval);
  }, [habits, permissionStatus, shownReminders]);

  // Request notification permission
  const handleRequestPermission = async () => {
    const permission = await requestNotificationPermission();
    setPermissionStatus(permission);
  };

  // Mark notification as read
  const markAsRead = (notificationId: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
    );
  };

  // Dismiss notification
  const dismissNotification = (notificationId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== notificationId));
  };

  // Clear all notifications
  const clearAll = () => {
    setNotifications([]);
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="relative">
      {/* Bell button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-lg hover:bg-[var(--card-hover)] transition-colors"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-medium">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
          />

          {/* Panel */}
          <div className="absolute right-0 top-12 w-80 sm:w-96 bg-[var(--card)] border border-[var(--border)] rounded-xl shadow-2xl z-50 overflow-hidden animate-fade-in">
            {/* Header */}
            <div className="p-4 border-b border-[var(--border)] flex items-center justify-between">
              <h3 className="font-semibold flex items-center gap-2">
                <Bell className="w-4 h-4" />
                Notifications
              </h3>
              {notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="text-xs text-[var(--muted)] hover:text-[var(--foreground)]"
                >
                  Clear all
                </button>
              )}
            </div>

            {/* Permission banner */}
            {isNotificationSupported() && permissionStatus !== "granted" && (
              <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border-b border-[var(--border)]">
                <div className="flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-sm text-amber-800 dark:text-amber-200">
                      Enable notifications to get habit reminders
                    </p>
                    <button
                      onClick={handleRequestPermission}
                      className="mt-2 text-xs px-3 py-1 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                    >
                      Enable Notifications
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications list */}
            <div className="max-h-96 overflow-y-auto">
              {notifications.length === 0 ? (
                <div className="p-8 text-center">
                  <Bell className="w-8 h-8 text-[var(--muted)] mx-auto mb-2 opacity-50" />
                  <p className="text-sm text-[var(--muted)]">No notifications</p>
                  <p className="text-xs text-[var(--muted)] mt-1">
                    Set up habit reminders to receive notifications
                  </p>
                </div>
              ) : (
                notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`
                      p-4 border-b border-[var(--border)] hover:bg-[var(--card-hover)] transition-colors
                      ${!notification.read ? "bg-[var(--garden-500)]/5" : ""}
                    `}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className="flex items-start gap-3">
                      {/* Icon */}
                      <div
                        className="w-10 h-10 rounded-full flex items-center justify-center text-lg flex-shrink-0"
                        style={{
                          backgroundColor: notification.habitColor
                            ? `${notification.habitColor}20`
                            : "var(--background)",
                        }}
                      >
                        {notification.habitIcon || "🔔"}
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{notification.title}</p>
                        <p className="text-xs text-[var(--muted)] mt-0.5">
                          {notification.message}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <Clock className="w-3 h-3 text-[var(--muted)]" />
                          <span className="text-xs text-[var(--muted)]">
                            {notification.timestamp.toLocaleTimeString([], {
                              hour: "numeric",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1">
                        {notification.habitId && (
                          <Link
                            href="/habits"
                            className="p-1.5 rounded hover:bg-[var(--background)] text-[var(--garden-500)]"
                            title="Mark as done"
                          >
                            <Check className="w-4 h-4" />
                          </Link>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            dismissNotification(notification.id);
                          }}
                          className="p-1.5 rounded hover:bg-[var(--background)] text-[var(--muted)]"
                          title="Dismiss"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-3 border-t border-[var(--border)] bg-[var(--background)]">
              <Link
                href="/habits"
                className="flex items-center justify-center gap-2 w-full py-2 text-sm text-[var(--garden-500)] hover:bg-[var(--card-hover)] rounded-lg transition-colors"
                onClick={() => setIsOpen(false)}
              >
                <Settings className="w-4 h-4" />
                Manage Habit Reminders
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

