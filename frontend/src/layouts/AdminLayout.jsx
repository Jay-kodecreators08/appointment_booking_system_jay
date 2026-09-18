import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';

const NAV_ITEMS = [
  { to: '/admin/dashboard', label: 'Dashboard' },
  { to: '/admin/doctors', label: 'Doctors' },
  { to: '/admin/availability', label: 'Availability' },
  { to: '/admin/breaks', label: 'Breaks' },
  { to: '/admin/appointments', label: 'Appointments' },
];

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/admin/login');
  };

  return (
    <div className="app-shell">
      <aside className={`sidebar${menuOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-brand">
          <span className="sidebar-logo">A</span>
          <span>Admin Portal</span>
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
        message="You will need to log in again to access the admin portal."
        confirmLabel="Logout"
        danger
        onCancel={() => setConfirmLogout(false)}
        onConfirm={handleLogout}
      />
    </div>
  );
}
