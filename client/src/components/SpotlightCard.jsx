import { useRef } from 'react';
import './SpotlightCard.css';

const boxSelector = [
  '.topbar', '.profile-button', '.theme-toggle', '.hero-actions .button-primary', '.nav-page-link',
  '.character-caption', '.floating-note', '.feature-card', '.feature-icon', '.wish-preview',
  '.preview-period', '.tier-preview', '.tier-row', '.tier-badge', '.tier-portrait',
  '.notes-visual', '.note-card', '.dashboard-back-button',
  '.dashboard-theme-toggle', '.wish-auth-button', '.wish-summary-card', '.summary-pity-row',
  '.wish-chart-card', '.wish-rank-card', '.wish-rank-row', '.breakdown-card',
  '.breakdown-footer-card', '.wish-records-card', '.wish-tools-card', '.dashboard-tool',
  '.wish-item-chips span', '.wish-auth-dialog', '.wish-auth-close', '.wish-auth-switch',
  '.wish-entry-form label', '.wish-filter', '.roster-count-label', '.roster-assigned-mark',
  '.wish-record-table tbody tr', '.tier-hero-meta', '.tier-board-header', '.tier-grid-heading',
  '.tier-role-headings', '.tier-role-heading', '.tier-rank-cell', '.tier-row-shell',
  '.tier-drop-cell', '.tier-drop-hint', '.tier-character-image', '.roster-character-card',
  '.roster-search', '.element-filter', '.roster-portrait', '.roster-empty',
];

export const spotlightBoxSelector = boxSelector.join(', ');

const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(255, 255, 255, 0.25)',
  spotlightSelector,
}) => {
  const divRef = useRef(null);

  const handleMouseMove = (event) => {
    const root = divRef.current;
    const spotlightOptOut = event.target.closest('.feature-link, .button-text');
    if (spotlightOptOut) {
      root?.querySelectorAll('.feature-card.card-spotlight-target').forEach((card) => {
        card.classList.remove('card-spotlight-target');
      });
      return;
    }

    const target = spotlightSelector
      ? event.target.closest(spotlightSelector)
      : root;
    if (!target || !root?.contains(target)) return;

    const rect = target.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    target.style.setProperty('--mouse-x', `${x}px`);
    target.style.setProperty('--mouse-y', `${y}px`);
    target.style.setProperty('--spotlight-color', spotlightColor);
    target.classList.add('card-spotlight-target');
  };

  return (
    <div ref={divRef} onMouseMove={handleMouseMove} className={`card-spotlight ${className}`}>
      {children}
    </div>
  );
};

export default SpotlightCard;
