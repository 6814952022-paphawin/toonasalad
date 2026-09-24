import { useEffect, useMemo, useState } from 'react';
import { upload } from '@vercel/blob/client';
import BackgroundLayer from './BackgroundLayer.jsx';
import WishDashboardHeader from './WishDashboardHeader.jsx';
import WishAnalyticsSection from './WishAnalyticsSection.jsx';
import WishBreakdownSection from './WishBreakdownSection.jsx';

const API = import.meta.env.VITE_API_URL || '/api';
const banners = [
  ['character', 'Character Event'], ['weapon', 'Weapon Event'], ['standard', 'Standard'], ['chronicled', 'Chronicled Wish'],
];
const blank = { bannerType: 'character', name: '', itemType: 'character', rarity: '5', wishedAt: new Date().toISOString().slice(0, 16) };
const playerKey = 'flins-pity-player-id';
const getPlayerId = () => {
  let id = localStorage.getItem(playerKey);
  if (!id) { id = crypto.randomUUID(); localStorage.setItem(playerKey, id); }
  return id;
};

function WishDetailsPage({ onBack }) {
  const [playerId] = useState(getPlayerId);
  const [data, setData] = useState(null);
  const [form, setForm] = useState(blank);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [banner, setBanner] = useState('character');
  const [authUser, setAuthUser] = useState(() => { try { return JSON.parse(localStorage.getItem('wish-auth-user') || 'null'); } catch { return null; } });
  const [authMode, setAuthMode] = useState('');
  const [authForm, setAuthForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);
  const authToken = () => localStorage.getItem('wish-auth-token');
  async function submitAuth(event) {
    event.preventDefault(); setAuthBusy(true); setAuthError('');
    try {
      const response = await fetch(`${API}/auth/${authMode}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(authForm) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Authentication failed');
      localStorage.setItem('wish-auth-token', body.token); localStorage.setItem('wish-auth-user', JSON.stringify(body.user));
      setAuthUser(body.user); setAuthMode(''); setAuthForm({ email: '', password: '' });
    } catch (error) { setAuthError(error.message); } finally { setAuthBusy(false); }
  }
  const load = async () => {
    const response = await fetch(`${API}/wishes`, { headers: { 'x-player-id': playerId, ...(authToken() ? { Authorization: `Bearer ${authToken()}` } : {}) } });
    const body = await response.json();
    if (!response.ok) throw new Error(body.message || 'Could not load wish history');
    setData(body);
  };
  useEffect(() => { load().catch((e) => setError(e.message)); }, []);
  const rows = data?.banners?.[banner]?.wishes || [];
  const number = (value) => new Intl.NumberFormat().format(value || 0);

  async function submitWishes(wishes, doneMessage) {
    setBusy(true); setError(''); setMessage('');
    try {
      const response = await fetch(`${API}/wishes`, { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-player-id': playerId, ...(authToken() ? { Authorization: `Bearer ${authToken()}` } : {}) }, body: JSON.stringify({ wishes }) });
      const body = await response.json();
      if (!response.ok) throw new Error(body.message || 'Could not save wishes');
      await load(); setMessage(`${doneMessage}: ${body.added} added, ${body.skipped} duplicate${body.skipped === 1 ? '' : 's'} skipped.`);
    } catch (e) { setError(e.message); }
    finally { setBusy(false); }
  }

  async function importFile(event) {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      if (!authToken() || !authUser?.id) throw new Error('Log in to upload wish history to Blob.');
      if (file.size > 10 * 1024 * 1024) throw new Error('Wish history files must be 10 MB or smaller.');
      const blob = await upload(`wish-imports/${authUser.id}/${crypto.randomUUID()}.json`, file, {
        access: 'public',
        contentType: 'application/json',
        handleUploadUrl: `${API}/uploads/token`,
        clientPayload: authToken(),
      });
      const parsed = JSON.parse(await file.text());
      const wishes = Array.isArray(parsed) ? parsed : parsed.wishes;
      if (!Array.isArray(wishes)) throw new Error('JSON must contain a wish array or a { "wishes": [...] } object.');
      await submitWishes(wishes, `Uploaded to Blob and imported (${blob.pathname})`);
    } catch (e) { setError(e.message); }
  }

  async function addManual(event) {
    event.preventDefault();
    await submitWishes([{ ...form, rarity: Number(form.rarity), wishedAt: new Date(form.wishedAt).toISOString() }], 'Wish saved');
    setForm({ ...blank, wishedAt: new Date().toISOString().slice(0, 16) });
  }

  const cards = useMemo(() => banners.map(([key, title]) => ({ key, title, ...(data?.banners?.[key] || {}) })), [data]);
  return (
    <main className="wish-dashboard-page">
      <BackgroundLayer />
      <div className="wish-dashboard-content">
        <WishDashboardHeader onBack={onBack} user={authUser} onAuth={(mode) => { setAuthMode(mode); setAuthError(''); }} onLogout={() => { localStorage.removeItem('wish-auth-token'); localStorage.removeItem('wish-auth-user'); setAuthUser(null); }} />
        {authMode && <div className="wish-auth-backdrop" onMouseDown={(event) => { if (event.target === event.currentTarget) setAuthMode(''); }}><section className="wish-auth-dialog" role="dialog" aria-modal="true" aria-labelledby="wish-auth-title"><button className="wish-auth-close" type="button" aria-label="Close" onClick={() => setAuthMode('')}>×</button><p className="dashboard-eyebrow">WISH COUNTER ACCOUNT</p><h2 id="wish-auth-title">{authMode === 'register' ? 'Create your account' : 'Welcome back'}</h2><form onSubmit={submitAuth}><label>Email<input required type="email" autoComplete="email" maxLength="254" value={authForm.email} onChange={(event) => setAuthForm({ ...authForm, email: event.target.value })} /></label><label>Password<input required type="password" autoComplete={authMode === 'register' ? 'new-password' : 'current-password'} minLength="8" maxLength="128" value={authForm.password} onChange={(event) => setAuthForm({ ...authForm, password: event.target.value })} /></label>{authError && <p className="wish-feedback wish-error" role="alert">{authError}</p>}<button className="wish-auth-button wish-auth-primary" disabled={authBusy}>{authBusy ? 'Please wait…' : authMode === 'register' ? 'Sign up' : 'Log in'}</button></form><button className="wish-auth-switch" type="button" onClick={() => { setAuthMode(authMode === 'register' ? 'login' : 'register'); setAuthError(''); }}>{authMode === 'register' ? 'Already have an account? Log in' : 'New here? Create an account'}</button></section></div>}
        <section className="wish-summary-grid" aria-label="Wish pity summary">
          {cards.map((card) => (
            <article className="wish-summary-card" key={card.key}>
              <div className="summary-card-heading"><h2>{card.title}</h2><span className="summary-menu-mark">✦</span></div>
              <div className="summary-pull-row"><div><span className="summary-label">Lifetime Pulls</span><span className="summary-value-note">✦ {number(card.totalPulls * 160)}</span></div><strong>{number(card.totalPulls)}</strong></div>
              <div className="summary-pity-row"><div><span>5★ Pity</span><small>Guaranteed at {card.key === 'weapon' ? 80 : 90}</small></div><strong className="wish-tone-gold">{number(card.fivePity)}</strong></div>
              <div className="summary-pity-row"><div><span>4★ Pity</span><small>Guaranteed at 10</small></div><strong className="wish-tone-violet">{number(card.fourPity)}</strong></div>
            </article>
          ))}
        </section>
        <WishAnalyticsSection data={data} />
        <WishBreakdownSection data={data} />
        <section className="wish-chart-card wish-tools-card">
          <div className="wish-section-heading"><div><p className="dashboard-eyebrow">YOUR WISH HISTORY</p><h2>Import or add wishes</h2></div><label className="dashboard-tool import-button">Import JSON<input type="file" accept="application/json,.json" onChange={importFile} /></label></div>
          <p className="wish-helper">Sign in to upload a JSON file directly to Vercel Blob. Files are limited to 10 MB and the Blob URL is public. The records are then imported into your wish history.</p>
          <form className="wish-entry-form" onSubmit={addManual}>
            <label>Banner<select value={form.bannerType} onChange={(e) => setForm({ ...form, bannerType: e.target.value })}>{banners.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label>
            <label>Item name<input required maxLength="120" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></label>
            <label>Kind<select value={form.itemType} onChange={(e) => setForm({ ...form, itemType: e.target.value })}><option value="character">Character</option><option value="weapon">Weapon</option></select></label>
            <label>Rarity<select value={form.rarity} onChange={(e) => setForm({ ...form, rarity: e.target.value })}><option value="5">5★</option><option value="4">4★</option><option value="3">3★</option></select></label>
            <label>Date and time<input required type="datetime-local" value={form.wishedAt} onChange={(e) => setForm({ ...form, wishedAt: e.target.value })} /></label>
            <button className="dashboard-tool" disabled={busy}>Add wish</button>
          </form>
          {error && <p className="wish-feedback wish-error" role="alert">{error} — start the API server and check its database connection.</p>}
          {message && <p className="wish-feedback" role="status">{message}</p>}
        </section>
        <section className="wish-chart-card wish-records-card">
          <div className="wish-section-heading"><h2>Pull records</h2><label className="wish-filter">Banner<select value={banner} onChange={(e) => setBanner(e.target.value)}>{banners.map(([key, label]) => <option key={key} value={key}>{label}</option>)}</select></label></div>
          {!data ? <p className="wish-helper">Loading wish history…</p> : rows.length === 0 ? <p className="wish-helper">No wishes in this banner yet. Import history or add a wish above.</p> : <div className="breakdown-table-wrap"><table className="wish-record-table"><thead><tr><th>Item</th><th>Rarity</th><th>Type</th><th>Date</th></tr></thead><tbody>{rows.map((wish, index) => <tr key={wish.wishId || `${wish.name}-${wish.wishedAt}-${index}`}><td>{wish.name}</td><td className={wish.rarity === 5 ? 'wish-tone-gold' : wish.rarity === 4 ? 'wish-tone-violet' : ''}>{'★'.repeat(wish.rarity)}</td><td>{wish.itemType}</td><td>{new Date(wish.wishedAt).toLocaleString()}</td></tr>)}</tbody></table></div>}
        </section>
      </div>
    </main>
  );
}

export default WishDetailsPage;
