import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createRoot } from 'react-dom/client';
import './styles.css';

const api = {
  async me() {
    const res = await fetch('/api/me', { credentials: 'include' });
    if (!res.ok) return null;
    const data = await res.json();
    return data.user;
  },
  async login(email, password) {
    const res = await fetch('/api/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  async register(username, email, password, confirm_password) {
    const res = await fetch('/api/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ username, email, password, confirm_password })
    });
    return res.json();
  },
  async logout() {
    await fetch('/api/logout', { method: 'POST', credentials: 'include' });
  },
  async convert(file, mode) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('mode', mode);
    const res = await fetch('/api/convert', {
      method: 'POST',
      credentials: 'include',
      body: formData
    });
    return res.json();
  }
};

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('login');
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    api.me()
      .then((currentUser) => {
        if (currentUser) {
          setUser(currentUser);
          setView('app');
        }
      })
      .finally(() => setCheckingAuth(false));
  }, []);

  async function logout() {
    await api.logout();
    setUser(null);
    setView('login');
  }

  if (checkingAuth) return <div className="screen-center">Loading VoiceDoc...</div>;

  if (!user && view === 'register') {
    return <RegisterPage onSwitch={() => setView('login')} onAuthed={(nextUser) => {
      setUser(nextUser);
      setView('app');
    }} />;
  }

  if (!user) {
    return <LoginPage onSwitch={() => setView('register')} onAuthed={(nextUser) => {
      setUser(nextUser);
      setView('app');
    }} />;
  }

  return <Dashboard user={user} onLogout={logout} />;
}

function LoginPage({ onSwitch, onAuthed }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }
    setLoading(true);
    const data = await api.login(email, password);
    setLoading(false);
    if (data.success) onAuthed(data.user);
    else setError(data.error || 'Login failed.');
  }

  return (
    <AuthShell title="Welcome back" subtitle="Sign in to continue converting documents to speech">
      <form className="auth-form" onSubmit={submit}>
        {error && <div className="error-box">{error}</div>}
        <label>
          Email
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" />
        </label>
        <label>
          Password
          <div className="password-row">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
            />
            <button type="button" onClick={() => setShowPassword((value) => !value)}>
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </label>
        <button className="primary-btn" disabled={loading}>{loading ? 'Signing in...' : 'Sign In'}</button>
      </form>
      <p className="auth-switch">Do not have an account? <button onClick={onSwitch}>Create one</button></p>
    </AuthShell>
  );
}

function RegisterPage({ onSwitch, onAuthed }) {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const strength = useMemo(() => {
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  }, [password]);

  async function submit(event) {
    event.preventDefault();
    setError('');
    if (!username || !email || !password || !confirmPassword) {
      setError('Please fill in all fields.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    setLoading(true);
    const data = await api.register(username, email, password, confirmPassword);
    setLoading(false);
    if (data.success) onAuthed(data.user);
    else setError(data.error || 'Registration failed.');
  }

  return (
    <AuthShell title="Create account" subtitle="Join VoiceDoc and start converting documents to speech">
      <form className="auth-form" onSubmit={submit}>
        {error && <div className="error-box">{error}</div>}
        <label>Username<input value={username} onChange={(e) => setUsername(e.target.value)} placeholder="cooluser123" /></label>
        <label>Email<input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" /></label>
        <label>Password<input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Minimum 6 characters" /></label>
        {password && <div className="pw-strength"><span style={{ width: `${strength * 20}%` }} /></div>}
        <label>Confirm Password<input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Repeat password" /></label>
        <button className="primary-btn" disabled={loading}>{loading ? 'Creating...' : 'Create Account'}</button>
      </form>
      <p className="auth-switch">Already have an account? <button onClick={onSwitch}>Sign in</button></p>
    </AuthShell>
  );
}

function AuthShell({ title, subtitle, children }) {
  return (
    <main className="auth-page">
      <div className="auth-brand"><span className="brand-mark">VD</span><span>VoiceDoc</span></div>
      <section className="auth-card">
        <h1>{title}</h1>
        <p>{subtitle}</p>
        {children}
      </section>
    </main>
  );
}

function Dashboard({ user, onLogout }) {
  const fileInputRef = useRef(null);
  const resultRef = useRef(null);
  const audioRef = useRef(null);
  const [currentUser, setCurrentUser] = useState(user);
  const [theme, setTheme] = useState(() => localStorage.getItem('voicedoc-theme') || 'light');
  const [mode, setMode] = useState('text');
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeStep, setActiveStep] = useState(0);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [result, setResult] = useState(null);
  const [playing, setPlaying] = useState(false);
  const [duration, setDuration] = useState(0);
  const [currentTime, setCurrentTime] = useState(0);
  const [volume, setVolume] = useState(1);
  const [speed, setSpeed] = useState(1);

  useEffect(() => {
    document.documentElement.dataset.theme = theme;
    localStorage.setItem('voicedoc-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (!toast) return undefined;
    const timer = setTimeout(() => setToast(''), 2500);
    return () => clearTimeout(timer);
  }, [toast]);

  useEffect(() => {
    if (!loading) return undefined;
    setActiveStep(1);
    const timers = [
      setTimeout(() => setActiveStep(2), 700),
      setTimeout(() => setActiveStep(3), 1400)
    ];
    return () => timers.forEach(clearTimeout);
  }, [loading]);

  const fileLabel = useMemo(() => {
    if (!file) return '';
    return `${file.name} - ${(file.size / 1024).toFixed(1)} KB - ${file.type.split('/')[1]?.toUpperCase() || 'IMAGE'}`;
  }, [file]);

  function showToast(message) {
    setToast(message);
  }

  function pickFile(nextFile) {
    setError('');
    setResult(null);
    if (!nextFile) return;
    const allowed = ['image/jpeg', 'image/png', 'image/bmp'];
    if (!allowed.includes(nextFile.type)) {
      setError('Please upload a JPG, PNG, or BMP image.');
      return;
    }
    if (nextFile.size > 20 * 1024 * 1024) {
      setError('File too large. Max 20 MB.');
      return;
    }
    if (preview) URL.revokeObjectURL(preview);
    setFile(nextFile);
    setPreview(URL.createObjectURL(nextFile));
  }

  function removeFile() {
    if (preview) URL.revokeObjectURL(preview);
    setFile(null);
    setPreview(null);
    setResult(null);
    setError('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  async function convert() {
    if (!file || loading) return;
    setLoading(true);
    setError('');
    setResult(null);
    setPlaying(false);
    const data = await api.convert(file, mode);
    setLoading(false);
    if (data.success) {
      setActiveStep(3);
      setResult(data);
      api.me().then((freshUser) => {
        if (freshUser) setCurrentUser(freshUser);
      });
      showToast('Conversion complete.');
      setTimeout(() => resultRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 100);
    } else {
      setError(data.error || 'Conversion failed.');
    }
  }

  async function copyText(text, label) {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    showToast(`${label} copied.`);
  }

  function downloadText() {
    if (!result?.text) return;
    const blob = new Blob([result.text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = 'voicedoc-output.txt';
    anchor.click();
    URL.revokeObjectURL(url);
  }

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.paused) {
      audio.play().catch((err) => setError(`Audio play failed: ${err.message}`));
    } else {
      audio.pause();
    }
  }

  function seek(percent) {
    const audio = audioRef.current;
    if (!audio || !duration) return;
    audio.currentTime = (Number(percent) / 100) * duration;
  }

  function changeVolume(nextVolume) {
    const value = Number(nextVolume) / 100;
    setVolume(value);
    if (audioRef.current) audioRef.current.volume = value;
  }

  function changeSpeed(nextSpeed) {
    const value = Number(nextSpeed);
    setSpeed(value);
    if (audioRef.current) audioRef.current.playbackRate = value;
  }

  const progress = duration ? (currentTime / duration) * 100 : 0;

  return (
    <main className="app-page">
      <nav className="navbar">
        <div className="nav-brand"><span className="brand-mark">VD</span><span>VoiceDoc</span></div>
        <div className="nav-right">
          <span className="nav-tagline">Document to Speech</span>
          <button className="small-btn" onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>{theme === 'dark' ? 'Light' : 'Dark'}</button>
          <ProfileMenu user={currentUser} onLogout={onLogout} />
        </div>
      </nav>

      <section className="hero">
        <div className="hero-bg-glow" />
        <h1>Turn Any Doc Into <span>Voice</span></h1>
        <p>Upload a photo of printed text. VoiceDoc extracts it and speaks it aloud.</p>
      </section>

      <section className="container">
        <div className="upload-card glass-card">
          <div
            className={`drop-zone ${dragging ? 'drag-over' : ''}`}
            role="button"
            tabIndex="0"
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              pickFile(event.dataTransfer.files[0]);
            }}
          >
            <div className="drop-icon">DOC</div>
            <p className="drop-title">Drop your document image here</p>
            <p className="drop-sub">or click to browse</p>
            <p className="drop-formats">Supports JPG - PNG - BMP</p>
            <input ref={fileInputRef} type="file" accept=".jpg,.jpeg,.png,.bmp" hidden onChange={(event) => pickFile(event.target.files[0])} />
          </div>

          {preview && (
            <div className="preview-area">
              <img className="preview-img" src={preview} alt="Document preview" />
              <div className="preview-meta"><strong>{file.name}</strong><br />{fileLabel}</div>
              <button className="remove-btn" onClick={removeFile}>Remove</button>
            </div>
          )}

          <div className="mode-toggle">
            <button className={`mode-btn ${mode === 'text' ? 'active' : ''}`} onClick={() => setMode('text')}>Text Document</button>
            <button className={`mode-btn ${mode === 'math' ? 'active' : ''}`} onClick={() => setMode('math')}>Math Equation</button>
          </div>

          <button className="convert-btn" disabled={!file || loading} onClick={convert}>{loading ? 'Converting...' : 'Convert to Speech'}</button>
          {error && <div className="error-box">{error}</div>}
        </div>

        {loading && <LoadingPanel activeStep={activeStep} />}

        {result && (
          <div className="result-panel glass-card" ref={resultRef}>
            <div className="result-header">
              <h2>Conversion Complete</h2>
              <div className="result-stats">
                <span>{result.mode === 'math' ? 'Math Mode' : 'Text Mode'}</span>
                <span>{result.word_count} words</span>
                <span>{result.char_count} chars</span>
              </div>
            </div>

            <TextBlock title="Extracted Text" value={result.text} onCopy={() => copyText(result.text, 'Text')} />
            {result.latex && <TextBlock title="Raw OCR Text" value={result.latex} onCopy={() => copyText(result.latex, 'Raw text')} />}

            <div className="audio-section">
              <h3>Listen</h3>
              <div className="custom-player">
                <button className="play-pause-btn" onClick={togglePlay}>{playing ? 'Pause' : 'Play'}</button>
                <div className="player-right">
                  <input className="seekbar" type="range" value={progress} min="0" max="100" step="0.01" onChange={(event) => seek(event.target.value)} />
                  <div className="player-bottom-row">
                    <span className="time-display">{formatTime(currentTime)} / {formatTime(duration)}</span>
                    <div className="speed-volume-wrap">
                      <select value={speed} onChange={(event) => changeSpeed(event.target.value)}>
                        <option value="0.75">0.75x</option>
                        <option value="1">1x</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2x</option>
                      </select>
                      <input type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={(event) => changeVolume(event.target.value)} />
                    </div>
                  </div>
                </div>
              </div>
              <audio
                ref={audioRef}
                src={result.audio_url}
                preload="auto"
                onLoadedMetadata={(event) => setDuration(event.currentTarget.duration || 0)}
                onTimeUpdate={(event) => setCurrentTime(event.currentTarget.currentTime || 0)}
                onPlay={() => setPlaying(true)}
                onPause={() => setPlaying(false)}
                onEnded={() => setPlaying(false)}
              />
            </div>

            <div className="download-row">
              <a href={result.audio_url} download="voicedoc-output.mp3">Download MP3</a>
              <button onClick={downloadText}>Download TXT</button>
            </div>
          </div>
        )}

        <section className="how-section">
          <h2>How It Works</h2>
          <div className="steps-grid">
            <InfoCard title="Upload" text="Choose a clear document image." />
            <InfoCard title="Preprocess" text="OpenCV cleans the image for OCR." />
            <InfoCard title="Extract" text="Tesseract reads the printed text." />
            <InfoCard title="Speak" text="gTTS creates the audio file." />
          </div>
        </section>
      </section>

      {toast && <div className="toast">{toast}</div>}
    </main>
  );
}

function ProfileMenu({ user, onLogout }) {
  const [open, setOpen] = useState(false);
  const initials = getInitials(user?.username);
  const stats = user?.stats || {};
  const lastConversion = stats.last_conversion ? formatDate(stats.last_conversion) : 'No conversions yet';

  return (
    <div className="profile-wrap">
      <button className={`profile-btn ${open ? 'open' : ''}`} onClick={() => setOpen((value) => !value)} aria-expanded={open}>
        <span className="profile-avatar">{initials}</span>
        <span className="profile-name">{user?.username}</span>
        <span className="profile-arrow">v</span>
      </button>

      {open && (
        <div className="profile-dropdown">
          <div className="dropdown-header">
            <span className="dropdown-avatar">{initials}</span>
            <div className="dropdown-info">
              <strong>{user?.username}</strong>
              <span>{user?.is_admin ? 'Admin Account' : 'User Account'}</span>
            </div>
          </div>

          <div className="dropdown-divider" />

          <div className="profile-detail">
            <span>Email</span>
            <strong>{user?.email}</strong>
          </div>
          <div className="profile-detail">
            <span>User ID</span>
            <strong>#{user?.id}</strong>
          </div>

          <div className="profile-stats">
            <div><strong>{stats.total_conversions ?? 0}</strong><span>Conversions</span></div>
            <div><strong>{stats.total_words ?? 0}</strong><span>Words</span></div>
            <div><strong>{stats.total_chars ?? 0}</strong><span>Chars</span></div>
          </div>

          <div className="profile-detail">
            <span>Last conversion</span>
            <strong>{lastConversion}</strong>
          </div>

          <button className="dropdown-logout" onClick={onLogout}>Logout</button>
        </div>
      )}
    </div>
  );
}

function LoadingPanel({ activeStep }) {
  const steps = ['Preprocessing Image', 'Running OCR', 'Generating Audio'];
  return (
    <div className="loading-panel">
      {steps.map((step, index) => {
        const number = index + 1;
        const status = activeStep > number ? 'done' : activeStep === number ? 'active' : 'pending';
        return <div className={`step-item ${status}`} key={step}><span>{status === 'done' ? 'OK' : number}</span><div><strong>{step}</strong><small>{status === 'pending' ? 'Waiting' : 'Working'}</small></div></div>;
      })}
    </div>
  );
}

function TextBlock({ title, value, onCopy }) {
  return (
    <div className="text-section">
      <div className="section-header"><h3>{title}</h3><button className="copy-btn" onClick={onCopy}>Copy</button></div>
      <div className="text-box">{value}</div>
    </div>
  );
}

function InfoCard({ title, text }) {
  return <div className="how-card"><h4>{title}</h4><p>{text}</p></div>;
}

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return '0:00';
  const minutes = Math.floor(seconds / 60);
  const remaining = Math.floor(seconds % 60);
  return `${minutes}:${remaining.toString().padStart(2, '0')}`;
}

function getInitials(name = '') {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('') || 'U';
}

function formatDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

createRoot(document.getElementById('root')).render(<App />);
