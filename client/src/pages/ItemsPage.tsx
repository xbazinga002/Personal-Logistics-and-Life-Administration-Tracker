import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { items as itemsApi, categories as catApi, tags as tagApi } from '../services/api';
import type { Item, Category, Tag } from '../types';
import ItemCard from '../components/ItemCard';

const STATUS_OPTIONS = ['', 'pending', 'completed', 'overdue', 'archived'];
const SORT_OPTIONS = [{ value: 'asc', label: 'Due Date ↑' }, { value: 'desc', label: 'Due Date ↓' }];

const ctrl: React.CSSProperties = {
  padding: '8px 12px',
  background: 'rgba(181,55,242,0.07)',
  border: '1px solid rgba(181,55,242,0.18)',
  borderRadius: 8, fontSize: 13, color: '#c080ff', outline: 'none',
  cursor: 'pointer', colorScheme: 'dark',
};

export default function ItemsPage() {
  const [allItems, setAllItems] = useState<Item[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: '', category_id: '', tag_id: '', due_from: '', due_to: '', sort: 'asc' });
  const navigate = useNavigate();

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (filters.status) params.status = filters.status;
      if (filters.category_id) params.category_id = filters.category_id;
      if (filters.tag_id) params.tag_id = filters.tag_id;
      if (filters.due_from) params.due_from = filters.due_from;
      if (filters.due_to) params.due_to = filters.due_to;
      if (filters.sort) params.sort = filters.sort;
      setAllItems(await itemsApi.list(params));
    } catch { /* ignore */ } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { load(); }, [load]);
  useEffect(() => {
    catApi.list().then(setCategories).catch(() => {});
    tagApi.list().then(setTags).catch(() => {});
  }, []);

  async function handleComplete(id: string) {
    try { await itemsApi.complete(id); load(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Error'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item?')) return;
    try { await itemsApi.delete(id); load(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Error'); }
  }

  function setFilter(key: string, value: string) {
    setFilters((f) => ({ ...f, [key]: value }));
  }

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <h1 style={{
          margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em',
          background: 'linear-gradient(135deg, #ede0ff 0%, #c080ff 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          All Items
        </h1>
        <button
          onClick={() => navigate('/items/new')}
          style={{
            background: 'linear-gradient(135deg, #b537f2 0%, #f72585 100%)',
            color: '#fff', border: 'none', padding: '12px 26px', borderRadius: 10,
            fontSize: 14, cursor: 'pointer', fontWeight: 800, letterSpacing: '0.02em',
            boxShadow: '0 4px 24px rgba(181,55,242,0.45)', transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
        >
          + New Item
        </button>
      </div>

      <div style={{
        display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 28,
        padding: '16px 20px',
        background: 'rgba(18,0,34,0.9)',
        borderRadius: 12, border: '1px solid rgba(181,55,242,0.15)',
        boxShadow: '0 4px 20px rgba(120,0,200,0.15)',
      }}>
        <select value={filters.status} onChange={(e) => setFilter('status', e.target.value)} style={ctrl}>
          {STATUS_OPTIONS.map((s) => <option key={s} value={s} style={{ background: '#120022' }}>{s || 'All Statuses'}</option>)}
        </select>
        <select value={filters.category_id} onChange={(e) => setFilter('category_id', e.target.value)} style={ctrl}>
          <option value="" style={{ background: '#120022' }}>All Categories</option>
          {categories.map((c) => <option key={c.id} value={c.id} style={{ background: '#120022' }}>{c.name}</option>)}
        </select>
        <select value={filters.tag_id} onChange={(e) => setFilter('tag_id', e.target.value)} style={ctrl}>
          <option value="" style={{ background: '#120022' }}>All Tags</option>
          {tags.map((t) => <option key={t.id} value={t.id} style={{ background: '#120022' }}>{t.name}</option>)}
        </select>
        <input type="date" value={filters.due_from} onChange={(e) => setFilter('due_from', e.target.value)} style={ctrl} title="Due from" />
        <input type="date" value={filters.due_to} onChange={(e) => setFilter('due_to', e.target.value)} style={ctrl} title="Due to" />
        <select value={filters.sort} onChange={(e) => setFilter('sort', e.target.value)} style={ctrl}>
          {SORT_OPTIONS.map((s) => <option key={s.value} value={s.value} style={{ background: '#120022' }}>{s.label}</option>)}
        </select>
        <button
          onClick={() => setFilters({ status: '', category_id: '', tag_id: '', due_from: '', due_to: '', sort: 'asc' })}
          style={{ ...ctrl, color: '#6b4a8a', fontWeight: 700, letterSpacing: '0.03em' }}
          onMouseEnter={(e) => (e.currentTarget.style.color = '#c080ff')}
          onMouseLeave={(e) => (e.currentTarget.style.color = '#6b4a8a')}
        >
          Clear
        </button>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#6b4a8a', fontSize: 14, fontWeight: 600 }}>Loading…</div>
      ) : allItems.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: '#3d1f5e' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📋</div>
          <p style={{ fontSize: 15, fontWeight: 700, marginBottom: 6, color: '#6b4a8a' }}>No items found</p>
          <button onClick={() => navigate('/items/new')} style={{ color: '#b537f2', background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 800 }}>
            Create your first item →
          </button>
        </div>
      ) : (
        <>
          <p style={{ color: '#6b4a8a', fontSize: 13, fontWeight: 700, marginBottom: 16, letterSpacing: '0.04em', textTransform: 'uppercase' }}>
            {allItems.length} {allItems.length === 1 ? 'item' : 'items'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
            {allItems.map((item) => (
              <ItemCard key={item.id} item={item} onComplete={handleComplete} onDelete={handleDelete} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
