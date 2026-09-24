import content from '../data/content.js';

function WishBreakdownSection({ data }) {
  const dashboard = content.wishDashboard;
  const bannerKeys = ['character', 'weapon', 'standard', 'chronicled'];
  const bannerNames = { character: 'Character Event', weapon: 'Weapon Event', standard: 'Standard', chronicled: 'Chronicled Wish' };
  const cards = bannerKeys.map((key) => {
    const wishes = [...(data?.banners?.[key]?.wishes || [])].sort((a, b) => new Date(a.wishedAt) - new Date(b.wishedAt));
    const total = wishes.length;
    const rarityCount = (rarity) => wishes.filter((wish) => wish.rarity === rarity).length;
    const averagePity = (rarity) => {
      let since = 0;
      const gaps = [];
      for (const wish of wishes) {
        since += 1;
        if (wish.rarity === rarity) { gaps.push(since); since = 0; }
      }
      return gaps.length ? (gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length).toFixed(1) : '—';
    };
    const percent = (count) => total ? `${((count / total) * 100).toFixed(2)}%` : '0%';
    const rows = [
      { label: '5★', count: rarityCount(5), average: averagePity(5), tone: 'gold' },
      { label: '4★', count: rarityCount(4), average: averagePity(4), tone: 'violet' },
      { label: '↳ Character', count: wishes.filter((wish) => wish.rarity === 4 && wish.itemType === 'character').length, average: '—', tone: 'violet' },
      { label: '↳ Weapon', count: wishes.filter((wish) => wish.rarity === 4 && wish.itemType === 'weapon').length, average: '—', tone: 'violet' },
      { label: '3★', count: rarityCount(3), average: averagePity(3), tone: 'blue' },
    ].map((row) => ({ ...row, percent: percent(row.count) }));
    const recent = [...wishes].reverse().filter((wish) => wish.rarity >= 4).slice(0, 8);
    return { key, title: bannerNames[key], total, rows, recent };
  });
  const totalPulls = data?.totalPulls || 0;

  return (
    <section className="wish-breakdown-section" aria-label={dashboard.breakdownTitle}>
      <div className="wish-section-heading breakdown-heading"><div><p className="dashboard-eyebrow">{dashboard.breakdownEyebrow}</p><h2>{dashboard.breakdownTitle}</h2></div><span className="sample-data-label">{totalPulls ? 'YOUR WISH DATA' : 'NO WISH DATA'}</span></div>
      <div className="breakdown-grid">
        {cards.map((card) => <article className="breakdown-card" key={card.key}>
          <h3>{card.title}</h3>
          <div className="breakdown-table-wrap"><table><thead><tr><th scope="col"></th>{dashboard.columns.map((column) => <th scope="col" key={column}>{column}</th>)}</tr></thead>
            <tbody>{card.rows.map((row) => <tr className={`wish-tone-${row.tone}`} key={`${card.key}-${row.label}`}><th scope="row">{row.label}</th><td>{row.count}</td><td>{row.percent}</td><td>{row.average}</td></tr>)}</tbody>
          </table></div>
          {card.recent.length > 0 && <div className="wish-item-chips">{card.recent.map((wish, index) => <span key={wish.wishId || `${wish.name}-${wish.wishedAt}-${index}`}>{wish.name} · {wish.rarity}★</span>)}</div>}
          {card.total === 0 && <p className="wish-helper breakdown-empty">No imported wishes for this banner yet.</p>}
        </article>)}
        <article className="breakdown-footer-card"><span>{dashboard.worthLabel} <b>✦</b> {(totalPulls * 160).toLocaleString()}</span><span className="global-stats-label"><i aria-hidden="true">◉</i> {dashboard.globalStatsLabel}</span></article>
      </div>
    </section>
  );
}

export default WishBreakdownSection;
