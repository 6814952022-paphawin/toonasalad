import content from '../data/content.js';

// แสดงชื่อหน้ารายละเอียดและปุ่มกลับสู่หน้าแรก
function WishDashboardHeader({ onBack, user, onAuth, onLogout, theme, onToggleTheme }) {
  const dashboard = content.wishDashboard;

  return (
    <header className="wish-dashboard-header">
      <button className="dashboard-back-button" type="button" onClick={onBack}>
        <span aria-hidden="true">←</span> {dashboard.backLabel}
      </button>
      <div className="dashboard-heading">
        <p className="dashboard-eyebrow">{dashboard.eyebrow}</p>
        <h1>{dashboard.title}</h1>
      </div>
      <div className="wish-auth-actions">
        <button type="button" className="dashboard-theme-toggle" onClick={onToggleTheme} aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`} title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}>{theme === 'light' ? '☾ Dark' : '☼ Light'}</button>
        {user ? <><span className="wish-auth-email">{user.email}</span><button type="button" className="wish-auth-button" onClick={onLogout}>Log out</button></> : <><button type="button" className="wish-auth-button" onClick={() => onAuth('login')}>Log in</button><button type="button" className="wish-auth-button wish-auth-primary" onClick={() => onAuth('register')}>Sign up</button></>}
      </div>
    </header>
  );
}

export default WishDashboardHeader;
