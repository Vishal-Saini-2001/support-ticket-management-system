import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import type { User } from '@/types/api';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function getUserId(user: User | string | null | undefined): string {
  if (!user) {
    return '';
  }
  if (typeof user === 'string') {
    return user;
  }
  return user._id || user.id || '';
}

export function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) {
    return '?';
  }
  if (parts.length === 1) {
    return parts[0].slice(0, 2).toUpperCase();
  }
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
}

export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const diffSeconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (Number.isNaN(diffSeconds)) {
    return '';
  }
  if (diffSeconds < 60) {
    return 'just now';
  }
  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    return `${diffMinutes}m ago`;
  }
  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    return `${diffDays}d ago`;
  }
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

