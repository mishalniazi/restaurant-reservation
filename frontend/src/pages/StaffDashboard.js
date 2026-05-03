import { useEffect, useState, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useReactTable, getCoreRowModel, getSortedRowModel, flexRender } from '@tanstack/react-table';
import { fetchReservations, updateStatus } from '../features/reservations/reservationsSlice';
import { fetchWaitlist, notifyWaitlist } from '../features/waitlist/waitlistSlice';
import api from '../app/api';

const STATUSES = ['pending','confirmed','seated','completed','cancelled','no-show'];
const STATUS_COLORS = { confirmed:'#2ecc71', pending:'#f39c12', seated:'#3498db', completed:'#95a5a6', cancelled:'#e74c3c', 'no-show':'#c0392b' };

export default function StaffDashboard() {
  const dispatch = useDispatch();
  const { data, total, pages, loading } = useSelector(s => s.reservations);
  const { entries } = useSelector(s => s.waitlist);
  const [filters, setFilters] = useState({ date: new Date().toISOString().split('T')[0], status:'', search:'', page:1, sortBy:'date', order:'ASC' });
  const [sorting, setSorting] = useState([]);
  const [walkin, setWalkin] = useState({ tableId:'', guests:2, customerName:'' });
  const [tables, setTables] = useState([]);

  useEffect(() => {
    dispatch(fetchReservations({ ...filters, limit:10 }));
    dispatch(fetchWaitlist({ date: filters.date }));
  }, [filters]);

  useEffect(() => { api.get('/tables').then(r => setTables(r.data)).catch(() => {}); }, []);

  useEffect(() => {
    if (sorting.length) setFilters(f => ({ ...f, sortBy: sorting[0].id, order: sorting[0].desc ? 'DESC':'ASC', page:1 }));
  }, [sorting]);

  const columns = useMemo(() => [
    { accessorKey:'customerName', header:'Customer' },
    { accessorKey:'date',         header:'Date' },
    { accessorKey:'time',         header:'Time' },
    { accessorKey:'guests',       header:'Guests' },
    { accessorKey:'status', header:'Status',
      cell: ({ getValue }) => <span style={{ background: STATUS_COLORS[getValue()], color:'#fff', padding:'3px 10px', borderRadius:12, fontSize:'0.8rem', fontWeight:'bold' }}>{getValue()}</span>
    },
    { id:'actions', header:'Update', enableSorting:false,
      cell: ({ row }) => (
        <select defaultValue={row.original.status}
          onChange={e => dispatch(updateStatus({ id: row.original.id, status: e.target.value }))}
          style={{ padding:'5px 8px', borderRadius:4, border:'1px solid #ddd', fontSize:'0.85rem' }}>
          {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
        </select>
      )
    },
  ], []);

  const table = useReactTable({ data, columns, state:{ sorting }, onSortingChange: setSorting, getCoreRowModel: getCoreRowModel(), getSortedRowModel: getSortedRowModel(), manualSorting:true });

  const handleWalkin = async e => {
    e.preventDefault();
    await api.post('/reservations/walkin', walkin);
    dispatch(fetchReservations({ ...filters, limit:10 }));
  };

  return (
    <div style={s.bg}>
      <div style={s.wrap}>
        <h2 style={s.heading}>Staff Dashboard</h2>

        {/* Filters */}
        <div style={s.filterBar}>
          <input style={s.input} type="date" value={filters.date} onChange={e => setFilters({ ...filters, date:e.target.value, page:1 })} />
          <input style={s.input} placeholder="🔍 Search customer..." value={filters.search} onChange={e => setFilters({ ...filters, search:e.target.value, page:1 })} />
          <select style={s.input} value={filters.status} onChange={e => setFilters({ ...filters, status:e.target.value, page:1 })}>
            <option value="">All Statuses</option>
            {STATUSES.map(st => <option key={st} value={st}>{st}</option>)}
          </select>
        </div>

        {/* Table */}
        <div style={s.card}>
          <p style={s.total}>{total} reservations</p>
          {loading ? <p style={{ color:'#888', padding:20 }}>Loading...</p> : (
            <div style={{ overflowX:'auto' }}>
              <table style={s.table}>
                <thead>
                  {table.getHeaderGroups().map(hg => (
                    <tr key={hg.id}>
                      {hg.headers.map(h => (
                        <th key={h.id} style={s.th} onClick={h.column.getCanSort() ? h.column.getToggleSortingHandler() : undefined}>
                          {flexRender(h.column.columnDef.header, h.getContext())}
                          {h.column.getIsSorted() === 'asc' ? ' ↑' : h.column.getIsSorted() === 'desc' ? ' ↓' : ''}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.map(row => (
                    <tr key={row.id} style={s.tr}>
                      {row.getVisibleCells().map(cell => (
                        <td key={cell.id} style={s.td}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div style={s.pagination}>
            {Array.from({ length:pages }, (_,i) => (
              <button key={i} style={{ ...s.pageBtn, background: filters.page===i+1 ? '#d4af37':'#f0f0f0', color: filters.page===i+1 ? '#111':'#333' }}
                onClick={() => setFilters({ ...filters, page:i+1 })}>{i+1}</button>
            ))}
          </div>
        </div>

        {/* Walk-in */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Add Walk-in</h3>
          <form onSubmit={handleWalkin} style={s.filterBar}>
            <select style={s.input} value={walkin.tableId} onChange={e => setWalkin({ ...walkin, tableId:e.target.value })} required>
              <option value="">Select Table</option>
              {tables.map(t => <option key={t.id} value={t.id}>Table {t.number} (cap {t.capacity})</option>)}
            </select>
            <input style={s.input} type="text" placeholder="Customer name" value={walkin.customerName}
              onChange={e => setWalkin({ ...walkin, customerName: e.target.value })} />
            <input style={s.input} type="number" min="1" placeholder="Guests" value={walkin.guests}
              onChange={e => setWalkin({ ...walkin, guests: parseInt(e.target.value) })} />
            <button style={s.goldBtn} type="submit">Seat Walk-in</button>
          </form>
        </div>

        {/* Waitlist */}
        <div style={s.card}>
          <h3 style={s.cardTitle}>Waitlist — {filters.date}</h3>
          {entries.length === 0 ? <p style={{ color:'#888' }}>No waitlist entries for this date.</p>
            : entries.map(e => (
              <div key={e.id} style={s.wRow}>
                <span>{e.customerName} — {e.guests} guests</span>
                {!e.notified
                  ? <button style={s.notifyBtn} onClick={() => dispatch(notifyWaitlist(e.id))}>Notify</button>
                  : <span style={{ color:'#2ecc71', fontWeight:'bold' }}>✓ Notified</span>
                }
              </div>
            ))
          }
        </div>
      </div>
    </div>
  );
}

const s = {
  bg:         { minHeight:'100vh', background:`linear-gradient(rgba(0,0,0,0.55),rgba(0,0,0,0.55)),url('https://images.unsplash.com/photo-1414235077428-338989a2e8c0?w=1600&q=80') center/cover fixed`, padding:'48px 16px' },
  wrap:       { maxWidth:1100, margin:'0 auto' },
  heading:    { color:'#d4af37', fontSize:'2rem', marginBottom:24 },
  filterBar:  { display:'flex', gap:12, marginBottom:20, flexWrap:'wrap' },
  input:      { padding:'10px 14px', border:'1px solid #ddd', borderRadius:6, fontSize:'0.95rem', background:'rgba(255,255,255,0.95)', flex:1, minWidth:160 },
  card:       { background:'rgba(255,255,255,0.96)', borderRadius:12, padding:'24px', marginBottom:24, boxShadow:'0 4px 20px rgba(0,0,0,0.2)' },
  cardTitle:  { fontSize:'1.05rem', fontWeight:'bold', color:'#1a1a1a', marginBottom:16, paddingBottom:12, borderBottom:'1px solid #eee' },
  total:      { color:'#888', fontSize:'0.9rem', marginBottom:12 },
  table:      { width:'100%', borderCollapse:'collapse' },
  th:         { padding:'12px 16px', background:'#1a1a2e', color:'#d4af37', textAlign:'left', fontSize:'0.85rem', cursor:'pointer', userSelect:'none', textTransform:'uppercase', letterSpacing:'0.5px' },
  tr:         { borderBottom:'1px solid #f0f0f0' },
  td:         { padding:'11px 16px', color:'#333', fontSize:'0.95rem' },
  pagination: { display:'flex', gap:8, marginTop:16 },
  pageBtn:    { padding:'7px 13px', border:'none', borderRadius:6, cursor:'pointer', fontWeight:'bold' },
  goldBtn:    { padding:'10px 24px', background:'#d4af37', color:'#111', border:'none', borderRadius:6, fontWeight:'bold' },
  wRow:       { display:'flex', justifyContent:'space-between', alignItems:'center', padding:'12px 0', borderBottom:'1px solid #f0f0f0' },
  notifyBtn:  { padding:'6px 16px', background:'#3498db', color:'#fff', border:'none', borderRadius:6, fontWeight:'bold', fontSize:'0.85rem' },
};
