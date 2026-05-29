import type {
  AuthResponse,
  TicketComment,
  DashboardStats,
  PaginatedResult,
  Ticket,
  TicketPriority,
  TicketStatus,
  User,
} from '../types';
import api from './axios';

export interface CompanyOption {
  id: string;
  name: string;
}

export const companiesApi = {
  registerOptions: () =>
    api.get<CompanyOption[]>('/companies/register-options'),
  listForTicket: () => api.get<CompanyOption[]>('/companies/options'),
};

export const authApi = {
  login: (email: string, password: string) =>
    api.post<AuthResponse>('/auth/login', { email, password }),
  register: (data: {
    email: string;
    password: string;
    name: string;
  }) => api.post<AuthResponse>('/auth/register', data),
  me: () => api.get<User>('/auth/me'),
};

export const ticketsApi = {
  list: (params?: {
    page?: number;
    limit?: number;
    status?: TicketStatus;
    priority?: TicketPriority;
    assignedToId?: string;
    search?: string;
  }) => api.get<PaginatedResult<Ticket>>('/tickets', { params }),
  get: (id: string) => api.get<Ticket>(`/tickets/${id}`),
  create: (data: {
    companyId: string;
    title: string;
    description: string;
    priority?: TicketPriority;
  }) => api.post<Ticket>('/tickets', data),
  update: (
    id: string,
    data: Partial<{
      title: string;
      description: string;
      status: TicketStatus;
      priority: TicketPriority;
    }>,
  ) => api.patch<Ticket>(`/tickets/${id}`, data),
  assign: (id: string, assignedToId: string) =>
    api.patch<Ticket>(`/tickets/${id}/assign`, { assignedToId }),
};

export const commentsApi = {
  list: (ticketId: string) =>
    api.get<TicketComment[]>(`/tickets/${ticketId}/comments`),
  create: (ticketId: string, message: string) =>
    api.post<TicketComment>(`/tickets/${ticketId}/comments`, { message }),
};

export const usersApi = {
  list: () => api.get<User[]>('/users'),
  create: (data: {
    email: string;
    password: string;
    name: string;
    role: string;
  }) => api.post<User>('/users', data),
  update: (
    id: string,
    data: Partial<{ name: string; role: string; password: string }>,
  ) => api.patch<User>(`/users/${id}`, data),
};

export const dashboardApi = {
  stats: () => api.get<DashboardStats>('/dashboard/stats'),
};

export interface AuditLogEntry {
  id: string;
  userId: string;
  action: string;
  entity: string;
  entityId: string;
  createdAt: string;
  user?: Pick<User, 'id' | 'name' | 'email' | 'role'>;
}

export const auditApi = {
  list: (limit = 50) =>
    api.get<AuditLogEntry[]>('/audit-logs', { params: { limit } }),
};
