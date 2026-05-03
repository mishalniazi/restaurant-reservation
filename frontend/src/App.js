import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './app/store';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ReservePage from './pages/ReservePage';
import MyReservationsPage from './pages/MyReservationsPage';
import WaitlistPage from './pages/WaitlistPage';
import StaffDashboard from './pages/StaffDashboard';
import AdminPage from './pages/AdminPage';

export default function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reserve" element={
            <ProtectedRoute roles={['customer']}><ReservePage /></ProtectedRoute>
          } />
          <Route path="/my-reservations" element={
            <ProtectedRoute roles={['customer']}><MyReservationsPage /></ProtectedRoute>
          } />
          <Route path="/waitlist" element={
            <ProtectedRoute roles={['customer']}><WaitlistPage /></ProtectedRoute>
          } />
          <Route path="/dashboard" element={
            <ProtectedRoute roles={['staff', 'admin']}><StaffDashboard /></ProtectedRoute>
          } />
          <Route path="/admin" element={
            <ProtectedRoute roles={['admin']}><AdminPage /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </Provider>
  );
}
