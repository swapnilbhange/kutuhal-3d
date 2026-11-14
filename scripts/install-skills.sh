#!/usr/bin/env bash
# Copy (or symlink) the five Kutuhal 3D skills into the skills folder of another AI coding tool.
# The skills must stay SIDE BY SIDE (the stage skills refer to ../make-3d-short/), so this installs all five together.
#
#   bash scripts/install-skills.sh <tool> [--scope user|project] [--dest DIR] [--link] [--dry-run]
#   tools: claude | codex | chatgpt | gemini | antigravity | generic
set -euo pipefail
SRC="$(cd "$(dirname "$0")/.." && pwd)/plugins/kutuhal-3d/skills"
TOOL="${1:-}"; shift || true
SCOPE=user; DEST=""; LINK=0; DRY=0
while [ $# -gt 0 ]; do case "$1" in
  --scope) SCOPE="$2"; shift 2;; --dest) DEST="$2"; shift 2;; --link) LINK=1; shift;; --dry-run) DRY=1; shift;;
  *) echo "unknown option $1"; exit 2;; esac; done
[ -d "$SRC/make-3d-short" ] || { echo "cannot find $SRC/make-3d-short"; exit 1; }
if [ -z "$DEST" ]; then
  case "$TOOL:$SCOPE" in
    claude:user)        DEST="$HOME/.claude/skills";;
    claude:project)     DEST="$PWD/.claude/skills";;
    codex:user|chatgpt:user|generic:user)           DEST="$HOME/.agents/skills";;
    codex:project|chatgpt:project|generic:project)  DEST="$PWD/.agents/skills";;
    gemini:user)        DEST="$HOME/.gemini/skills";;
    gemini:project)     DEST="$PWD/.gemini/skills";;
    antigravity:user)   DEST="$HOME/.gemini/antigravity/skills";;
    antigravity:project) DEST="$PWD/.agents/skills";;
    *) echo "usage: $0 <claude|codex|chatgpt|gemini|antigravity|generic> [--scope user|project] [--dest DIR] [--link] [--dry-run]"; exit 2;;
  esac
fi
echo "Installing Kutuhal 3D skills -> $DEST  ($( [ $LINK = 1 ] && echo symlink || echo copy ))"
[ $DRY = 1 ] && { for s in "$SRC"/*/; do echo "  would install $(basename "$s")"; done; exit 0; }
mkdir -p "$DEST"
for s in "$SRC"/*/; do
  n="$(basename "$s")"; rm -rf "$DEST/$n"
  if [ $LINK = 1 ]; then ln -s "${s%/}" "$DEST/$n"; else cp -r "${s%/}" "$DEST/$n"; fi
  echo "  + $n"
done
echo "Done. Restart the tool (or start a new session), then ask: \"Make a 9:16 short from this script\" and attach your script."
echo "Skill folder with the studio kit: $DEST/make-3d-short/kit"
