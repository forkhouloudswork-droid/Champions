import React from 'react';

export default function CountryFlag({ code, name, size = 20 }) {
  if (!code) return null;
  if (code.startsWith('http')) {
    return (
      <img
        src={code}
        alt={name}
        width={size}
        className="inline-block object-contain"
        style={{ height: size, borderRadius: 4, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
      />
    );
  }

  const codeLower = code.toLowerCase();
  
  return (
    <picture>
      <source
        type="image/webp"
        srcSet={`https://flagcdn.com/w${size}/${codeLower}.webp, https://flagcdn.com/w${size * 2}/${codeLower}.webp 2x`}
      />
      <source
        type="image/png"
        srcSet={`https://flagcdn.com/w${size}/${codeLower}.png, https://flagcdn.com/w${size * 2}/${codeLower}.png 2x`}
      />
      <img
        src={`https://flagcdn.com/w${size}/${codeLower}.png`}
        width={size}
        alt={name}
        className="inline-block"
        style={{ borderRadius: 4, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}
      />
    </picture>
  );
}
