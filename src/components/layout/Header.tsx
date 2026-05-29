import { LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export default function Header() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="app-header">
      <div>
        <div className="header-title">Welcome, {user?.name}</div>
        <div className="header-sub">
          {user?.role} · {user?.email}
        </div>
      </div>
      <button type="button" className="btn btn-secondary" onClick={handleLogout}>
        <LogOut size={16} /> Logout
      </button>
      <style>{`
        .app-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 1rem 1.5rem;
          background: var(--surface);
          border-bottom: 1px solid var(--border);
        }
        .header-title { font-weight: 700; }
        .header-sub { font-size: 0.85rem; color: var(--text-muted); }
      `}</style>
    </header>
  );
}
