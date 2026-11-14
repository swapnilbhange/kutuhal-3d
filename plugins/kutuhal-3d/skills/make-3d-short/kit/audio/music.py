"""music.py — mood-based generated music.   python audio/music.py --mood tension --intensity 0.7 --dur 20 --out test.wav
Moods: mystery, tension, playful, action, dark, historical, epic, hopeful, calm, wonder, sad, triumph
A section is {start, end, mood, intensity 0..1, key 'A'..'G#'}; each call fills the music bus (and the reverb send)."""
import sys, numpy as np
from dsp import *
import dsp
from sfx import e_heartbeat

NOTE = {'C': 0, 'C#': 1, 'DB': 1, 'D': 2, 'D#': 3, 'EB': 3, 'E': 4, 'F': 5, 'F#': 6, 'GB': 6, 'G': 7, 'G#': 8, 'AB': 8, 'A': 9, 'A#': 10, 'BB': 10, 'B': 11}
def key_shift(k): k = (k or 'A').upper(); s = NOTE.get(k.rstrip('M'), 9) - 9; return s if s <= 6 else s - 12   # semitones relative to A

class Ctx:
    def __init__(s, music, send, ks=0): s.m, s.s, s.ks = music, send, ks
    def note(s, inst, m, t, d, g, pan=0.0, rev=0.4):
        sig = inst(midi(m + s.ks), d); s.m.put(sig, t, g, pan); s.s.put(sig, t, g * rev, pan)
    def play(s, sig, t, g, pan=0.0, rev=0.3): s.m.put(sig, t, g, pan); s.s.put(sig, t, g * rev, pan)

def _arp(c, ch, t, beat, n, inst_dur, g, bright, pat, up=12, rev=0.3, spread=0.4):
    for k in range(n):
        m = ch[pat[k % len(pat)]] + up
        sig = pluck(midi(m + 12 + c.ks), inst_dur, bright=bright); c.play(sig, t + k * beat, g, spread * (1 if k % 2 else -1), rev)

def mystery(c, t0, t1, I):
    A = 55.0 * 2 ** (c.ks / 12); d = t1 - t0
    c.m.put(sub(A, d + 0.3, 0.55, a=1.2, r=0.8), t0, 1.0)
    for i, tm in enumerate(np.arange(t0, t1, 2.95)):
        ch = [[45, 52, 59, 60], [41, 48, 52, 57]][i % 2]; p = pad([midi(m + c.ks) for m in ch], 3.4, a=1.0, r=1.4, cut=1400, g=0.9); c.play(p, tm, 0.45, -0.1, 0.8)
    for tm in np.arange(t0 + 0.5, t1 - 0.5, 0.9 + 0.8 * (1 - I)):
        c.note(lambda f, d_: bell(f, 2.5, 0.6), int(rng().choice([81, 84, 88, 91, 93])), tm, 2.5, 0.5, rng().uniform(-0.6, 0.6), 1.2)
def tension(c, t0, t1, I):
    A = 55.0 * 2 ** (c.ks / 12); d = t1 - t0; c.m.put(sub(A, d + 0.5, 0.7, a=1.5, r=0.6), t0, 1.0)
    for i, tm in enumerate(np.arange(t0, t1 - 0.5, 2.1)):
        ch = [[45, 52, 58, 64], [43, 50, 56, 62], [41, 48, 54, 60], [40, 47, 53, 59]][i % 4]
        c.play(pad([midi(m + c.ks) for m in ch], 2.6, a=1.1, r=1.2, cut=900 + 150 * i, g=0.9), tm, 0.42, 0.1, 0.7)
    for tm in np.arange(t0 + 0.2, t1, 1.05 - 0.4 * I): c.note(lambda f, d_: pluck(f, 1.4, bright=0.6), 57 + 3 * int(rng().integers(0, 3)) + 12, tm, 1.4, 0.22, rng().uniform(-0.5, 0.5), 1.8)
    if d > 3: c.m.put(riser(d - 1.5, 300, 6000, 0.35), t0 + 1.5, 0.5)
def playful(c, t0, t1, I, bpm=112):
    beat = 60 / bpm; bar = beat * 4; chords = [[48, 52, 55, 60], [43, 47, 50, 55], [45, 48, 52, 57], [41, 45, 48, 53]]; i = 0
    while t0 + i * bar < t1 - 0.05:
        tb = t0 + i * bar; ch = chords[i % 4]
        c.play(pad([midi(m + c.ks) for m in ch], bar, a=0.2, r=0.4, cut=1600, g=0.7), tb, 0.28, 0, 0.7)
        c.m.put(bass(midi(ch[0] - 12 + c.ks), beat * 1.5, 0.9), tb, 0.55); c.m.put(bass(midi(ch[0] - 12 + c.ks), beat * 0.9, 0.8), tb + beat * 2.5, 0.45)
        _arp(c, ch, tb, beat / 2, 8, 0.5, 0.33, 1.2, [0, 1, 2, 3, 2, 1, 3, 2], up=12, rev=0.25)
        if I > 0.25:
            for k in (0, 2): c.m.put(kick(0.7), tb + k * beat, 0.5 * I + 0.1)
            for k in range(8): c.m.put(hat(0.6), tb + k * beat / 2, 0.2 + 0.1 * (k % 2), 0.4)
            for k in (1, 3): c.m.put(snare(0.5), tb + k * beat, 0.18)
        i += 1
def action(c, t0, t1, I, bpm=128):
    beat = 60 / bpm; bar = beat * 4; chords = [[45, 52, 57, 60], [41, 48, 53, 57], [48, 52, 55, 60], [43, 50, 55, 59]]; nb = int((t1 - t0) / bar) + 1
    for i in range(nb):
        tb = t0 + i * bar; ch = chords[i % 4]; prog = min(1, (tb - t0) / max(t1 - t0, 1e-3))
        c.play(pad([midi(m + c.ks) for m in ch], bar, a=0.1, r=0.2, cut=1200 + 2500 * prog, g=0.8), tb, 0.25, 0, 0.6)
        for k in range(4): c.m.put(kick(0.95), tb + k * beat, 0.6)
        for k in range(16):
            tm = tb + k * beat / 4
            if tm >= t1: break
            c.m.put(hat(0.8, open_=(k % 4 == 2)), tm, 0.22 + 0.08 * prog, 0.3)
            m = ch[[0, 2, 1, 3][k % 4]] + 12 + (12 if (k // 4) % 2 else 0); c.play(pluck(midi(m + 12 + c.ks), 0.28, bright=1.5), tm, 0.26 + 0.1 * prog, 0.5 * (1 if k % 2 else -1), 0.2)
        for k in (1, 3): c.m.put(snare(0.8), tb + k * beat, 0.28)
        c.m.put(bass(midi(ch[0] - 12 + c.ks), beat * 0.8, 1.0), tb, 0.6)
        for k in (1.5, 2.5): c.m.put(bass(midi(ch[0] - 12 + c.ks), beat * 0.4, 0.8), tb + beat * k, 0.5)
    if t1 - t0 > 3:
        for i, tm in enumerate(np.linspace(t1 - 1.8, t1 - 0.05, 18)): c.m.put(snare(0.6), tm, 0.3 + 0.3 * i / 18)
        c.m.put(riser(t1 - t0 - 1.0, 250, 11000, 0.5), t0 + 1.0, 0.55)
def dark(c, t0, t1, I):
    A = 55.0 * 2 ** (c.ks / 12); d = t1 - t0
    c.m.put(sub(A, d + 0.2, 0.9, a=0.4, r=0.2), t0, 1.0); c.m.put(sub(midi(51 + c.ks), d, 0.4, a=0.8, r=0.2), t0, 1.0)
    c.m.put(pad([midi(m + c.ks) for m in [33, 40, 45, 51]], d, a=0.5, r=0.2, cut=700, g=1.0), t0, 0.5)
    for tm in np.arange(t0, t1, 0.85): c.m.put(e_heartbeat(), tm, 0.7 * (0.5 + 0.5 * I))
    if d > 2: c.m.put(riser(d - 1.0, 200, 9000, 0.6), t0 + 1.0, 0.7)
def historical(c, t0, t1, I, bpm=76, drums=False):
    beat = 60 / bpm; bar = beat * 4; H = [[50, 57, 62, 65], [46, 53, 58, 62], [43, 50, 55, 58], [45, 52, 57, 61]]; mel_t = [[74, 77, 76, 74], [74, 72, 70, 74], [70, 72, 74, 70], [69, 73, 76, 73]]; i = 0
    while t0 + i * bar < t1 - 0.05:
        tb = t0 + i * bar; ch = H[i % 4]
        c.play(strings([midi(m + c.ks) for m in ch], bar + 0.2, a=0.5, r=0.8, cut=2400, g=0.9), tb, 0.30, 0, 0.9)
        c.play(strings([midi(ch[0] - 12 + c.ks)], bar + 0.2, a=0.3, r=0.6, cut=700, g=1.2), tb, 0.35, -0.2, 0.6)
        _arp(c, ch, tb, beat / 2, 8, 0.9, 0.22, 1.6, [0, 1, 2, 3, 2, 1, 2, 3], up=12, rev=0.35)
        for k, m in enumerate(mel_t[i % 4]): c.play(strings([midi(m + 12 + c.ks)], beat * 0.95, a=0.12, r=0.3, cut=3000, g=0.8), tb + k * beat, 0.18, 0.15, 0.3)
        if drums:
            for k in (0, 2): c.m.put(kick(1.0), tb + k * beat, 0.5)
            c.m.put(impact(0.4, 1.2), tb, 0.35)
        i += 1
def epic(c, t0, t1, I): historical(c, t0, t1, I, bpm=90, drums=True)
def hopeful(c, t0, t1, I, bpm=72, soft=False):
    beat = 60 / bpm; bar = beat * 4; CH = [[57, 60, 64, 67], [53, 57, 60, 64], [48, 52, 55, 59], [55, 59, 62, 65]]; i = 0
    while t0 + i * bar < t1 - 0.05:
        tb = t0 + i * bar; ch = CH[i % 4]
        c.play(pad([midi(m - 12 + c.ks) for m in ch], bar + 0.3, a=0.8, r=1.0, cut=1100, g=0.9), tb, 0.30, 0, 0.9)
        _arp(c, ch, tb, beat / 2, 8, 1.6, 0.30 * (0.7 if soft else 1), 0.8, [0, 1, 2, 3, 2, 1, 3, 2], up=0, rev=0.5)
        c.m.put(bass(midi(ch[0] - 24 + c.ks), bar * 0.45, 0.8), tb, 0.35); i += 1
    if not soft:
        for k, m in enumerate([88, 91, 95]): c.note(lambda f, d_: bell(f, 2.5, 0.8), m, t0 + 0.6 * k, 2.5, 0.4, rng().uniform(-0.4, 0.4), 1.7)
def calm(c, t0, t1, I): hopeful(c, t0, t1, I, bpm=64, soft=True)
def wonder(c, t0, t1, I):
    d = t1 - t0
    for i, tm in enumerate(np.arange(t0, t1, 3.2)):
        ch = [[48, 55, 60, 64, 71], [53, 57, 60, 65, 69], [55, 59, 62, 67, 71], [52, 55, 59, 64, 67]][i % 4]; c.play(pad([midi(m + c.ks) for m in ch], 3.6, a=1.2, r=1.4, cut=2000, g=0.9), tm, 0.35, 0, 0.9)
    for tm in np.arange(t0 + 0.3, t1, 0.55 + 0.5 * (1 - I)): c.note(lambda f, d_: bell(f, 2.5, 0.7), int(rng().choice([76, 79, 83, 88, 91])), tm, 2.5, 0.38, rng().uniform(-0.7, 0.7), 1.4)
    c.m.put(sub(midi(36 + c.ks), d + 0.3, 0.5, a=1.5, r=0.8), t0, 0.8)
def sad(c, t0, t1, I):
    for i, tm in enumerate(np.arange(t0, t1, 4.0)):
        ch = [[45, 52, 57, 60], [41, 48, 53, 57], [43, 50, 55, 58], [40, 47, 52, 56]][i % 4]; c.play(pad([midi(m + c.ks) for m in ch], 4.4, a=1.4, r=1.6, cut=900, g=0.9), tm, 0.4, 0, 0.9)
        for k, m in enumerate([ch[2] + 12, ch[1] + 12, ch[3] + 12, ch[1] + 12]): c.note(lambda f, d_: pluck(f, 2.2, bright=0.5), m + 12, tm + k * 1.0, 2.2, 0.26, 0.2, 2.0)
def triumph(c, t0, t1, I):
    d = t1 - t0; c.play(pad([midi(m + c.ks) for m in [48, 55, 60, 64, 71]], d + 0.5, a=0.4, r=1.6, cut=1500, g=1.0), t0, 0.45, 0, 0.9)
    c.m.put(sub(midi(36 + c.ks), d + 0.5, 0.6, a=0.4, r=1.0), t0, 0.9)
    for k, m in enumerate([76, 79, 83, 88]): c.note(lambda f, d_: bell(f, 3.0, 0.7), m, t0 + 0.4 + k * 0.28, 3.0, 0.4, 0, 1.5)

MOODS = dict(mystery=mystery, tension=tension, playful=playful, action=action, dark=dark, historical=historical, epic=epic, hopeful=hopeful, calm=calm, wonder=wonder, sad=sad, triumph=triumph)
ALIASES = dict(upbeat=playful, suspense=tension, build=action, resolve=triumph, regal=historical, history=historical, happy=playful, inspiring=hopeful, cinematic=epic, scary=dark)

def section(c, mood, t0, t1, intensity=0.6, **kw):
    f = MOODS.get(mood) or ALIASES.get(mood)
    if f is None: raise KeyError(f'unknown mood "{mood}"; choose from {sorted(MOODS)}')
    f(c, t0, t1, float(intensity))

if __name__ == '__main__':
    import argparse, soundfile as sf
    ap = argparse.ArgumentParser(); ap.add_argument('--mood', default='mystery'); ap.add_argument('--intensity', type=float, default=0.6); ap.add_argument('--dur', type=float, default=20); ap.add_argument('--key', default='A'); ap.add_argument('--out', default='music_test.wav'); a = ap.parse_args()
    N = int((a.dur + 3) * SR); dsp.seed(11); mb, sb = Bus(N), Bus(N); section(Ctx(mb, sb, key_shift(a.key)), a.mood, 0, a.dur, a.intensity)
    L, R = mb.L + 0.35 * sb.L, mb.R + 0.35 * sb.R; pk = max(abs(L).max(), abs(R).max()) + 1e-9
    sf.write(a.out, (np.stack([L, R], 1) / pk * 0.8).astype(np.float32), SR); print('wrote', a.out)
