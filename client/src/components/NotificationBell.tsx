import { useState, useEffect, useRef } from 'react';
import { notifications as notifApi } from '../services/api';
import type { Notification } from '../types';

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [notifs, setNotifs] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 60_000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  async function loadNotifications() {
    try {
      const data = await notifApi.list();
      setNotifs(data.notifications);
      setUnreadCount(data.unreadCount);
    } catch { /* ignore */ }
  }

  async function handleMarkRead(id: string) {
    await notifApi.markRead(id);
    setNotifs((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    setUnreadCount((c) => Math.max(0, c - 1));
  }

  async function handleMarkAll() {
    await notifApi.markAllRead();
    setNotifs((prev) => prev.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen((o) => !o)}
        style={{
          position: 'relative', background: 'transparent', border: 'none',
          color: '#6b4a8a', fontSize: 18, cursor: 'pointer', padding: '4px 10px',
          transition: 'color 0.15s',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#d580ff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = '#6b4a8a')}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute', top: 2, right: 4,
            background: 'linear-gradient(135deg, #b537f2, #f72585)',
            color: '#fff', borderRadius: '50%', width: 16, height: 16, fontSize: 9,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 900, boxShadow: '0 0 8px rgba(247,37,133,0.5)',
          }}>
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div style={{
          position: 'absolute', right: 0, top: '100%', marginTop: 8,
          background: '#0e0018', border: '1px solid rgba(181,55,242,0.25)',
          borderRadius: 12, boxShadow: '0 16px 50px rgba(120,0,200,0.4)',
          width: 330, maxHeight: 420, overflowY: 'auto', zIndex: 200,
        }}>
          <div style={{
            padding: '14px 18px', borderBottom: '1px solid rgba(181,55,242,0.12)',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
          }}>
            <strong style={{ fontSize: 12, fontWeight: 800, color: '#c080ff', letterSpacing: '0.07em', textTransform: 'uppercase' }}>
              Notifications
            </strong>
            {unreadCount > 0 && (
              <button onClick={handleMarkAll}
                style={{ background: 'none', border: 'none', color: '#6b4a8a', fontSize: 11, cursor: 'pointer', fontWeight: 700 }}
                onMouseEnter={(e) => (e.currentTarget.style.color = '#b537f2')}
                onMouseLeave={(e) => (e.currentTarget.style.color = '#6b4a8a')}
              >
                Mark all read
              </button>
            )}
          </div>

          {notifs.length === 0 ? (
            <div style={{ padding: 24, textAlign: 'center', color: '#3d1f5e', fontSize: 13, fontWeight: 600 }}>No notifications</div>
          ) : (
            notifs.map((n) => (
              <div key={n.id} style={{
                padding: '11px 18px', borderBottom: '1px solid rgba(181,55,242,0.07)',
                background: n.is_read ? 'transparent' : 'rgba(181,55,242,0.06)',
                display: 'flex', justifyContent: 'space-between', gap: 8,
              }}>
                <div>
                  <div style={{
                    fontSize: 13, fontWeight: n.is_read ? 500 : 700,
                    color: n.type === 'overdue' ? '#f72585' : '#00f0ff',
                  }}>
                    {n.type === 'overdue' ? '⚠️' : '📅'} {n.message}
                  </div>
                  <div style={{ fontSize: 11, color: '#3d1f5e', marginTop: 3, fontWeight: 600 }}>
                    {new Date(n.created_at).toLocaleDateString()}
                  </div>
                </div>
                {!n.is_read && (
                  <button onClick={() => handleMarkRead(n.id)}
                    style={{ background: 'none', border: 'none', color: '#6b4a8a', fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap', fontWeight: 700, transition: 'color 0.15s' }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = '#7cff6b')}
                    onMouseLeave={(e) => (e.currentTarget.style.color = '#6b4a8a')}
                  >
                    ✓
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
