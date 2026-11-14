"""mix.py — builds music + SFX + ambience from story/shots.json, ducks them under the narration, normalises to -14 LUFS
and (if build/video_silent.mp4 exists) muxes out/<title>.mp4.      python audio/mix.py --project projects/<slug>"""
import sys, os, json, re, argparse, subprocess, shutil
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
import numpy as np, scipy.signal as ss, soundfile as sf
import dsp
from dsp import SR, Bus, lp, hp, rng
import sfx, music as M

ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); ap.add_argument('--no-mux', action='store_true'); ap.add_argument('--video', help='silent video to mux (default build/video_silent.mp4; use build/preview.mp4 for a low-res preview)'); a = ap.parse_args()
P = a.project; J = lambda *x: os.path.join(P, *x)
CFG = json.load(open(J('config.json'))); ST = json.load(open(J('story', 'shots.json')))
DUR = float(ST['duration']); N = int(DUR * SR); dsp.seed(CFG.get('seed', 11))
os.makedirs(J('build'), exist_ok=True); os.makedirs(J('out'), exist_ok=True)
mcfg, scfg = CFG.get('music', {}), CFG.get('sfx', {}); acfg = CFG.get('ambience', {})
db = lambda x: 10 ** (x / 20)

# ---------- narration ----------
vo = J(CFG.get('voiceover', 'input/narration.wav'))
if not os.path.exists(vo): sys.exit(f'narration not found: {vo} (run tools/narrate.py first)')
nar, nsr = sf.read(vo); nar = nar.mean(1) if nar.ndim > 1 else nar
if nsr != SR: nar = ss.resample_poly(nar, SR, nsr) if SR % nsr == 0 else ss.resample(nar, int(len(nar) * SR / nsr))
nar = np.concatenate([nar, np.zeros(max(0, N - len(nar)))])[:N]; nar = hp(nar, 70, 2)
peq = ss.iirpeak(3200, 1.2, fs=SR); nar = nar + 0.25 * ss.lfilter(*peq, nar)
fr = int(0.02 * SR); rms = np.sqrt(np.convolve(nar ** 2, np.ones(fr) / fr, 'same')); active = (rms > 0.02).astype(float)
act = np.clip(lp(active, 6, 1) * 1.6, 0, 1); nar_rms = np.sqrt(np.mean(nar[active > 0.5] ** 2)) if active.any() else 0.1

# ---------- music ----------
mus, snd, send = Bus(N), Bus(N), Bus(N)
if mcfg.get('enabled', True) and mcfg.get('file'):
    f = J(mcfg['file']); raw = subprocess.run(['ffmpeg', '-v', 'error', '-i', f, '-ar', str(SR), '-ac', '2', '-f', 'f32le', '-'], capture_output=True).stdout
    x = np.frombuffer(raw, dtype=np.float32).reshape(-1, 2); reps = int(np.ceil(N / len(x))); x = np.tile(x, (reps, 1))[:N]; mus.L[:] = x[:, 0]; mus.R[:] = x[:, 1]
elif mcfg.get('enabled', True):
    secs = ST.get('music') or [{'start': 0, 'end': DUR, 'mood': 'hopeful', 'intensity': 0.5}]
    for s in secs:
        if s['mood'] in ('none', 'silence'): continue
        M.section(M.Ctx(mus, send, M.key_shift(s.get('key') or mcfg.get('key'))), s['mood'], float(s['start']), min(float(s['end']), DUR), s.get('intensity', 0.6))
# ---------- sfx + ambience ----------
amb = Bus(N); cues = 0
if scfg.get('enabled', True):
    allc = [(c.get('t'), c) for c in ST.get('sfx', [])]
    for sh in ST['shots']:
        for c in sh.get('sfx', []): allc.append((sh['start'] + c['at'], c))
    for t, c in allc:
        x = sfx.render(c['name'], c.get('dur'), c.get('seed', 0), c.get('pitch', 1.0)); snd.put(x, t, db(c.get('gain', 0)), c.get('pan', 0.0)); cues += 1
    runs = []   # merge consecutive shots that share the same ambience bed
    for sh in ST['shots']:
        am = sh.get('amb')
        if not am: continue
        if runs and runs[-1]['name'] == am['name'] and abs(runs[-1]['end'] - sh['start']) < 0.01: runs[-1]['end'] = sh['end']
        else: runs.append({'name': am['name'], 'start': sh['start'], 'end': sh['end'], 'gain': am.get('gain', 0)})
    for r in runs:
        x = sfx.render_amb(r['name'], r['end'] - r['start'] + 0.4); x = dsp.fade(x, 0.4, 0.4) * db(r['gain']); amb.put(x, r['start'] - 0.2)
print(f'music sections: {len(ST.get("music") or [])} · sfx cues: {cues} · ambience beds: {len(runs) if scfg.get("enabled", True) else 0}')

# ---------- reverb send, ducking, levels ----------
def rev(x, seed):
    r = np.random.default_rng(seed); n = int(2.2 * SR); t = np.arange(n) / SR; ir = r.standard_normal(n) * np.exp(-t * 2.4); ir = lp(ir, 5000, 1); ir[0] = 0
    return ss.fftconvolve(x, ir / np.sqrt(np.sum(ir ** 2)))[:N] * 0.35
sm_ = (send.L + send.R) * 0.5; mL, mR = mus.L + rev(sm_, 1), mus.R + rev(sm_, 2)
t_ax = np.arange(N) / SR; gate = np.clip(t_ax / 0.4, 0, 1) * np.clip((DUR - t_ax) / (CFG.get('fadeOut', 0.5) + 1.2), 0, 1)
duck = 1 - 0.7 * act; mL, mR = mL * gate * duck, mR * gate * duck
mm = 0.5 * (mL + mR); m_rms = np.sqrt(np.mean(mm[active > 0.5] ** 2)) if active.any() else 0; msc = nar_rms * db(mcfg.get('gainDb', -20)) / (m_rms + 1e-9) if m_rms > 1e-6 else 0
if mcfg.get('file'): msc = db(mcfg.get('gainDb', -17)) * 0.5 / (np.abs(mm).max() + 1e-9) * nar_rms * 4
mL, mR = mL * msc, mR * msc
sL, sR = snd.L * (1 - 0.35 * act), snd.R * (1 - 0.35 * act); sm2 = 0.5 * (sL + sR); s_rms = np.sqrt(np.mean(sm2[np.abs(sm2) > 1e-4] ** 2)) if (np.abs(sm2) > 1e-4).any() else 0
ssc = nar_rms * db(scfg.get('gainDb', -14)) / (s_rms + 1e-9) if s_rms > 0 else 0; sL, sR = sL * ssc, sR * ssc
aL, aR = amb.L * (1 - 0.5 * act), amb.R * (1 - 0.5 * act); a_rms = np.sqrt(np.mean(aL[np.abs(aL) > 1e-5] ** 2)) if (np.abs(aL) > 1e-5).any() else 0
asc = nar_rms * db(acfg.get('gainDb', -26)) / (a_rms + 1e-9) if a_rms > 0 else 0; aL, aR = aL * asc, aR * asc
L, R = nar + mL + sL + aL, nar + mR + sR + aR; pk = max(np.abs(L).max(), np.abs(R).max()); g = 0.89 / pk
L, R = np.tanh(L * g * 1.1) / 1.1, np.tanh(R * g * 1.1) / 1.1
mix = J('build', 'mix.wav'); sf.write(mix, np.stack([L, R], 1).astype(np.float32), SR)
sf.write(J('out', 'narration.wav'), (nar / (np.abs(nar).max() + 1e-9) * 0.89).astype(np.float32), SR)
ln = J('build', 'mix_ln.wav'); subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', mix, '-af', f"loudnorm=I={CFG.get('loudness', -14)}:TP=-1.5:LRA=11", '-ar', str(SR), ln], check=True)
print('mix ->', mix, '| loudnorm ->', ln)

# ---------- captions SRT ----------
try:
    W = json.load(open(J('timeline', 'words.json')))['words']
    ts = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round((t % 1) * 1000)):03d}"
    with open(J('out', 'captions.srt'), 'w') as fh:
        for i, w in enumerate(W, 1):
            end = min(W[i]['start'], w['end'] + 0.3) if i < len(W) else w['end']; fh.write(f"{i}\n{ts(w['start'])} --> {ts(max(end, w['start'] + 0.05))}\n{w['w']}\n\n")
except Exception as e: print('srt skipped:', e)

# ---------- mux ----------
vid = os.path.abspath(a.video) if a.video else J('build', 'video_silent.mp4')
if os.path.exists(vid) and not a.no_mux:
    title = re.sub(r'[^A-Za-z0-9]+', '_', CFG.get('title') or os.path.basename(os.path.abspath(P))).strip('_') or 'short'; out = J('out', title + '.mp4')
    subprocess.run(['ffmpeg', '-y', '-v', 'error', '-i', vid, '-i', ln, '-map', '0:v', '-map', '1:a', '-c:v', 'copy', '-c:a', 'aac', '-b:a', '192k', '-ar', '48000', '-t', str(DUR), '-movflags', '+faststart', out], check=True)
    print('final ->', out)
else: print('no build/video_silent.mp4 yet: audio only (render the video, then re-run mix.py to mux)')
