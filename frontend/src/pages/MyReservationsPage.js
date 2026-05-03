import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchReservations, cancelReservation } from '../features/reservations/reservationsSlice';

const STATUS_COLORS = {
  confirmed:'#2ecc71', pending:'#f39c12', seated:'#3498db',
  completed:'#95a5a6', cancelled:'#e74c3c', 'no-show':'#c0392b',
};

export default function MyReservationsPage() {
  const dispatch = useDispatch();
  const { data, total, pages, loading } = useSelector(s => s.reservations);
  const [filters, setFilters] = useState({ status:'', date:'', page:1 });

  useEffect(() => { dispatch(fetchReservations({ ...filters, limit:10 })); }, [filters]);

  return (
    <div style={s.bg}>
      <div style={s.wrap}>
        <h2 style={s.heading}>My Reservations</h2>

        <div style={s.filters}>
          <input style={s.input} type="date" value={filters.date}
            onChange={e => setFilters({ ...filters, date:e.target.value, page:1 })} />
          <select style={s.input} value={filters.status}
            onChange={e => setFilters({ ...filters, status:e.target.value, page:1 })}>
            <option value="">All Statuses</option>
            {['pending','confirmed','seated','completed','cancelled','no-show'].map(st =>
              <option key={st} value={st}>{st}</option>)}
          </select>
        </div>

        {loading ? <p style={s.info}>Loading...</p> : (
          <>
            <p style={s.count}>{total} reservation(s)</p>
            {data.map(r => (
              <div key={r.id} style={s.card}>
                <div style={s.cardTop}>
                  <div>
                    <span style={s.tableLabel}>Table {r.table?.number || '—'}</span>
                    <span style={s.dateTime}>{r.date} at {r.time}</span>
                  </div>
                  <span style={{ ...s.badge, background: STATUS_COLORS[r.status] }}>{r.status}</span>
                </div>
                <p style={s.detail}>👥 {r.guests} guests {r.notes ? `· ${r.notes}` : ''}</p>
                {['confirmed','pending'].includes(r.status) && (
                  <button style={s.cancelBtn}
                    onClick={() => window.confirm('Cancel this reservation?') && dispatch(cancelReservation(r.id))}>
                    Cancel Reservation
                  </button>
                )}
              </div>
            ))}
            <div style={s.pagination}>
              {Array.from({ length:pages }, (_,i) => (
                <button key={i} style={{ ...s.pageBtn, background: filters.page===i+1 ? '#d4af37':'rgba(255,255,255,0.9)', color: filters.page===i+1 ? '#111':'#333' }}
                  onClick={() => setFilters({ ...filters, page:i+1 })}>{i+1}</button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

const s = {
  bg:         { minHeight:'100vh', background:`linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80') center/cover fixed`, padding:'48px 16px' },
  wrap:       { maxWidth:800, margin:'0 auto' },
  heading:    { color:'#d4af37', fontSize:'2rem', marginBottom:24 },
  filters:    { display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' },
  input:      { padding:'10px 14px', border:'1px solid #ddd', borderRadius:6, fontSize:'0.95rem', background:'rgba(255,255,255,0.95)', flex:1, minWidth:160 },
  info:       { color:'#fff', textAlign:'center' },
  count:      { color:'#ccc', marginBottom:16, fontSize:'0.9rem' },
  card:       { background:'rgba(255,255,255,0.96)', borderRadius:12, padding:'20px 24px', marginBottom:14, boxShadow:'0 4px 16px rgba(0,0,0,0.2)' },
  cardTop:    { display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 },
  tableLabel: { fontWeight:'bold', fontSize:'1.1rem', color:'#1a1a1a', display:'block' },
  dateTime:   { color:'#666', fontSize:'0.9rem' },
  badge:      { color:'#fff', padding:'4px 12px', borderRadius:20, fontSize:'0.8rem', fontWeight:'bold', whiteSpace:'nowrap' },
  detail:     { color:'#555', fontSize:'0.9rem', marginBottom:8 },
  cancelBtn:  { padding:'8px 18px', background:'#e74c3c', color:'#fff', border:'none', borderRadius:6, fontSize:'0.9rem', fontWeight:'bold' },
  pagination: { display:'flex', gap:8, marginTop:20 },
  pageBtn:    { padding:'8px 14px', border:'none', borderRadius:6, cursor:'pointer', fontWeight:'bold' },
};
