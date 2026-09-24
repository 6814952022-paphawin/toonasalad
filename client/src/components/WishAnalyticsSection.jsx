import content from '../data/content.js';

const sources = [
  ['character', 'Character', 'blue'], ['weapon', 'Weapon', 'violet'], ['standard', 'Standard', 'gold'],
];

function WishAnalyticsSection({ data }) {
  const dashboard = content.wishDashboard;
  const now = new Date();
  const months = Array.from({ length: 18 }, (_, index) => new Date(now.getFullYear(), now.getMonth() - 17 + index, 1));
  const chartSeries = sources.map(([key, name, tone]) => {
    const wishes = data?.banners?.[key]?.wishes || [];
    const values = months.map((month) => wishes.filter((wish) => {
      const date = new Date(wish.wishedAt);
      return date.getFullYear() === month.getFullYear() && date.getMonth() === month.getMonth();
    }).length);
    return { key, name, tone, values, hasWishes: wishes.length > 0 };
  });
  const allEmpty = chartSeries.every((series) => !series.hasWishes);
  const chartMax = Math.max(1, ...chartSeries.flatMap((series) => series.values));
  const yLabels = [1, 0.75, 0.5, 0.25, 0].map((ratio) => Math.ceil(chartMax * ratio));

  return (
    <section className="wish-analytics-grid" aria-label={dashboard.analyticsLabel}>
      <article className="wish-chart-card">
        <div className="wish-section-heading"><div><p className="dashboard-eyebrow">{dashboard.chartEyebrow}</p><h2>{dashboard.chartTitle}</h2></div><span className="chart-period">LAST 18 MONTHS</span></div>
        <div className="wish-chart">
          <div className="chart-y-labels" aria-hidden="true">{yLabels.map((label, index) => <span key={`${label}-${index}`}>{label}</span>)}</div>
          <svg viewBox="0 0 728 190" preserveAspectRatio="none" role="img" aria-label={dashboard.chartLabel}>
            {[0, 1, 2, 3, 4].map((line) => <line className="chart-grid-line" key={line} x1="0" x2="728" y1={line * 47.5} y2={line * 47.5} />)}
            {!allEmpty && chartSeries.map((series) => series.hasWishes && <polyline className={`chart-series chart-series-${series.tone}`} key={series.key} points={series.values.map((value, index) => `${(index / 17) * 728},${182 - (value / chartMax) * 160}`).join(' ')} />)}
          </svg>
        </div>
        <div className="chart-dates" aria-hidden="true">{months.filter((_, i) => i % 2 === 0).map((month) => <span key={month.toISOString()}>{month.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })}</span>)}</div>
        <div className="chart-legend">{chartSeries.map((series) => <span className={`legend-item legend-${series.tone}`} key={series.key}><i /> {series.name}</span>)}</div>
        {allEmpty && <p className="wish-chart-empty">Import wish history to see your monthly pull activity.</p>}
      </article>
      <article className="wish-rank-card">
        <div className="wish-section-heading"><div><p className="dashboard-eyebrow">{dashboard.rankEyebrow}</p><h2>{dashboard.rankTitle}</h2></div></div>
        <p className="wish-helper community-note">{data?.totalPulls ? 'Community percentile comparisons are illustrative until this site has enough shared, anonymous statistics.' : 'Sample community comparison. Import your history to see your personal pull totals.'}</p>
        <div className="wish-rank-list">{dashboard.globalRanks.map((rank) => (
          <div className="wish-rank-row" key={rank.label}><div><strong>{rank.label}</strong><span>{rank.detail}</span></div><div className={`rank-score wish-tone-${rank.tone}`}><small>{rank.rank}</small><strong>{rank.value}</strong></div></div>
        ))}</div>
      </article>
    </section>
  );
}

export default WishAnalyticsSection;
