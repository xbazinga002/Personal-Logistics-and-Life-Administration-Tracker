import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Item, Category, Tag } from '../types';
import { categories as catApi, tags as tagApi } from '../services/api';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  due_date: z.string().min(1, 'Due date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  notes: z.string().max(2000).optional(),
  category_id: z.string().optional(),
  recurrence_type: z.enum(['none', 'weekly', 'monthly', 'yearly']).default('none'),
  status: z.enum(['pending', 'completed', 'overdue', 'archived']).optional(),
});

type FormData = z.infer<typeof schema>;

interface Props {
  defaultValues?: Partial<Item>;
  onSubmit: (data: FormData & { tag_ids: string[] }) => Promise<void>;
  submitLabel?: string;
  loading?: boolean;
}

const inp: React.CSSProperties = {
  width: '100%', padding: '10px 12px', boxSizing: 'border-box',
  background: 'rgba(181,55,242,0.07)', border: '1px solid rgba(181,55,242,0.2)',
  borderRadius: 9, fontSize: 14, color: '#ede0ff', outline: 'none',
  transition: 'border-color 0.15s, box-shadow 0.15s', colorScheme: 'dark',
};

const lbl: React.CSSProperties = {
  display: 'block', fontSize: 11, fontWeight: 800, color: '#9b72cf',
  marginBottom: 6, letterSpacing: '0.07em', textTransform: 'uppercase',
};

const field: React.CSSProperties = { marginBottom: 18 };

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(181,55,242,0.65)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181,55,242,0.1)';
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(181,55,242,0.2)';
  e.currentTarget.style.boxShadow = '';
}

export default function ItemForm({ defaultValues, onSubmit, submitLabel = 'Save', loading }: Props) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(defaultValues?.tags?.map((t) => t.id) || []);

  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title || '',
      due_date: defaultValues?.due_date || '',
      notes: defaultValues?.notes || '',
      category_id: defaultValues?.category_id || '',
      recurrence_type: defaultValues?.recurrence_type || 'none',
      status: defaultValues?.status,
    },
  });

  useEffect(() => {
    catApi.list().then(setAllCategories).catch(() => {});
    tagApi.list().then(setAllTags).catch(() => {});
  }, []);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  }

  return (
    <form onSubmit={handleSubmit((data) => onSubmit({ ...data, tag_ids: selectedTagIds }))} noValidate>
      <div style={field}>
        <label style={lbl}>Title *</label>
        <input {...register('title')} style={inp} placeholder="e.g. Renew car registration" onFocus={onFocus} onBlur={onBlur} />
        {errors.title && <div style={{ color: '#ff6eb0', fontSize: 12, marginTop: 4, fontWeight: 600 }}>{errors.title.message}</div>}
      </div>

      <div style={field}>
        <label style={lbl}>Due Date *</label>
        <input {...register('due_date')} type="date" style={inp} onFocus={onFocus} onBlur={onBlur} />
        {errors.due_date && <div style={{ color: '#ff6eb0', fontSize: 12, marginTop: 4, fontWeight: 600 }}>{errors.due_date.message}</div>}
      </div>

      <div style={field}>
        <label style={lbl}>Notes</label>
        <textarea {...register('notes')} style={{ ...inp, height: 90, resize: 'vertical' }} placeholder="Optional notes…" onFocus={onFocus} onBlur={onBlur} />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 18 }}>
        <div>
          <label style={lbl}>Category</label>
          <select {...register('category_id')} style={inp} onFocus={onFocus} onBlur={onBlur}>
            <option value="" style={{ background: '#120022' }}>— None —</option>
            {allCategories.map((c) => <option key={c.id} value={c.id} style={{ background: '#120022' }}>{c.name}</option>)}
          </select>
        </div>
        <div>
          <label style={lbl}>Recurrence</label>
          <select {...register('recurrence_type')} style={inp} onFocus={onFocus} onBlur={onBlur}>
            <option value="none" style={{ background: '#120022' }}>None</option>
            <option value="weekly" style={{ background: '#120022' }}>Weekly</option>
            <option value="monthly" style={{ background: '#120022' }}>Monthly</option>
            <option value="yearly" style={{ background: '#120022' }}>Yearly</option>
          </select>
        </div>
      </div>

      {defaultValues && (
        <div style={field}>
          <label style={lbl}>Status</label>
          <select {...register('status')} style={inp} onFocus={onFocus} onBlur={onBlur}>
            <option value="pending" style={{ background: '#120022' }}>Pending</option>
            <option value="completed" style={{ background: '#120022' }}>Completed</option>
            <option value="archived" style={{ background: '#120022' }}>Archived</option>
          </select>
        </div>
      )}

      {allTags.length > 0 && (
        <div style={field}>
          <label style={lbl}>Tags</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 4 }}>
            {allTags.map((t) => {
              const active = selectedTagIds.includes(t.id);
              return (
                <button
                  key={t.id} type="button" onClick={() => toggleTag(t.id)}
                  style={{
                    padding: '5px 12px', borderRadius: 7, fontSize: 12, cursor: 'pointer', fontWeight: 700,
                    border: active ? '1px solid rgba(0,240,255,0.6)' : '1px solid rgba(0,240,255,0.2)',
                    background: active ? 'rgba(0,240,255,0.15)' : 'rgba(0,240,255,0.05)',
                    color: active ? '#00f0ff' : '#006878',
                    boxShadow: active ? '0 0 8px rgba(0,240,255,0.2)' : 'none',
                    transition: 'all 0.15s',
                  }}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {allCategories.length === 0 && (
        <p style={{ fontSize: 12, color: '#6b4a8a', marginBottom: 16, fontWeight: 600 }}>
          No categories yet — <a href="/categories" style={{ color: '#b537f2', textDecoration: 'none', fontWeight: 800 }}>add some →</a>
        </p>
      )}

      <button
        type="submit" disabled={loading}
        style={{
          background: loading ? 'rgba(181,55,242,0.3)' : 'linear-gradient(135deg, #b537f2 0%, #f72585 100%)',
          color: '#fff', border: 'none', padding: '11px 28px', borderRadius: 9,
          fontSize: 14, cursor: loading ? 'not-allowed' : 'pointer', fontWeight: 800, letterSpacing: '0.02em',
          boxShadow: loading ? 'none' : '0 4px 20px rgba(181,55,242,0.4)',
          transition: 'opacity 0.15s',
        }}
        onMouseEnter={(e) => { if (!loading) e.currentTarget.style.opacity = '0.88'; }}
        onMouseLeave={(e) => { e.currentTarget.style.opacity = '1'; }}
      >
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
}
