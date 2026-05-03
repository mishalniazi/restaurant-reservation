import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchWaitlist, leaveWaitlist } from '../features/waitlist/waitlistSlice';

export default function WaitlistPage() {
  const dispatch = useDispatch();
  const { entries } = useSelector(s => s.waitlist);
  const [date, setDate] = useState('');

  useEffect(() => { dispatch(fetchWaitlist(date ? { date } : {})); }, [date]);

  return (
    <div style={s.bg}>
      <div style={s.wrap}>
        <h2 style={s.heading}>My Waitlist</h2>
        <input style={s.input} type="date" value={date} onChange={e => setDate(e.target.value)} placeholder="Filter by date" />

        {entries.length === 0
          ? <div style={s.empty}><p style={{ fontSize:'3rem' }}>⏳</p><p>No waitlist entries yet.</p><p style={{ fontSize:'0.9rem', marginTop:8, color:'#aaa' }}>When tables are full, join the waitlist from the Reserve page.</p></div>
          : entries.map(e => (
            <div key={e.id} style={s.card}>
              <div style={s.row}>
                <div>
                  <p style={s.date}>📅 {e.date}</p>
                  <p style={s.guests}>👥 {e.guests} guests</p>
                </div>
                <div style={{ textAlign:'right' }}>
                  <span style={{ ...s.badge, background: e.notified ? '#2ecc71':'#f39c12' }}>
                    {e.notified ? '✓ Notified' : 'Waiting'}
                  </span>
                  <br />
                  <button style={s.leaveBtn} onClick={() => dispatch(leaveWaitlist(e.id))}>Leave</button>
                </div>
              </div>
            </div>
          ))
        }
      </div>
    </div>
  );
}

const s = {
  bg:       { minHeight:'100vh', background:`linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80') center/cover fixed`, padding:'48px 16px' },
  wrap:     { maxWidth:700, margin:'0 auto' },
  heading:  { color:'#d4af37', fontSize:'2rem', marginBottom:24 },
  input:    { padding:'10px 14px', border:'1px solid #ddd', borderRadius:6, fontSize:'0.95rem', background:'rgba(255,255,255,0.95)', marginBottom:20, width:220 },
  empty:    { textAlign:'center', color:'#ccc', padding:'60px 0' },
  card:     { background:'rgba(255,255,255,0.96)', borderRadius:12, padding:'20px 24px', marginBottom:12, boxShadow:'0 4px 16px rgba(0,0,0,0.2)' },
  row:      { display:'flex', justifyContent:'space-between', alignItems:'center' },
  date:     { fontWeight:'bold', color:'#1a1a1a', marginBottom:4 },
  guests:   { color:'#555', fontSize:'0.9rem' },
  badge:    { color:'#fff', padding:'4px 12px', borderRadius:20, fontSize:'0.8rem', fontWeight:'bold' },
  leaveBtn: { marginTop:8, padding:'6px 14px', background:'#e74c3c', color:'#fff', border:'none', borderRadius:6, fontSize:'0.85rem', fontWeight:'bold' },
};
