import { Navigate, Route, Routes } from 'react-router-dom';
import ProtectedRoute from './auth/ProtectedRoute';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import ReportPage from './pages/ReportPage';
import UsersPage from './pages/UsersPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/users" element={<UsersPage />} />
          <Route path="/reports" element={<ReportPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/users" replace />} />
    </Routes>
  );
}
