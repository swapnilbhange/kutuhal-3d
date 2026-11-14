#!/usr/bin/env bash
# Replace the <your-github-username> placeholder everywhere. Usage: ./scripts/set-github-user.sh YOURNAME
set -euo pipefail
[ $# -eq 1 ] || { echo "usage: $0 <github-username>"; exit 2; }
cd "$(dirname "$0")/.."
grep -rl --exclude-dir=.git --exclude-dir=dist --exclude='*.mp4' --exclude='*.wav' --exclude='*.gif' --exclude='*.png' --exclude='*.jpg' --exclude=set-github-user.sh --exclude=PUBLISHING.md -- "<your-github-username>" . | while read -r f; do
  python3 - "$f" "$1" <<'PY'
import sys; p,u=sys.argv[1:]; s=open(p,encoding='utf-8').read().replace('<your-github-username>',u); open(p,'w',encoding='utf-8').write(s); print('updated',p)
PY
done
echo "Done. Review with: git diff"
