import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Ticket, PlusCircle, Users } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';

export default function Sidebar() {
  const user = useAuthStore((s) => s.user);

  const linkClass = ({ isActive }: { isActive: boolean }) =>
    `sidebar-link${isActive ? ' active' : ''}`;

  return (
    <aside className="sidebar">
      <div className="sidebar-brand">Helpdesk</div>
      <nav className="sidebar-nav">
        <NavLink to="/dashboard" className={linkClass}>
          <LayoutDashboard size={18} /> Dashboard
        </NavLink>
        <NavLink to="/tickets" className={linkClass}>
          <Ticket size={18} /> Tickets
        </NavLink>
        {(user?.role === 'customer' || user?.role === 'admin') && (
          <NavLink to="/tickets/create" className={linkClass}>
            <PlusCircle size={18} /> New Ticket
          </NavLink>
        )}
        {user?.role === 'admin' && (
          <NavLink to="/admin/users" className={linkClass}>
            <Users size={18} /> Manage Users
          </NavLink>
        )}
      </nav>
      <style>{`
        .sidebar {
          width: 240px;
          background: var(--surface);
          border-right: 1px solid var(--border);
          padding: 1.25rem 0;
          flex-shrink: 0;
        }
        .sidebar-brand {
          font-weight: 800;
          font-size: 1.15rem;
          color: var(--primary);
          padding: 0 1.25rem 1.25rem;
        }
        .sidebar-nav { display: flex; flex-direction: column; gap: 0.25rem; }
        .sidebar-link {
          display: flex;
          align-items: center;
          gap: 0.65rem;
          padding: 0.65rem 1.25rem;
          color: var(--text-muted);
          font-weight: 500;
        }
        .sidebar-link:hover { background: #f3f4f6; color: var(--text); }
        .sidebar-link.active {
          background: #eef2ff;
          color: var(--primary);
          border-right: 3px solid var(--primary);
        }
        @media (max-width: 768px) {
          .sidebar { width: 100%; border-right: none; border-bottom: 1px solid var(--border); }
          .sidebar-nav { flex-direction: row; flex-wrap: wrap; padding: 0 0.5rem 0.5rem; }
          .sidebar-link { padding: 0.5rem 0.75rem; border-radius: 8px; }
          .sidebar-link.active { border-right: none; }
        }
      `}</style>
    </aside>
  );
}
