"use client";
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import Header from '@/components/Header';

// ─── The Sarcasm Engine™ ───
const ROAST_CAROUSEL = [
  "Wow. Someone forgot their password. Truly unprecedented. Nobel Prize in originality.",
  "Let me guess… they tried 'password123' and are shocked it didn't work?",
  "Another day, another user treating their memory like a free trial they never renewed.",
  "Tell them to write it on a sticky note next time. Or a tattoo. Whatever works.",
  "Welcome to the circus. You're the clown wrangler now.",
  "In the old days, we just remembered things. With our brains. Wild concept.",
  "Here lies their old password. Gone but definitely not remembered.",
  "Achievement unlocked: IT Support Desk Simulator 2026.",
  "Plot twist: they'll forget this new password too. See you in 3 days.",
  "You should start charging per recovery. Rent is due.",
  "Their password memory is colder than their World Cup predictions.",
  "This is fine. Everything is fine. You love doing this.",
];

const LOGIN_WRONG_PASSWORDS = [
  "ACCESS DENIED — Try again, genius.",
  "AUTHENTICATION FAILURE — Shocking.",
  "INVALID CREDENTIALS — Have you tried remembering?",
  "REJECTED — Maybe write YOUR password down too?",
  "SECURITY BREACH ATTEMPT — The irony of forgetting the admin password on a password recovery page... chef's kiss.",
  "PERMISSION DENIED — Just… no.",
  "INTRUDER ALERT — Are you sure you're the admin?",
];

const SUCCESS_MESSAGES = [
  "PASSWORD OVERWRITTEN — Start the countdown until they forget this one too.",
  "CREDENTIALS INJECTED — You're basically a charity at this point.",
  "MEMORY PATCHED — That'll be £50. Venmo works.",
  "USER RESURRECTED — They owe you their life. Or at least a coffee.",
  "AMNESIA CURED (TEMPORARILY) — See you next week.",
  "OPERATION COMPLETE — You are the unsung hero nobody asked for.",
];

const ERROR_NO_USER = [
  "ERROR: No target selected. The dropdown isn't decoration.",
  "FATAL: Select a user first. Is forgetting things contagious?",
  "NULL POINTER: Pick someone from the list. It's not a suggestion box.",
];

const ERROR_SHORT_PASSWORD = [
  "BUFFER UNDERFLOW: 6 chars minimum. Even their memory isn't THAT bad.",
  "VALIDATION FAILED: That password is shorter than their attention span. 6+ chars.",
  "INSUFFICIENT LENGTH: Give them a fighting chance. 6 characters minimum.",
];

const HACKING_STEPS = [
  "Initializing password recovery protocol...",
  "Bypassing memory cortex firewall...",
  "Injecting new credentials into auth matrix...",
  "Overwriting neural password pathways...",
  "Compiling excuse generator for next time...",
  "Deploying sticky note reminder drone...",
  "Finalizing brain cell allocation...",
];

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

// ─── Matrix Rain Canvas ───
function MatrixRain({ opacity = 0.06 }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let animId;
    const chars = 'アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワヲン0123456789ABCDEF{}[]<>/\\|';
    const fontSize = 13;
    let columns, drops;

    function resize() {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      columns = Math.floor(canvas.width / fontSize);
      drops = Array(columns).fill(1).map(() => Math.random() * -100);
    }

    resize();
    window.addEventListener('resize', resize);

    function draw() {
      ctx.fillStyle = `rgba(0, 0, 0, 0.05)`;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      ctx.fillStyle = '#00ff41';
      ctx.font = `${fontSize}px monospace`;

      for (let i = 0; i < drops.length; i++) {
        const char = chars[Math.floor(Math.random() * chars.length)];
        const x = i * fontSize;
        const y = drops[i] * fontSize;

        ctx.globalAlpha = Math.random() * 0.5 + 0.2;
        ctx.fillText(char, x, y);

        if (y > canvas.height && Math.random() > 0.975) {
          drops[i] = 0;
        }
        drops[i]++;
      }
      ctx.globalAlpha = 1;
      animId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        opacity,
        pointerEvents: 'none',
        zIndex: 0,
      }}
    />
  );
}

// ─── Typewriter Hook ───
function useTypewriter(text, speed = 35, startDelay = 200) {
  const [displayed, setDisplayed] = useState('');
  const [isDone, setIsDone] = useState(false);

  useEffect(() => {
    setDisplayed('');
    setIsDone(false);
    let i = 0;
    const startTimeout = setTimeout(() => {
      const interval = setInterval(() => {
        if (i < text.length) {
          setDisplayed(text.slice(0, i + 1));
          i++;
        } else {
          setIsDone(true);
          clearInterval(interval);
        }
      }, speed);
      return () => clearInterval(interval);
    }, startDelay);
    return () => clearTimeout(startTimeout);
  }, [text, speed, startDelay]);

  return { displayed, isDone };
}

// ─── Blinking Cursor ───
function Cursor() {
  return (
    <span
      style={{
        display: 'inline-block',
        width: '8px',
        height: '1.1em',
        background: '#00ff41',
        marginLeft: '2px',
        verticalAlign: 'text-bottom',
        animation: 'terminalBlink 1s step-end infinite',
      }}
    />
  );
}

// ─── Scanline Overlay ───
function Scanlines() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 9999,
        background: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,255,65,0.015) 2px, rgba(0,255,65,0.015) 4px)',
        mixBlendMode: 'overlay',
      }}
    />
  );
}

export default function AdminRecoveryPage() {
  const [authenticated, setAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const [profiles, setProfiles] = useState([]);
  const [loading, setLoading] = useState(true);

  const [selectedUserId, setSelectedUserId] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [updateStatus, setUpdateStatus] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [recoveryCount, setRecoveryCount] = useState(0);

  // Carousel
  const [currentRoast, setCurrentRoast] = useState(0);

  // Hacking animation
  const [hackingStep, setHackingStep] = useState(-1);
  const [terminalLog, setTerminalLog] = useState([]);

  // Boot sequence
  const [booted, setBooted] = useState(false);
  const bootLines = [
    '[BOOT] Loading password recovery module...',
    '[BOOT] Scanning for forgetful users... found ' + (profiles.length || '?') + ' suspects',
    '[BOOT] Sarcasm engine initialized ✓',
    '[BOOT] Sympathy module... NOT FOUND',
    '[BOOT] System ready. Awaiting your command, admin.',
  ];
  const [visibleBootLines, setVisibleBootLines] = useState([]);

  useEffect(() => {
    if (!authenticated || booted) return;
    let i = 0;
    const interval = setInterval(() => {
      if (i < bootLines.length) {
        setVisibleBootLines(prev => [...prev, bootLines[i]]);
        i++;
      } else {
        clearInterval(interval);
        setTimeout(() => setBooted(true), 600);
      }
    }, 400);
    return () => clearInterval(interval);
  }, [authenticated, booted, profiles.length]);

  // Rotate roast
  useEffect(() => {
    if (!authenticated || !booted) return;
    const interval = setInterval(() => {
      setCurrentRoast(prev => (prev + 1) % ROAST_CAROUSEL.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [authenticated, booted]);

  const handleLogin = (e) => {
    e.preventDefault();
    if (password === 'arduino') {
      setAuthenticated(true);
      setError('');
    } else {
      const idx = Math.min(wrongAttempts, LOGIN_WRONG_PASSWORDS.length - 1);
      setError(LOGIN_WRONG_PASSWORDS[idx]);
      setWrongAttempts(prev => prev + 1);
    }
  };

  useEffect(() => {
    if (!authenticated) return;
    const fetchProfiles = async () => {
      const { data } = await supabase
        .from('profiles')
        .select('id, full_name, email')
        .order('full_name', { ascending: true });
      if (data) setProfiles(data);
      setLoading(false);
    };
    fetchProfiles();
  }, [authenticated]);

  const getSelectedUserName = useCallback(() => {
    const user = profiles.find(p => p.id === selectedUserId);
    return user?.full_name || 'this person';
  }, [selectedUserId, profiles]);

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    setUpdateStatus('');
    setTerminalLog([]);

    if (!selectedUserId) {
      setUpdateStatus(`${randomFrom(ERROR_NO_USER)}`);
      return;
    }
    if (!newPassword || newPassword.length < 6) {
      setUpdateStatus(`${randomFrom(ERROR_SHORT_PASSWORD)}`);
      return;
    }

    setIsUpdating(true);

    // Fake hacking animation
    const steps = HACKING_STEPS.sort(() => Math.random() - 0.5).slice(0, 5);
    for (let i = 0; i < steps.length; i++) {
      setHackingStep(i);
      setTerminalLog(prev => [...prev, `[${String(i + 1).padStart(2, '0')}] ${steps[i]}`]);
      await new Promise(r => setTimeout(r, 500 + Math.random() * 400));
    }

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
        setTerminalLog(prev => [...prev, `[OK] ${randomFrom(SUCCESS_MESSAGES)}`]);
        setUpdateStatus('success');
        setNewPassword('');
        setRecoveryCount(prev => prev + 1);
      } else {
        setTerminalLog(prev => [...prev, `[FAIL] ${data.error || 'Unknown error'}`]);
        setUpdateStatus('error');
      }
    } catch (err) {
      setTerminalLog(prev => [...prev, '[FAIL] Network error. The matrix has you.']);
      setUpdateStatus('error');
    } finally {
      setIsUpdating(false);
      setHackingStep(-1);
    }
  };

  const roastText = ROAST_CAROUSEL[currentRoast];
  const { displayed: typedRoast, isDone: roastDone } = useTypewriter(roastText, 30, 0);

  // ─── Inline styles ───
  const terminalStyles = `
    @keyframes terminalBlink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0; }
    }
    @keyframes glitchShake {
      0% { transform: translate(0); }
      20% { transform: translate(-2px, 1px); }
      40% { transform: translate(2px, -1px); }
      60% { transform: translate(-1px, 2px); }
      80% { transform: translate(1px, -2px); }
      100% { transform: translate(0); }
    }
    @keyframes fadeSlideIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }
    @keyframes progressPulse {
      0%, 100% { opacity: 0.6; }
      50% { opacity: 1; }
    }
    @keyframes bootFlicker {
      0%, 95%, 100% { opacity: 1; }
      96% { opacity: 0.3; }
      97% { opacity: 0.8; }
      98% { opacity: 0.2; }
      99% { opacity: 0.9; }
    }
    .terminal-card {
      background: rgba(0, 10, 2, 0.85);
      border: 1px solid rgba(0, 255, 65, 0.2);
      border-radius: 12px;
      box-shadow: 0 0 30px rgba(0, 255, 65, 0.05), inset 0 0 60px rgba(0, 0, 0, 0.3);
      backdrop-filter: blur(8px);
    }
    .terminal-input {
      background: rgba(0, 20, 5, 0.9) !important;
      border: 1px solid rgba(0, 255, 65, 0.2) !important;
      color: #00ff41 !important;
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace !important;
      border-radius: 8px;
      padding: 12px 14px;
      font-size: 13px;
      width: 100%;
      outline: none;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .terminal-input:focus {
      border-color: rgba(0, 255, 65, 0.5) !important;
      box-shadow: 0 0 15px rgba(0, 255, 65, 0.1);
    }
    .terminal-input::placeholder {
      color: rgba(0, 255, 65, 0.25);
      font-style: italic;
    }
    .terminal-input option {
      background: #000a02;
      color: #00ff41;
    }
    .terminal-btn {
      background: rgba(0, 255, 65, 0.12);
      border: 1px solid rgba(0, 255, 65, 0.3);
      color: #00ff41;
      font-family: 'JetBrains Mono', 'Fira Code', 'Courier New', monospace;
      font-weight: 700;
      font-size: 13px;
      padding: 12px 20px;
      border-radius: 8px;
      cursor: pointer;
      width: 100%;
      transition: all 0.2s;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .terminal-btn:hover:not(:disabled) {
      background: rgba(0, 255, 65, 0.2);
      box-shadow: 0 0 20px rgba(0, 255, 65, 0.15);
      border-color: rgba(0, 255, 65, 0.5);
    }
    .terminal-btn:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
    .log-line {
      animation: fadeSlideIn 0.3s ease forwards;
    }
    .glitch-text {
      animation: glitchShake 0.3s ease;
    }
    .boot-line {
      animation: fadeSlideIn 0.4s ease forwards;
    }
  `;

  // ─── Login Screen ───
  if (!authenticated) {
    return (
      <>
        <style>{terminalStyles}</style>
        <Scanlines />
        <div
          className="min-h-screen flex flex-col relative overflow-hidden"
          style={{
            background: '#000a02',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
          }}
        >
          <MatrixRain opacity={0.08} />
          <div className="flex-1 flex items-center justify-center px-4 relative z-10">
            <form onSubmit={handleLogin} className="w-full max-w-md">
              <div className="terminal-card p-8">
                {/* Terminal title bar */}
                <div className="flex items-center gap-2 mb-6 pb-4" style={{ borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ff5f57' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ffbd2e' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#28c840' }} />
                  <span className="ml-3 text-xs" style={{ color: 'rgba(0,255,65,0.4)' }}>
                    admin@champions:~/recovery
                  </span>
                </div>

                <div className="mb-6">
                  <div className="text-xs mb-2" style={{ color: 'rgba(0,255,65,0.5)' }}>
                    {'>'} SYSTEM MESSAGE:
                  </div>
                  <p className="text-sm leading-relaxed" style={{ color: '#00ff41' }}>
                    Someone forgot their password again.
                    <br />You know the drill. Authenticate yourself.
                  </p>
                  <p className="text-xs mt-2 italic" style={{ color: 'rgba(0,255,65,0.3)' }}>
                    // Prove you have at least one functioning brain cell
                  </p>
                </div>

                <div className="mb-1 text-xs" style={{ color: 'rgba(0,255,65,0.5)' }}>
                  {'>'} ENTER PASSPHRASE:
                </div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="terminal-input mb-4"
                  autoFocus
                />

                {error && (
                  <div className="glitch-text mb-4 p-3 rounded-lg text-xs font-bold" style={{
                    background: 'rgba(255,0,0,0.1)',
                    border: '1px solid rgba(255,0,0,0.3)',
                    color: '#ff4444',
                  }}>
                    ⚠ {error}
                  </div>
                )}

                <button type="submit" className="terminal-btn">
                  {wrongAttempts === 0
                    ? '> AUTHENTICATE'
                    : wrongAttempts < 3
                      ? '> RETRY_AUTH.exe'
                      : '> PLEASE_JUST_GET_IT_RIGHT.exe'}
                </button>

                {wrongAttempts >= 3 && (
                  <p className="text-[10px] text-center mt-4 italic" style={{ color: 'rgba(0,255,65,0.25)' }}>
                    // Maybe you need a password recovery page for this password recovery page.
                  </p>
                )}
              </div>
            </form>
          </div>
        </div>
      </>
    );
  }

  // ─── Boot Sequence ───
  if (!booted) {
    return (
      <>
        <style>{terminalStyles}</style>
        <Scanlines />
        <div
          className="min-h-screen flex flex-col relative overflow-hidden"
          style={{
            background: '#000a02',
            fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
            animation: 'bootFlicker 2s ease-in-out',
          }}
        >
          <MatrixRain opacity={0.04} />
          <div className="flex-1 flex items-center justify-center px-4 relative z-10">
            <div className="w-full max-w-lg">
              <div className="terminal-card p-8">
                <div className="text-xs mb-4 font-bold" style={{ color: 'rgba(0,255,65,0.6)' }}>
                  ╔══════════════════════════════════════╗
                  <br />║ &nbsp; PASSWORD RECOVERY SYSTEM v4.2.0 &nbsp; ║
                  <br />╚══════════════════════════════════════╝
                </div>
                <div className="space-y-2">
                  {visibleBootLines.map((line, i) => (
                    <div key={i} className="boot-line text-xs" style={{
                      color: line.includes('NOT FOUND') ? '#ff4444' : '#00ff41',
                      opacity: 0.8,
                    }}>
                      {line}
                    </div>
                  ))}
                  <Cursor />
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ─── Main Page ───
  return (
    <>
      <style>{terminalStyles}</style>
      <Scanlines />
      <div
        className="min-h-screen flex flex-col relative overflow-hidden"
        style={{
          background: '#000a02',
          fontFamily: "'JetBrains Mono', 'Fira Code', 'Courier New', monospace",
        }}
      >
        <MatrixRain opacity={0.04} />
        <Header />
        <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-8 relative z-10">

          {/* Header */}
          <div className="mb-6">
            <h1 className="text-xl font-bold tracking-tight mb-1" style={{ color: '#00ff41' }}>
              {'>'} THE PASSWORD GRAVEYARD_
            </h1>
            <p className="text-xs" style={{ color: 'rgba(0,255,65,0.5)' }}>
              // Where forgotten passwords come to die and new ones are born (only to be forgotten again)
            </p>
            {recoveryCount > 0 && (
              <p className="text-xs mt-2 font-bold" style={{ color: '#ffbd2e' }}>
                [STATS] Passwords recovered this session: {recoveryCount} — You're practically IT support now.
              </p>
            )}
          </div>

          {/* Sarcasm Terminal */}
          <div className="terminal-card p-5 mb-6">
            <div className="flex items-center gap-2 mb-3 pb-2" style={{ borderBottom: '1px solid rgba(0,255,65,0.08)' }}>
              <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#28c840' }} />
              <span className="text-[10px] uppercase tracking-widest" style={{ color: 'rgba(0,255,65,0.4)' }}>
                sarcasm_engine.exe — PID {2048 + currentRoast}
              </span>
              <span className="ml-auto text-[10px]" style={{ color: 'rgba(0,255,65,0.25)' }}>
                [{currentRoast + 1}/{ROAST_CAROUSEL.length}]
              </span>
            </div>
            <div className="text-xs" style={{ color: 'rgba(0,255,65,0.5)' }}>
              {'>'} stdout:
            </div>
            <p className="text-sm leading-relaxed mt-1" style={{ color: '#00ff41', minHeight: '2.5em' }}>
              {typedRoast}{!roastDone && <Cursor />}
            </p>
          </div>

          {/* Form */}
          {loading ? (
            <div className="terminal-card p-8 text-center">
              <div className="text-xs" style={{ color: '#00ff41', animation: 'progressPulse 1.5s infinite' }}>
                [LOADING] Scanning user database for amnesia patients...
              </div>
            </div>
          ) : (
            <div className="terminal-card p-6 sm:p-8">
              {/* Terminal title bar */}
              <div className="flex items-center gap-2 mb-6 pb-3" style={{ borderBottom: '1px solid rgba(0,255,65,0.1)' }}>
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ff5f57' }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#ffbd2e' }} />
                <div style={{ width: 7, height: 7, borderRadius: '50%', background: '#28c840' }} />
                <span className="ml-2 text-[10px]" style={{ color: 'rgba(0,255,65,0.4)' }}>
                  password_recovery.sh
                </span>
              </div>

              <div className="text-center mb-6">
                <p className="text-[11px] italic" style={{ color: 'rgba(0,255,65,0.35)' }}>
                  // "With great power comes great annoyance" — Every admin, ever
                </p>
              </div>

              <form onSubmit={handleUpdatePassword} className="space-y-5">

                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(0,255,65,0.7)' }}>
                    {'>'} SELECT TARGET:
                  </label>
                  <select
                    value={selectedUserId}
                    onChange={(e) => setSelectedUserId(e.target.value)}
                    className="terminal-input"
                  >
                    <option value="">-- pick the offender --</option>
                    {profiles.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.full_name || 'Anonymous (somehow made it worse)'} {p.email ? `(${p.email})` : ''}
                      </option>
                    ))}
                  </select>
                  {selectedUserId && (
                    <p className="text-[11px] mt-1.5 italic" style={{ color: 'rgba(0,255,65,0.4)' }}>
                      // target_acquired: "{getSelectedUserName()}" — Why am I not surprised.
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold mb-2" style={{ color: 'rgba(0,255,65,0.7)' }}>
                    {'>'} NEW_CREDENTIALS (they'll definitely forget this too):
                  </label>
                  <input
                    type="text"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="inject new password here..."
                    className="terminal-input"
                  />
                  <p className="text-[10px] mt-1.5" style={{ color: 'rgba(0,255,65,0.3)' }}>
                    // min 6 chars — "123456" counts technically but morally? No.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isUpdating}
                  className="terminal-btn"
                >
                  {isUpdating
                    ? '> EXECUTING...'
                    : selectedUserId
                      ? `> RESURRECT("${getSelectedUserName()}")`
                      : '> EXECUTE_RECOVERY.exe'
                  }
                </button>

                {/* Terminal Log Output */}
                {terminalLog.length > 0 && (
                  <div className="mt-4 p-4 rounded-lg" style={{
                    background: 'rgba(0, 10, 2, 0.95)',
                    border: '1px solid rgba(0,255,65,0.15)',
                  }}>
                    <div className="text-[10px] uppercase tracking-widest mb-2 font-bold" style={{ color: 'rgba(0,255,65,0.4)' }}>
                      {'>'} execution_log:
                    </div>
                    <div className="space-y-1">
                      {terminalLog.map((line, i) => (
                        <div
                          key={i}
                          className="log-line text-xs"
                          style={{
                            color: line.includes('[OK]')
                              ? '#28c840'
                              : line.includes('[FAIL]')
                                ? '#ff4444'
                                : '#00ff41',
                            opacity: line.includes('[OK]') || line.includes('[FAIL]') ? 1 : 0.7,
                            fontWeight: line.includes('[OK]') || line.includes('[FAIL]') ? 700 : 400,
                          }}
                        >
                          {line}
                        </div>
                      ))}
                      {isUpdating && <Cursor />}
                    </div>
                  </div>
                )}

                {/* Status feedback (validation errors only) */}
                {updateStatus && updateStatus !== 'success' && updateStatus !== 'error' && (
                  <div className="mt-3 p-3 rounded-lg text-xs font-bold" style={{
                    background: 'rgba(255,0,0,0.08)',
                    border: '1px solid rgba(255,0,0,0.25)',
                    color: '#ff4444',
                  }}>
                    ⚠ {updateStatus}
                  </div>
                )}
              </form>

              {/* Footer */}
              <div className="mt-8 pt-4 text-center" style={{ borderTop: '1px solid rgba(0,255,65,0.08)' }}>
                <p className="text-[10px]" style={{ color: 'rgba(0,255,65,0.2)' }}>
                  // 🫡 Thank you for your service. Nobody will acknowledge this. EOF
                </p>
              </div>
            </div>
          )}

        </main>
      </div>
    </>
  );
}
