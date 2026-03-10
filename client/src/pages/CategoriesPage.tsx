import { useState, useEffect } from 'react';
import { categories as catApi, tags as tagApi } from '../services/api';
import type { Category, Tag } from '../types';

const PRESET_CATEGORIES = [
  'Vehicle', 'Finance', 'Health', 'Home', 'Insurance', 'Government',
  'Subscriptions', 'Education', 'Travel', 'Work', 'Personal', 'Family',
];
const PRESET_TAGS = ['Urgent', 'Renewal', 'Bill', 'Appointment', 'Legal', 'Annual'];

const pill: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: 8,
  background: 'rgba(181,55,242,0.1)', border: '1px solid rgba(181,55,242,0.22)',
  borderRadius: 8, padding: '8px 14px',
  color: '#c080ff', fontSize: 13, fontWeight: 700,
};

const presetBtn: React.CSSProperties = {
  padding: '6px 14px', borderRadius: 7,
  background: 'rgba(181,55,242,0.06)', border: '1px solid rgba(181,55,242,0.15)',
  color: '#9b72cf', fontSize: 12, fontWeight: 700, cursor: 'pointer',
  transition: 'all 0.15s', letterSpacing: '0.02em',
};

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [newCat, setNewCat] = useState('');
  const [newTag, setNewTag] = useState('');
  const [catLoading, setCatLoading] = useState(false);
  const [tagLoading, setTagLoading] = useState(false);
  const [catError, setCatError] = useState('');
  const [tagError, setTagError] = useState('');

  async function loadAll() {
    const [cats, tgs] = await Promise.all([
      catApi.list().catch(() => [] as Category[]),
      tagApi.list().catch(() => [] as Tag[]),
    ]);
    setCategories(cats);
    setTags(tgs);
  }

  useEffect(() => { loadAll(); }, []);

  async function addCategory(name: string) {
    if (!name.trim()) return;
    setCatLoading(true); setCatError('');
    try {
      await catApi.create(name.trim());
      setNewCat('');
      await loadAll();
    } catch (err) {
      setCatError(err instanceof Error ? err.message : 'Failed');
    } finally { setCatLoading(false); }
  }

  async function deleteCategory(id: string) {
    try { await catApi.delete(id); await loadAll(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed to delete'); }
  }

  async function addTag(name: string) {
    if (!name.trim()) return;
    setTagLoading(true); setTagError('');
    try {
      await tagApi.create(name.trim());
      setNewTag('');
      await loadAll();
    } catch (err) {
      setTagError(err instanceof Error ? err.message : 'Failed');
    } finally { setTagLoading(false); }
  }

  async function deleteTag(id: string) {
    try { await tagApi.delete(id); await loadAll(); }
    catch (err) { alert(err instanceof Error ? err.message : 'Failed to delete'); }
  }

  const existingCatNames = new Set(categories.map((c) => c.name.toLowerCase()));
  const existingTagNames = new Set(tags.map((t) => t.name.toLowerCase()));

  const inputStyle: React.CSSProperties = {
    flex: 1, padding: '10px 14px', outline: 'none',
    background: 'rgba(181,55,242,0.07)', border: '1px solid rgba(181,55,242,0.2)',
    borderRadius: 9, fontSize: 14, color: '#ede0ff',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div>
      <h1 style={{
        margin: '0 0 32px', fontSize: 32, fontWeight: 900, letterSpacing: '-0.04em',
        background: 'linear-gradient(135deg, #ede0ff 0%, #c080ff 100%)',
        WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
      }}>
        Categories &amp; Tags
      </h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: 28 }}>

        <section style={{
          background: 'rgba(18,0,34,0.95)', border: '1px solid rgba(181,55,242,0.18)',
          borderRadius: 16, padding: 28, boxShadow: '0 8px 40px rgba(120,0,200,0.2)',
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 800, color: '#9b72cf', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            📁 Categories
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); addCategory(newCat); }} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={newCat} onChange={(e) => setNewCat(e.target.value)}
              placeholder="New category name…" style={inputStyle}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(181,55,242,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(181,55,242,0.1)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(181,55,242,0.2)'; e.currentTarget.style.boxShadow = ''; }}
            />
            <button type="submit" disabled={catLoading || !newCat.trim()} style={{
              padding: '10px 18px', borderRadius: 9, border: 'none', fontWeight: 800, fontSize: 14,
              background: catLoading ? 'rgba(181,55,242,0.3)' : 'linear-gradient(135deg, #b537f2, #f72585)',
              color: '#fff', cursor: catLoading ? 'not-allowed' : 'pointer',
              boxShadow: catLoading ? 'none' : '0 2px 14px rgba(181,55,242,0.35)',
              transition: 'opacity 0.15s',
              flexShrink: 0,
            }}>
              Add
            </button>
          </form>
          {catError && <p style={{ color: '#ff6eb0', fontSize: 12, marginBottom: 10 }}>{catError}</p>}

          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, color: '#6b4a8a', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Quick add</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESET_CATEGORIES.filter((p) => !existingCatNames.has(p.toLowerCase())).map((p) => (
                <button key={p} onClick={() => addCategory(p)} style={presetBtn}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(181,55,242,0.18)'; e.currentTarget.style.color = '#d580ff'; e.currentTarget.style.borderColor = 'rgba(181,55,242,0.4)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = presetBtn.background as string; e.currentTarget.style.color = '#9b72cf'; e.currentTarget.style.borderColor = 'rgba(181,55,242,0.15)'; }}
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {categories.length === 0 ? (
              <p style={{ color: '#3d1f5e', fontSize: 13, fontWeight: 600 }}>No categories yet</p>
            ) : categories.map((c) => (
              <div key={c.id} style={pill}>
                <span style={{ flex: 1 }}>{c.name}</span>
                <button onClick={() => deleteCategory(c.id)} style={{
                  background: 'none', border: 'none', color: '#3d1f5e', cursor: 'pointer',
                  fontSize: 16, padding: '0 2px', lineHeight: 1, transition: 'color 0.15s',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f72585')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#3d1f5e')}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>

        <section style={{
          background: 'rgba(18,0,34,0.95)', border: '1px solid rgba(0,240,255,0.15)',
          borderRadius: 16, padding: 28, boxShadow: '0 8px 40px rgba(0,200,255,0.1)',
        }}>
          <h2 style={{ margin: '0 0 20px', fontSize: 14, fontWeight: 800, color: '#00c8d4', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            🏷️ Tags
          </h2>

          <form onSubmit={(e) => { e.preventDefault(); addTag(newTag); }} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input
              value={newTag} onChange={(e) => setNewTag(e.target.value)}
              placeholder="New tag name…"
              style={{ ...inputStyle, border: '1px solid rgba(0,240,255,0.2)' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.6)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(0,240,255,0.08)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = 'rgba(0,240,255,0.2)'; e.currentTarget.style.boxShadow = ''; }}
            />
            <button type="submit" disabled={tagLoading || !newTag.trim()} style={{
              padding: '10px 18px', borderRadius: 9, border: 'none', fontWeight: 800, fontSize: 14,
              background: tagLoading ? 'rgba(0,240,255,0.2)' : 'linear-gradient(135deg, #00c8d4, #0070a0)',
              color: '#fff', cursor: tagLoading ? 'not-allowed' : 'pointer',
              boxShadow: tagLoading ? 'none' : '0 2px 14px rgba(0,200,212,0.3)',
              transition: 'opacity 0.15s', flexShrink: 0,
            }}>
              Add
            </button>
          </form>
          {tagError && <p style={{ color: '#ff6eb0', fontSize: 12, marginBottom: 10 }}>{tagError}</p>}

          <div style={{ marginBottom: 18 }}>
            <p style={{ fontSize: 11, color: '#006878', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>Quick add</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {PRESET_TAGS.filter((p) => !existingTagNames.has(p.toLowerCase())).map((p) => (
                <button key={p} onClick={() => addTag(p)}
                  style={{ ...presetBtn, background: 'rgba(0,240,255,0.06)', border: '1px solid rgba(0,240,255,0.15)', color: '#00c8d4' }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(0,240,255,0.14)'; e.currentTarget.style.color = '#00f0ff'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(0,240,255,0.06)'; e.currentTarget.style.color = '#00c8d4'; }}
                >
                  + {p}
                </button>
              ))}
            </div>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            {tags.length === 0 ? (
              <p style={{ color: '#003d4a', fontSize: 13, fontWeight: 600 }}>No tags yet</p>
            ) : tags.map((t) => (
              <div key={t.id} style={{
                display: 'flex', alignItems: 'center', gap: 6,
                background: 'rgba(0,240,255,0.08)', border: '1px solid rgba(0,240,255,0.2)',
                borderRadius: 7, padding: '6px 12px', color: '#00f0ff', fontSize: 12, fontWeight: 700,
              }}>
                <span>{t.name}</span>
                <button onClick={() => deleteTag(t.id)} style={{
                  background: 'none', border: 'none', color: '#006878', cursor: 'pointer',
                  fontSize: 15, padding: 0, lineHeight: 1, transition: 'color 0.15s',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.color = '#f72585')}
                  onMouseLeave={(e) => (e.currentTarget.style.color = '#006878')}
                  title="Delete"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
