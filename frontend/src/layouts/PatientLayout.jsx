import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const NAV_ITEMS = [
  { to: '/patient/dashboard', label: 'Dashboard' },
  { to: '/patient/doctors', label: 'Doctors' },
  { to: '/patient/appointments', label: 'My Appointments' },
  { to: '/patient/profile', label: 'Profile' },
];

export default function PatientLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar${menuOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-logo">P</span>
          <span>Patient Portal</span>
        </div>
        <nav className="sidebar-nav">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => `sidebar-link${isActive ? ' sidebar-link-active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
          <button className="sidebar-link sidebar-logout" onClick={() => setConfirmLogout(true)}>
            Logout
          </button>
        </nav>
      </aside>

      <div className="app-main">
        <header className="app-header">
          <button className="menu-toggle" onClick={() => setMenuOpen((v) => !v)} aria-label="Toggle menu">
            &#9776;
          </button>
          <span className="app-header-title">Appointment Booking System</span>
          <span className="app-header-user">{user?.name}</span>
        </header>
        <main className="app-content">
          <Outlet />
        </main>
      </div>

      <ConfirmDialog
        open={confirmLogout}
        title="Log out?"
        message="You will need to log in again to book or manage appointments."
        confirmLabel="Logout"
        danger
        onCancel={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
