import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import type { Item, Category, Tag } from '../types';
import { categories as catApi, tags as tagApi } from '../services/api';

const DRAFT_KEY = 'lifeadmin:newItemDraft';

const schema = z.object({
  title: z.string().min(1, 'Title is required').max(255),
  due_date: z.string().min(1, 'Due date is required').regex(/^\d{4}-\d{2}-\d{2}$/, 'Use YYYY-MM-DD format'),
  notes: z.string().max(2000).optional(),
  category_id: z.string().optional(),
  recurrence_type: z.enum(['none', 'daily', 'weekly', 'monthly', 'yearly']).default('none'),
  status: z.enum(['pending', 'completed', 'overdue', 'archived']).optional(),
});

type FormData = z.infer<typeof schema>;

interface PersistedDraft extends Partial<FormData> {
  tag_ids?: string[];
}

function loadDraft(): PersistedDraft | null {
  try {
    const raw = localStorage.getItem(DRAFT_KEY);
    return raw ? (JSON.parse(raw) as PersistedDraft) : null;
  } catch {
    return null;
  }
}

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

const labelRow: React.CSSProperties = {
  display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6,
};

const addBtn: React.CSSProperties = {
  background: 'none', border: 'none', color: '#b537f2', cursor: 'pointer',
  fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', padding: 0,
};

const inlineRow: React.CSSProperties = {
  display: 'flex', gap: 6, marginTop: 6,
};

const inlineBtn: React.CSSProperties = {
  padding: '6px 12px', borderRadius: 7, fontSize: 12, fontWeight: 700,
  cursor: 'pointer', border: 'none', whiteSpace: 'nowrap',
};

function onFocus(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(181,55,242,0.65)';
  e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181,55,242,0.1)';
}
function onBlur(e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) {
  e.currentTarget.style.borderColor = 'rgba(181,55,242,0.2)';
  e.currentTarget.style.boxShadow = '';
}

export default function ItemForm({ defaultValues, onSubmit, submitLabel = 'Save', loading }: Props) {
  const isNewItem = !defaultValues;
  const draft = isNewItem ? loadDraft() : null;

  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [allTags, setAllTags] = useState<Tag[]>([]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>(
    defaultValues?.tags?.map((t) => t.id) || draft?.tag_ids || []
  );

  const { register, handleSubmit, watch, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: defaultValues?.title || draft?.title || '',
      due_date: defaultValues?.due_date || draft?.due_date || '',
      notes: defaultValues?.notes || draft?.notes || '',
      category_id: defaultValues?.category_id || draft?.category_id || '',
      recurrence_type: defaultValues?.recurrence_type || draft?.recurrence_type || 'none',
      status: defaultValues?.status,
    },
  });

  useEffect(() => {
    catApi.list().then(setAllCategories).catch(() => {});
    tagApi.list().then(setAllTags).catch(() => {});
  }, []);

  useEffect(() => {
    if (!isNewItem) return;
    const subscription = watch((value) => {
      try {
        localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...value, tag_ids: selectedTagIds }));
      } catch { /* quota exceeded; ignore */ }
    });
    return () => subscription.unsubscribe();
  }, [watch, isNewItem, selectedTagIds]);

  useEffect(() => {
    if (!isNewItem) return;
    try {
      const existing = loadDraft() || {};
      localStorage.setItem(DRAFT_KEY, JSON.stringify({ ...existing, tag_ids: selectedTagIds }));
    } catch { /* ignore */ }
  }, [selectedTagIds, isNewItem]);

  function toggleTag(id: string) {
    setSelectedTagIds((prev) => prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]);
  }

  const [newCatName, setNewCatName] = useState('');
  const [showNewCat, setShowNewCat] = useState(false);
  const [creatingCat, setCreatingCat] = useState(false);
  const [catError, setCatError] = useState('');

  const [newTagName, setNewTagName] = useState('');
  const [showNewTag, setShowNewTag] = useState(false);
  const [creatingTag, setCreatingTag] = useState(false);
  const [tagError, setTagError] = useState('');

  async function handleCreateCategory() {
    const name = newCatName.trim();
    if (!name) return;
    setCreatingCat(true); setCatError('');
    try {
      const created = await catApi.create(name);
      setAllCategories((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setValue('category_id', created.id, { shouldDirty: true });
      setNewCatName('');
      setShowNewCat(false);
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Failed to create');
    } finally { setCreatingCat(false); }
  }

  async function handleCreateTag() {
    const name = newTagName.trim();
    if (!name) return;
    setCreatingTag(true); setTagError('');
    try {
      const created = await tagApi.create(name);
      setAllTags((prev) => [...prev, created].sort((a, b) => a.name.localeCompare(b.name)));
      setSelectedTagIds((prev) => [...prev, created.id]);
      setNewTagName('');
      setShowNewTag(false);
    } catch (err) {
      setTagError(err instanceof Error ? err.message : 'Failed to create');
    } finally { setCreatingTag(false); }
  }

  async function wrappedSubmit(data: FormData) {
    try {
      await onSubmit({ ...data, tag_ids: selectedTagIds });
      if (isNewItem) localStorage.removeItem(DRAFT_KEY);
    } catch {
      // Parent surfaces the error message; keep the draft so the user can retry.
    }
  }

  return (
    <form onSubmit={handleSubmit(wrappedSubmit)} noValidate>
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
          <div style={labelRow}>
            <label style={lbl}>Category</label>
            <button type="button" onClick={() => { setShowNewCat((v) => !v); setCatError(''); }} style={addBtn}>
              {showNewCat ? '× Cancel' : '+ New'}
            </button>
          </div>
          <select {...register('category_id')} style={inp} onFocus={onFocus} onBlur={onBlur}>
            <option value="" style={{ background: '#120022' }}>— None —</option>
            {allCategories.map((c) => <option key={c.id} value={c.id} style={{ background: '#120022' }}>{c.name}</option>)}
          </select>
          {showNewCat && (
            <div style={inlineRow}>
              <input
                type="text" value={newCatName} onChange={(e) => setNewCatName(e.target.value)}
                placeholder="Category name" maxLength={64}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateCategory(); } }}
                style={{ ...inp, padding: '7px 10px', fontSize: 13 }} autoFocus onFocus={onFocus} onBlur={onBlur}
              />
              <button
                type="button" disabled={creatingCat || !newCatName.trim()} onClick={handleCreateCategory}
                style={{
                  ...inlineBtn,
                  background: creatingCat || !newCatName.trim() ? 'rgba(181,55,242,0.3)' : 'linear-gradient(135deg, #b537f2 0%, #f72585 100%)',
                  color: '#fff',
                }}
              >
                {creatingCat ? '…' : 'Add'}
              </button>
            </div>
          )}
          {catError && <div style={{ color: '#ff6eb0', fontSize: 12, marginTop: 4, fontWeight: 600 }}>{catError}</div>}
        </div>
        <div>
          <label style={lbl}>Recurrence</label>
          <select {...register('recurrence_type')} style={inp} onFocus={onFocus} onBlur={onBlur}>
            <option value="none" style={{ background: '#120022' }}>None</option>
            <option value="daily" style={{ background: '#120022' }}>Daily</option>
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

      <div style={field}>
        <div style={labelRow}>
          <label style={lbl}>Tags</label>
          <button type="button" onClick={() => { setShowNewTag((v) => !v); setTagError(''); }} style={addBtn}>
            {showNewTag ? '× Cancel' : '+ New'}
          </button>
        </div>
        {allTags.length > 0 && (
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
        )}
        {allTags.length === 0 && !showNewTag && (
          <p style={{ fontSize: 12, color: '#6b4a8a', margin: '4px 0 0', fontWeight: 600 }}>
            No tags yet — click + New to add one
          </p>
        )}
        {showNewTag && (
          <div style={inlineRow}>
            <input
              type="text" value={newTagName} onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name" maxLength={32}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleCreateTag(); } }}
              style={{ ...inp, padding: '7px 10px', fontSize: 13 }} autoFocus onFocus={onFocus} onBlur={onBlur}
            />
            <button
              type="button" disabled={creatingTag || !newTagName.trim()} onClick={handleCreateTag}
              style={{
                ...inlineBtn,
                background: creatingTag || !newTagName.trim() ? 'rgba(0,240,255,0.2)' : 'rgba(0,240,255,0.18)',
                color: creatingTag || !newTagName.trim() ? '#006878' : '#00f0ff',
                border: '1px solid rgba(0,240,255,0.4)',
              }}
            >
              {creatingTag ? '…' : 'Add'}
            </button>
          </div>
        )}
        {tagError && <div style={{ color: '#ff6eb0', fontSize: 12, marginTop: 4, fontWeight: 600 }}>{tagError}</div>}
      </div>

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
