/**
 * Browser Notification Utilities
 * 
 * Handles requesting permission and sending browser notifications
 */

// Check if notifications are supported
export function isNotificationSupported(): boolean {
  return typeof window !== "undefined" && "Notification" in window;
}

// Get current permission status
export function getNotificationPermission(): NotificationPermission | "unsupported" {
  if (!isNotificationSupported()) return "unsupported";
  return Notification.permission;
}

// Request notification permission
export async function requestNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!isNotificationSupported()) return "unsupported";
  
  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error("Error requesting notification permission:", error);
    return "denied";
  }
}

// Send a browser notification
export function sendNotification(
  title: string,
  options?: {
    body?: string;
    icon?: string;
    tag?: string;
    onClick?: () => void;
  }
): Notification | null {
  if (!isNotificationSupported()) return null;
  if (Notification.permission !== "granted") return null;

  try {
    const notification = new Notification(title, {
      body: options?.body,
      icon: options?.icon || "/icon-192.png",
      tag: options?.tag,
      badge: "/icon-192.png",
    });

    if (options?.onClick) {
      notification.onclick = () => {
        window.focus();
        options.onClick?.();
        notification.close();
      };
    }

    return notification;
  } catch (error) {
    console.error("Error sending notification:", error);
    return null;
  }
}

// Check if a habit should show a reminder right now
export function shouldShowReminder(
  reminderTime: string,
  lastShownTime?: string
): boolean {
  const now = new Date();
  const [hours, minutes] = reminderTime.split(":").map(Number);
  
  const reminderDate = new Date();
  reminderDate.setHours(hours, minutes, 0, 0);

  // Check if current time is within 1 minute of reminder time
  const diffMs = Math.abs(now.getTime() - reminderDate.getTime());
  const isWithinWindow = diffMs < 60000; // 1 minute window

  // Check if we already showed this reminder today
  if (lastShownTime) {
    const lastShown = new Date(lastShownTime);
    const isSameDay = lastShown.toDateString() === now.toDateString();
    if (isSameDay) return false;
  }

  return isWithinWindow;
}

// Format time for display
export function formatTime(time: string): string {
  const [hours, minutes] = time.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const displayHours = hours % 12 || 12;
  return `${displayHours}:${minutes.toString().padStart(2, "0")} ${period}`;
}

// Common reminder times
export const PRESET_TIMES = [
  { value: "06:00", label: "6:00 AM - Early Bird" },
  { value: "07:00", label: "7:00 AM - Morning" },
  { value: "08:00", label: "8:00 AM - Start of Day" },
  { value: "09:00", label: "9:00 AM - Mid-Morning" },
  { value: "12:00", label: "12:00 PM - Noon" },
  { value: "14:00", label: "2:00 PM - Afternoon" },
  { value: "17:00", label: "5:00 PM - End of Work" },
  { value: "19:00", label: "7:00 PM - Evening" },
  { value: "21:00", label: "9:00 PM - Night" },
];

