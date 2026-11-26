import { ArrowRight } from 'lucide-react';
import { Logo, Robot } from '../components/Brand.jsx';
import { IMG } from '../data/seed.js';

export default function Splash({ onStart }) {
  return (
    <div className="splash" style={{ backgroundImage: `linear-gradient(180deg, rgba(18,110,230,.92) 0%, rgba(40,150,240,.55) 34%, rgba(0,0,0,0) 60%), url(${IMG.dock})` }}>
      <div className="splash-top">
        <Logo variant="splash" />
        <p className="splash-claim">Descubre • Planifica • Disfruta</p>
      </div>
      <Robot className="splash-robot" wave />
      <div className="splash-bottom">
        <div className="splash-pill">Tu Guía Turístico Inteligente<br />en San Andrés Islas</div>
        <button className="btn btn-yellow splash-cta" onClick={onStart}>Comenzar <ArrowRight size={24} strokeWidth={2.6} /></button>
      </div>
    </div>
  );
}
