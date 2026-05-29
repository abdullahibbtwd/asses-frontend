export type Role = 'admin' | 'agent' | 'customer';

export type TicketStatus = 'open' | 'in_progress' | 'resolved' | 'closed';

export type TicketPriority = 'low' | 'medium' | 'high';

export interface User {
  id: string;
  email: string;
  name: string;
  role: Role;
  companyId: string | null;
  createdAt?: string;
}

export interface AuthResponse {
  accessToken: string;
  user: User;
}

export interface Ticket {
  id: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  companyId: string | null;
  createdById: string;
  assignedToId: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: User;
  assignedTo?: User | null;
  company?: { id: string; name: string };
  comments?: TicketComment[];
  _count?: { comments: number };
}

export interface TicketComment {
  id: string;
  message: string;
  ticketId: string;
  authorId: string;
  createdAt: string;
  author?: User;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface DashboardStats {
  tickets: {
    total: number;
    open: number;
    inProgress: number;
    resolved: number;
    closed: number;
  };
  users?: number;
  ticketsByAgent?: { count: number; agent: User | null }[];
  recentActivity?: Ticket[];
}

export const statusColor: Record<TicketStatus, string> = {
  open: 'red',
  in_progress: 'orange',
  resolved: 'green',
  closed: 'gray',
};

export const priorityColor: Record<TicketPriority, string> = {
  low: 'blue',
  medium: 'orange',
  high: 'red',
};
