import {
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  format,
  isSameMonth,
  isSameDay,
  addMonths,
  subMonths,
} from "date-fns";

export const WEEKDAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function getMonthGrid(year: number, month: number): Date[] {
  // month is 0-indexed
  const monthStart = startOfMonth(new Date(year, month, 1));
  const monthEnd = endOfMonth(monthStart);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 0 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 0 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function toDateKey(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function formatMonthTitle(year: number, month: number): string {
  return format(new Date(year, month, 1), "MMMM yyyy");
}

export function formatDayLabel(date: Date): string {
  return format(date, "EEEE, MMMM d, yyyy");
}

export function formatShortDate(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number);
  return format(new Date(y, m - 1, d), "MMM d, yyyy");
}

export { isSameMonth, isSameDay, addMonths, subMonths, format };
