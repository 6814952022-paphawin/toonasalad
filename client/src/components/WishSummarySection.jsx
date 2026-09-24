import content from '../data/content.js';

// แสดงยอดสุ่มและ pity ล่าสุดแยกตามประเภทตู้
function WishSummarySection() {
  return (
    <section className="wish-summary-grid" aria-label={content.wishDashboard.title}>
      {content.wishDashboard.summaryCards.map((card) => (
        <article className="wish-summary-card" key={card.title}>
          <div className="summary-card-heading">
            <h2>{card.title}</h2>
            <span className="summary-menu-mark" aria-hidden="true">•••</span>
          </div>
          <div className="summary-pull-row">
            <div>
              <span className="summary-label">{content.wishDashboard.lifetimeLabel}</span>
              <span className="summary-value-note">✦ {card.value}</span>
            </div>
            <strong>{card.pulls}</strong>
          </div>
          <div className="summary-pity-row">
            <div>
              <span>{content.wishDashboard.fivePityLabel}</span>
              <small>{card.guaranteeFive}</small>
            </div>
            <strong className="wish-tone-gold">{card.pityFive}</strong>
          </div>
          <div className="summary-pity-row">
            <div>
              <span>{content.wishDashboard.fourPityLabel}</span>
              <small>{card.guaranteeFour}</small>
            </div>
            <strong className="wish-tone-violet">{card.pityFour}</strong>
          </div>
        </article>
      ))}
    </section>
  );
}

export default WishSummarySection;
