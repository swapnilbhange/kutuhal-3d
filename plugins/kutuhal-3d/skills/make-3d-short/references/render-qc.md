# Render & QC checklist

1. **Narration**: `python3 tools/narrate.py --project projects/<slug>` → check printed duration, `timeline/transcript.txt`, and that every word has a time. Voice choice: `--audition` renders sample lines in 9 voices (the user listens; Claude cannot hear them) – default `hm_psi` (male, documentary) or `af_heart` (warm female).
2. **Contact sheet**: `node render.mjs --project P --sheet --scale 0.5` → read `build/sheets/*.png` yourself. Fix framing/pose/overlay problems, repeat.
3. **Key stills** at overlay moments: `--stills 9.5,17,23`. Check caption clearance, overlay text legibility, no clipped props.
4. **Style options** (optional): `--styles` grid.
5. **Preview**: `--from 0 --to 10 --scale 0.5` → `build/preview.mp4`.
6. **Full render**: `node render.mjs --project P --workers 2` (add `--resume` after a crash). → `build/video_silent.mp4`.
7. **Audio + mux**: `python3 audio/mix.py --project P` → `out/<title>.mp4`, `out/captions.srt`, `out/narration.wav`.
8. **Verify the file**: `ffprobe` (resolution, fps, duration ≈ `shots.json.duration`, audio stream), extract 3 frames and look at them, check loudness ≈ −14 LUFS.
9. Deliver the MP4 (+ SRT + narration) with `SendUserFile`; one line each.
