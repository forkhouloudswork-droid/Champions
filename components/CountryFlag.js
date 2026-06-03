import React from 'react';

export default function CountryFlag({ code, name, size = 20 }) {
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
        className="inline-block rounded-sm shadow-sm"
      />
    </picture>
  );
}
