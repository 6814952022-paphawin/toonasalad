import content from '../data/content.js';

// แนะนำเว็บไซต์และแสดงการ์ดฟีเจอร์ที่วางแผนไว้
function BottomBoxLayer({ onOpenWishCounter }) {
  return (
    <section className="bottom-box-layer" aria-label={content.featureLabel}>
      <div className="bottom-box-copy">
        <p className="section-eyebrow">{content.eyebrow}</p>
        <h2 className="bottom-box-title">
          {content.panelTitlePrefix}<span>{content.panelTitleAccent}</span>
        </h2>
        <p className="bottom-box-description">{content.panelDescription}</p>
        <div className="section-actions" aria-hidden="true">
          <div className="section-action section-action-primary">{content.primaryAction}</div>
          <div className="section-action section-action-secondary">{content.secondaryAction}</div>
        </div>
        <div className="section-note"><span /> {content.sectionNote}</div>
      </div>
      <div className="bottom-box-cards">
        {content.panelBoxes.map((box) => (
          <article className="bottom-box-card" key={box.number}>
            {box.icon === 'wish' && (
              <button
                className="card-open-button"
                type="button"
                aria-label={box.openLabel}
                onClick={onOpenWishCounter}
              />
            )}
            <div className="card-topline">
              <span className="card-number">{box.number} / {content.featureCount}</span>
              <span className="card-arrow" aria-hidden="true">↗</span>
            </div>
            <div className="card-main">
              <div className="card-detail">
                <div className="card-icon" aria-hidden="true">
                  {box.icon === 'wish' ? (
                    <svg viewBox="0 0 32 32" fill="none">
                      <path d="M16 3.5 18.7 12l8.8 1.4-6.6 5.8 1.5 8.8-6.4-4.4-6.4 4.4 1.5-8.8-6.6-5.8 8.8-1.4L16 3.5Z" />
                      <path d="m24.5 5 .7 2.2 2.3.7-2.3.7-.7 2.2-.7-2.2-2.3-.7 2.3-.7.7-2.2Z" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 32 32" fill="none">
                      <path d="M5 6.5h22v5H5zM5 13.5h10v5H5zM17 13.5h10v5H17zM5 20.5h7v5H5zM14 20.5h13v5H14z" />
                    </svg>
                  )}
                </div>
                <span className="coming-soon">{content.comingSoon}</span>
                <h3 className="card-title">{box.title}</h3>
                <p className="card-description">{box.description}</p>
              </div>
              <div className="card-preview" aria-hidden="true">
                {box.counterPreview ? (
                  <>
                    <span className="counter-preview">{box.counterPreview}</span>
                    <span className="counter-caption">{content.counterCaption}</span>
                    <span className="counter-progress" />
                  </>
                ) : (
                  <div className="tier-preview">
                    {box.tierPreview.map((row) => (
                      <div className="tier-preview-row" key={row.rank}>
                        <span className="tier-rank">{row.rank}</span>
                        {row.chips.map((chip) => <span className="tier-chip" key={chip}>{chip}</span>)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

export default BottomBoxLayer;
