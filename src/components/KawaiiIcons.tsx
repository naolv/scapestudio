import React from 'react';

/**
 * Pure SVG Kawaii Elements and Icons (No Unicode Emojis).
 */

export const KawaiiMascot: React.FC<{ className?: string }> = ({ className = 'w-10 h-10' }) => (
  <svg viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    {/* Cute cloud body */}
    <path
      d="M14 36H34C38.4183 36 42 32.4183 42 28C42 23.8329 38.8143 20.4079 34.7348 20.0381C33.8876 13.1793 28.0583 8 21 8C13.268 8 7 14.268 7 22C7 22.3838 7.0154 22.7639 7.04568 23.1396C4.16723 24.3315 2.14286 27.2023 2.14286 30.5714C2.14286 34.6741 5.46873 38 9.57143 38"
      fill="#FFFFFF"
      stroke="#334155"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Rosy cheeks */}
    <ellipse cx="14" cy="28" rx="2.5" ry="1.5" fill="#FDA4AF" />
    <ellipse cx="30" cy="28" rx="2.5" ry="1.5" fill="#FDA4AF" />
    {/* Happy eyes */}
    <path d="M12.5 24C13.5 22.5 15.5 22.5 16.5 24" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
    <path d="M27.5 24C28.5 22.5 30.5 22.5 31.5 24" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
    {/* Happy smile */}
    <path d="M20 28C21 29.5 23 29.5 24 28" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" />
    {/* Little rainbow head ribbon */}
    <path d="M18 10C21 8.5 25 8.5 28 10" stroke="#F472B6" strokeWidth="3" strokeLinecap="round" />
  </svg>
);

export const KawaiiRainbowArch: React.FC<{ className?: string }> = ({ className = 'w-16 h-8' }) => (
  <svg viewBox="0 0 64 32" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path d="M4 32C4 16.536 16.536 4 32 4C47.464 4 60 16.536 60 32" stroke="#FDA4AF" strokeWidth="4" strokeLinecap="round" />
    <path d="M10 32C10 19.8497 19.8497 10 32 10C44.1503 10 54 19.8497 54 32" stroke="#FDE047" strokeWidth="4" strokeLinecap="round" />
    <path d="M16 32C16 23.1634 23.1634 16 32 16C40.8366 16 48 23.1634 48 32" stroke="#86EFAC" strokeWidth="4" strokeLinecap="round" />
    <path d="M22 32C22 26.4772 26.4772 22 32 22C37.5228 22 42 26.4772 42 32" stroke="#93C5FD" strokeWidth="4" strokeLinecap="round" />
  </svg>
);

export const FullWidthRainbowPanorama: React.FC<{ className?: string }> = ({ className = 'w-full h-24 sm:h-32 md:h-40 lg:h-48' }) => (
  <svg
    viewBox="0 0 1440 230"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    preserveAspectRatio="none"
  >
    <defs>
      {/* Radiant Glow Filter for Gloss & Sheen Effect */}
      <filter id="rainbow-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="8" result="blur" />
        <feComposite in="SourceGraphic" in2="blur" operator="over" />
      </filter>

      {/* Intense Center Specular Gloss Gradient */}
      <linearGradient id="gloss-shine-wide" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0" />
        <stop offset="30%" stopColor="#FFFFFF" stopOpacity="0.45" />
        <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.98" />
        <stop offset="70%" stopColor="#FFFFFF" stopOpacity="0.45" />
        <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
      </linearGradient>

      {/* Golden Pearlescent Shimmer Overlay */}
      <linearGradient id="gold-shimmer" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FEF08A" stopOpacity="0" />
        <stop offset="40%" stopColor="#FEF08A" stopOpacity="0.5" />
        <stop offset="50%" stopColor="#FFFFFF" stopOpacity="0.9" />
        <stop offset="60%" stopColor="#FEF08A" stopOpacity="0.5" />
        <stop offset="100%" stopColor="#FEF08A" stopOpacity="0" />
      </linearGradient>

      {/* 6 Rich, Saturated, Broad Rainbow Colors */}
      <linearGradient id="rainbow-pink" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#F472B6" stopOpacity="0.92" />
        <stop offset="50%" stopColor="#FB7185" stopOpacity="1" />
        <stop offset="100%" stopColor="#F472B6" stopOpacity="0.92" />
      </linearGradient>
      <linearGradient id="rainbow-coral" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FB923C" stopOpacity="0.92" />
        <stop offset="50%" stopColor="#F97316" stopOpacity="1" />
        <stop offset="100%" stopColor="#FB923C" stopOpacity="0.92" />
      </linearGradient>
      <linearGradient id="rainbow-yellow" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#FDE047" stopOpacity="0.95" />
        <stop offset="50%" stopColor="#FACC15" stopOpacity="1" />
        <stop offset="100%" stopColor="#FDE047" stopOpacity="0.95" />
      </linearGradient>
      <linearGradient id="rainbow-green" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#4ADE80" stopOpacity="0.92" />
        <stop offset="50%" stopColor="#22C55E" stopOpacity="1" />
        <stop offset="100%" stopColor="#4ADE80" stopOpacity="0.92" />
      </linearGradient>
      <linearGradient id="rainbow-cyan" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#38BDF8" stopOpacity="0.92" />
        <stop offset="50%" stopColor="#0EA5E9" stopOpacity="1" />
        <stop offset="100%" stopColor="#38BDF8" stopOpacity="0.92" />
      </linearGradient>
      <linearGradient id="rainbow-purple" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="#C084FC" stopOpacity="0.92" />
        <stop offset="50%" stopColor="#A855F7" stopOpacity="1" />
        <stop offset="100%" stopColor="#C084FC" stopOpacity="0.92" />
      </linearGradient>
    </defs>
    
    {/* Soft Ambient Rainbow Glow behind center */}
    <g filter="url(#rainbow-glow)" opacity="0.75">
      <path d="M-50 230 Q720 -40 1490 230" stroke="url(#rainbow-yellow)" strokeWidth="36" fill="none" opacity="0.35" />
    </g>

    {/* 6 Broader, Fuller Harmonious Rainbow Arcs (Extra thick in the center: strokeWidth 23) */}
    <path d="M-40 230 Q720 -38 1480 230" stroke="url(#rainbow-pink)" strokeWidth="23" strokeLinecap="round" />
    <path d="M-40 230 Q720 -14 1480 230" stroke="url(#rainbow-coral)" strokeWidth="23" strokeLinecap="round" />
    <path d="M-40 230 Q720 10 1480 230" stroke="url(#rainbow-yellow)" strokeWidth="23" strokeLinecap="round" />
    <path d="M-40 230 Q720 34 1480 230" stroke="url(#rainbow-green)" strokeWidth="23" strokeLinecap="round" />
    <path d="M-40 230 Q720 58 1480 230" stroke="url(#rainbow-cyan)" strokeWidth="23" strokeLinecap="round" />
    <path d="M-40 230 Q720 82 1480 230" stroke="url(#rainbow-purple)" strokeWidth="23" strokeLinecap="round" />

    {/* Luminous Center Glanz & Gloss Highlights (Mehr Glanz im Bogenzentrum) */}
    {/* Broad Gloss Band */}
    <path d="M340 50 Q720 -34 1100 50" stroke="url(#gloss-shine-wide)" strokeWidth="10" strokeLinecap="round" />
    {/* Shimmer Gold Core */}
    <path d="M460 26 Q720 -28 980 26" stroke="url(#gold-shimmer)" strokeWidth="6" strokeLinecap="round" opacity="0.85" />
    {/* Pure White Sharp Specular Reflection */}
    <path d="M540 14 Q720 -22 900 14" stroke="#FFFFFF" strokeWidth="4.5" strokeLinecap="round" opacity="0.95" />
    <path d="M620 4 Q720 -18 820 4" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" opacity="1" />

    {/* Sparkling Kawaii Glanz-Sterne in the Center (Glanz & Funkeln) */}
    {/* Large Center Crown Star */}
    <g transform="translate(720, -5) scale(1.15)">
      <path d="M0 -14 L3.5 -3.5 L14 0 L3.5 3.5 L0 14 L-3.5 3.5 L-14 0 L-3.5 -3.5 Z" fill="#FFFFFF" opacity="0.98" />
      <circle cx="0" cy="0" r="2.5" fill="#FEF08A" />
    </g>
    {/* Left Flank Star */}
    <g transform="translate(635, 14) scale(0.85)">
      <path d="M0 -11 L3 -3 L11 0 L3 3 L0 11 L-3 3 L-11 0 L-3 -3 Z" fill="#FFFFFF" opacity="0.95" />
      <circle cx="0" cy="0" r="1.8" fill="#FDE047" />
    </g>
    {/* Right Flank Star */}
    <g transform="translate(805, 14) scale(0.85)">
      <path d="M0 -11 L3 -3 L11 0 L3 3 L0 11 L-3 3 L-11 0 L-3 -3 Z" fill="#FFFFFF" opacity="0.95" />
      <circle cx="0" cy="0" r="1.8" fill="#FDE047" />
    </g>
    {/* Additional Glanz Twinkles */}
    <g transform="translate(560, 34) scale(0.65)">
      <path d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5 Z" fill="#FFFFFF" opacity="0.9" />
    </g>
    <g transform="translate(880, 34) scale(0.65)">
      <path d="M0 -9 L2.5 -2.5 L9 0 L2.5 2.5 L0 9 L-2.5 2.5 L-9 0 L-2.5 -2.5 Z" fill="#FFFFFF" opacity="0.9" />
    </g>
    {/* Sparkling Twinkle Dots */}
    <circle cx="500" cy="54" r="3" fill="#FFFFFF" opacity="0.9" />
    <circle cx="940" cy="54" r="3" fill="#FFFFFF" opacity="0.9" />
    <circle cx="680" cy="8" r="2.5" fill="#FEF08A" opacity="0.9" />
    <circle cx="760" cy="8" r="2.5" fill="#FEF08A" opacity="0.9" />
    <circle cx="720" cy="40" r="2" fill="#FFFFFF" opacity="0.8" />
  </svg>
);

export const KawaiiStar: React.FC<{ className?: string; fill?: string }> = ({ className = 'w-5 h-5', fill = '#FBBF24' }) => (
  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M12 2L14.7 8.3L21.5 9.1L16.4 13.8L17.8 20.6L12 17.2L6.2 20.6L7.6 13.8L2.5 9.1L9.3 8.3L12 2Z"
      fill={fill}
      stroke="#1E293B"
      strokeWidth="1.5"
      strokeLinejoin="round"
    />
    {/* Cute shine dot */}
    <circle cx="10" cy="9" r="1" fill="#FFFFFF" />
  </svg>
);

export const KawaiiSparkle: React.FC<{ className?: string; color?: string }> = ({ className = 'w-4 h-4', color = '#F472B6' }) => (
  <svg viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg" className={className}>
    <path
      d="M10 1C10 5.97 14.03 10 19 10C14.03 10 10 14.03 10 19C10 14.03 5.97 10 1 10C5.97 10 10 5.97 10 1Z"
      fill={color}
    />
  </svg>
);

export const KawaiiBookSpine: React.FC<{ className?: string; color?: string }> = ({ className = 'w-3 h-full', color = '#F472B6' }) => (
  <div className={`relative ${className} rounded-l-md flex flex-col justify-between py-2 items-center`} style={{ backgroundColor: color }}>
    <div className="w-1.5 h-6 bg-white/40 rounded-full" />
    <div className="w-1.5 h-12 bg-black/10 rounded-full" />
    <div className="w-1.5 h-6 bg-white/40 rounded-full" />
  </div>
);
