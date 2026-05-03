import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from '../features/auth/authSlice';

export default function Navbar() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const user = useSelector(s => s.auth.user);
  const handleLogout = () => { dispatch(logout()); navigate('/login'); };

  return (
    <nav style={s.nav}>
      <Link to="/" style={s.brand}>🍽 The Grand Table</Link>
      <div style={s.links}>
        {user ? (
          <>
            {user.role === 'customer' && <Link to="/reserve" style={s.link}>Reserve</Link>}
            {user.role === 'customer' && <Link to="/my-reservations" style={s.link}>My Bookings</Link>}
            {user.role === 'customer' && <Link to="/waitlist" style={s.link}>Waitlist</Link>}
            {(user.role === 'staff' || user.role === 'admin') && <Link to="/dashboard" style={s.link}>Dashboard</Link>}
            {user.role === 'admin' && <Link to="/admin" style={s.link}>Admin</Link>}
            <span style={s.name}>👤 {user.name}</span>
            <button onClick={handleLogout} style={s.btn}>Logout</button>
          </>
        ) : (
          <>
            <Link to="/login" style={s.link}>Login</Link>
            <Link to="/register" style={s.linkOutline}>Register</Link>
          </>
        )}
      </div>
    </nav>
  );
}

const s = {
  nav:         { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'16px 32px', background:'rgba(10,10,10,0.92)', backdropFilter:'blur(8px)', borderBottom:'1px solid rgba(212,175,55,0.3)', position:'sticky', top:0, zIndex:100 },
  brand:       { color:'#d4af37', fontWeight:'bold', fontSize:'1.3rem', textDecoration:'none', letterSpacing:'1px' },
  links:       { display:'flex', gap:'20px', alignItems:'center', flexWrap:'wrap' },
  link:        { color:'#e8e8e8', textDecoration:'none', fontSize:'0.95rem', letterSpacing:'0.5px', transition:'color 0.2s' },
  linkOutline: { color:'#d4af37', textDecoration:'none', fontSize:'0.95rem', border:'1px solid #d4af37', padding:'6px 14px', borderRadius:'4px' },
  name:        { color:'#aaa', fontSize:'0.9rem' },
  btn:         { background:'#d4af37', color:'#111', border:'none', padding:'7px 16px', borderRadius:'4px', fontWeight:'bold', fontSize:'0.9rem' },
};
