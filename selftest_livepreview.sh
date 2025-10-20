#!/bin/bash
# 🧠 Live Preview SelfTest v1.0 – אין דמו. עבודה אמיתית בלבד.

set -e
echo "🔍 בדיקה אוטומטית של Live Preview..."

required_files=(
  ".vscode/settings.json"
  ".vscode/tasks.json"
  ".vscode/extensions.json"
  "index.html"
)

missing=0
for f in "${required_files[@]}"; do
  if [ ! -f "$f" ]; then
    echo "❌ חסר קובץ: $f"
    missing=1
  fi
done

if ! grep -q '"ms-vscode.live-server"' .vscode/extensions.json 2>/dev/null; then
  echo "❌ התוסף Live Preview (ms-vscode.live-server) לא מוגדר בהמלצות"
  missing=1
fi

if ! grep -q '"EmbeddedPreview"' .vscode/settings.json 2>/dev/null; then
  echo "❌ ההגדרה EmbeddedPreview חסרה ב-.vscode/settings.json"
  missing=1
fi

if ! grep -q '"livePreview.autoRefreshPreview": "OnSave"' .vscode/settings.json 2>/dev/null; then
  echo "❌ ההגדרה autoRefreshPreview=OnSave חסרה"
  missing=1
fi

if [ "$missing" -eq 0 ]; then
  echo "🟩 SUCCESS: כל הגדרות Live Preview תקינות. רענון אוטומטי בכל שמירה."
else
  echo "🟥 FAILED: יש להשלים את ההגדרות החסרות המודפסות למעלה."
  exit 1
fi
