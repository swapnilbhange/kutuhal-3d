#!/usr/bin/env bash
# Build the installable archives in dist/ from plugins/kutuhal-3d.
# Both archives hold the plugin folder's CONTENTS (so .claude-plugin/plugin.json is at the archive root),
# which is the layout the Claude upload dialog expects. kutuhal-3d.zip is the same file as kutuhal-3d.plugin.
set -euo pipefail
cd "$(dirname "$0")/.."
command -v zip >/dev/null || { echo "zip is required"; exit 1; }
python3 -m json.tool plugins/kutuhal-3d/.claude-plugin/plugin.json >/dev/null
python3 -m json.tool .claude-plugin/marketplace.json >/dev/null
mkdir -p dist && rm -f dist/kutuhal-3d.plugin dist/kutuhal-3d.zip
( cd plugins/kutuhal-3d && zip -qr ../../dist/kutuhal-3d.plugin . -x '*/node_modules/*' -x '*.DS_Store' -x '*/__pycache__/*' )
cp dist/kutuhal-3d.plugin dist/kutuhal-3d.zip
unzip -tq dist/kutuhal-3d.plugin
unzip -l dist/kutuhal-3d.plugin | tail -1
echo "built dist/kutuhal-3d.plugin and dist/kutuhal-3d.zip"
