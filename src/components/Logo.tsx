import React from 'react';

// PennyPal mark - a copper penny with a rising trend breaking out of it.
// Hand-drawn for the brand (money that grows), not a stock icon.
export const Logo: React.FC<{ size?: number; mark?: string }> = ({ size = 22, mark = '#fdf7ef' }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 32 32"
    fill="none"
    role="img"
    aria-label="PennyPal logo"
  >
    {/* coin */}
    <circle cx="16" cy="16" r="11.5" stroke={mark} strokeOpacity="0.92" strokeWidth="2.3" />
    {/* rising trend inside the coin */}
    <path
      d="M10.6 18.8 L14.6 14.6 L17.4 17.1 L21.4 12.6"
      stroke={mark}
      strokeWidth="2.2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* arrowhead */}
    <path d="M18.4 12.6 H21.6 V15.8" stroke={mark} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

export default Logo;
