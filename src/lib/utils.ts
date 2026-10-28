import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Returns current real local time in HH:mm (24-hour) format.
 * E.g. "10:45"
 */
export function getRealCurrentTime(): string {
  const d = new Date();
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

/**
 * Converts a 24-hour "HH:mm" time string into 12-hour format with AM/PM.
 * E.g. "07:00" -> "07:00 AM", "14:30" -> "02:30 PM", "10:45" -> "10:45 AM"
 */
export function formatTime12Hour(timeStr?: string): string {
  if (!timeStr) timeStr = getRealCurrentTime();
  const trimmed = String(timeStr).trim();
  if (/am|pm/i.test(trimmed)) {
    return trimmed;
  }
  const parts = trimmed.split(":");
  if (parts.length >= 2) {
    let h = parseInt(parts[0], 10);
    const m = parts[1].slice(0, 2);
    if (isNaN(h)) return trimmed;
    const ampm = h >= 12 ? "PM" : "AM";
    h = h % 12;
    if (h === 0) h = 12;
    return `${String(h).padStart(2, "0")}:${m} ${ampm}`;
  }
  return trimmed;
}

/**
 * Formats a departure date (YYYY-MM-DD) and time (HH:mm) into official ticket format:
 * e.g. "28-10-2026.10.45"
 */
export function formatDepartureDateString(dateStr?: string, timeStr?: string): string {
  const today = new Date().toISOString().split("T")[0];
  const rawDate = dateStr || today;
  const parts = String(rawDate).split("-");
  const [y, m, d] = parts.length === 3 ? parts : today.split("-");
  const rawTime = String(timeStr || getRealCurrentTime()).replace(":", ".");
  return `${d}-${m}-${y}.${rawTime}`;
}
