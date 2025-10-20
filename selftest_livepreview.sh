#!/bin/bash
# 🧠 Live Preview SelfTest v1.0 – מאת יניב רז

set -e
echo "🔍 בדיקה אוטומטית של Live Preview..."

# בדיקת קיומם של קבצי הגדרות
missing_files=0
for f in .vscode/settings.json .vscode/tasks.json .vscode/extensions.json index.html; do
  if [ ! -f "$f" ]; then
    echo "❌ חסר קובץ: $f"
    missing_files=1
  fi
done

# בדיקה שהתוסף מופיע בקובץ ההרחבות
if ! grep -q "ms-vscode.live-server" .vscode/extensions.json 2>/dev/null; then
  echo "❌ התוסף Live Preview לא הוגדר בקובץ extensions.json"
  missing_files=1
fi

# בדיקה שהפרמטרים העיקריים קיימים בהגדרות
if ! grep -q "EmbeddedPreview" .vscode/settings.json 2>/dev/null; then
  echo "❌ הגדרה של EmbeddedPreview חסרה ב-settings.json"
  missing_files=1
fi

# אם הכול נמצא
if [ "$missing_files" -eq 0 ]; then
  echo "🟩 SUCCESS: כל הגדרות Live Preview תקינות."
  echo "🌐 הפעל את Codespace או VSCode – החלון ייפתח אוטומטית."
else
  echo "🟥 FAILED: יש לתקן את הקבצים שצוינו למעלה."
  exit 1
fi
