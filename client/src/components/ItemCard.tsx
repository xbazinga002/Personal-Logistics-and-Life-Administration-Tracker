import { useNavigate } from 'react-router-dom';
import type { Item } from '../types';

const urgencyConfig: Record<string, { color: string; glow: string }> = {
  overdue:  { color: '#f72585', glow: 'rgba(247,37,133,0.18)' },
  due_soon: { color: '#ff9e00', glow: 'rgba(255,158,0,0.18)' },
  upcoming: { color: '#00f0ff', glow: 'rgba(0,240,255,0.15)' },
  none:     { color: '#7cff6b', glow: 'rgba(124,255,107,0.13)' },
};

const statusConfig: Record<string, { bg: string; color: string; label: string }> = {
  pending:   { bg: 'rgba(181,55,242,0.15)', color: '#d580ff', label: 'Pending' },
  completed: { bg: 'rgba(124,255,107,0.12)', color: '#7cff6b', label: 'Done' },
  overdue:   { bg: 'rgba(247,37,133,0.15)', color: '#ff6eb0', label: 'Overdue' },
  archived:  { bg: 'rgba(107,74,138,0.15)', color: '#9b72cf', label: 'Archived' },
};

interface Props {
  item: Item;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function ItemCard({ item, onComplete, onDelete }: Props) {
  const navigate = useNavigate();
  const urg = urgencyConfig[item.urgency] ?? urgencyConfig.none;
  const stat = statusConfig[item.status] ?? statusConfig.pending;

  const dueDateStr = String(item.due_date).split('T')[0];

  return (
    <div
      onClick={() => navigate(`/items/${item.id}`)}
      style={{
        background: 'linear-gradient(145deg, #120022 0%, #0e0018 100%)',
        border: '1px solid rgba(181,55,242,0.15)',
        borderLeft: `3px solid ${urg.color}`,
        borderRadius: 12,
        padding: '18px 20px',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = `0 12px 40px rgba(120,0,200,0.3), 0 0 0 1px rgba(181,55,242,0.25)`;
        e.currentTarget.style.borderColor = 'rgba(181,55,242,0.3)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = '';
        e.currentTarget.style.borderColor = 'rgba(181,55,242,0.15)';
      }}
    >
      <div style={{
        position: 'absolute', top: -20, left: -10,
        width: 100, height: 100,
        background: urg.glow,
        borderRadius: '50%', filter: 'blur(28px)',
        pointerEvents: 'none',
      }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10, gap: 10 }}>
        <h3 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: '#ede0ff', flex: 1, lineHeight: 1.4, letterSpacing: '-0.02em' }}>
          {item.title}
        </h3>
        <span style={{
          background: stat.bg, color: stat.color,
          borderRadius: 6, padding: '3px 9px',
          fontSize: 10, fontWeight: 800, whiteSpace: 'nowrap',
          letterSpacing: '0.06em', textTransform: 'uppercase', flexShrink: 0,
        }}>
          {stat.label}
        </span>
      </div>

      <div style={{ fontSize: 13, color: urg.color, fontWeight: 700, marginBottom: 8, letterSpacing: '0.01em', textShadow: `0 0 8px ${urg.color}66` }}>
        📅 {new Date(dueDateStr + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
      </div>

      {item.category_name && (
        <div style={{ fontSize: 12, color: '#6b4a8a', marginBottom: 5, fontWeight: 600 }}>📁 {item.category_name}</div>
      )}
      {item.recurrence_type !== 'none' && (
        <div style={{ fontSize: 12, color: '#6b4a8a', fontWeight: 600, textTransform: 'capitalize' }}>🔄 {item.recurrence_type}</div>
      )}

      {item.tags && item.tags.length > 0 && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 12 }}>
          {item.tags.map((t) => (
            <span key={t.id} style={{
              background: 'rgba(0,240,255,0.08)', color: '#00f0ff',
              borderRadius: 5, padding: '2px 9px', fontSize: 11, fontWeight: 700,
              border: '1px solid rgba(0,240,255,0.2)', letterSpacing: '0.02em',
            }}>
              {t.name}
            </span>
          ))}
        </div>
      )}

      {(onComplete || onDelete) && (
        <div style={{ display: 'flex', gap: 8, marginTop: 16 }}>
          {onComplete && item.status !== 'completed' && (
            <button
              onClick={(e) => { e.stopPropagation(); onComplete(item.id); }}
              style={{
                fontSize: 12, padding: '7px 16px',
                background: 'linear-gradient(135deg, #b537f2 0%, #f72585 100%)',
                color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
                fontWeight: 800, letterSpacing: '0.03em',
                boxShadow: '0 2px 14px rgba(181,55,242,0.4)',
                transition: 'opacity 0.15s, transform 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.opacity = '0.85'; e.currentTarget.style.transform = 'scale(1.03)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.transform = ''; }}
            >
              ✓ Complete
            </button>
          )}
          {onDelete && (
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(item.id); }}
              style={{
                fontSize: 12, padding: '7px 14px',
                background: 'rgba(247,37,133,0.08)', color: '#ff6eb0',
                border: '1px solid rgba(247,37,133,0.25)', borderRadius: 8,
                cursor: 'pointer', fontWeight: 700, transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(247,37,133,0.18)'; e.currentTarget.style.borderColor = 'rgba(247,37,133,0.5)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(247,37,133,0.08)'; e.currentTarget.style.borderColor = 'rgba(247,37,133,0.25)'; }}
            >
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
