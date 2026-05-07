import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatUGX(amount: number): string {
  return `UGX ${amount.toLocaleString("en-UG")}`;
}

export function formatDate(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleDateString("en-UG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "Africa/Kampala",
  });
}

export function formatDateTime(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleString("en-UG", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Kampala",
  });
}

export function formatTime(date: Date | string | null): string {
  if (!date) return "N/A";
  const d = typeof date === "string" ? new Date(date) : date;
  return d.toLocaleTimeString("en-UG", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Africa/Kampala",
  });
}

export function formatOdds(odds: string | number): string {
  const num = typeof odds === "string" ? parseFloat(odds) : odds;
  return num.toFixed(2);
}

export function generateWhatsAppMessage(tip: {
  matchName: string;
  league: string;
  pick: string;
  odds: string | number;
  matchDatetime: Date | string | null;
}): string {
  const time = formatTime(tip.matchDatetime);
  const odds = formatOdds(tip.odds);
  
  return encodeURIComponent(
    `*TipZone UG* - Today's Tip\n` +
    `${tip.matchName} (${tip.league})\n` +
    `${time} EAT\n` +
    `Pick: ${tip.pick}\n` +
    `Odds: ${odds}\n\n` +
    `Get more verified tips at tipzone.ug`
  );
}

export function getTierColor(tier: string): string {
  switch (tier) {
    case "GOLD":
      return "text-yellow-400 border-yellow-400";
    case "SILVER":
      return "text-gray-300 border-gray-300";
    case "BRONZE":
      return "text-amber-600 border-amber-600";
    default:
      return "text-muted-foreground border-muted-foreground";
  }
}

export function getTierBg(tier: string): string {
  switch (tier) {
    case "GOLD":
      return "bg-yellow-400/10 border-yellow-400/30";
    case "SILVER":
      return "bg-gray-300/10 border-gray-300/30";
    case "BRONZE":
      return "bg-amber-600/10 border-amber-600/30";
    default:
      return "bg-muted border-muted-foreground/30";
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "won":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "lost":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "void":
      return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    case "postponed":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    default:
      return "bg-amber-500/10 text-amber-400 border-amber-500/30";
  }
}

export function getStatusDot(status: string): string {
  switch (status) {
    case "won":
      return "bg-green-500";
    case "lost":
      return "bg-red-500";
    case "void":
      return "bg-gray-500";
    default:
      return "bg-amber-500";
  }
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
}
