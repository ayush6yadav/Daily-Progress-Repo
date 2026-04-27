import React, { useState } from 'react';

const CATEGORIES = ['All', 'Work', 'Personal', 'Learning', 'Health'];
const PRIORITIES = { high: '#ef4444', medium: '#f59e0b', low: '#22c55e' };

const initialTasks = [
  { id: 1, title: 'Install Homebrew on macOS',              category: 'Work',     priority: 'high',   done: false },
  { id: 2, title: 'Install Apache via Homebrew',            category: 'Work',     priority: 'high',   done: false },
  { id: 3, title: 'Deploy React App 1 on port 8081',        category: 'Work',     priority: 'high',   done: false },
  { id: 4, title: 'Deploy React App 2 on port 8082',        category: 'Work',     priority: 'high',   done: false },
  { id: 5, title: 'Configure /first and /second routes',    category: 'Work',     priority: 'medium', done: false },
  { id: 6, title: 'Read Apache httpd.conf on macOS',        category: 'Learning', priority: 'medium', done: false },
  { id: 7, title: 'Learn React homepage in package.json',   category: 'Learning', priority: 'low',    done: true  },
  { id: 8, title: 'Take a break from screens',              category: 'Health',   priority: 'low',    done: false },
];

const s = {
  app: { minHeight: '100vh', background: '#0d1117', fontFamily: "'Segoe UI', system-ui, sans-serif", color: '#c9d1d9' },
  header: {
    background: '#161b22', borderBottom: '1px solid #21262d',
    padding: '16px 32px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { fontSize: '20px', fontWeight: '700', color: '#f0f6fc', display: 'flex', alignItems: 'center', gap: '8px' },
  badge: {
    background: 'rgba(56,189,248,0.15)', border: '1px solid rgba(56,189,248,0.3)',
    color: '#38bdf8', padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: '600',
  },
  main: { maxWidth: '800px', margin: '0 auto', padding: '32px 24px' },
  topBar: { display: 'flex', gap: '12px', marginBottom: '28px', flexWrap: 'wrap', alignItems: 'center' },
  input: {
    flex: 1, minWidth: '200px', padding: '10px 16px',
    background: '#161b22', border: '1px solid #21262d', borderRadius: '8px',
    color: '#f0f6fc', fontSize: '14px', outline: 'none',
  },
  select: {
    padding: '10px 12px', background: '#161b22', border: '1px solid #21262d',
    borderRadius: '8px', color: '#c9d1d9', fontSize: '14px', cursor: 'pointer',
  },
  addBtn: {
    padding: '10px 20px', background: '#238636', border: 'none',
    borderRadius: '8px', color: '#fff', fontWeight: '600', fontSize: '14px', cursor: 'pointer',
  },
  filterRow: { display: 'flex', gap: '8px', marginBottom: '20px', flexWrap: 'wrap' },
  filterBtn: (active) => ({
    padding: '6px 14px', borderRadius: '20px',
    border: active ? '1px solid #38bdf8' : '1px solid #21262d',
    background: active ? 'rgba(56,189,248,0.15)' : 'transparent',
    color: active ? '#38bdf8' : '#6e7681',
    cursor: 'pointer', fontSize: '13px', fontWeight: active ? '600' : '400',
  }),
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '24px' },
  statCard: { background: '#161b22', border: '1px solid #21262d', borderRadius: '10px', padding: '16px', textAlign: 'center' },
  statNum: { fontSize: '28px', fontWeight: '700', color: '#f0f6fc' },
  statLabel: { fontSize: '12px', color: '#6e7681', marginTop: '4px' },
  taskCard: (done) => ({
    background: done ? '#0d1117' : '#161b22', border: '1px solid #21262d',
    borderRadius: '10px', padding: '16px 20px', marginBottom: '10px',
    display: 'flex', alignItems: 'center', gap: '14px', opacity: done ? 0.5 : 1,
  }),
  checkbox: { width: '18px', height: '18px', cursor: 'pointer', accentColor: '#238636', flexShrink: 0 },
  taskTitle: (done) => ({
    flex: 1, fontSize: '15px', color: '#f0f6fc',
    textDecoration: done ? 'line-through' : 'none', fontWeight: '500',
  }),
  pill: (color) => ({
    padding: '3px 10px', borderRadius: '12px', fontSize: '11px', fontWeight: '600',
    background: color + '22', color: color, border: `1px solid ${color}44`, whiteSpace: 'nowrap',
  }),
  deleteBtn: { background: 'none', border: 'none', color: '#6e7681', cursor: 'pointer', fontSize: '16px', padding: '4px' },
};

export default function App() {
  const [tasks, setTasks] = useState(initialTasks);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState('Work');
  const [newPriority, setNewPriority] = useState('medium');
  const [filter, setFilter] = useState('All');

  const addTask = () => {
    if (!newTitle.trim()) return;
    setTasks([{ id: Date.now(), title: newTitle.trim(), category: newCategory, priority: newPriority, done: false }, ...tasks]);
    setNewTitle('');
  };

  const toggle = (id) => setTasks(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  const remove = (id) => setTasks(tasks.filter(t => t.id !== id));
  const filtered = filter === 'All' ? tasks : tasks.filter(t => t.category === filter);
  const done = tasks.filter(t => t.done).length;
  const high = tasks.filter(t => t.priority === 'high' && !t.done).length;

  return (
    <div style={s.app}>
      <header style={s.header}>
        <div style={s.logo}><span>✅</span> TaskFlow</div>
        <span style={s.badge}>APP TWO · PORT 8082 · /second</span>
      </header>
      <main style={s.main}>
        <div style={s.statsRow}>
          <div style={s.statCard}><div style={s.statNum}>{tasks.length}</div><div style={s.statLabel}>Total Tasks</div></div>
          <div style={s.statCard}><div style={{ ...s.statNum, color: '#22c55e' }}>{done}</div><div style={s.statLabel}>Completed</div></div>
          <div style={s.statCard}><div style={{ ...s.statNum, color: '#ef4444' }}>{high}</div><div style={s.statLabel}>High Priority</div></div>
        </div>
        <div style={s.topBar}>
          <input style={s.input} placeholder="Add a new task..." value={newTitle}
            onChange={e => setNewTitle(e.target.value)} onKeyDown={e => e.key === 'Enter' && addTask()} />
          <select style={s.select} value={newCategory} onChange={e => setNewCategory(e.target.value)}>
            {CATEGORIES.filter(c => c !== 'All').map(c => <option key={c}>{c}</option>)}
          </select>
          <select style={s.select} value={newPriority} onChange={e => setNewPriority(e.target.value)}>
            <option value="high">🔴 High</option>
            <option value="medium">🟡 Medium</option>
            <option value="low">🟢 Low</option>
          </select>
          <button style={s.addBtn} onClick={addTask}>+ Add</button>
        </div>
        <div style={s.filterRow}>
          {CATEGORIES.map(c => (
            <button key={c} style={s.filterBtn(filter === c)} onClick={() => setFilter(c)}>{c}</button>
          ))}
        </div>
        {filtered.length === 0
          ? <div style={{ textAlign: 'center', padding: '48px', color: '#6e7681' }}>No tasks here. Add one above!</div>
          : filtered.map(task => (
            <div key={task.id} style={s.taskCard(task.done)}>
              <input type="checkbox" style={s.checkbox} checked={task.done} onChange={() => toggle(task.id)} />
              <span style={s.taskTitle(task.done)}>{task.title}</span>
              <span style={s.pill('#6e7681')}>{task.category}</span>
              <span style={s.pill(PRIORITIES[task.priority])}>{task.priority}</span>
              <button style={s.deleteBtn} onClick={() => remove(task.id)}>✕</button>
            </div>
          ))
        }
      </main>
    </div>
  );
}
