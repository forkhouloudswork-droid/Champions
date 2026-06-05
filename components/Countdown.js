"use client";
import React, { useState, useEffect } from 'react';

export default function Countdown({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = new Date(targetDate).getTime() - Date.now();
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
          seconds: Math.floor((difference / 1000) % 60),
        });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [targetDate]);

  if (!targetDate || new Date(targetDate).getTime() <= Date.now()) {
    return null;
  }

  return (
    <div 
      className="mb-6 rounded-2xl p-4 sm:p-6 text-center animate-fade-in-up" 
      style={{ background: 'var(--accent-dim)', border: '1px solid var(--accent)' }}
    >
      <div className="text-xs uppercase tracking-widest font-bold mb-3" style={{ color: 'var(--accent)' }}>
        Tournament Starts In
      </div>
      <div className="flex justify-center gap-4 sm:gap-8">
        {[
          { label: 'Days', value: timeLeft.days },
          { label: 'Hours', value: timeLeft.hours },
          { label: 'Mins', value: timeLeft.minutes },
          { label: 'Secs', value: timeLeft.seconds },
        ].map((item, i) => (
          <div key={item.label} className="flex flex-col items-center">
            <div 
              className="text-3xl sm:text-4xl font-black tabular-nums tracking-tighter" 
              style={{ color: 'var(--text)' }}
            >
              {item.value.toString().padStart(2, '0')}
            </div>
            <div className="text-[10px] sm:text-xs uppercase tracking-wider mt-1 opacity-70" style={{ color: 'var(--accent)' }}>
              {item.label}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
