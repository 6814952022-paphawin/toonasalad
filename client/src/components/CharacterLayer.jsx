import content from '../data/content.js';

// วางรูปตัวละครไว้กึ่งกลางและอยู่เหนือข้อความชื่อ
function CharacterLayer() {
  return (
    <img
      className="character-layer"
      src={content.characterImage}
      alt={content.characterAlt}
    />
  );
}

export default CharacterLayer;
