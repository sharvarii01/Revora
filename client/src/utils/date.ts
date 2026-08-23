/**
 * Date formatting and relative time helpers
 */

export function formatDate(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Just now';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    }).format(date);
  } catch {
    return 'Just now';
  }
}

export function formatDateTime(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Just now';
  try {
    return new Intl.DateTimeFormat('en-IN', {
      day: 'numeric',
      month: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true,
    }).format(date);
  } catch {
    return 'Just now';
  }
}

export function formatRelativeTime(dateInput: string | Date | number | undefined | null): string {
  if (!dateInput) return 'Just now';
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return 'Just now';
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 0) {
    const futureSeconds = Math.abs(diffInSeconds);
    if (futureSeconds < 60) return `in ${futureSeconds}s`;
    if (futureSeconds < 3600) return `in ${Math.floor(futureSeconds / 60)}m`;
    if (futureSeconds < 86400) return `in ${Math.floor(futureSeconds / 3600)}h`;
    return `in ${Math.floor(futureSeconds / 86400)}d`;
  }

  if (diffInSeconds < 60) return `${Math.max(1, diffInSeconds)}s ago`;
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(date);
}
