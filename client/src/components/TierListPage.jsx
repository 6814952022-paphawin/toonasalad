import { useEffect, useMemo, useState } from 'react';
import characters from '../data/characters.json';
import elements from '../data/elements.json';

const ranks = ['SS', 'S', 'A+', 'A', 'B', 'C', 'D'];
const roles = [
  { id: 'main-dps', title: 'Main DPS', detail: 'On-field damage' },
  { id: 'sub-dps', title: 'Sub DPS', detail: 'Off-field damage' },
  { id: 'support', title: 'Support', detail: 'Buffs, healing & utility' },
];
const storageKey = 'flins-tier-list-v1';

function loadPlacements() {
  try { return JSON.parse(localStorage.getItem(storageKey) || '{}'); } catch { return {}; }
}

function TierListPage({ theme, onToggleTheme, onBack }) {
  const [placements, setPlacements] = useState(loadPlacements);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState('');
  const [elementFilter, setElementFilter] = useState('All');

  useEffect(() => { localStorage.setItem(storageKey, JSON.stringify(placements)); }, [placements]);

  const visibleCharacters = useMemo(() => characters.filter((character) => {
    const matchesName = character.name.toLowerCase().includes(search.trim().toLowerCase());
    const matchesElement = elementFilter === 'All' || character.element === elementFilter;
    return matchesName && matchesElement;
  }), [search, elementFilter]);

  const assignedIds = new Set(Object.keys(placements));
  const placedCharacter = (id) => characters.find((character) => String(character.id) === String(id));
  const elementIcon = (name) => elements.find((element) => element.name === name)?.icon;

  function assign(characterId, role, rank) {
    if (!characterId) return;
    setPlacements((current) => ({ ...current, [characterId]: { role, rank } }));
    setSelectedId('');
  }

  function dropCharacter(event, role, rank) {
    event.preventDefault();
    const characterId = event.dataTransfer.getData('text/plain');
    if (characterId) assign(characterId, role, rank);
  }

  function removeCharacter(characterId) {
    setPlacements((current) => {
      const next = { ...current };
      delete next[characterId];
      return next;
    });
  }

  return (
    <main className="landing-page tier-page" data-theme={theme}>
      <div className="ambient ambient-one" aria-hidden="true" />
      <div className="ambient ambient-two" aria-hidden="true" />
      <header className="topbar tier-topbar">
        <button className="brand tier-brand" type="button" onClick={onBack} aria-label="Back to Flins home"><span className="brand-mark">✳</span> flins<span className="brand-dot">.</span></button>
        <nav className="main-nav" aria-label="Main navigation"><button type="button" onClick={onBack}>Home</button><a href="#tier-board" className="nav-active">Tier list</a><a href="#character-roster">Characters</a></nav>
        <div className="topbar-actions"><button className="theme-toggle" type="button" onClick={onToggleTheme}><span aria-hidden="true">{theme === 'light' ? '☾' : '☼'}</span><span className="theme-toggle-label">{theme === 'light' ? 'Dark' : 'Light'}</span></button><button className="profile-button" type="button" onClick={onBack}>← Home</button></div>
      </header>

      <section className="tier-hero">
        <div className="eyebrow"><span className="eyebrow-line" /> Find your next favourite</div>
        <div className="tier-hero-heading"><div><h1>Character<br /><em>tier list.</em></h1><p>Build your own roster. Drag a character into a role and rank, or select a character and tap a tier.</p></div><div className="tier-hero-meta"><span>ROLES <b>03</b></span><i /><span>RANKS <b>07</b></span><i /><span>CHARACTERS <b>{characters.length.toString().padStart(2, '0')}</b></span></div></div>
      </section>

      <section className="tier-board-section" id="tier-board" aria-label="Tier list board">
        <div className="tier-board-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> Your personal rankings</p><h2>Arrange your roster</h2></div><span className="tier-board-hint">DRAG OR SELECT A CHARACTER TO PLACE IT</span></div>
        <div className="tier-board-scroll"><div className="tier-board">
          <div className="tier-board-header"><span className="tier-grid-heading">RANK</span><div className="tier-role-headings">{roles.map((role) => <header className="tier-role-heading" key={role.id}><div><h3>{role.title}</h3><p>{role.detail}</p></div></header>)}</div></div>
          {ranks.map((rank) => <div className={`tier-board-row rank-${rank.replace('+', 'plus').toLowerCase()}`} key={rank}>
            <div className="tier-rank-cell"><span className="tier-rank-label">{rank}</span></div>
            <div className="tier-row-shell">{roles.map((role) => {
              const members = Object.entries(placements).filter(([, position]) => position.role === role.id && position.rank === rank).map(([id]) => placedCharacter(id)).filter(Boolean);
              return <div className={`tier-drop-cell${selectedId ? ' tier-row-selectable' : ''}`} key={role.id} onDragOver={(event) => event.preventDefault()} onDrop={(event) => dropCharacter(event, role.id, rank)} onClick={() => selectedId && assign(selectedId, role.id, rank)} role={selectedId ? 'button' : undefined} tabIndex={selectedId ? 0 : undefined} onKeyDown={(event) => { if (selectedId && (event.key === 'Enter' || event.key === ' ')) assign(selectedId, role.id, rank); }}>
                {members.length ? members.map((character) => <article className="tier-character-card" key={character.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(character.id))}>
                  <div className={`tier-character-image element-${character.element.toLowerCase()}`}><img src={character.icon} alt="" loading="lazy" /><span className="constellation-label" title="Constellation 0">C0</span>{elementIcon(character.element) && <span className="character-element-icon"><img src={elementIcon(character.element)} alt={character.element} title={character.element} /></span>}<button type="button" aria-label={`Remove ${character.name} from ${rank}`} onClick={() => removeCharacter(String(character.id))}>×</button></div>
                  <span className="tier-character-name">{character.name}</span>
                </article>) : <span className="tier-drop-hint">{selectedId ? 'Place here' : 'Drop characters here'}</span>}
              </div>;
            })}</div>
          </div>)}
        </div></div>
      </section>

      <section className="character-roster-section" id="character-roster">
        <div className="tier-board-heading roster-heading"><div><p className="eyebrow"><span className="eyebrow-line" /> The whole collection</p><h2>Character roster <span>{characters.length}</span></h2></div><p className="roster-instruction">Choose a portrait, then select a tier above. Your placements are saved on this device.</p></div>
        <div className="roster-tools"><label className="roster-search"><span aria-hidden="true">⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search characters" aria-label="Search characters" /></label><label className="element-filter"><span>Element</span><select value={elementFilter} onChange={(event) => setElementFilter(event.target.value)}><option>All</option>{['Anemo', 'Cryo', 'Dendro', 'Electro', 'Geo', 'Hydro', 'Pyro'].map((element) => <option key={element}>{element}</option>)}</select></label><span className="roster-count-label">{visibleCharacters.length} CHARACTERS</span></div>
        {!characters.length ? <div className="roster-empty"><span>✧</span><h3>Character portraits are on their way</h3><p>Run <code>npm run fetch:characters</code> to download the roster and icons.</p></div> : <div className="character-roster-grid">{visibleCharacters.map((character) => {
          const isAssigned = assignedIds.has(String(character.id));
          const isSelected = selectedId === String(character.id);
          return <button className={`roster-character-card${isSelected ? ' is-selected' : ''}${isAssigned ? ' is-assigned' : ''}`} type="button" key={character.id} draggable onDragStart={(event) => event.dataTransfer.setData('text/plain', String(character.id))} onClick={() => setSelectedId(isSelected ? '' : String(character.id))} aria-pressed={isSelected}>
            <span className={`roster-portrait element-${character.element.toLowerCase()}`}><img src={character.icon} alt="" loading="lazy" /><span className="constellation-label" title="Constellation 0">C0</span>{elementIcon(character.element) && <span className="character-element-icon"><img src={elementIcon(character.element)} alt={character.element} title={character.element} /></span>}</span><span className="roster-character-name">{character.name}</span><span className="roster-character-meta">{character.element} · {character.rarity}★</span>{isAssigned && <span className="roster-assigned-mark">PLACED</span>}
          </button>;
        })}</div>}
      </section>
      <footer className="site-footer"><button className="brand tier-brand" type="button" onClick={onBack}><span className="brand-mark">✳</span> flins<span className="brand-dot">.</span></button><span>A FAN-MADE COMPANION FOR YOUR TEYVAT JOURNEY</span><a href="#tier-board">BACK TO TOP ↑</a></footer>
    </main>
  );
}

export default TierListPage;
