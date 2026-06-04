"use client";
import React from 'react';

export default function ScoreInput({ value, onChange, disabled = false }) {
  const numValue = parseInt(value) || 0;

  const increment = () => {
    if (!disabled) onChange(numValue + 1);
  };

  const decrement = () => {
    if (!disabled && numValue > 0) onChange(numValue - 1);
  };

  return (
    <div className="flex items-center gap-0.5">
      <button
        type="button"
        onClick={decrement}
        disabled={disabled || numValue <= 0}
        className="w-8 h-10 flex items-center justify-center rounded-l-lg text-sm font-bold transition-colors duration-150"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderRight: 'none',
          color: disabled || numValue <= 0 ? 'var(--text-muted)' : 'var(--text-secondary)',
        }}
      >
        −
      </button>
      <div
        className="w-11 h-10 flex items-center justify-center text-lg font-bold"
        style={{
          background: 'var(--bg)',
          borderTop: '1px solid var(--border)',
          borderBottom: '1px solid var(--border)',
          color: 'var(--text)',
        }}
      >
        {value !== undefined && value !== null && value !== '' ? numValue : '–'}
      </div>
      <button
        type="button"
        onClick={increment}
        disabled={disabled}
        className="w-8 h-10 flex items-center justify-center rounded-r-lg text-sm font-bold transition-colors duration-150"
        style={{
          background: 'var(--bg)',
          border: '1px solid var(--border)',
          borderLeft: 'none',
          color: disabled ? 'var(--text-muted)' : 'var(--text-secondary)',
        }}
      >
        +
      </button>
    </div>
  );
}
