import { useEffect, useState } from 'react';
import WishDetailsPage from './components/WishDetailsPage.jsx';
import TierListPage from './components/TierListPage.jsx';
import SpotlightCard, { spotlightBoxSelector } from './components/SpotlightCard.jsx';

const characters = [
  new URL('../assets/images/Main Character.png', import.meta.url).href,
  new URL('../assets/images/Main Character 1.png', import.meta.url).href,
  new URL('../assets/images/Main Character 2.png', import.meta.url).href,
  new URL('../assets/images/Main Character 3.png', import.meta.url).href,
  new URL('../assets/images/Main Character 4.png', import.meta.url).href,
];

function Arrow() { return <span aria-hidden="true">↗</span>; }

function App() {
  const [showWishDetails, setShowWishDetails] = useState(false);
  const [showTierList, setShowTierList] = useState(false);
  const [wishAuthMode, setWishAuthMode] = useState('');
  const [theme, setTheme] = useState(() => window.localStorage.getItem('flins-theme') || 'light');
  useEffect(() => {
    window.localStorage.setItem('flins-theme', theme);
  }, [theme]);
  const spotlightColor = theme === 'dark' ? 'rgba(185, 168, 242, 0.22)' : 'rgba(121, 103, 201, 0.15)';
  const spotlightLayer = { className: 'spotlight-page-layer', spotlightSelector: spotlightBoxSelector, spotlightColor };
  if (showWishDetails) return <SpotlightCard {...spotlightLayer}><WishDetailsPage theme={theme} initialAuthMode={wishAuthMode} onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} onBack={() => { setWishAuthMode(''); setShowWishDetails(false); }} /></SpotlightCard>;
  if (showTierList) return <SpotlightCard {...spotlightLayer}><TierListPage theme={theme} onToggleTheme={() => setTheme(theme === 'light' ? 'dark' : 'light')} onBack={() => setShowTierList(false)} /></SpotlightCard>;

  return (
    <SpotlightCard {...spotlightLayer}>
    <main className="landing-page" data-theme={theme}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <header className="topbar">
        <a className="brand" href="#home" aria-label="Flins home"><span className="brand-mark">✳</span> flins<span className="brand-dot">.</span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-active" href="#home">Discover</a><a href="#features">Features</a><a href="#characters">Characters</a><button className="nav-page-link" type="button" onClick={() => setShowTierList(true)}>Tier list</button>
        </nav>
        <div className="topbar-actions">
          <button className="theme-toggle" type="button" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>
            <span aria-hidden="true">{theme === 'light' ? '☾' : '☼'}</span><span className="theme-toggle-label">{theme === 'light' ? 'Dark' : 'Light'}</span>
          </button>
          <button className="profile-button" type="button" onClick={() => { setWishAuthMode('login'); setShowWishDetails(true); }}><span className="profile-icon">◉</span> Sign in</button>
        </div>
      </header>

      <section className="hero" id="home">
        <div className="hero-copy">
          <div className="eyebrow"><span className="eyebrow-line" /> Teyvat, at your fingertips</div>
          <h1>Your next<br /><span>wish</span> awaits.</h1>
          <p className="hero-description">A little more magic in every journey. Keep your wishes close, discover your next favourite, and make every pull count.</p>
          <div className="hero-actions">
            <button className="button-primary" onClick={() => setShowWishDetails(true)}>Explore your wishes <Arrow /></button>
            <a className="button-text" href="#features">Discover features <span>↓</span></a>
          </div>
          <div className="hero-footnote"><span className="online-dot" /> YOUR ADVENTURE, BEAUTIFULLY ORGANIZED <span className="footnote-rule" /> NO. 01 — NOD-KRAI</div>
        </div>
        <div className="hero-art" aria-label="Flins, the lunar courier">
          <div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" />
          <div className="art-glow" />
          <div className="character-halo"><span>✳</span></div>
          <img className="hero-character" src={characters[0]} alt="Flins, a character from Genshin Impact" />
          <div className="character-caption"><span className="caption-index">01 / 05</span><span className="caption-name">FLINS <small>THE LUNAR COURIER</small></span><span className="caption-star">✦</span></div>
          <div className="floating-note"><span className="note-spark">✧</span><span><small>A NEW JOURNEY</small><strong>Starts with a wish</strong></span><Arrow /></div>
        </div>
        <a className="scroll-cue" href="#features"><span /> SCROLL TO EXPLORE</a>
        <div className="hero-index">01 <i /> 03</div>
      </section>

      <section className="features-section" id="features">
        <div className="section-heading">
          <div><div className="eyebrow"><span className="eyebrow-line" /> A calmer way to play</div><h2>Everything in its<br /><em>right place.</em></h2></div>
          <p>Less keeping track. More looking forward to what’s next. Your Teyvat toolkit, thoughtfully brought together.</p>
        </div>
        <div className="feature-grid">
          <article className="feature-card wish-feature">
            <div className="feature-topline"><span>01 — YOUR HISTORY</span><span className="feature-icon">✧</span></div>
            <div className="wish-preview"><div className="preview-heading"><div className="preview-total"><strong>128</strong><span><b>TOTAL WISHES</b><small>↗ 12 this month</small></span></div><span className="preview-period">ALL TIME⌄</span></div><svg className="wish-line-chart" viewBox="0 0 420 84" preserveAspectRatio="none" role="img" aria-label="Wish history with varied monthly activity"><defs><linearGradient id="wish-chart-fill" x1="0" x2="0" y1="0" y2="1"><stop offset="0%" stopColor="currentColor" stopOpacity=".2"/><stop offset="100%" stopColor="currentColor" stopOpacity="0"/></linearGradient></defs><path className="chart-area" d="M0 64 L35 61 L70 22 L105 66 L140 63 L175 43 L210 13 L245 17 L280 57 L315 62 L350 9 L385 37 L420 59 V84 H0 Z"/><path className="chart-line" d="M0 64 L35 61 L70 22 L105 66 L140 63 L175 43 L210 13 L245 17 L280 57 L315 62 L350 9 L385 37 L420 59"/><circle className="chart-marker" cx="70" cy="22" r="2.8"/><circle className="chart-marker" cx="140" cy="63" r="2.8"/><circle className="chart-marker" cx="210" cy="13" r="2.8"/><circle className="chart-marker" cx="280" cy="57" r="2.8"/><circle className="chart-marker" cx="350" cy="9" r="2.8"/><circle className="chart-point" cx="420" cy="59" r="3.5"/></svg><div className="chart-labels"><span>JAN</span><span>MAR</span><span>MAY</span><span>JUL</span><span>SEP</span><span>NOV</span></div></div>
            <div className="feature-copy"><h3>Wish tracker</h3><p>Every pull, every pity count. Keep your wish history beautifully in view.</p><button className="feature-link" onClick={() => setShowWishDetails(true)}>Open tracker <Arrow /></button></div>
          </article>
          <article className="feature-card roster-feature" id="characters">
            <div className="feature-topline"><span>02 — TEAM RANKINGS</span><span className="feature-icon">✦</span></div>
            <div className="tier-preview"><div className="tier-preview-heading"><span>TEYVAT TIER LIST</span><span>UPDATED TODAY <i /></span></div><div className="tier-row tier-s"><span className="tier-badge">S</span><div className="tier-portrait"><img src={characters[2]} alt="" /></div><div className="tier-info"><strong>Top picks</strong><span>Standout characters</span></div><span className="tier-score">98</span><Arrow /></div><div className="tier-row tier-a"><span className="tier-badge">A</span><div className="tier-portrait"><img src={characters[3]} alt="" /></div><div className="tier-info"><strong>Strong choices</strong><span>Reliable all-rounders</span></div><span className="tier-score">92</span><Arrow /></div><div className="tier-row tier-b"><span className="tier-badge">B</span><div className="tier-portrait"><img src={characters[1]} alt="" /></div><div className="tier-info"><strong>Great potential</strong><span>Worth building</span></div><span className="tier-score">86</span><Arrow /></div></div>
            <div className="feature-copy"><h3>Tier list</h3><p>Compare character strengths and find the right fit for your team.</p><button className="feature-link" onClick={() => setShowTierList(true)}>Explore rankings <Arrow /></button></div>
          </article>
          <article className="feature-card notes-feature">
            <div className="feature-topline"><span>03 — LITTLE DETAILS</span><span className="feature-icon">✳</span></div>
            <div className="notes-visual"><div className="moon-disc">☾</div><div className="note-card note-card-back"><span>✧</span><i /></div><div className="note-card note-card-front"><small>YOUR NEXT FIVE-STAR</small><strong>Closer than<br />you think.</strong><span>KEEP GOING ↗</span></div><div className="notes-caption">A LITTLE LUCK, A LOT OF HEART</div></div>
            <div className="feature-copy"><h3>Personal insights</h3><p>Useful little details and milestones that make your journey feel yours.</p><a className="feature-link" href="#characters">Take a look <Arrow /></a></div>
          </article>
        </div>
      </section>

      <footer className="site-footer"><a className="brand" href="#home"><span className="brand-mark">✳</span> flins<span className="brand-dot">.</span></a><span>A FAN-MADE COMPANION FOR YOUR TEYVAT JOURNEY</span><a href="#home">BACK TO TOP ↑</a></footer>
    </main>
    </SpotlightCard>
  );
}

export default App;
