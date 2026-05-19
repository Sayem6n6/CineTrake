import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date?: string | null) {
  if (!date) return "TBA";

  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`));
}

export function daysUntil(date?: string | null) {
  if (!date) return null;

  const today = new Date();
  const target = new Date(`${date}T00:00:00`);
  today.setHours(0, 0, 0, 0);

  return Math.ceil((target.getTime() - today.getTime()) / 86_400_000);
}

export function countdownLabel(date?: string | null) {
  const days = daysUntil(date);

  if (days === null) return "Release TBA";
  if (days < 0) return "Released";
  if (days === 0) return "Releases today";
  if (days === 1) return "Releases tomorrow";

  return `Releases in ${days} days`;
}

export function imageUrl(
  path?: string | null,
  size: "w342" | "w500" | "w780" | "w1280" | "original" = "w500",
) {
  if (!path) return null;

  return `https://image.tmdb.org/t/p/${size}${path}`;
}

export function scoreLabel(score?: number | null) {
  if (score === null || score === undefined || Number.isNaN(score)) return "0.0";

  return score.toFixed(1);
}
