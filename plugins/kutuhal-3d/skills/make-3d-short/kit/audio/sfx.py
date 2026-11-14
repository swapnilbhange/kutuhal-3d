"""sfx.py — sound-effect and ambience library.   python audio/sfx.py --list | --demo build/sfx_demo"""
import sys, os, numpy as np
from dsp import *
import dsp

def _norm(x, peak=0.9): m = np.abs(x).max(); return x / m * peak if m > 1e-9 else x

def e_whoosh(d=0.5, **k): return whoosh(d, 500, 5000, 0.4)
def e_swish(d=0.25, **k): return whoosh(d, 1500, 7000, 0.3)
def e_impact(d=1.6, **k): return impact(1.0, d)
def e_hit(**k): t = T(0.35); return (lp(noise(0.35), 1200) * np.exp(-t * 30) + np.sin(2 * np.pi * 90 * t) * np.exp(-t * 18)) * 1.0
def e_riser(d=2.0, **k): return riser(d, 300, 8000, 0.5)
def e_thud(**k): t = T(0.3); return lp(noise(0.3), 600) * np.exp(-t * 25) * 0.9 + np.sin(2 * np.pi * 110 * t) * np.exp(-t * 20)
def e_footstep(**k):
    t = T(0.18); return np.sin(2 * np.pi * 85 * t) * np.exp(-t * 38) * 0.8 + lp(noise(0.18), 1800) * np.exp(-t * 60) * 0.6
def e_tick(**k): t = T(0.05); return np.sin(2 * np.pi * 3100 * t) * np.exp(-t * 160) + hp(noise(0.05), 2500) * np.exp(-t * 200) * 0.5
def e_clock(d=2.0, **k):
    out = np.zeros(int(d * SR))
    for i in range(int(d / 0.5)):
        tk = e_tick() * (1.0 if i % 2 == 0 else 0.7); j = int(i * 0.5 * SR); n = min(len(tk), len(out) - j); out[j:j + n] += tk[:n]
    return out
def e_heartbeat(**k):
    a = np.zeros(int(0.5 * SR)); t = T(0.25)
    for off, gg in ((0, 1.0), (0.2, 0.7)): i = int(off * SR); b = np.sin(2 * np.pi * 55 * t) * np.exp(-t * 22) * gg; a[i:i + len(b)] += b[:len(a) - i]
    return a
def e_pop(**k): t = T(0.12); f = 500 + 900 * np.exp(-t * 60); return np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t * 35)
def e_blip(**k): t = T(0.1); return np.sin(2 * np.pi * 1760 * t) * np.exp(-t * 28) * 0.6
def e_ping(**k):
    out = np.zeros(int(0.7 * SR)); t = T(0.7); out += np.sin(2 * np.pi * 880 * t) * np.exp(-t * 9) * 0.6
    j = int(0.09 * SR); t2 = T(0.6); out[j:j + len(t2)] += (np.sin(2 * np.pi * 1320 * t2) * np.exp(-t2 * 8))[:len(out) - j] * 0.6; return out
def e_ding(**k): t = T(1.4); return (np.sin(2 * np.pi * 1568 * t) + 0.3 * np.sin(2 * np.pi * 1568 * 2.76 * t)) * np.exp(-t * 3.2) * 0.5
def e_chime(d=3.0, **k): t = T(d); return (np.sin(2 * np.pi * 1046 * t) + 0.3 * np.sin(2 * np.pi * 1046 * 2.76 * t)) * np.exp(-t * 1.3) * 0.45
def e_shimmer(d=1.5, **k): return sparkle(d, 0.7)
def e_register(**k):
    t = T(0.9); b = (np.sin(2 * np.pi * 2400 * t) + 0.7 * np.sin(2 * np.pi * 3600 * t) + 0.4 * np.sin(2 * np.pi * 5100 * t)) * np.exp(-t * 6)
    return b * 0.4 + hp(noise(0.9), 2000) * np.exp(-t * 60) * 0.8 + bp(noise(0.9), 300, 900) * np.exp(-t * 25) * 0.6
def e_beep(**k): t = T(0.22); return fade(np.where(t < 0.1, np.sin(2 * np.pi * 1000 * t), np.where(t < 0.2, np.sin(2 * np.pi * 1500 * t), 0)) * 0.5, 0.004, 0.01)
def e_buzz(d=0.6, **k): t = T(d); return fade(ss.square(2 * np.pi * 110 * t) * 0.25 + lp(noise(d), 800) * 0.2, 0.01, 0.05)
def e_lid(**k): t = T(0.5); return bp(noise(0.5), 700, 3500) * np.exp(-t * 14) * 0.8 + lp(noise(0.5), 300) * np.exp(-t * 30) * 0.8
def e_crinkle(d=0.6, **k):
    n = hp(noise(d), 2500); env = np.zeros(len(n))
    for _ in range(int(d * 40)): i = int(rng().random() * (len(n) - 200)); env[i:i + int(rng().random() * 160) + 20] += rng().random()
    return n * np.minimum(env, 1) * np.sin(np.pi * T(d) / d) * 0.6
def e_scratch(d=0.35, **k): n = bp(noise(d), 2500, 6500); return n * np.sin(np.pi * T(d) / d) ** 1.5 * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * T(d))) * 0.5
def e_crackle(**k): t = T(0.03); return hp(noise(0.03), 1500) * np.exp(-t * 180)
def e_stinger(**k):
    x = impact(0.9, 1.8); b = bell(midi(88), 1.8, 1.0); x[:len(b)] += b[:len(x)]; return x
def e_slowmo(d=1.2, **k): n = noise(d); t = T(d); return (lp(n, 2500) * 0.2 + np.sin(2 * np.pi * np.cumsum(900 * np.exp(-t * 2.2)) / SR) * 0.25) * np.sin(np.pi * np.clip(t / d, 0, 1)) ** 0.6
def e_powerup(d=0.8, **k):
    out = np.zeros(int(d * SR))
    for i, m in enumerate([60, 64, 67, 72, 76]): b = pluck(midi(m + 12), 0.5, 1.4); j = int(i * 0.1 * SR); n = min(len(b), len(out) - j); out[j:j + n] += b[:n]
    return out
def e_glitch(d=0.4, **k):
    out = np.zeros(int(d * SR))
    for _ in range(9): j = int(rng().random() * (len(out) - 2000)); L = int(rng().random() * 1500) + 200; out[j:j + L] += (hp(noise(L / SR), 1500) if rng().random() < .6 else np.sin(2 * np.pi * rng().uniform(300, 4000) * T(L / SR))) * 0.5
    return out
def e_counter(d=1.5, **k):
    out = np.zeros(int(d * SR)); n = int(d / 0.06)
    for i in range(n): b = e_tick() * 0.6; j = int(i * 0.06 * SR); m = min(len(b), len(out) - j); out[j:j + m] += b[:m] * (0.6 + 0.4 * i / n)
    return out

SFX = {k[2:]: v for k, v in list(globals().items()) if k.startswith('e_')}
SFX['step'] = SFX['footstep']; SFX['sparkle'] = SFX['shimmer']

# ---------------- ambience beds ----------------
def a_roomtone(d, **k): return lp(noise(d), 300) * 0.25 + hp(lp(noise(d), 2500), 800) * 0.02
def a_murmur(d, **k): n = lp(noise(d), 900); m = bp(noise(d), 250, 1800); return (n * 0.5 + m * np.clip(0.6 + 0.4 * lp(np.abs(noise(d)), 6) * 12, 0, 1.3) * 0.4) * 0.35
def a_city(d, **k): t = T(d); return (lp(noise(d), 500) * 0.8 + bp(noise(d), 800, 3000) * 0.12) * (0.8 + 0.2 * np.sin(2 * np.pi * 0.35 * t)) * 0.35
def a_wind(d, **k): t = T(d); return bp(noise(d), 150, 1400) * (0.5 + 0.5 * np.sin(2 * np.pi * 0.17 * t + 1) ** 2) * 0.5
def a_rain(d, **k): return hp(lp(noise(d), 9000), 1500) * 0.22 + lp(noise(d), 400) * 0.1
def a_hum(d, **k): t = T(d); return (np.sin(2 * np.pi * 60 * t) * 0.15 + np.sin(2 * np.pi * 120 * t) * 0.06 + lp(noise(d), 200) * 0.05)
AMB = {k[2:]: v for k, v in list(globals().items()) if k.startswith('a_')}
AMB['crowd'] = AMB['murmur']; AMB['street'] = AMB['city']; AMB['room'] = AMB['roomtone']

def render(name, dur=None, seed=0, pitch=1.0):
    """Return a mono float array, peak-normalised to ~0.9 (relative level is set by mix.py)."""
    dsp.seed(1000 + seed + sum(map(ord, name)))
    if name not in SFX: raise KeyError(f'unknown sfx "{name}" (see: python audio/sfx.py --list)')
    f = SFX[name]; x = f(dur) if (dur and name in ('whoosh', 'swish', 'riser', 'impact', 'clock', 'counter', 'buzz', 'slowmo', 'shimmer', 'chime', 'crinkle', 'scratch', 'glitch', 'powerup')) else f()
    x = pitch_shift(np.asarray(x, dtype=np.float64), pitch); return _norm(x)
def render_amb(name, dur, seed=0):
    dsp.seed(2000 + seed + sum(map(ord, name)))
    if name not in AMB: raise KeyError(f'unknown ambience "{name}" (see: python audio/sfx.py --list)')
    return AMB[name](dur)

if __name__ == '__main__':
    import soundfile as sf
    if '--list' in sys.argv: print('SFX:', ', '.join(sorted(SFX))); print('AMB:', ', '.join(sorted(AMB)))
    elif '--demo' in sys.argv:
        out = sys.argv[sys.argv.index('--demo') + 1]; os.makedirs(out, exist_ok=True)
        for n in SFX: sf.write(f'{out}/{n}.wav', render(n).astype(np.float32), SR)
        for n in AMB: sf.write(f'{out}/amb_{n}.wav', (_norm(render_amb(n, 4.0))).astype(np.float32), SR)
        print('wrote', len(SFX) + len(AMB), 'files to', out)
