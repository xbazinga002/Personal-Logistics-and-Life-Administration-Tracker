import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { items as itemsApi } from '../services/api';
import type { Item } from '../types';
import ItemForm from '../components/ItemForm';

export default function ItemDetailPage() {
  const { id } = useParams<{ id: string }>();
  const isNew = !id;
  const navigate = useNavigate();
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => {
    if (!isNew && id) {
      itemsApi.get(id)
        .then(setItem)
        .catch(() => setError('Item not found'))
        .finally(() => setLoading(false));
    }
  }, [id, isNew]);

  async function handleSubmit(data: Parameters<typeof itemsApi.create>[0]) {
    setSaving(true); setError('');
    try {
      if (isNew) { await itemsApi.create(data); navigate('/items'); }
      else {
        const updated = await itemsApi.update(id!, data);
        setItem(updated);
        setSuccessMsg('Saved!');
        setTimeout(() => setSuccessMsg(''), 2500);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
      throw err;
    } finally { setSaving(false); }
  }

  async function handleComplete() {
    if (!id) return;
    setSaving(true);
    try {
      const result = await itemsApi.complete(id);
      setItem(result.completedItem);
      let msg = 'Marked as complete!';
      if (result.nextItem) msg += ` Next due: ${result.nextItem.due_date}.`;
      setSuccessMsg(msg);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to complete');
    } finally { setSaving(false); }
  }

  async function handleDelete() {
    if (!id || !confirm('Delete this item? This cannot be undone.')) return;
    try { await itemsApi.delete(id); navigate('/items'); }
    catch (err) { setError(err instanceof Error ? err.message : 'Failed to delete'); }
  }

  if (loading) return <div style={{ padding: 60, textAlign: 'center', color: '#6b4a8a', fontWeight: 600 }}>Loading…</div>;

  return (
    <div style={{ maxWidth: 620 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 28 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            background: 'rgba(181,55,242,0.08)', border: '1px solid rgba(181,55,242,0.2)',
            color: '#9b72cf', borderRadius: 8, padding: '7px 14px', cursor: 'pointer',
            fontSize: 13, fontWeight: 700, transition: 'all 0.15s',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(181,55,242,0.16)'; e.currentTarget.style.color = '#d580ff'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(181,55,242,0.08)'; e.currentTarget.style.color = '#9b72cf'; }}
        >
          ← Back
        </button>
        <h1 style={{
          margin: 0, fontSize: 26, fontWeight: 900, letterSpacing: '-0.03em',
          background: 'linear-gradient(135deg, #ede0ff 0%, #c080ff 100%)',
          WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
        }}>
          {isNew ? 'New Item' : 'Edit Item'}
        </h1>
      </div>

      {error && (
        <div style={{ background: 'rgba(247,37,133,0.1)', border: '1px solid rgba(247,37,133,0.3)', color: '#ff6eb0', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          {error}
        </div>
      )}
      {successMsg && (
        <div style={{ background: 'rgba(124,255,107,0.1)', border: '1px solid rgba(124,255,107,0.3)', color: '#7cff6b', padding: '10px 14px', borderRadius: 10, marginBottom: 16, fontSize: 13, fontWeight: 600 }}>
          {successMsg}
        </div>
      )}

      <div style={{
        background: 'rgba(18,0,34,0.95)', borderRadius: 16, padding: 28,
        border: '1px solid rgba(181,55,242,0.18)', boxShadow: '0 8px 40px rgba(120,0,200,0.2)',
      }}>
        <ItemForm defaultValues={item || undefined} onSubmit={handleSubmit} submitLabel={isNew ? 'Create Item' : 'Save Changes'} loading={saving} />

        {!isNew && item && item.status !== 'completed' && (
          <div style={{ marginTop: 28, paddingTop: 22, borderTop: '1px solid rgba(181,55,242,0.12)', display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button
              onClick={handleComplete} disabled={saving}
              style={{
                background: 'linear-gradient(135deg, #b537f2 0%, #f72585 100%)',
                color: '#fff', border: 'none', padding: '10px 22px', borderRadius: 9,
                fontSize: 13, cursor: 'pointer', fontWeight: 800,
                boxShadow: '0 2px 14px rgba(181,55,242,0.4)', transition: 'opacity 0.15s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.opacity = '0.85')}
              onMouseLeave={(e) => (e.currentTarget.style.opacity = '1')}
            >
              ✓ Mark Complete
            </button>
            <button
              onClick={handleDelete}
              style={{
                background: 'rgba(247,37,133,0.08)', color: '#ff6eb0',
                border: '1px solid rgba(247,37,133,0.25)', padding: '10px 22px',
                borderRadius: 9, fontSize: 13, cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(247,37,133,0.18)'; e.currentTarget.style.borderColor = 'rgba(247,37,133,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(247,37,133,0.08)'; e.currentTarget.style.borderColor = 'rgba(247,37,133,0.25)'; }}
            >
              Delete Item
            </button>
          </div>
        )}
      </div>

      {item && (
        <div style={{ marginTop: 14, fontSize: 12, color: '#3d1f5e', fontWeight: 600 }}>
          Created: {new Date(item.created_at).toLocaleDateString()} · Status: <span style={{ color: '#9b72cf' }}>{item.status}</span>
          {item.recurrence_type !== 'none' && <> · Recurs: <span style={{ color: '#9b72cf' }}>{item.recurrence_type}</span></>}
        </div>
      )}
    </div>
  );
}
