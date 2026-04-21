import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../AuthContext';

export default function NavBar(){
  const { user, logout } = useAuth();
  return (
    <nav style={{display:'flex',alignItems:'center',justifyContent:'space-between',padding:12,background:'#0f4b23',color:'#fff'}}>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        <Link to="/" style={{color:'#fff',textDecoration:'none',fontWeight:800}}>Smart Agriculture</Link>
      </div>
      <div style={{display:'flex',alignItems:'center',gap:12}}>
        {user ? (
          <>
            <span style={{opacity:0.9}}>Hello, {user.name || user.email}</span>
            {user.role === 'admin' && <Link to="/admin" style={{color:'#fff',textDecoration:'none'}}>Admin</Link>}
            {/* <Link to="/knowledge" style={{color:'#fff',textDecoration:'none'}}>📚 Knowledge Hub</Link> */}
            {/* <Link to="/soil" style={{color:'#fff',textDecoration:'none'}}>🌱 Soil Health</Link> */}
            {/* <Link to="/pests" style={{color:'#fff',textDecoration:'none'}}>🐛 Pest Management</Link> */}
            {/* <Link to="/expenses" style={{color:'#fff',textDecoration:'none'}}>💰 Expenses</Link> */}
            <button onClick={logout} style={{padding:'6px 8px',borderRadius:6}}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={{color:'#fff',textDecoration:'none'}}>Login</Link>
            <Link to="/register" style={{color:'#fff',textDecoration:'none'}}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}
