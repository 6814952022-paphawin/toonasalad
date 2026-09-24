import { useState } from 'react';
import BackgroundLayer from './components/BackgroundLayer.jsx';
import TitleLayer from './components/TitleLayer.jsx';
import CharacterLayer from './components/CharacterLayer.jsx';
import BottomBoxLayer from './components/BottomBoxLayer.jsx';
import HeaderLayer from './components/HeaderLayer.jsx';
import WishDetailsPage from './components/WishDetailsPage.jsx';

// รวม component แต่ละ layer ให้อยู่ในหน้าหลักหน้าเดียว
function App() {
  const [showWishDetails, setShowWishDetails] = useState(false);

  if (showWishDetails) {
    return <WishDetailsPage onBack={() => setShowWishDetails(false)} />;
  }

  return (
    <main className="hero-page">
      <BackgroundLayer />
      <TitleLayer />
      <CharacterLayer />
      <HeaderLayer />
      <BottomBoxLayer onOpenWishCounter={() => setShowWishDetails(true)} />
    </main>
  );
}

export default App;
