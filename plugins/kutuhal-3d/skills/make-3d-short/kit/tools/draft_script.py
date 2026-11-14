"""Draft story/script.json from the plain script (paragraphs -> scenes, sentences -> units). Claude then refines it.
   python tools/draft_script.py --project projects/<slug>"""
import argparse, json, os, re
ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); ap.add_argument('--force', action='store_true'); a = ap.parse_args()
P = a.project; out = os.path.join(P, 'story', 'script.json')
if os.path.exists(out) and not a.force: raise SystemExit('story/script.json exists (use --force)')
raw = open(os.path.join(P, 'input', 'script.txt'), encoding='utf-8').read().replace('\r', '')
cfg = json.load(open(os.path.join(P, 'config.json')))
paras = [p.strip() for p in re.split(r'\n\s*\n', raw) if p.strip()]
scenes = []; notes_acc = []
for p in paras:
    lines = [l.strip() for l in p.split('\n') if l.strip()]
    notes = [l for l in lines if re.match(r'^[\[\(].*[\]\)]$', l) or re.match(r'^(visual|scene|shot|music|sfx|b-?roll|note)\s*[:\-]', l, re.I)]
    spoken = ' '.join(re.sub(r'^(narrator|vo|voice[- ]?over|host)\s*[:\-]\s*', '', l, flags=re.I) for l in lines if l not in notes)
    if not spoken.strip(): notes_acc += notes; continue
    sents = [s.strip() for s in re.split(r'(?<=[.!?…])\s+(?=[A-Z"“‘\'(])', spoken) if s.strip()]
    scenes.append({'id': len(scenes) + 1, 'speed': 1.0, 'gap': 1.0, 'pause': 0.3, 'notes': notes_acc + notes, 'units': [{'say': s, 'show': s} for s in sents]}); notes_acc = []
scenes[-1]['gap'] = 0.0
doc = {'voice': cfg.get('voice', 'hm_psi'), 'lead': 0.2, 'pronounce': {}, 'emph': [], 'scenes': scenes}
json.dump(doc, open(out, 'w'), indent=1, ensure_ascii=False)
print(f'wrote {out}: {len(scenes)} scenes, {sum(len(s["units"]) for s in scenes)} units, {sum(len(u["say"].split()) for s in scenes for u in s["units"])} words')
