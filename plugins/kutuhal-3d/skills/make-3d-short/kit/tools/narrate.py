"""Generate the narration (Kokoro TTS, offline) + word timings (pocketsphinx forced alignment).
   python tools/narrate.py --project projects/<slug> [--voice hm_psi] [--audition]
Reads story/script.json; writes input/narration.wav, timeline/words.json, timeline/units.json."""
import argparse, json, os, re, sys, urllib.request
import numpy as np, scipy.signal as ss, soundfile as sf
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); ap.add_argument('--voice'); ap.add_argument('--audition', action='store_true', help='render one sentence with several voices'); a = ap.parse_args()
P = a.project; SC = json.load(open(os.path.join(P, 'story', 'script.json'))); CFG = json.load(open(os.path.join(P, 'config.json')))
VOICE = a.voice or SC.get('voice') or CFG.get('voice', 'hm_psi'); SR = 24000
MODELS = os.path.join(ROOT, 'models'); BASE = 'https://github.com/thewh1teagle/kokoro-onnx/releases/download/model-files-v1.0/'
os.makedirs(MODELS, exist_ok=True)
for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin'):
    fp = os.path.join(MODELS, f)
    if not (os.path.exists(fp) and os.path.getsize(fp) > 1000):
        print('downloading', f, '(first run only)'); urllib.request.urlretrieve(BASE + f, fp)
from kokoro_onnx import Kokoro
from pocketsphinx import Decoder
K = Kokoro(os.path.join(MODELS, 'kokoro-v1.0.onnx'), os.path.join(MODELS, 'voices-v1.0.bin'))
OVR = {k.lower(): v for k, v in SC.get('pronounce', {}).items()}     # word -> IPA phonemes (espeak style)

def phon(text):
    out = []
    for tok in text.split():
        m = re.match(r"^([\"'“”(]*)(.*?)([\"'“”).,!?:;…]*)$", tok); pre, core, post = m.groups(); post = post.replace('...', '…')
        out.append(pre + (OVR.get(core.lower()) or K.tokenizer.phonemize(core, 'en-us').strip() if core else '') + post)
    return ' '.join(out)
def synth(text, speed, voice=None):
    a_, sr = K.create(phon(text), voice=voice or VOICE, speed=speed, lang='en-us', is_phonemes=True, trim=True); assert sr == SR; return a_.astype(np.float32)

# IPA -> ARPAbet (for words missing from the alignment dictionary)
_I = [('tʃ', 'CH'), ('dʒ', 'JH'), ('ʧ', 'CH'), ('ʤ', 'JH'), ('aɪ', 'AY'), ('aʊ', 'AW'), ('eɪ', 'EY'), ('oʊ', 'OW'), ('əʊ', 'OW'), ('ɔɪ', 'OY'), ('ɜː', 'ER'), ('ɝ', 'ER'), ('ɚ', 'ER'), ('ɑː', 'AA'), ('iː', 'IY'), ('uː', 'UW'), ('ɔː', 'AO'),
      ('ɑ', 'AA'), ('æ', 'AE'), ('ʌ', 'AH'), ('ɔ', 'AO'), ('ə', 'AH'), ('ɛ', 'EH'), ('ɪ', 'IH'), ('i', 'IY'), ('ʊ', 'UH'), ('u', 'UW'), ('e', 'EH'), ('o', 'OW'), ('a', 'AA'), ('ɐ', 'AH'),
      ('b', 'B'), ('d', 'D'), ('ð', 'DH'), ('f', 'F'), ('ɡ', 'G'), ('g', 'G'), ('h', 'HH'), ('k', 'K'), ('l', 'L'), ('m', 'M'), ('n', 'N'), ('ŋ', 'NG'), ('p', 'P'), ('ɹ', 'R'), ('r', 'R'), ('s', 'S'), ('ʃ', 'SH'), ('t', 'T'), ('θ', 'TH'), ('v', 'V'), ('w', 'W'), ('j', 'Y'), ('z', 'Z'), ('ʒ', 'ZH')]
def ipa2arpa(ipa):
    ipa = re.sub(r'[ˈˌː\.\s]', '', ipa); out = []; i = 0
    while i < len(ipa):
        for s, ph in _I:
            if ipa.startswith(s, i): out.append(ph); i += len(s); break
        else: i += 1
    return ' '.join(out) or 'AH'

def align(audio, spoken):
    x = ss.resample_poly(audio, 16000, SR); pcm = (np.clip(x, -1, 1) * 32767).astype('int16').tobytes()
    clean = ' '.join(re.sub(r"[^a-z' ]", ' ', spoken.lower().replace('-', ' ')).split()); d = Decoder(loglevel='FATAL')
    for w in set(clean.split()):
        if d.lookup_word(w) is None or w in OVR:
            ip = OVR.get(w) or K.tokenizer.phonemize(w, 'en-us').strip()
            try: d.add_word(w, ipa2arpa(ip), False)
            except Exception: pass
    d.set_align_text(clean); d.start_utt(); d.process_raw(pcm, False, True); d.end_utt()
    out = []
    for sg in d.seg():
        n = re.sub(r'\(\d+\)$', '', sg.word)
        if n.startswith('<') or n.startswith('[') or n == '(NULL)': continue
        out.append((n, sg.start_frame / 100.0, sg.end_frame / 100.0))
    return out


def reconcile(al, dt, tot, say):
    """Map aligned words onto display tokens. Words the aligner dropped are interpolated between their neighbours."""
    nrm = lambda w: re.sub(r"[^a-z']", '', w.lower())
    out = [None] * len(dt); j = 0
    for i, w in enumerate(dt):
        if j < len(al) and nrm(al[j][0]) == nrm(w): out[i] = (w, al[j][1], al[j][2]); j += 1
    if all(o is None for o in out):                                  # nothing matched: fully proportional
        ws = [len(w) + 2 for w in dt]; c = 0; res = []
        for w, wt in zip(dt, ws): res.append((w, c / sum(ws) * tot, (c + wt) / sum(ws) * tot)); c += wt
        print(f'  alignment failed for "{say[:40]}": proportional timing'); return res
    if any(o is None for o in out): print(f'  note: interpolated {sum(o is None for o in out)} word(s) in "{say[:40]}"')
    i = 0
    while i < len(dt):
        if out[i] is None:
            k = i
            while k < len(dt) and out[k] is None: k += 1
            a0 = out[i - 1][2] if i > 0 else 0.0; b0 = out[k][1] if k < len(dt) else tot; ws = [len(w) + 1 for w in dt[i:k]]; c = 0
            for n, w in enumerate(dt[i:k]): out[i + n] = (w, a0 + (b0 - a0) * c / sum(ws), a0 + (b0 - a0) * (c + ws[n]) / sum(ws)); c += ws[n]
            i = k
        else: i += 1
    return out

if a.audition:
    s = SC['scenes'][0]['units'][0]['say']; os.makedirs(os.path.join(P, 'build', 'voices'), exist_ok=True)
    for v in ['hm_psi', 'hm_omega', 'bm_george', 'bm_lewis', 'am_michael', 'am_adam', 'af_heart', 'af_bella', 'bf_emma']:
        try: sf.write(os.path.join(P, 'build', 'voices', v + '.wav'), synth(s, 1.0, v), SR); print('wrote', v)
        except Exception as e: print('skip', v, e)
    sys.exit()

EMPH = {w.lower() for w in SC.get('emph', [])}; LEAD = SC.get('lead', 0.2)
parts = [np.zeros(int(LEAD * SR), np.float32)]; words = []; units = []; scenes = []; t = LEAD
for sc in SC['scenes']:
    scenes.append({'scene': sc['id'], 'start': t})
    for ui, u in enumerate(sc['units']):
        say, show = u['say'], u.get('show', u['say']); au = synth(say, sc.get('speed', 1.0)); al = align(au, say); dt = show.split()
        al = reconcile(al, dt, len(au) / SR, say)
        u0 = len(words)
        for (n, s, e), dw in zip(al, dt):
            core = re.sub(r"[^A-Za-z']", '', dw).lower(); words.append({'w': dw, 'start': round(t + s, 3), 'end': round(t + e, 3), 'scene': sc['id'], 'emph': core in EMPH or (dw.isupper() and len(re.sub(r'[^A-Za-z]', '', dw)) > 2)})
        words[-1]['end'] = round(min(t + len(au) / SR, words[-1]['end'] + 0.25), 3)
        units.append({'scene': sc['id'], 'text': show, 'start': words[u0]['start'], 'end': words[-1]['end']})
        parts.append(au); t += len(au) / SR; gap = sc.get('gap', 1.0) if ui == len(sc['units']) - 1 else sc.get('pause', 0.3)
        if gap > 0: parts.append(np.zeros(int(gap * SR), np.float32)); t += gap
    scenes[-1]['end'] = words[-1]['end']
nar = np.concatenate(parts); nar = nar / (np.abs(nar).max() + 1e-9) * 0.89
os.makedirs(os.path.join(P, 'input'), exist_ok=True); os.makedirs(os.path.join(P, 'timeline'), exist_ok=True)
sf.write(os.path.join(P, 'input', 'narration.wav'), nar, SR)
json.dump({'words': words, 'scenes': scenes, 'duration': round(words[-1]['end'], 3), 'voice': VOICE}, open(os.path.join(P, 'timeline', 'words.json'), 'w'), indent=1)
json.dump({'units': units}, open(os.path.join(P, 'timeline', 'units.json'), 'w'), indent=1)
open(os.path.join(P, 'timeline', 'transcript.txt'), 'w').write('\n'.join(f"[{u['start']:6.2f}-{u['end']:6.2f}] s{u['scene']}: {u['text']}" for u in units))
print(f'voice {VOICE}: {len(words)} words, narration {len(nar) / SR:.1f}s, last word ends {words[-1]["end"]:.2f}s')
