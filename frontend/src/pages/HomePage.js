import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

export default function HomePage() {
  const user = useSelector(s => s.auth.user);

  return (
    <div style={s.hero}>
      <div style={s.overlay}>
        <p style={s.tagline}>✦ Fine Dining Experience ✦</p>
        <h1 style={s.title}>The Grand Table</h1>
        <p style={s.sub}>Reserve your perfect seat for an unforgettable evening</p>
        <div style={s.btns}>
          {!user && <>
            <Link to="/register" style={s.primary}>Book a Table</Link>
            <Link to="/login" style={s.secondary}>Sign In</Link>
          </>}
          {user?.role === 'customer' && <Link to="/reserve" style={s.primary}>Make a Reservation</Link>}
          {(user?.role === 'staff' || user?.role === 'admin') && <Link to="/dashboard" style={s.primary}>Go to Dashboard</Link>}
        </div>

        <div style={s.features}>
          {[
            { icon: '🕯', title: 'Elegant Ambiance', desc: 'Curated dining spaces for every occasion' },
            { icon: '📅', title: 'Easy Reservations', desc: 'Book your table in seconds, anytime' },
            { icon: '⭐', title: 'Premium Service', desc: 'Dedicated staff ensuring a perfect experience' },
          ].map(f => (
            <div key={f.title} style={s.featureCard}>
              <span style={{ fontSize: '2rem' }}>{f.icon}</span>
              <h3 style={s.featureTitle}>{f.title}</h3>
              <p style={s.featureDesc}>{f.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const s = {
  hero: {
    minHeight: '100vh',
    background: `linear-gradient(rgba(0,0,0,0.6), rgba(0,0,0,0.75)),
      url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80') center/cover fixed`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  overlay:      { textAlign: 'center', color: '#fff', padding: '40px 24px', maxWidth: 900, width: '100%' },
  tagline:      { color: '#d4af37', letterSpacing: '4px', fontSize: '0.85rem', marginBottom: 16, textTransform: 'uppercase' },
  title:        { fontSize: 'clamp(2.5rem, 6vw, 5rem)', fontWeight: 'bold', marginBottom: 16, textShadow: '0 2px 20px rgba(0,0,0,0.5)' },
  sub:          { fontSize: '1.15rem', color: '#ddd', marginBottom: 40, lineHeight: 1.6 },
  btns:         { display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap', marginBottom: 64 },
  primary:      { padding: '14px 36px', background: '#d4af37', color: '#111', borderRadius: 4, textDecoration: 'none', fontWeight: 'bold', fontSize: '1rem', letterSpacing: '0.5px' },
  secondary:    { padding: '14px 36px', border: '2px solid #fff', color: '#fff', borderRadius: 4, textDecoration: 'none', fontSize: '1rem' },
  features:     { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 24 },
  featureCard:  { background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: 12, padding: '28px 20px' },
  featureTitle: { color: '#d4af37', margin: '12px 0 8px', fontSize: '1.1rem' },
  featureDesc:  { color: '#ccc', fontSize: '0.9rem', lineHeight: 1.5 },
};
