import type { Item } from '../types';
import ItemCard from './ItemCard';

interface Props {
  title: string;
  items: Item[];
  color: string;
  onComplete?: (id: string) => void;
  onDelete?: (id: string) => void;
}

export default function DashboardSection({ title, items, color, onComplete, onDelete }: Props) {
  return (
    <section style={{ marginBottom: 44 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
        <div style={{ width: 3, height: 18, background: color, borderRadius: 2, flexShrink: 0, boxShadow: `0 0 8px ${color}` }} />
        <h2 style={{
          fontSize: 12, fontWeight: 800, color: '#9b72cf', margin: 0,
          letterSpacing: '0.1em', textTransform: 'uppercase',
        }}>
          {title}
        </h2>
        <span style={{
          background: `${color}25`, color, borderRadius: 20,
          padding: '2px 10px', fontSize: 11, fontWeight: 800,
          letterSpacing: '0.04em',
          boxShadow: `0 0 10px ${color}44`,
          border: `1px solid ${color}44`,
        }}>
          {items.length}
        </span>
      </div>

      {items.length === 0 ? (
        <div style={{
          padding: '14px 18px',
          background: 'rgba(181,55,242,0.04)',
          border: '1px solid rgba(181,55,242,0.08)',
          borderRadius: 10,
          color: '#3d1f5e',
          fontSize: 13, fontWeight: 600,
        }}>
          All clear
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))', gap: 14 }}>
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onComplete={onComplete} onDelete={onDelete} />
          ))}
        </div>
      )}
    </section>
  );
}
