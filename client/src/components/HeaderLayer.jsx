import content from '../data/content.js';

// แสดงแถบนำทางตกแต่ง โดยรายการทั้งหมดเป็นข้อความที่ยังไม่กดได้
function HeaderLayer() {
  return (
    <header className="site-header">
      <div className="site-logo">{content.logoPrefix}<span>{content.logoSuffix}</span></div>
      <nav className="site-navigation" aria-label={content.navigationLabel}>
        {content.navigation.map((item) => (
          <span className="navigation-item" key={item}>{item}</span>
        ))}
      </nav>
      <div className="header-actions">
        <div className="header-status"><span /> {content.headerStatus}</div>
        <div className="sign-in-button" aria-label={content.signInLabel}>
          <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="12" cy="8" r="3.25" />
            <path d="M5.5 20a6.5 6.5 0 0 1 13 0" />
          </svg>
          <span>{content.signInLabel}</span>
        </div>
      </div>
    </header>
  );
}

export default HeaderLayer;
