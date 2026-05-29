import { Outlet } from 'react-router-dom';
import Header from './Header';
import Sidebar from './Sidebar';

export default function AppLayout() {
  return (
    <div className="app-shell">
      <Sidebar />
      <div className="app-main">
        <Header />
        <main>
          <Outlet />
        </main>
      </div>
      <style>{`
        .app-shell {
          display: flex;
          min-height: 100vh;
        }
        .app-main {
          flex: 1;
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        main { flex: 1; overflow: auto; }
        @media (max-width: 768px) {
          .app-shell { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
