import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import './theme.css';
import './dashboard.css';
import './tierlist.css';
import './tierlist-rank-text.css';
import './page-backgrounds.css';

// จุดเริ่มต้นของ React ที่นำหน้า App ไปแสดงในหน้าเว็บ
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
