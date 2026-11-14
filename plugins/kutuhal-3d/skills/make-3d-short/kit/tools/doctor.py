"""Check dependencies.  python tools/doctor.py [--install]"""
import os, sys, shutil, subprocess, importlib
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__))); inst = '--install' in sys.argv; bad = 0
def row(ok, name, hint=''):
    global bad; print(('OK    ' if ok else 'FAIL  ') + name + ('' if ok else f'  -> {hint}')); bad += (not ok)
row(sys.version_info >= (3, 9), f'python {sys.version.split()[0]}', 'need Python >= 3.9')
for b, h in (('ffmpeg', 'install ffmpeg (apt install ffmpeg / brew install ffmpeg / winget install Gyan.FFmpeg)'), ('node', 'install Node.js >= 18')): row(shutil.which(b) is not None, b, h)
for mod in ('numpy', 'scipy', 'soundfile', 'PIL', 'kokoro_onnx', 'pocketsphinx'):
    try: importlib.import_module(mod); row(True, 'python: ' + mod)
    except Exception:
        if inst:
            rq = [sys.executable, '-m', 'pip', 'install', '-r', os.path.join(ROOT, 'requirements.txt')]
            if subprocess.call(rq + ['--break-system-packages']) != 0: subprocess.call(rq)   # older pip / venv has no such flag
            break
        row(False, 'python: ' + mod, 'pip install -r requirements.txt')
row(os.path.isdir(os.path.join(ROOT, 'node_modules', 'three')) and os.path.isdir(os.path.join(ROOT, 'node_modules', 'puppeteer-core')), 'node packages', 'npm install (in the studio folder)')
if inst and not os.path.isdir(os.path.join(ROOT, 'node_modules', 'three')): subprocess.call(['npm', 'install', '--no-audit', '--no-fund'], cwd=ROOT)
r = subprocess.run(['node', '-e', "import('./render.mjs')"], cwd=ROOT, capture_output=True) if False else None
chrome = None
for c in (os.environ.get('CHROME_PATH'), '/usr/bin/google-chrome', '/usr/bin/google-chrome-stable', '/usr/bin/chromium', '/usr/bin/chromium-browser', '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome', r'C:\Program Files\Google\Chrome\Application\chrome.exe'):
    if c and os.path.exists(c): chrome = c; break
if not chrome:
    import glob; g = glob.glob(os.path.expanduser('~/.cache/ms-playwright/chromium*/chrome-linux*/chrome')) + glob.glob(os.path.expanduser('~/Library/Caches/ms-playwright/chromium*/chrome-mac*/Chromium.app/Contents/MacOS/Chromium')) + glob.glob(os.path.expanduser('~/AppData/Local/ms-playwright/chromium*/chrome-win/chrome.exe')); chrome = g[0] if g else None
row(bool(chrome), 'Chrome/Chromium' + (f' ({chrome})' if chrome else ''), 'install Chrome or run: npx playwright install chromium (then it is auto-detected), or set CHROME_PATH')
m = os.path.join(ROOT, 'models'); row(all(os.path.exists(os.path.join(m, f)) for f in ('kokoro-v1.0.onnx', 'voices-v1.0.bin')), 'Kokoro model files (downloaded automatically on first narrate.py)', 'will download ~350 MB from GitHub releases on first use')
print('\nAll good.' if not bad else f'\n{bad} item(s) need attention.')
