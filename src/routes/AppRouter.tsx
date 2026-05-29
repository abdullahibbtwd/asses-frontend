import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../components/layout/AppLayout.tsx';
import Login from '../pages/auth/Login.tsx';
import Register from '../pages/auth/Register.tsx';
import ManageUsers from '../pages/admin/ManageUsers.tsx';
import Dashboard from '../pages/dashboard/Dashboard.tsx';
import CreateTicket from '../pages/tickets/CreateTicket.tsx';
import TicketDetail from '../pages/tickets/TicketDetail.tsx';
import TicketList from '../pages/tickets/TicketList.tsx';
import { ProtectedRoute } from './ProtectedRoute.tsx';

export const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      <Route
        path="/"
        element={
          <ProtectedRoute>
            <AppLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="tickets" element={<TicketList />} />
        <Route
          path="tickets/create"
          element={
            <ProtectedRoute allowedRoles={['customer', 'admin']}>
              <CreateTicket />
            </ProtectedRoute>
          }
        />
        <Route path="tickets/:id" element={<TicketDetail />} />
        <Route
          path="admin/users"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <ManageUsers />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  </BrowserRouter>
);
