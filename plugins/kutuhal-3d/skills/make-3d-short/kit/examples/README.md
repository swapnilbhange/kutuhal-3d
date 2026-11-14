# Example: planning-fallacy (30 s, 9:16)
A complete, tested project: `input/script.txt` → `story/` → `timeline/` → `scenes/` (cast, props, 2 sets, 8 shot modules) → `preview_540p.mp4`.
Use it as the template for new scenes. To re-render: `cp -r examples/planning-fallacy projects/ && node render.mjs --project projects/planning-fallacy && python3 audio/mix.py --project projects/planning-fallacy` (narration is included; `tools/narrate.py` regenerates it).
