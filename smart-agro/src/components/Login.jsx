import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const auth = useAuth();
  const navigate = useNavigate();

  async function handle(e) {
    e.preventDefault();
    setLoading(true);
    setMsg('');
    try {
      const res = await auth.login({ email, password });
      setMsg('✓ Login successful — redirecting');
      setTimeout(() => {
        if (res.user?.role === 'admin') navigate('/admin');
        else navigate('/dashboard');
      }, 500);
    } catch (err) {
      console.error(err);
      setMsg((err && err.body && err.body.error) || 'Login failed');
      setLoading(false);
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <div style={styles.iconCircle}>🌾</div>
          <h1 style={styles.title}>Welcome Back</h1>
          <p style={styles.subtitle}>Log in to your Smart Agriculture account</p>
        </div>

        <form onSubmit={handle} style={styles.form}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              value={email}
              onChange={e => setEmail(e.target.value)}
              type="email"
              placeholder="farmer@example.com"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <div style={styles.formGroup}>
            <label style={styles.label}>Password</label>
            <input
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="••••••••"
              required
              disabled={loading}
              style={styles.input}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          {msg && (
            <div style={{
              ...styles.message,
              backgroundColor: msg.includes('✓') ? '#d4edda' : '#f8d7da',
              color: msg.includes('✓') ? '#155724' : '#721c24',
              borderColor: msg.includes('✓') ? '#c3e6cb' : '#f5c6cb',
            }}>
              {msg}
            </div>
          )}
        </form>

        <div style={styles.footer}>
          <p>Don't have an account? <Link to="/register" style={styles.link}>Sign up here</Link></p>
        </div>
      </div>
    </div>
  );
}

const styles = {
  container: {
    minHeight: 'calc(100vh - 100px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8f5e9 100%)',
    padding: '20px',
  },
  card: {
    background: 'white',
    borderRadius: '12px',
    boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
    maxWidth: '420px',
    width: '100%',
    padding: '40px 30px',
  },
  header: {
    textAlign: 'center',
    marginBottom: '30px',
  },
  iconCircle: {
    fontSize: '48px',
    marginBottom: '15px',
  },
  title: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#1b5e20',
    margin: '0 0 8px 0',
    letterSpacing: '-0.5px',
  },
  subtitle: {
    fontSize: '14px',
    color: '#666',
    margin: '0',
  },
  form: {
    marginBottom: '20px',
  },
  formGroup: {
    marginBottom: '20px',
  },
  label: {
    display: 'block',
    fontSize: '14px',
    fontWeight: '600',
    color: '#333',
    marginBottom: '8px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  input: {
    width: '100%',
    padding: '12px 15px',
    fontSize: '14px',
    border: '2px solid #e0e0e0',
    borderRadius: '8px',
    boxSizing: 'border-box',
    transition: 'all 0.3s ease',
    fontFamily: 'inherit',
  },
  button: {
    width: '100%',
    padding: '12px 20px',
    fontSize: '16px',
    fontWeight: '600',
    color: 'white',
    background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
    border: 'none',
    borderRadius: '8px',
    transition: 'all 0.3s ease',
    textTransform: 'uppercase',
    letterSpacing: '1px',
    boxShadow: '0 4px 15px rgba(46, 125, 50, 0.3)',
  },
  message: {
    marginTop: '16px',
    padding: '12px 15px',
    borderRadius: '8px',
    fontSize: '14px',
    border: '1px solid',
    textAlign: 'center',
  },
  footer: {
    textAlign: 'center',
    paddingTop: '20px',
    borderTop: '1px solid #e0e0e0',
    fontSize: '14px',
    color: '#666',
  },
  link: {
    color: '#2e7d32',
    textDecoration: 'none',
    fontWeight: '600',
    cursor: 'pointer',
  },
};
