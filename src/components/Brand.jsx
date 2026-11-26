export function LogoMark({ className = '' }) {
  return (
    <svg className={`logo-mark ${className}`} viewBox="0 0 110 70" aria-hidden="true">
      <path d="M8 56c22-12 52-14 94-4" fill="none" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
      <path d="M18 64c22-7 46-8 76-2" fill="none" stroke="#2fd3e0" strokeWidth="4" strokeLinecap="round" />
      <path d="M42 54c2-13 0-24-7-34" fill="none" stroke="#11a7b8" strokeWidth="4.5" strokeLinecap="round" />
      <path d="M35 20c-8-7-18-7-25 0 9-2 17 0 25 0Z M35 20c-2-9-9-14-18-13 7 3 13 8 18 13Z M35 20c4-8 12-11 21-8-8 1-15 4-21 8Z M35 20c8-3 16 0 20 7-7-4-13-6-20-7Z M35 20c-7 0-13 5-15 12 4-6 9-10 15-12Z" fill="#27d38f" stroke="#18b87a" strokeWidth="1" strokeLinejoin="round" />
      <path d="M56 54c0-10 3-18 9-24" fill="none" stroke="#11a7b8" strokeWidth="4" strokeLinecap="round" />
      <path d="M65 30c-6-6-14-6-20-1 7-1 14 0 20 1Z M65 30c1-8 7-12 15-11-6 2-11 6-15 11Z M65 30c7-2 14 2 16 8-6-4-11-6-16-8Z M65 30c-5 1-9 6-10 11 3-5 6-8 10-11Z" fill="#3fe0a0" stroke="#18b87a" strokeWidth="1" strokeLinejoin="round" />
      <path d="M88 4a10 10 0 0 1 10 10c0 8-10 18-10 18S78 22 78 14A10 10 0 0 1 88 4Z" fill="#ffc928" stroke="#f2a900" strokeWidth="1.5" />
      <circle cx="88" cy="14" r="3.6" fill="#fff" />
    </svg>
  );
}

export function Logo({ variant = 'header' }) {
  return (
    <div className={`logo logo-${variant}`}>
      <LogoMark />
      <div className="logo-text"><b>San Andrés</b><em>Explorer</em></div>
    </div>
  );
}

export function Robot({ className = '', wave = false }) {
  return (
    <svg className={`robot ${className}`} viewBox="0 0 200 240" role="img" aria-label="Robot guía turístico">
      <defs>
        <linearGradient id="rbWhite" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#ffffff" /><stop offset="1" stopColor="#cfe2f2" /></linearGradient>
        <linearGradient id="rbVisor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#1d335c" /><stop offset="1" stopColor="#060f25" /></linearGradient>
        <linearGradient id="rbHat" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#f7da94" /><stop offset="1" stopColor="#d6a245" /></linearGradient>
        <linearGradient id="rbBlue" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stopColor="#47a8ff" /><stop offset="1" stopColor="#0b57d0" /></linearGradient>
      </defs>
      <ellipse cx="100" cy="233" rx="54" ry="6" fill="rgba(0,30,80,.18)" />
      <rect x="70" y="200" width="25" height="30" rx="11" fill="url(#rbWhite)" />
      <rect x="105" y="200" width="25" height="30" rx="11" fill="url(#rbWhite)" />
      <path d="M58 152q42-16 84 0l5 56q-47 15-94 0Z" fill="url(#rbWhite)" stroke="#e9f3fb" strokeWidth="2" />
      <rect x="80" y="165" width="40" height="22" rx="9" fill="url(#rbBlue)" />
      <circle cx="100" cy="176" r="4" fill="#ffd23f" />
      <path d="M64 154q-24 14-18 40" fill="none" stroke="#e6f0f9" strokeWidth="17" strokeLinecap="round" />
      <path d="M66 150q34 36 68 0" fill="none" stroke="#24364d" strokeWidth="3" />
      <g className={wave ? 'robot-arm-wave' : ''}>
        <path d="M138 160q22-4 27-28" fill="none" stroke="#e6f0f9" strokeWidth="17" strokeLinecap="round" />
        <circle cx="166" cy="128" r="13" fill="url(#rbWhite)" stroke="#dbe8f4" strokeWidth="2" />
        <rect x="160" y="102" width="10" height="22" rx="5" fill="url(#rbWhite)" stroke="#dbe8f4" strokeWidth="2" />
      </g>
      <rect x="28" y="180" width="42" height="29" rx="7" fill="#273445" />
      <rect x="33" y="175" width="13" height="7" rx="2" fill="#273445" />
      <circle cx="49" cy="194.5" r="10" fill="#0c1420" stroke="#5f6f82" strokeWidth="3" />
      <circle cx="49" cy="194.5" r="4" fill="#3d8fe0" />
      <rect x="40" y="62" width="120" height="94" rx="46" fill="url(#rbWhite)" stroke="#eef6fd" strokeWidth="3" />
      <rect x="27" y="92" width="18" height="36" rx="9" fill="url(#rbBlue)" />
      <rect x="155" y="92" width="18" height="36" rx="9" fill="url(#rbBlue)" />
      <rect x="54" y="78" width="92" height="64" rx="31" fill="url(#rbVisor)" />
      <g className="robot-eyes">
        <ellipse cx="82" cy="105" rx="9.5" ry="12.5" fill="#2bd8ff" />
        <ellipse cx="118" cy="105" rx="9.5" ry="12.5" fill="#2bd8ff" />
        <circle cx="85" cy="100" r="3" fill="#fff" />
        <circle cx="121" cy="100" r="3" fill="#fff" />
      </g>
      <path d="M88 125q12 9 24 0" fill="none" stroke="#2bd8ff" strokeWidth="4" strokeLinecap="round" />
      <path d="M63 94q4-11 17-13" fill="none" stroke="rgba(255,255,255,.35)" strokeWidth="4" strokeLinecap="round" />
      <ellipse cx="100" cy="67" rx="80" ry="16" fill="url(#rbHat)" stroke="#c48f35" strokeWidth="1.5" />
      <path d="M60 65q2-42 40-44q38 2 40 44Z" fill="url(#rbHat)" stroke="#c48f35" strokeWidth="1.5" />
      <path d="M61 55q39 11 78 0l1 9q-40 11-80 0Z" fill="#1f6fd6" />
      <path d="M72 40q28-8 56 0M66 50q34-8 68 0" fill="none" stroke="#b9863a" strokeWidth="1.4" opacity=".5" />
      <path d="M124 52c-1-5-4-8-8-9 4 0 7 2 8 4 1-3 4-5 8-5-4 2-6 5-6 9" fill="#27d38f" />
    </svg>
  );
}
