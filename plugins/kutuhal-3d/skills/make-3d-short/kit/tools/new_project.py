"""Create a project skeleton.  python tools/new_project.py --name my-short --script script.txt [--aspect 9:16] [--resolution 1080p] [--title "My Short"]"""
import argparse, json, os, shutil, re
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ap = argparse.ArgumentParser()
ap.add_argument('--name', required=True); ap.add_argument('--script'); ap.add_argument('--title'); ap.add_argument('--aspect', default='9:16', choices=['9:16', '16:9'])
ap.add_argument('--resolution', default='1080p', choices=['720p', '1080p', '1440p', '2160p']); ap.add_argument('--voice', default='hm_psi'); ap.add_argument('--style', default='midnight')
ap.add_argument('--no-captions', action='store_true'); ap.add_argument('--no-music', action='store_true'); ap.add_argument('--no-sfx', action='store_true'); a = ap.parse_args()
slug = re.sub(r'[^a-z0-9]+', '-', a.name.lower()).strip('-'); P = os.path.join(ROOT, 'projects', slug)
if os.path.exists(os.path.join(P, 'config.json')): raise SystemExit(f'project exists: {P}')
for d in ['input', 'story', 'timeline', 'scenes/sets', 'scenes/shots', 'build', 'out']: os.makedirs(os.path.join(P, d), exist_ok=True)
if a.script: shutil.copy(a.script, os.path.join(P, 'input', 'script.txt'))
cfg = {'title': a.title or a.name, 'aspect': a.aspect, 'resolution': a.resolution, 'fps': 30, 'style': a.style, 'voice': a.voice, 'captions': not a.no_captions,
       'voiceover': 'input/narration.wav', 'music': {'enabled': not a.no_music, 'gainDb': -20}, 'sfx': {'enabled': not a.no_sfx, 'gainDb': -14}, 'ambience': {'gainDb': -26}, 'loudness': -14, 'crf': 20, 'tail': 1.6, 'fadeOut': 0.6}
json.dump(cfg, open(os.path.join(P, 'config.json'), 'w'), indent=2)
open(os.path.join(P, 'scenes', 'cast.js'), 'w').write("import { registerCast } from '/engine/core.js';\n// registerCast('hero', { skin: 0xa86b45, hair: 0x15110f, shirt: 0x6f9ac4, pants: 0x3f5f8f });\n")
print('created', P)
