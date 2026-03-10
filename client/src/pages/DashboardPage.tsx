import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { dashboard as dashApi, items as itemsApi } from '../services/api';
import type { DashboardSummary } from '../types';
import DashboardSection from '../components/DashboardSection';

function StatCard({ label, value, color, glow }: { label: string; value: number; color: string; glow: string }) {
  return (
    <div style={{
      background: 'linear-gradient(145deg, #120022, #0e0018)',
      border: `1px solid ${glow}`,
      borderTop: `3px solid ${color}`,
      borderRadius: 14,
      padding: '22px 28px',
      flex: 1,
      minWidth: 130,
      boxShadow: `0 4px 30px ${glow}, inset 0 1px 0 rgba(255,255,255,0.04)`,
    }}>
      <div style={{
        fontSize: 36, fontWeight: 900, color,
        letterSpacing: '-2px', lineHeight: 1,
        textShadow: `0 0 20px ${color}88`,
      }}>
        {value}
      </div>
      <div style={{
        fontSize: 10, fontWeight: 800, color: '#6b4a8a',
        marginTop: 8, textTransform: 'uppercase', letterSpacing: '0.1em',
      }}>
        {label}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const load = useCallback(async () => {
    try {
      setError('');
      const data = await dashApi.summary();
      setSummary(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  async function handleComplete(id: string) {
    try { await itemsApi.complete(id); load(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed to complete item'); }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this item?')) return;
    try { await itemsApi.delete(id); load(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed to delete item'); }
  }

  if (loading) return (
    <div style={{ textAlign: 'center', padding: 80, color: '#6b4a8a', fontSize: 14, fontWeight: 600 }}>
      Loading…
    </div>
  );
  if (error) return (
    <div style={{ background: 'rgba(247,37,133,0.1)', border: '1px solid rgba(247,37,133,0.25)', color: '#ff6eb0', padding: '12px 16px', borderRadius: 10 }}>
      {error}
    </div>
  );

  const overdue = summary?.counts.overdue ?? 0;
  const dueSoon = summary?.counts.dueSoon ?? 0;
  const upcoming = summary?.counts.upcoming ?? 0;

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{
            margin: 0, fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em',
            background: 'linear-gradient(135deg, #ede0ff 0%, #c080ff 100%)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            Dashboard
          </h1>
          <p style={{ margin: '8px 0 0', color: '#6b4a8a', fontSize: 13, fontWeight: 600 }}>
            {overdue + dueSoon + upcoming} active items
          </p>
        </div>
        <button
          onClick={() => navigate('/items/new')}
          style={{
            background: 'linear-gradient(135deg, #b537f2 0%, #f72585 100%)',
            color: '#fff', border: 'none', padding: '12px 26px', borderRadius: 10,
            fontSize: 14, cursor: 'pointer', fontWeight: 800, letterSpacing: '0.02em',
            boxShadow: '0 4px 24px rgba(181,55,242,0.45)',
            transition: 'opacity 0.15s, transform 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.88'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
        >
          + New Item
        </button>
      </div>

      <div style={{ display: 'flex', gap: 14, marginBottom: 44, flexWrap: 'wrap' }}>
        <StatCard label="Overdue"  value={overdue}  color="#f72585" glow="rgba(247,37,133,0.2)" />
        <StatCard label="Due Soon" value={dueSoon}  color="#ff9e00" glow="rgba(255,158,0,0.2)" />
        <StatCard label="Upcoming" value={upcoming} color="#00f0ff" glow="rgba(0,240,255,0.15)" />
      </div>

      <DashboardSection title="Overdue"               items={summary?.overdue ?? []} color="#f72585" onComplete={handleComplete} onDelete={handleDelete} />
      <DashboardSection title="Due Soon — Next 7 Days"  items={summary?.dueSoon  ?? []} color="#ff9e00" onComplete={handleComplete} onDelete={handleDelete} />
      <DashboardSection title="Upcoming — Next 30 Days" items={summary?.upcoming ?? []} color="#00f0ff" onComplete={handleComplete} onDelete={handleDelete} />
    </div>
  );
}
