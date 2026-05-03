import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchTables, addTable, deleteTable } from '../features/tables/tablesSlice';

export default function AdminPage() {
  const dispatch = useDispatch();
  const { all: tables } = useSelector(s => s.tables);
  const [form, setForm] = useState({ number:'', capacity:'', location:'main' });
  const [msg, setMsg] = useState('');

  useEffect(() => { dispatch(fetchTables()); }, []);

  const handleAdd = async e => {
    e.preventDefault();
    const res = await dispatch(addTable(form));
    if (!res.error) { setMsg('✓ Table added'); setForm({ number:'', capacity:'', location:'main' }); }
    else setMsg(res.payload);
  };

  return (
    <div style={s.bg}>
      <div style={s.wrap}>
        <h2 style={s.heading}>Admin — Table Management</h2>
        {msg && <p style={{ ...s.msg, color: msg.startsWith('✓') ? '#2ecc71':'#e74c3c' }}>{msg}</p>}

        <div style={s.card}>
          <h3 style={s.cardTitle}>Add New Table</h3>
          <form onSubmit={handleAdd} style={s.form}>
            <input style={s.input} type="number" placeholder="Table #" value={form.number}
              onChange={e => setForm({ ...form, number: parseInt(e.target.value) })} required />
            <input style={s.input} type="number" placeholder="Capacity" value={form.capacity}
              onChange={e => setForm({ ...form, capacity: parseInt(e.target.value) })} required />
            <select style={s.input} value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}>
              <option value="main">Main Hall</option>
              <option value="window">Window</option>
              <option value="private">Private Room</option>
              <option value="outdoor">Outdoor</option>
            </select>
            <button style={s.btn} type="submit">Add Table</button>
          </form>
        </div>

        <div style={s.card}>
          <h3 style={s.cardTitle}>All Tables ({tables.length})</h3>
          <table style={s.table}>
            <thead>
              <tr>{['Table #','Capacity','Location','Action'].map(h => <th key={h} style={s.th}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {tables.map(t => (
                <tr key={t.id} style={s.tr}>
                  <td style={s.td}>Table {t.number}</td>
                  <td style={s.td}>{t.capacity} seats</td>
                  <td style={s.td}>{t.location}</td>
                  <td style={s.td}>
                    <button style={s.delBtn} onClick={() => window.confirm('Delete this table?') && dispatch(deleteTable(t.id))}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const s = {
  bg:        { minHeight:'100vh', background:`linear-gradient(rgba(0,0,0,0.6),rgba(0,0,0,0.6)),url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80') center/cover fixed`, padding:'48px 16px' },
  wrap:      { maxWidth:900, margin:'0 auto' },
  heading:   { color:'#d4af37', fontSize:'2rem', marginBottom:24 },
  msg:       { padding:'10px 16px', borderRadius:8, background:'rgba(255,255,255,0.9)', marginBottom:16, fontWeight:'bold' },
  card:      { background:'rgba(255,255,255,0.96)', borderRadius:12, padding:'28px', marginBottom:24, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' },
  cardTitle: { fontSize:'1.1rem', fontWeight:'bold', color:'#1a1a1a', marginBottom:20, paddingBottom:12, borderBottom:'1px solid #eee' },
  form:      { display:'flex', gap:12, flexWrap:'wrap' },
  input:     { padding:'10px 14px', border:'1px solid #ddd', borderRadius:6, fontSize:'0.95rem', flex:1, minWidth:120 },
  btn:       { padding:'10px 24px', background:'#d4af37', color:'#111', border:'none', borderRadius:6, fontWeight:'bold' },
  table:     { width:'100%', borderCollapse:'collapse' },
  th:        { padding:'12px 16px', background:'#1a1a2e', color:'#d4af37', textAlign:'left', fontSize:'0.85rem', textTransform:'uppercase', letterSpacing:'0.5px' },
  tr:        { borderBottom:'1px solid #f0f0f0' },
  td:        { padding:'12px 16px', color:'#333' },
  delBtn:    { padding:'6px 14px', background:'#e74c3c', color:'#fff', border:'none', borderRadius:6, fontSize:'0.85rem', fontWeight:'bold' },
};
