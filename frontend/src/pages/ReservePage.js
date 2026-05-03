import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAvailability } from '../features/tables/tablesSlice';
import { createReservation } from '../features/reservations/reservationsSlice';
import { joinWaitlist } from '../features/waitlist/waitlistSlice';
import { useNavigate } from 'react-router-dom';

export default function ReservePage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { available, loading } = useSelector(s => s.tables);
  const [search, setSearch] = useState({ date: '', time: '', guests: 1, guestName: '' });
  const [searched, setSearched] = useState(false);
  const [msg, setMsg] = useState('');

  const normalizeTime = (t) => {
    if (!t || !t.includes('M')) return t;
    const d = new Date(`1970-01-01 ${t}`);
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  };

  const handleSearch = async e => {
    e.preventDefault();
    await dispatch(fetchAvailability({ ...search, time: normalizeTime(search.time) }));
    setSearched(true);
  };

  const handleReserve = async (tableId) => {
    const params = { ...search, time: normalizeTime(search.time), tableId };
    if (params.guestName) params.notes = `Booking for: ${params.guestName}`;
    delete params.guestName;
    const res = await dispatch(createReservation(params));
    if (!res.error) { setMsg('✓ Reservation confirmed!'); setTimeout(() => navigate('/my-reservations'), 1500); }
    else setMsg(res.payload);
  };

  const handleWaitlist = async () => {
    const res = await dispatch(joinWaitlist({ date: search.date, guests: search.guests }));
    if (!res.error) setMsg('✓ Added to waitlist!');
    else setMsg(res.payload);
  };

  return (
    <div style={s.bg}>
      <div style={s.wrap}>
        <h2 style={s.heading}>Find a Table</h2>
        <p style={s.subheading}>Select your date, time and party size</p>

        <form onSubmit={handleSearch} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>Date</label>
            <input style={s.input} type="date" value={search.date}
              onChange={e => setSearch({ ...search, date: e.target.value })} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Time</label>
            <input style={s.input} type="time" value={search.time}
              onChange={e => setSearch({ ...search, time: e.target.value })} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Guests</label>
            <input style={s.input} type="number" min="1" max="20" value={search.guests}
              onChange={e => setSearch({ ...search, guests: parseInt(e.target.value) })} required />
          </div>
          <div style={s.field}>
            <label style={s.label}>Booking Name (optional)</label>
            <input style={s.input} type="text" placeholder="e.g. John Smith" value={search.guestName}
              onChange={e => setSearch({ ...search, guestName: e.target.value })} />
          </div>
          <button style={s.btn} type="submit">{loading ? 'Searching...' : 'Search Tables'}</button>
        </form>

        {msg && <p style={{ ...s.msg, color: msg.startsWith('✓') ? '#2ecc71' : '#e74c3c' }}>{msg}</p>}

        {searched && available.length === 0 && (
          <div style={s.noTable}>
            <p style={{ fontSize:'1.1rem', marginBottom:16 }}>No tables available for this slot.</p>
            <button style={s.waitBtn} onClick={handleWaitlist}>Join Waitlist</button>
          </div>
        )}

        {searched && available.length > 0 && (
          <div style={s.grid}>
            {available.map(t => (
              <div key={t.id} style={s.card}>
                <div style={s.tableIcon}>🪑</div>
                <h3 style={s.tableNum}>Table {t.number}</h3>
                <p style={s.tableInfo}>Seats up to {t.capacity}</p>
                <p style={s.tableInfo}>📍 {t.location}</p>
                <button style={s.reserveBtn} onClick={() => handleReserve(t.id)}>Reserve</button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const s = {
  bg:         { minHeight:'100vh', background:`linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80') center/cover fixed`, padding:'48px 16px' },
  wrap:       { maxWidth:960, margin:'0 auto' },
  heading:    { color:'#d4af37', fontSize:'2.2rem', textAlign:'center', marginBottom:8 },
  subheading: { color:'#ccc', textAlign:'center', marginBottom:32, fontSize:'1rem' },
  form:       { background:'rgba(255,255,255,0.95)', borderRadius:12, padding:'28px 24px', display:'flex', gap:16, flexWrap:'wrap', alignItems:'flex-end', marginBottom:24, boxShadow:'0 8px 32px rgba(0,0,0,0.3)' },
  field:      { display:'flex', flexDirection:'column', gap:6, flex:1, minWidth:140 },
  label:      { fontSize:'0.85rem', fontWeight:'bold', color:'#555', textTransform:'uppercase', letterSpacing:'0.5px' },
  input:      { padding:'11px 14px', border:'1px solid #ddd', borderRadius:6, fontSize:'1rem' },
  btn:        { padding:'11px 28px', background:'#d4af37', color:'#111', border:'none', borderRadius:6, fontWeight:'bold', fontSize:'1rem', whiteSpace:'nowrap' },
  msg:        { textAlign:'center', fontSize:'1rem', padding:'12px', borderRadius:8, background:'rgba(255,255,255,0.9)', marginBottom:16 },
  noTable:    { textAlign:'center', color:'#fff', padding:'40px 0' },
  waitBtn:    { padding:'12px 32px', background:'transparent', border:'2px solid #d4af37', color:'#d4af37', borderRadius:6, fontSize:'1rem', fontWeight:'bold' },
  grid:       { display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(200px, 1fr))', gap:20 },
  card:       { background:'rgba(255,255,255,0.95)', borderRadius:12, padding:'28px 20px', textAlign:'center', boxShadow:'0 4px 20px rgba(0,0,0,0.2)' },
  tableIcon:  { fontSize:'2.5rem', marginBottom:8 },
  tableNum:   { fontSize:'1.2rem', fontWeight:'bold', color:'#1a1a1a', marginBottom:8 },
  tableInfo:  { color:'#666', fontSize:'0.9rem', marginBottom:4 },
  reserveBtn: { marginTop:16, padding:'10px 24px', background:'#d4af37', color:'#111', border:'none', borderRadius:6, fontWeight:'bold', width:'100%' },
};
