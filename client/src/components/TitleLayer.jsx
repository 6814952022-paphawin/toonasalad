import content from '../data/content.js';

// แสดงชื่อ FLINS ด้วยฟอนต์และไล่สีที่กำหนด
function TitleLayer() {
  return <h1 className="title-layer">{content.title}</h1>;
}

export default TitleLayer;
