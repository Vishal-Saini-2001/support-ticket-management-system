export type UserRole = 'user' | 'admin';

export type TicketStatus = 'open' | 'in-progress' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high' | 'urgent';

export type TicketCategory = 'Technical' | 'Billing' | 'General' | 'Feature Request';

export interface User {
  _id: string;
  id?: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Ticket {
  _id: string;
  title: string;
  description: string;
  category: string;
  priority: TicketPriority;
  status: TicketStatus;
  createdBy: User | string;
  resolvedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Comment {
  _id: string;
  ticket: string;
  author: User;
  message: string;
  createdAt: string;
  updatedAt: string;
}

export type ActivityAction =
  | 'TICKET_CREATED'
  | 'TICKET_UPDATED'
  | 'STATUS_CHANGED'
  | 'COMMENT_ADDED'
  | 'TICKET_RESOLVED';

export interface ActivityLog {
  _id: string;
  ticket: string;
  actor: User;
  action: ActivityAction;
  meta: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  _id: string;
  recipient: string;
  ticket: Pick<Ticket, '_id' | 'title' | 'status' | 'priority'> | string;
  type: string;
  message: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  pages: number;
}

export interface TicketStats {
  total: number;
  byStatus: Record<TicketStatus, number>;
  byPriority: Record<TicketPriority, number>;
}

export interface ApiFieldError {
  field: string;
  message: string;
}

export interface ApiErrorPayload {
  message: string;
  errors?: ApiFieldError[];
}

