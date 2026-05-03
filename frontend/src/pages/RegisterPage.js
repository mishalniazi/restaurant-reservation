import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate, Link } from 'react-router-dom';
import { register } from '../features/auth/authSlice';

export default function RegisterPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector(s => s.auth);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  const handleSubmit = async e => {
    e.preventDefault();
    const res = await dispatch(register(form));
    if (!res.error) navigate('/');
  };

  return (
    <div style={s.bg}>
      <form onSubmit={handleSubmit} style={s.card}>
        <div style={s.logo}>🍽</div>
        <h2 style={s.title}>Create Account</h2>
        <p style={s.sub}>Join us for a fine dining experience</p>
        {error && <p style={s.error}>{error}</p>}
        <input style={s.input} placeholder="Full name" value={form.name}
          onChange={e => setForm({ ...form, name: e.target.value })} required />
        <input style={s.input} placeholder="Email address" type="email" value={form.email}
          onChange={e => setForm({ ...form, email: e.target.value })} required />
        <input style={s.input} placeholder="Password" type="password" value={form.password}
          onChange={e => setForm({ ...form, password: e.target.value })} required />
        <button style={s.btn} disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
        <p style={s.foot}>Already have an account? <Link to="/login" style={s.footLink}>Sign in</Link></p>
      </form>
    </div>
  );
}

const s = {
  bg:       { minHeight:'100vh', display:'flex', alignItems:'center', justifyContent:'center',
              background:`linear-gradient(rgba(0,0,0,0.65),rgba(0,0,0,0.65)),url('https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=1600&q=80') center/cover fixed` },
  card:     { background:'rgba(255,255,255,0.97)', padding:'48px 40px', borderRadius:16, width:400, maxWidth:'90vw', display:'flex', flexDirection:'column', gap:14, boxShadow:'0 20px 60px rgba(0,0,0,0.4)' },
  logo:     { fontSize:'2.5rem', textAlign:'center' },
  title:    { textAlign:'center', fontSize:'1.6rem', color:'#1a1a1a', fontWeight:'bold' },
  sub:      { textAlign:'center', color:'#888', fontSize:'0.9rem', marginTop:-8 },
  input:    { padding:'12px 16px', border:'1px solid #ddd', borderRadius:6, fontSize:'1rem', outline:'none' },
  btn:      { padding:'13px', background:'#d4af37', color:'#111', border:'none', borderRadius:6, fontSize:'1rem', fontWeight:'bold', marginTop:4 },
  error:    { color:'#c0392b', textAlign:'center', fontSize:'0.9rem', background:'#fdecea', padding:'8px', borderRadius:6 },
  foot:     { textAlign:'center', color:'#666', fontSize:'0.9rem' },
  footLink: { color:'#d4af37', textDecoration:'none', fontWeight:'bold' },
};
