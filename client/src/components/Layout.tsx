import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import NotificationBell from './NotificationBell';
import Logo from './Logo';

export default function Layout() {
  const navigate = useNavigate();

  function logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('email');
    navigate('/login');
  }

  function navStyle(isActive: boolean): React.CSSProperties {
    return {
      color: isActive ? '#e0b0ff' : '#6b4a8a',
      textDecoration: 'none',
      fontSize: 13,
      fontWeight: 700,
      padding: '6px 14px',
      borderRadius: 8,
      background: isActive ? 'rgba(181,55,242,0.15)' : 'transparent',
      border: `1px solid ${isActive ? 'rgba(181,55,242,0.4)' : 'transparent'}`,
      transition: 'all 0.15s',
      letterSpacing: '0.03em',
      textTransform: 'uppercase' as const,
    };
  }

  return (
    <>
      <nav style={{
        background: 'linear-gradient(90deg, #0e0018 0%, #12002a 100%)',
        borderBottom: '1px solid rgba(181,55,242,0.2)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        height: 62,
        gap: 4,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        boxShadow: '0 4px 40px rgba(120,0,200,0.3)',
      }}>
        <div style={{ marginRight: 20 }}>
          <Logo size={32} withText={true} textSize={17} />
        </div>

        <NavLink to="/dashboard" style={({ isActive }) => navStyle(isActive)}>Dashboard</NavLink>
        <NavLink to="/items" style={({ isActive }) => navStyle(isActive)}>Items</NavLink>
        <NavLink to="/categories" style={({ isActive }) => navStyle(isActive)}>Categories</NavLink>

        <div style={{ flex: 1 }} />
        <NotificationBell />
        <button
          onClick={logout}
          style={{
            background: 'transparent',
            border: '1px solid rgba(247,37,133,0.3)',
            color: '#6b4a8a',
            padding: '6px 18px',
            borderRadius: 8,
            cursor: 'pointer',
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'rgba(247,37,133,0.7)';
            e.currentTarget.style.color = '#f72585';
            e.currentTarget.style.boxShadow = '0 0 12px rgba(247,37,133,0.2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'rgba(247,37,133,0.3)';
            e.currentTarget.style.color = '#6b4a8a';
            e.currentTarget.style.boxShadow = '';
          }}
        >
          Logout
        </button>
      </nav>
      <main style={{ maxWidth: 1200, margin: '0 auto', padding: '36px 28px' }}>
        <Outlet />
      </main>
    </>
  );
}
