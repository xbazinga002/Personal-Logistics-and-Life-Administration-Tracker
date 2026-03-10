import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../services/api';
import Logo from '../components/Logo';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await auth.login(email, password);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.userId);
      localStorage.setItem('email', data.email);
      navigate('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setLoading(false);
    }
  }

  const input: React.CSSProperties = {
    width: '100%', padding: '12px 14px', boxSizing: 'border-box',
    background: 'rgba(181,55,242,0.06)', border: '1px solid rgba(181,55,242,0.2)',
    borderRadius: 10, fontSize: 14, color: '#ede0ff', outline: 'none',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
      background: 'radial-gradient(ellipse at 50% 0%, #2d0060 0%, #07000f 60%)',
    }}>
      <div style={{
        background: 'rgba(18,0,34,0.95)', border: '1px solid rgba(181,55,242,0.25)',
        borderRadius: 20, padding: '48px 44px', width: '100%', maxWidth: 400,
        boxShadow: '0 32px 80px rgba(120,0,200,0.4), inset 0 1px 0 rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
      }}>
        <div style={{ textAlign: 'center', marginBottom: 40 }}>
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 14 }}>
            <Logo size={52} withText={false} />
          </div>
          <div style={{
            fontSize: 28, fontWeight: 900, letterSpacing: '-0.5px', marginBottom: 6,
            background: 'linear-gradient(135deg, #b537f2 0%, #f72585 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 12px rgba(181,55,242,0.4))',
          }}>
            LifeAdmin
          </div>
          <p style={{ color: '#6b4a8a', fontSize: 13, margin: 0, fontWeight: 600 }}>Sign in to your account</p>
        </div>

        {error && (
          <div style={{
            background: 'rgba(247,37,133,0.1)', border: '1px solid rgba(247,37,133,0.3)',
            color: '#ff6eb0', padding: '10px 14px', borderRadius: 10, marginBottom: 20, fontSize: 13, fontWeight: 600,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <div style={{ marginBottom: 18 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#9b72cf', marginBottom: 7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Email
            </label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} style={input} required placeholder="you@email.com"
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(181,55,242,0.7)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181,55,242,0.12)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(181,55,242,0.2)'; e.currentTarget.style.boxShadow = ''; }}
            />
          </div>
          <div style={{ marginBottom: 28 }}>
            <label style={{ display: 'block', fontSize: 11, fontWeight: 800, color: '#9b72cf', marginBottom: 7, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
              Password
            </label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} style={input} required placeholder="••••••••"
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(181,55,242,0.7)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181,55,242,0.12)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(181,55,242,0.2)'; e.currentTarget.style.boxShadow = ''; }}
            />
          </div>
          <button type="submit" disabled={loading} style={{
            width: '100%', padding: '13px',
            background: loading ? 'rgba(181,55,242,0.4)' : 'linear-gradient(135deg, #b537f2 0%, #f72585 100%)',
            color: '#fff', border: 'none', borderRadius: 10, fontSize: 15,
            cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, letterSpacing: '0.02em',
            boxShadow: loading ? 'none' : '0 4px 24px rgba(181,55,242,0.45)',
            transition: 'opacity 0.15s',
          }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
            onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
          >
            {loading ? 'Signing in…' : 'Sign In'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: 24, fontSize: 13, color: '#3d1f5e', fontWeight: 600 }}>
          No account?{' '}
          <Link to="/register" style={{ color: '#b537f2', fontWeight: 800, textDecoration: 'none' }}>Create one</Link>
        </p>
      </div>
    </div>
  );
}
