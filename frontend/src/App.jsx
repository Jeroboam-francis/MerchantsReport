import { Navigate, Route, Routes } from 'react-router-dom';
import AppShell from './components/AppShell';
import ProtectedRoute from './routes/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import ListingPage from './pages/ListingPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute />}>
        <Route element={<AppShell />}>
          <Route index element={<DashboardPage />} />
          <Route path="merchants" element={<ListingPage />} />
          <Route path="transactions" element={<ListingPage />} />
          <Route path="revenue" element={<ListingPage />} />
          <Route path="subscribers" element={<ListingPage />} />
          <Route path="fraud" element={<ListingPage />} />
          <Route path="alerts" element={<ListingPage />} />
          <Route path="reports" element={<ListingPage />} />
          <Route path="admin" element={<ListingPage />} />
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
