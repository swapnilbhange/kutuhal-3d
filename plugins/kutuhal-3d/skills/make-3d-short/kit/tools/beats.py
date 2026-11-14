"""Draft story/shots.json from the narration timeline: one shot per spoken unit (short units merged), music per scene.
   python tools/beats.py --project projects/<slug> [--force]   (Claude then rewrites scene/set/overlays/sfx/music per shot)"""
import argparse, json, os
ap = argparse.ArgumentParser(); ap.add_argument('--project', required=True); ap.add_argument('--force', action='store_true'); a = ap.parse_args()
P = a.project; out = os.path.join(P, 'story', 'shots.json')
if os.path.exists(out) and not a.force: raise SystemExit('story/shots.json exists (use --force)')
cfg = json.load(open(os.path.join(P, 'config.json'))); U = json.load(open(os.path.join(P, 'timeline', 'units.json')))['units']; TL = json.load(open(os.path.join(P, 'timeline', 'words.json')))
dur = round(TL['duration'] + cfg.get('tail', 1.6), 2); groups = []
for u in U:
    if groups and groups[-1]['scene'] == u['scene'] and (groups[-1]['end'] - groups[-1]['start']) < 1.8: groups[-1]['end'] = u['end']; groups[-1]['line'] += ' ' + u['text']
    else: groups.append({'scene': u['scene'], 'start': u['start'], 'end': u['end'], 'line': u['text']})
shots = []
for i, g in enumerate(groups):
    s = 0.0 if i == 0 else round(g['start'] - 0.12, 2)
    shots.append({'id': f's{i + 1:02d}', 'start': s, 'end': 0, 'line': g['line'], 'scene': 'TODO: describe the picture', 'set': '', 'in': {'type': 'cut'}, 'sfx': [], 'overlays': [], 'params': {}, 'narr_scene': g['scene']})
for i, s in enumerate(shots): s['end'] = shots[i + 1]['start'] if i + 1 < len(shots) else dur
sc = TL['scenes']; music = [{'start': 0.0 if i == 0 else round(s['start'] - 0.2, 2), 'end': (round(sc[i + 1]['start'] - 0.2, 2) if i + 1 < len(sc) else dur), 'mood': 'hopeful', 'intensity': 0.5} for i, s in enumerate(sc)]
json.dump({'title': cfg.get('title'), 'duration': dur, 'shots': shots, 'music': music, 'sfx': []}, open(out, 'w'), indent=1)
print(f'wrote {out}: {len(shots)} shots over {dur}s, {len(music)} music sections')
