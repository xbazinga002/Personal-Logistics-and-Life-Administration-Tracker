/**
 * Recurrence engine — generates the next due date for recurring items.
 * Handles weekly, monthly, and yearly recurrence with edge-case clamping.
 */

export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';

/**
 * Given a due date and recurrence type, returns the next due date.
 * For monthly/yearly, clamps to the last valid day of the resulting month
 * (e.g., Jan 31 + 1 month → Feb 28/29).
 */
export function generateNextDueDate(dueDateInput: string | Date, recurrenceType: RecurrenceType): Date {
  const dueDateStr = dueDateInput instanceof Date
    ? dueDateInput.toISOString().split('T')[0]
    : String(dueDateInput).split('T')[0];
  const date = new Date(dueDateStr + 'T00:00:00Z');

  switch (recurrenceType) {
    case 'daily':
      date.setUTCDate(date.getUTCDate() + 1);
      break;

    case 'weekly':
      date.setUTCDate(date.getUTCDate() + 7);
      break;

    case 'monthly': {
      const originalDay = date.getUTCDate();
      date.setUTCMonth(date.getUTCMonth() + 1);
      // If the day rolled over (e.g. Jan 31 → Mar 2), clamp to last day of target month
      if (date.getUTCDate() !== originalDay) {
        date.setUTCDate(0); // moves to last day of previous month
      }
      break;
    }

    case 'yearly': {
      const originalMonth = date.getUTCMonth();
      const originalDay = date.getUTCDate();
      date.setUTCFullYear(date.getUTCFullYear() + 1);
      // Handle Feb 29 in non-leap years → clamp to Feb 28
      if (date.getUTCMonth() !== originalMonth || date.getUTCDate() !== originalDay) {
        date.setUTCDate(0);
      }
      break;
    }

    default:
      throw new Error(`Cannot generate next date for recurrence type: ${recurrenceType}`);
  }

  return date;
}

/**
 * Formats a Date to YYYY-MM-DD string (UTC).
 */
export function toDateString(date: Date): string {
  return date.toISOString().split('T')[0];
}
