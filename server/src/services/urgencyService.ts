/**
 * Urgency service — computes urgency tier for a given item based on due date and status.
 */

export type UrgencyTier = 'overdue' | 'due_soon' | 'upcoming' | 'none';

/**
 * Returns the urgency tier for an item.
 * - overdue: past due and not completed/archived
 * - due_soon: due within next 7 days
 * - upcoming: due within next 8–30 days
 * - none: more than 30 days away
 */
export function computeUrgency(dueDateStr: string, status: string): UrgencyTier {
  if (status === 'completed' || status === 'archived') return 'none';

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dueDate = new Date(dueDateStr + 'T00:00:00');
  dueDate.setHours(0, 0, 0, 0);

  const diffMs = dueDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return 'overdue';
  if (diffDays <= 7) return 'due_soon';
  if (diffDays <= 30) return 'upcoming';
  return 'none';
}

/**
 * Returns days until due (negative if overdue).
 */
export function daysUntilDue(dueDateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDate = new Date(dueDateStr + 'T00:00:00');
  dueDate.setHours(0, 0, 0, 0);
  const diffMs = dueDate.getTime() - today.getTime();
  return Math.ceil(diffMs / (1000 * 60 * 60 * 24));
}
