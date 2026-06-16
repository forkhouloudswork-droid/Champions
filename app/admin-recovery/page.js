"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';

// ─── The Sarcasm Engine™ ───
const ROAST_CAROUSEL = [
  { prefix: '[WARN]', text: "Someone forgot their password. Truly unprecedented. Nobel Prize in originality." },
  { prefix: '[LOG]', text: "Let me guess… they tried 'password123' and are shocked it didn't work?" },
  { prefix: '[ERR]', text: "Another day, another user treating their memory like a free trial they never renewed." },
  { prefix: '[CRIT]', text: "Tell them to write it on a sticky note next time. Or a tattoo. Whatever works." },
  { prefix: '[INFO]', text: "Welcome to the circus. You're the clown wrangler now." },
  { prefix: '[WARN]', text: "In the old days, we just remembered things. With our brains. Wild concept." },
  { prefix: '[LOG]', text: "Here lies their old password. Gone but definitely not remembered." },
  { prefix: '[INFO]', text: "Achievement unlocked: IT Support Desk Simulator 2026." },
  { prefix: '[CRIT]', text: "Plot twist: they'll forget this new password too. See you in 3 days." },
  { prefix: '[WARN]', text: "You should start charging per recovery. Rent is due." },
  { prefix: '[ERR]', text: "Their password memory is colder than their World Cup predictions." },
  { prefix: '[LOG]', text: "This is fine. Everything is fine. You love doing this." },
];

const LOGIN_WRONG_PASSWORDS = [
  "ACCESS DENIED. Try again, genius.",
  "AUTHENTICATION FAILED. Shocking.",
  "INVALID CREDENTIALS. Have you tried remembering?",
  "PERMISSION DENIED. Maybe write YOUR password down too?",
  "FATAL: The irony of forgetting the admin password on a password recovery page... chef's kiss.",
  "SEGFAULT in brain.exe. Just… no.",
  "ERR_NOT_ADMIN: Are you sure you're the admin? Because this is embarrassing.",
];

const SUCCESS_MESSAGES = [
  "[OK] Password updated. Start the countdown until they forget this one too.",
  "[OK] Password changed. You're basically a charity at this point.",
  "[OK] Updated! That'll be £50. Venmo works.",
  "[OK] New password set. They owe you their life. Or at least a coffee.",
  "[OK] Success! Their digital amnesia has been cured. Temporarily.",
  "[OK] Password reset complete. You are the unsung hero nobody asked for.",
];

const ERROR_NO_USER = [
  "ERR: Pick a victim first. The dropdown isn't decoration.",
  "ERR: You forgot to select a user. Is forgetting things contagious?",
  "ERR: Select someone from the list. It's a dropdown, not a suggestion box.",
];

const ERROR_SHORT_PASSWORD = [
  "ERR: 6 characters minimum. Even their memory isn't THAT bad.",
  "ERR: Password shorter than their attention span. Try 6+ chars.",
  "ERR: Come on, at least give them a fighting chance. 6 chars minimum.",
];

const BOOT_SEQUENCE = [
  { text: "BIOS v13.37 — CHAMPIONS RECOVERY SYSTEM", delay: 100 },
  { text: "Checking memory... 640K ought to be enough for anybody.", delay: 200 },
  { text: "Loading sarcasm module.......... [OK]", delay: 400 },
  { text: "Initializing password graveyard... [OK]", delay: 300 },
  { text: "Mounting /dev/disappointment... [OK]", delay: 250 },
  { text: "Starting clown-detection service... [FOUND 1]", delay: 350 },
  { text: "Connecting to Supabase... [OK]", delay: 300 },
  { text: "Loading user database.......... [OK]", delay: 400 },
  { text: "Admin privileges: ELEVATED", delay: 150 },
  { text: "System ready. God help us all.", delay: 200 },
  { text: "", delay: 100 },
  { text: "Type 'help' for commands. Just kidding, there's only one button.", delay: 300 },
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Matrix Rain Component ───
function MatrixRain() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF{}[]<>/\\|';
    const fontSize = 14;
    const columns = Math.floor(canvas.width / fontSize);
    const drops = Array(columns).fill(1);

    const draw = () => {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#0f0';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.globalAlpha = Math.random() * 0.4 + 0.1;
        ctx.fillText(char, x, y);
        ctx.globalAlpha = 1;

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
    };

    const interval = setInterval(draw, 50);
    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        opacity: 0.15,
        pointerEvents: 'none',
      }}
    />
  );
}

// ─── Typing Text Component ───
function TypingText({ text, speed = 30, onDone, style = {} }) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    let i = 0;
    const interval = setInterval(() => {
      if (i < text.length) {
        setDisplayed(text.slice(0, i + 1));
        i++;
      } else {
        setDone(true);
        clearInterval(interval);
        onDone?.();
      }
    }, speed);
    return () => clearInterval(interval);
  }, [text]);

  return (
    <span style={style}>
      {displayed}
      {!done && <span className="terminal-cursor">█</span>}
    </span>
  );
}

// ─── Glitch Text Component ───
function GlitchText({ children }) {
  return (
    <span className="glitch-text" data-text={children}>
      {children}
    </span>
  );
}

// ─── Styles ───
const terminalStyles = `
  @import url('https://fonts.googleapis.com/css2?family=JetBrains+Mono:wght@400;500;600;700&display=swap');

  .terminal-page {
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
    background: #0a0a0a;
    min-height: 100vh;
    position: relative;
    overflow-x: hidden;
  }

  .terminal-page * {
    font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
  }

  /* Scanlines overlay */
  .scanlines {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;
    z-index: 1;
    background: repeating-linear-gradient(
      0deg,
      transparent,
      transparent 2px,
      rgba(0, 255, 0, 0.015) 2px,
      rgba(0, 255, 0, 0.015) 4px
    );
  }

  /* CRT flicker */
  .crt-flicker {
    animation: crt-flicker 0.15s infinite alternate;
  }

  @keyframes crt-flicker {
    0% { opacity: 0.97; }
    50% { opacity: 1; }
    100% { opacity: 0.98; }
  }

  /* Terminal cursor blink */
  .terminal-cursor {
    animation: cursor-blink 0.7s step-end infinite;
    color: #00ff00;
    font-weight: 400;
  }

  @keyframes cursor-blink {
    0%, 100% { opacity: 1; }
    50% { opacity: 0; }
  }

  /* Terminal box styling */
  .terminal-box {
    background: rgba(0, 10, 0, 0.85);
    border: 1px solid #1a3a1a;
    border-radius: 8px;
    box-shadow:
      0 0 20px rgba(0, 255, 0, 0.05),
      inset 0 0 60px rgba(0, 0, 0, 0.5);
    backdrop-filter: blur(10px);
  }

  .terminal-box-header {
    padding: 8px 14px;
    border-bottom: 1px solid #1a3a1a;
    display: flex;
    align-items: center;
    gap: 6px;
    background: rgba(0, 20, 0, 0.5);
    border-radius: 8px 8px 0 0;
  }

  .terminal-dot {
    width: 10px;
    height: 10px;
    border-radius: 50%;
  }

  /* Terminal input styling */
  .terminal-input {
    background: rgba(0, 15, 0, 0.6) !important;
    border: 1px solid #1a3a1a !important;
    color: #00ff00 !important;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 4px;
    width: 100%;
    outline: none;
    caret-color: #00ff00;
    transition: border-color 0.2s, box-shadow 0.2s;
  }

  .terminal-input:focus {
    border-color: #00ff41 !important;
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.15);
  }

  .terminal-input::placeholder {
    color: #1a5a1a;
  }

  .terminal-input option {
    background: #0a0a0a;
    color: #00ff00;
  }

  .terminal-select {
    background: rgba(0, 15, 0, 0.6) !important;
    border: 1px solid #1a3a1a !important;
    color: #00ff00 !important;
    font-size: 13px;
    padding: 10px 14px;
    border-radius: 4px;
    width: 100%;
    outline: none;
    cursor: pointer;
    -webkit-appearance: none;
    appearance: none;
  }

  .terminal-select:focus {
    border-color: #00ff41 !important;
    box-shadow: 0 0 10px rgba(0, 255, 65, 0.15);
  }

  .terminal-select option {
    background: #0a0a0a;
    color: #00ff00;
    padding: 8px;
  }

  /* Glitch effect */
  .glitch-text {
    position: relative;
    display: inline-block;
    animation: glitch-skew 4s infinite linear alternate-reverse;
  }

  .glitch-text::before,
  .glitch-text::after {
    content: attr(data-text);
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .glitch-text::before {
    color: #ff0040;
    animation: glitch-before 3s infinite linear alternate-reverse;
    clip-path: polygon(0 0, 100% 0, 100% 45%, 0 45%);
    transform: translateX(-2px);
    opacity: 0.7;
  }

  .glitch-text::after {
    color: #00ffff;
    animation: glitch-after 2s infinite linear alternate-reverse;
    clip-path: polygon(0 60%, 100% 60%, 100% 100%, 0 100%);
    transform: translateX(2px);
    opacity: 0.7;
  }

  @keyframes glitch-before {
    0% { clip-path: polygon(0 2%, 100% 2%, 100% 5%, 0 5%); }
    10% { clip-path: polygon(0 15%, 100% 15%, 100% 15%, 0 15%); }
    20% { clip-path: polygon(0 10%, 100% 10%, 100% 20%, 0 20%); }
    30% { clip-path: polygon(0 1%, 100% 1%, 100% 2%, 0 2%); }
    40% { clip-path: polygon(0 33%, 100% 33%, 100% 33%, 0 33%); }
    50% { clip-path: polygon(0 44%, 100% 44%, 100% 44%, 0 44%); }
    60% { clip-path: polygon(0 50%, 100% 50%, 100% 20%, 0 20%); }
    70% { clip-path: polygon(0 70%, 100% 70%, 100% 70%, 0 70%); }
    80% { clip-path: polygon(0 80%, 100% 80%, 100% 80%, 0 80%); }
    90% { clip-path: polygon(0 50%, 100% 50%, 100% 55%, 0 55%); }
    100% { clip-path: polygon(0 70%, 100% 70%, 100% 80%, 0 80%); }
  }

  @keyframes glitch-after {
    0% { clip-path: polygon(0 25%, 100% 25%, 100% 30%, 0 30%); }
    15% { clip-path: polygon(0 3%, 100% 3%, 100% 3%, 0 3%); }
    22% { clip-path: polygon(0 5%, 100% 5%, 100% 20%, 0 20%); }
    31% { clip-path: polygon(0 20%, 100% 20%, 100% 20%, 0 20%); }
    45% { clip-path: polygon(0 40%, 100% 40%, 100% 40%, 0 40%); }
    51% { clip-path: polygon(0 52%, 100% 52%, 100% 59%, 0 59%); }
    63% { clip-path: polygon(0 60%, 100% 60%, 100% 60%, 0 60%); }
    76% { clip-path: polygon(0 75%, 100% 75%, 100% 75%, 0 75%); }
    81% { clip-path: polygon(0 65%, 100% 65%, 100% 40%, 0 40%); }
    94% { clip-path: polygon(0 45%, 100% 45%, 100% 50%, 0 50%); }
    100% { clip-path: polygon(0 14%, 100% 14%, 100% 33%, 0 33%); }
  }

  @keyframes glitch-skew {
    0% { transform: skew(0deg); }
    20% { transform: skew(0deg); }
    21% { transform: skew(-1deg); }
    22% { transform: skew(0deg); }
    60% { transform: skew(0deg); }
    61% { transform: skew(0.5deg); }
    62% { transform: skew(0deg); }
    100% { transform: skew(0deg); }
  }

  /* Execute button */
  .btn-execute {
    background: linear-gradient(180deg, #00cc00 0%, #009900 100%);
    color: #000;
    font-weight: 700;
    font-size: 13px;
    padding: 12px 20px;
    border: 1px solid #00ff00;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
    text-transform: uppercase;
    letter-spacing: 2px;
    transition: all 0.2s;
    position: relative;
    overflow: hidden;
  }

  .btn-execute:hover {
    background: linear-gradient(180deg, #00ff00 0%, #00cc00 100%);
    box-shadow: 0 0 20px rgba(0, 255, 0, 0.3), 0 0 40px rgba(0, 255, 0, 0.1);
    transform: translateY(-1px);
  }

  .btn-execute:active {
    transform: translateY(0);
  }

  .btn-execute:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    animation: processing-pulse 1.5s infinite;
  }

  @keyframes processing-pulse {
    0%, 100% { box-shadow: 0 0 5px rgba(0, 255, 0, 0.2); }
    50% { box-shadow: 0 0 20px rgba(0, 255, 0, 0.5), 0 0 40px rgba(0, 255, 0, 0.2); }
  }

  /* Boot sequence animation */
  .boot-line {
    opacity: 0;
    animation: boot-appear 0.1s forwards;
  }

  @keyframes boot-appear {
    to { opacity: 1; }
  }

  /* Carousel log line highlight */
  .log-highlight {
    animation: log-glow 2s ease-in-out infinite alternate;
  }

  @keyframes log-glow {
    0% { text-shadow: 0 0 5px rgba(0, 255, 0, 0.3); }
    100% { text-shadow: 0 0 15px rgba(0, 255, 0, 0.6); }
  }

  /* Status bar */
  .status-bar {
    background: rgba(0, 20, 0, 0.8);
    border-top: 1px solid #1a3a1a;
    padding: 4px 16px;
    font-size: 11px;
    color: #1a5a1a;
    display: flex;
    justify-content: space-between;
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 10;
  }

  .status-active {
    color: #00ff00;
  }

  /* Progress bar for "hacking" */
  .hack-progress {
    height: 3px;
    background: #1a3a1a;
    border-radius: 2px;
    overflow: hidden;
    margin-top: 8px;
  }

  .hack-progress-bar {
    height: 100%;
    background: #00ff00;
    border-radius: 2px;
    animation: hack-fill 2s ease-in-out forwards;
    box-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }

  @keyframes hack-fill {
    0% { width: 0%; }
    20% { width: 15%; }
    40% { width: 35%; }
    50% { width: 42%; }
    70% { width: 78%; }
    85% { width: 90%; }
    100% { width: 100%; }
  }

  /* Fade in */
  .terminal-fade-in {
    animation: term-fade 0.5s ease forwards;
  }

  @keyframes term-fade {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  /* Glow text */
  .glow-green {
    color: #00ff00;
    text-shadow: 0 0 10px rgba(0, 255, 0, 0.5);
  }

  .text-green { color: #00ff00; }
  .text-green-dim { color: #1a5a1a; }
  .text-green-mid { color: #00aa00; }
  .text-red { color: #ff0040; }
  .text-yellow { color: #ffaa00; }
  .text-cyan { color: #00ffff; }
  .text-white { color: #aaaaaa; }
`;

export default function AdminRecoveryPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [wrongAttempts, setWrongAttempts] = useState(0);

  // Boot sequence
  const [booting, setBooting] = useState(false);
  const [bootLines, setBootLines] = useState([]);
  const [bootDone, setBootDone] = useState(false);

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [recoveryCount, setRecoveryCount] = useState(0);

  // Carousel state
  const [currentRoast, setCurrentRoast] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // Terminal log
  const [terminalLog, setTerminalLog] = useState([]);
  const logEndRef = useRef(null);

  // Clock
  const [clock, setClock] = useState('');
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      setClock(now.toLocaleTimeString('en-GB', { hour12: false }));
    };
    tick();
    const i = setInterval(tick, 1000);
    return () => clearInterval(i);
  }, []);

  const addLog = useCallback((msg, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString('en-GB', { hour12: false });
    setTerminalLog(prev => [...prev.slice(-20), { timestamp, msg, type }]);
  }, []);

  // Auto-rotate the carousel
  useEffect(() => {
    if (!bootDone) return;
    const interval = setInterval(() => {
      setIsTransitioning(true);
      setTimeout(() => {
        setCurrentRoast(prev => (prev + 1) % ROAST_CAROUSEL.length);
        setIsTransitioning(false);
      }, 400);
    }, 5000);
    return () => clearInterval(interval);
  }, [bootDone]);

  // Boot sequence after auth
  useEffect(() => {
    if (!booting) return;

    let i = 0;
    const runBoot = () => {
      if (i < BOOT_SEQUENCE.length) {
        const line = BOOT_SEQUENCE[i];
        setBootLines(prev => [...prev, line.text]);
        i++;
        setTimeout(runBoot, line.delay);
      } else {
        setTimeout(() => {
          setBootDone(true);
          addLog('System initialized. Ready for operations.', 'ok');
        }, 500);
      }
    };
    runBoot();
  }, [booting, addLog]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'arduino') {
      setAuthenticated(true);
      setError('');
      setBooting(true);
    } else {
      const idx = Math.min(wrongAttempts, LOGIN_WRONG_PASSWORDS.length - 1);
      setError(LOGIN_WRONG_PASSWORDS[idx]);
      setWrongAttempts(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!bootDone) return;

    const fetchProfiles = async () => {
      addLog('Querying user database...', 'info');
      const { data, error } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });

      if (data) {
        setProfiles(data);
        addLog(`Found ${data.length} registered souls.`, 'ok');
      }
      if (error) {
        addLog(`Database error: ${error.message}`, 'err');
      }
      setLoading(false);
    };

    fetchProfiles();
  }, [bootDone, addLog]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setUpdateStatus('');

    if (!selectedUserId) {
      const msg = randomFrom(ERROR_NO_USER);
      setUpdateStatus(msg);
      addLog(msg, 'err');
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      const msg = randomFrom(ERROR_SHORT_PASSWORD);
      setUpdateStatus(msg);
      addLog(msg, 'err');
      return;
    }

    setIsUpdating(true);
    addLog(`Initiating password override for ${getSelectedUserName()}...`, 'info');

    try {
      const res = await fetch('/api/admin/update-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          adminPassword: password,
          userId: selectedUserId,
          newPassword: newPassword
        })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        const msg = randomFrom(SUCCESS_MESSAGES);
        setUpdateStatus(msg);
        addLog(msg, 'ok');
        setNewPassword('');
        setRecoveryCount(prev => prev + 1);
      } else {
        const msg = `FATAL: Server rejected the operation — ${data.error || 'Unknown error'}`;
        setUpdateStatus(msg);
        addLog(msg, 'err');
      }
    } catch (err) {
      const msg = 'NETWORK TIMEOUT: The universe is trying to tell you something.';
      setUpdateStatus(msg);
      addLog(msg, 'err');
    } finally {
      setIsUpdating(false);
    }
  };

  const getSelectedUserName = useCallback(() => {
    const user = profiles.find(p => p.id === selectedUserId);
    return user?.full_name || 'target_user';
  }, [selectedUserId, profiles]);

  // ─── Login Screen ───
  if (!authenticated) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: terminalStyles }} />
        <div className="terminal-page crt-flicker">
          <MatrixRain />
          <div className="scanlines" />

          <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <form onSubmit={handleLogin} style={{ width: '100%', maxWidth: '440px' }}>
              <div className="terminal-box">
                <div className="terminal-box-header">
                  <div className="terminal-dot" style={{ background: '#ff5f57' }} />
                  <div className="terminal-dot" style={{ background: '#febc2e' }} />
                  <div className="terminal-dot" style={{ background: '#28c840' }} />
                  <span style={{ marginLeft: '8px', fontSize: '11px', color: '#1a5a1a' }}>
                    auth_terminal — 80×24
                  </span>
                </div>

                <div style={{ padding: '24px' }}>
                  <div style={{ marginBottom: '20px' }}>
                    <div className="glow-green" style={{ fontSize: '13px', marginBottom: '6px' }}>
                      {'>'} CHAMPIONS RECOVERY SYSTEM v4.2.0
                    </div>
                    <div className="text-green-mid" style={{ fontSize: '12px', marginBottom: '4px' }}>
                      {'>'} Copyright (c) 2026 Password Graveyard Inc.
                    </div>
                    <div className="text-green-dim" style={{ fontSize: '11px', marginBottom: '16px' }}>
                      {'>'} "Someone forgot their password again, didn't they?"
                    </div>
                    <div style={{ borderBottom: '1px solid #1a3a1a', marginBottom: '16px' }} />
                    <div className="text-green-mid" style={{ fontSize: '12px', marginBottom: '12px' }}>
                      <GlitchText>AUTHENTICATION REQUIRED</GlitchText>
                    </div>
                    <div className="text-green-dim" style={{ fontSize: '11px' }}>
                      Prove you're the one with the braincells.
                    </div>
                  </div>

                  <div style={{ marginBottom: '12px' }}>
                    <div className="text-green-dim" style={{ fontSize: '11px', marginBottom: '6px' }}>
                      root@champions:~$ <span className="text-green">enter_passphrase</span>
                    </div>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="terminal-input"
                      autoFocus
                    />
                  </div>

                  {error && (
                    <div style={{ marginBottom: '12px', padding: '8px 12px', background: 'rgba(255, 0, 64, 0.1)', border: '1px solid rgba(255, 0, 64, 0.3)', borderRadius: '4px' }}>
                      <span className="text-red" style={{ fontSize: '12px' }}>
                        {'>'} {error}
                      </span>
                    </div>
                  )}

                  <button type="submit" className="btn-execute">
                    {wrongAttempts === 0 ? '[ AUTHENTICATE ]' : wrongAttempts < 3 ? '[ RETRY ]' : '[ PLEASE JUST GET IT RIGHT ]'}
                  </button>

                  {wrongAttempts >= 3 && (
                    <div className="text-yellow" style={{ fontSize: '10px', textAlign: 'center', marginTop: '12px', opacity: 0.7 }}>
                      ⚠ WARN: Maybe you need a password recovery page for this password recovery page.
                    </div>
                  )}

                  {wrongAttempts >= 5 && (
                    <div className="text-red" style={{ fontSize: '10px', textAlign: 'center', marginTop: '8px', opacity: 0.6 }}>
                      ⚠ CRIT: {wrongAttempts} failed attempts. Embarrassment level: maximum.
                    </div>
                  )}
                </div>
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  // ─── Boot Sequence Screen ───
  if (!bootDone) {
    return (
      <>
        <style dangerouslySetInnerHTML={{ __html: terminalStyles }} />
        <div className="terminal-page crt-flicker">
          <MatrixRain />
          <div className="scanlines" />

          <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px' }}>
            <div className="terminal-box" style={{ width: '100%', maxWidth: '600px' }}>
              <div className="terminal-box-header">
                <div className="terminal-dot" style={{ background: '#ff5f57' }} />
                <div className="terminal-dot" style={{ background: '#febc2e' }} />
                <div className="terminal-dot" style={{ background: '#28c840' }} />
                <span style={{ marginLeft: '8px', fontSize: '11px', color: '#1a5a1a' }}>
                  boot_sequence — initializing
                </span>
              </div>

              <div style={{ padding: '20px', minHeight: '300px' }}>
                {bootLines.map((line, i) => (
                  <div
                    key={i}
                    className="boot-line"
                    style={{
                      fontSize: '12px',
                      lineHeight: '1.8',
                      color: line.includes('[OK]') ? '#00ff00' :
                             line.includes('[FOUND') ? '#ffaa00' :
                             line.includes('ready') ? '#00ffff' : '#00aa00',
                      animationDelay: `${i * 0.05}s`,
                    }}
                  >
                    {line && `> ${line}`}
                  </div>
                ))}
                <span className="terminal-cursor" style={{ fontSize: '14px' }}>█</span>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  const roast = ROAST_CAROUSEL[currentRoast];

  // ─── Main Terminal Page ───
  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: terminalStyles }} />
      <div className="terminal-page">
        <MatrixRain />
        <div className="scanlines" />

        <div style={{ position: 'relative', zIndex: 2, minHeight: '100vh', paddingBottom: '40px' }}>
          {/* Top bar */}
          <div style={{
            background: 'rgba(0, 20, 0, 0.9)',
            borderBottom: '1px solid #1a3a1a',
            padding: '8px 20px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            fontSize: '11px',
          }}>
            <span className="glow-green" style={{ fontWeight: 700 }}>
              ◆ CHAMPIONS RECOVERY TERMINAL
            </span>
            <div style={{ display: 'flex', gap: '16px' }}>
              {recoveryCount > 0 && (
                <span className="text-yellow">RESCUES: {recoveryCount}</span>
              )}
              <span className="text-green-dim">PID: {Math.floor(Math.random() * 9000) + 1000}</span>
              <span className="text-green-dim">{clock}</span>
            </div>
          </div>

          <main style={{ maxWidth: '720px', margin: '0 auto', padding: '24px 16px' }}>

            {/* Sarcasm Carousel — Terminal Log Style */}
            <div className="terminal-box terminal-fade-in" style={{ marginBottom: '20px' }}>
              <div className="terminal-box-header">
                <div className="terminal-dot" style={{ background: '#ff5f57' }} />
                <div className="terminal-dot" style={{ background: '#febc2e' }} />
                <div className="terminal-dot" style={{ background: '#28c840' }} />
                <span style={{ marginLeft: '8px', fontSize: '11px', color: '#1a5a1a' }}>
                  sarcasm_daemon — {currentRoast + 1}/{ROAST_CAROUSEL.length}
                </span>
              </div>
              <div style={{ padding: '16px', minHeight: '60px' }}>
                <div
                  style={{
                    opacity: isTransitioning ? 0 : 1,
                    transform: isTransitioning ? 'translateY(8px)' : 'translateY(0)',
                    transition: 'opacity 0.4s ease, transform 0.4s ease',
                  }}
                >
                  <span style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    color: roast.prefix === '[ERR]' ? '#ff0040' :
                           roast.prefix === '[CRIT]' ? '#ff6600' :
                           roast.prefix === '[WARN]' ? '#ffaa00' : '#00aa00',
                  }}>
                    {roast.prefix}
                  </span>
                  <span className="log-highlight text-green" style={{ fontSize: '12px', marginLeft: '8px' }}>
                    {roast.text}
                  </span>
                </div>

                {/* Carousel nav */}
                <div style={{ display: 'flex', justifyContent: 'center', gap: '6px', marginTop: '14px' }}>
                  {ROAST_CAROUSEL.map((_, i) => (
                    <button
                      key={i}
                      onClick={() => {
                        setIsTransitioning(true);
                        setTimeout(() => { setCurrentRoast(i); setIsTransitioning(false); }, 300);
                      }}
                      style={{
                        width: i === currentRoast ? '20px' : '6px',
                        height: '4px',
                        borderRadius: '2px',
                        background: i === currentRoast ? '#00ff00' : '#1a3a1a',
                        border: 'none',
                        cursor: 'pointer',
                        transition: 'all 0.3s',
                        padding: 0,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Main Form Terminal */}
            <div className="terminal-box terminal-fade-in" style={{ animationDelay: '0.2s' }}>
              <div className="terminal-box-header">
                <div className="terminal-dot" style={{ background: '#ff5f57' }} />
                <div className="terminal-dot" style={{ background: '#febc2e' }} />
                <div className="terminal-dot" style={{ background: '#28c840' }} />
                <span style={{ marginLeft: '8px', fontSize: '11px', color: '#1a5a1a' }}>
                  passwd_override — root@champions
                </span>
              </div>

              <div style={{ padding: '24px' }}>
                <div className="text-green-dim" style={{ fontSize: '11px', marginBottom: '16px', fontStyle: 'italic', textAlign: 'center' }}>
                  # "With great sudo comes great annoyance" — /etc/motd
                </div>

                {loading ? (
                  <div>
                    <div className="text-green" style={{ fontSize: '12px' }}>
                      {'>'} Loading user records...
                      <span className="terminal-cursor">█</span>
                    </div>
                    <div className="hack-progress">
                      <div className="hack-progress-bar" />
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handleUpdatePassword}>

                    {/* User selector */}
                    <div style={{ marginBottom: '20px' }}>
                      <div className="text-green-mid" style={{ fontSize: '11px', marginBottom: '6px' }}>
                        {'>'} SELECT TARGET <span className="text-green-dim">// which forgetful soul needs saving?</span>
                      </div>
                      <select
                        value={selectedUserId}
                        onChange={(e) => {
                          setSelectedUserId(e.target.value);
                          if (e.target.value) {
                            const u = profiles.find(p => p.id === e.target.value);
                            addLog(`Target acquired: ${u?.full_name || 'unknown'}`, 'info');
                          }
                        }}
                        className="terminal-select"
                      >
                        <option value="">-- select_victim --</option>
                        {profiles.map(p => (
                          <option key={p.id} value={p.id}>
                            {p.full_name || 'Anonymous'} {p.email ? `<${p.email}>` : ''}
                          </option>
                        ))}
                      </select>
                      {selectedUserId && (
                        <div className="text-yellow" style={{ fontSize: '11px', marginTop: '6px' }}>
                          {'>'} Ah, {getSelectedUserName()}. Why am I not surprised.
                        </div>
                      )}
                    </div>

                    {/* Password input */}
                    <div style={{ marginBottom: '20px' }}>
                      <div className="text-green-mid" style={{ fontSize: '11px', marginBottom: '6px' }}>
                        {'>'} SET NEW_PASSWD <span className="text-green-dim">// they'll definitely forget this one too</span>
                      </div>
                      <input
                        type="text"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="minimum_6_chars (morally, '123456' doesn't count)"
                        className="terminal-input"
                      />
                      <div className="text-green-dim" style={{ fontSize: '10px', marginTop: '4px' }}>
                        # min 6 chars. "password" counts technically but spiritually? No.
                      </div>
                    </div>

                    {/* Execute */}
                    <button
                      type="submit"
                      disabled={isUpdating}
                      className="btn-execute"
                    >
                      {isUpdating
                        ? '[ BYPASSING SECURITY... ]'
                        : selectedUserId
                          ? `[ OVERRIDE ${getSelectedUserName().toUpperCase()}'S PASSWORD ]`
                          : '[ EXECUTE RECOVERY ]'
                      }
                    </button>

                    {isUpdating && (
                      <div className="hack-progress" style={{ marginTop: '8px' }}>
                        <div className="hack-progress-bar" />
                      </div>
                    )}

                    {/* Status message */}
                    {updateStatus && (
                      <div style={{
                        marginTop: '16px',
                        padding: '12px 14px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        fontWeight: 500,
                        background: updateStatus.includes('[OK]') ? 'rgba(0, 255, 0, 0.08)' : 'rgba(255, 0, 64, 0.08)',
                        border: `1px solid ${updateStatus.includes('[OK]') ? 'rgba(0, 255, 0, 0.2)' : 'rgba(255, 0, 64, 0.2)'}`,
                        color: updateStatus.includes('[OK]') ? '#00ff00' : '#ff0040',
                      }}>
                        {'>'} {updateStatus}
                      </div>
                    )}
                  </form>
                )}

                {/* Footer */}
                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid #1a3a1a', textAlign: 'center' }}>
                  <div className="text-green-dim" style={{ fontSize: '10px' }}>
                    # Thank you for your service. Nobody will acknowledge this.
                  </div>
                  <div className="text-green-dim" style={{ fontSize: '10px', marginTop: '4px', opacity: 0.4 }}>
                    # Connection: encrypted | Mode: god | Shame Level: ∞
                  </div>
                </div>
              </div>
            </div>

            {/* Live Activity Log */}
            {terminalLog.length > 0 && (
              <div className="terminal-box terminal-fade-in" style={{ marginTop: '20px', animationDelay: '0.4s' }}>
                <div className="terminal-box-header">
                  <div className="terminal-dot" style={{ background: '#ff5f57' }} />
                  <div className="terminal-dot" style={{ background: '#febc2e' }} />
                  <div className="terminal-dot" style={{ background: '#28c840' }} />
                  <span style={{ marginLeft: '8px', fontSize: '11px', color: '#1a5a1a' }}>
                    activity_log — tail -f
                  </span>
                </div>
                <div style={{ padding: '12px 16px', maxHeight: '200px', overflowY: 'auto' }}>
                  {terminalLog.map((entry, i) => (
                    <div key={i} style={{ fontSize: '11px', lineHeight: '1.8' }}>
                      <span className="text-green-dim">[{entry.timestamp}]</span>{' '}
                      <span style={{
                        color: entry.type === 'err' ? '#ff0040' :
                               entry.type === 'ok' ? '#00ff00' :
                               entry.type === 'warn' ? '#ffaa00' : '#00aa00',
                      }}>
                        {entry.msg}
                      </span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>
              </div>
            )}

          </main>
        </div>

        {/* Status bar */}
        <div className="status-bar">
          <span>
            <span className="status-active">● CONNECTED</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span>root@champions-recovery</span>
          </span>
          <span>
            <span>UTF-8</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span>LF</span>
            <span style={{ margin: '0 8px' }}>|</span>
            <span>{clock}</span>
          </span>
        </div>
      </div>
    </>
  );
}
