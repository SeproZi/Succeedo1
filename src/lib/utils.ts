import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { TimelinePeriod, OkrOwner } from "@/lib/types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getCurrentPeriod(): TimelinePeriod {
  const month = new Date().getMonth(); // 0-11
  if (month < 4) { // Jan-Apr
    return 'P1';
  } else if (month < 8) { // May-Aug
    return 'P2';
  } else { // Sep-Dec
    return 'P3';
  }
}

export function getOwnerKey(owner: OkrOwner): string {
  return `${owner.type}:${owner.id}`;
}
