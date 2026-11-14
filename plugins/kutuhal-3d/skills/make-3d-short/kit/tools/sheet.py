"""Contact sheet: python tools/sheet.py OUT.png COLS img1 img2 ...   (labels = file names)"""
import sys
from PIL import Image, ImageDraw
out, cols, files = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
im0 = Image.open(files[0]); th = (216, int(216 * im0.height / im0.width)) if im0.width < im0.height else (384, int(384 * im0.height / im0.width))
rows = (len(files) + cols - 1) // cols
sheet = Image.new('RGB', (cols * th[0], rows * th[1]), (20, 20, 20))
for i, f in enumerate(files):
    im = Image.open(f).convert('RGB').resize(th); d = ImageDraw.Draw(im)
    d.rectangle([0, 0, th[0], 16], fill=(0, 0, 0)); d.text((4, 3), f.replace('\\', '/').split('/')[-1].rsplit('.', 1)[0][:34], fill=(255, 220, 0))
    sheet.paste(im, ((i % cols) * th[0], (i // cols) * th[1]))
sheet.save(out)
print('wrote', out, len(files), 'tiles')
