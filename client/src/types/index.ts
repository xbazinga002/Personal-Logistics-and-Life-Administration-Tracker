export type RecurrenceType = 'none' | 'daily' | 'weekly' | 'monthly' | 'yearly';
export type ItemStatus = 'pending' | 'completed' | 'overdue' | 'archived';
export type UrgencyTier = 'overdue' | 'due_soon' | 'upcoming' | 'none';

export interface Tag {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  user_id: string;
  created_at: string;
}

export interface Item {
  id: string;
  user_id: string;
  category_id: string | null;
  category_name?: string;
  generated_from_item_id: string | null;
  title: string;
  notes: string | null;
  due_date: string;
  status: ItemStatus;
  recurrence_type: RecurrenceType;
  recurrence_interval: number;
  archived_at: string | null;
  created_at: string;
  tags: Tag[];
  urgency: UrgencyTier;
}

export interface Notification {
  id: string;
  user_id: string;
  item_id: string | null;
  type: string;
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface DashboardSummary {
  overdue: Item[];
  dueSoon: Item[];
  upcoming: Item[];
  counts: {
    overdue: number;
    dueSoon: number;
    upcoming: number;
  };
}

export interface AuthState {
  token: string | null;
  userId: string | null;
  email: string | null;
}
