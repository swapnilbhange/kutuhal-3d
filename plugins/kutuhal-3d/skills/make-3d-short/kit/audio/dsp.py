"""dsp.py — synthesis primitives shared by sfx.py, music.py and mix.py (numpy/scipy only)."""
import numpy as np, scipy.signal as ss
SR = 48000
_rng = np.random.default_rng(11)
def seed(s): 
    global _rng; _rng = np.random.default_rng(s)
def rng(): return _rng
def T(d): return np.arange(int(d * SR)) / SR
def midi(m): return 440.0 * 2 ** ((m - 69) / 12)
def lp(x, f, order=2): return ss.sosfilt(ss.butter(order, min(f, SR / 2 - 100), 'low', fs=SR, output='sos'), x)
def hp(x, f, order=2): return ss.sosfilt(ss.butter(order, f, 'high', fs=SR, output='sos'), x)
def bp(x, f1, f2, order=2): return ss.sosfilt(ss.butter(order, [f1, min(f2, SR / 2 - 100)], 'band', fs=SR, output='sos'), x)
def noise(d): return _rng.standard_normal(int(d * SR)).astype(np.float64)
def fade(x, a=0.005, r=0.02):
    x = x.copy(); n = len(x); na = min(n, int(a * SR)); nr = min(n, int(r * SR))
    if na: x[:na] *= np.linspace(0, 1, na)
    if nr: x[-nr:] *= np.linspace(1, 0, nr)
    return x
def pitch_shift(x, k):
    """resample by factor k (k>1 = higher/faster)"""
    if abs(k - 1) < 1e-3: return x
    n = int(len(x) / k); return np.interp(np.linspace(0, len(x) - 1, n), np.arange(len(x)), x)

class Bus:
    def __init__(s, n): s.n = n; s.L = np.zeros(n); s.R = np.zeros(n)
    def put(s, sig, t, g=1.0, pan=0.0):
        i = int(t * SR)
        if i >= s.n or i + len(sig) <= 0: return
        a = max(0, -i); b = min(len(sig), s.n - i); sig = sig[a:b] * g; i = max(i, 0)
        ang = (pan + 1) * np.pi / 4
        s.L[i:i + len(sig)] += sig * np.cos(ang); s.R[i:i + len(sig)] += sig * np.sin(ang)

# ---------------- instruments ----------------
def pad(freqs, d, a=0.8, r=1.2, cut=1800, det=0.004, g=1.0):
    t = T(d + r); out = np.zeros_like(t)
    for f in freqs:
        for dt in (-det, 0, det): out += ss.sawtooth(2 * np.pi * f * (1 + dt) * t + _rng.random() * 6.28) * 0.18
    out = lp(out, cut, 2); env = np.minimum(1, t / a) * np.where(t > d, np.clip(1 - (t - d) / r, 0, 1), 1); return out * env * g
def strings(freqs, d, a=0.6, r=1.0, cut=2600, g=1.0):
    t = T(d + r); out = np.zeros_like(t)
    for f in freqs:
        vib = 1 + 0.004 * np.sin(2 * np.pi * 5.3 * t + _rng.random() * 6) * np.minimum(1, t / 0.8)
        for dt in (-0.003, 0.0, 0.003): out += ss.sawtooth(2 * np.pi * np.cumsum(f * (1 + dt) * vib) / SR) * 0.14
    out = lp(out, cut, 2); env = np.minimum(1, t / a) * np.where(t > d, np.clip(1 - (t - d) / r, 0, 1), 1); return out * env * g
def pluck(f, d=1.2, bright=1.0, g=1.0, nh=9):
    t = T(d); out = np.zeros_like(t)
    for k in range(1, nh + 1): out += (1.0 / k ** 1.1) * np.exp(-t * (2.2 + 2.0 * k / bright)) * np.sin(2 * np.pi * f * k * t + k)
    return out * (1 - np.exp(-t * 400)) * g * 0.5
def bell(f, d=2.0, g=1.0):
    t = T(d); return np.sin(2 * np.pi * f * t + 2.5 * np.exp(-3 * t) * np.sin(2 * np.pi * f * 3.5 * t)) * np.exp(-t * 1.6) * g * 0.35
def kick(g=1.0):
    t = T(0.45); f = 48 + 110 * np.exp(-t * 32); return (np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 8) + 0.3 * noise(0.45) * np.exp(-t * 90)) * g
def snare(g=1.0):
    t = T(0.3); n = bp(noise(0.3), 1500, 7000) * np.exp(-t * 16); return (n * 0.8 + np.sin(2 * np.pi * 190 * t) * np.exp(-t * 28) * 0.5) * g
def hat(g=1.0, open_=False):
    d = 0.25 if open_ else 0.06; t = T(d); return hp(noise(d), 7000) * np.exp(-t * (14 if open_ else 70)) * g * 0.5
def sub(f, d, g=1.0, a=0.3, r=0.6):
    t = T(d + r); env = np.minimum(1, t / a) * np.where(t > d, np.clip(1 - (t - d) / r, 0, 1), 1); return np.sin(2 * np.pi * f * t) * env * g
def bass(f, d=0.5, g=1.0):
    t = T(d); out = lp(ss.sawtooth(2 * np.pi * f * t), 380) * np.exp(-t * 3.5) + 0.6 * np.sin(2 * np.pi * f * t) * np.exp(-t * 2.5); return out * g * (1 - np.exp(-t * 300))
def riser(d, f0=400, f1=9000, g=1.0):
    n = noise(d); blocks = 40; out = np.zeros_like(n); bl = len(n) // blocks
    for i in range(blocks):
        fc = f0 * (f1 / f0) ** (i / blocks); out[i * bl:(i + 1) * bl] = bp(n[i * bl:(i + 1) * bl], fc, min(fc * 1.8, 20000), 2)
    return out * (T(d) / d) ** 2 * g * 3
def whoosh(d=0.5, f0=500, f1=5000, g=1.0, up=True):
    n = noise(d); blocks = 25; out = np.zeros_like(n); bl = len(n) // blocks
    for i in range(blocks):
        k = i / blocks if up else 1 - i / blocks; fc = f0 * (f1 / f0) ** k; out[i * bl:(i + 1) * bl] = bp(n[i * bl:(i + 1) * bl], fc, min(fc * 2.2, 20000), 2)
    return out * np.sin(np.pi * np.clip(T(d) / d, 0, 1)) ** 2 * g * 3
def impact(g=1.0, d=2.2):
    t = T(d); f = 38 + 80 * np.exp(-t * 6); body = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 2.2)
    return (body + lp(noise(d), 1500) * np.exp(-t * 7) * 0.5 + hp(noise(d), 3000) * np.exp(-t * 18) * 0.2) * g
def sparkle(d=1.4, g=1.0, base=1800):
    out = np.zeros(int(d * SR))
    for _ in range(14):
        t0 = _rng.random() * d * 0.7; f = base * (1.2 + _rng.random() * 2.2) * (1 + 0.5 * t0 / d); b = bell(f, 0.5, 0.5); i0 = int(t0 * SR); n = min(len(b), len(out) - i0); out[i0:i0 + n] += b[:n] * np.exp(-t0 * 0.8)
    return out * g
