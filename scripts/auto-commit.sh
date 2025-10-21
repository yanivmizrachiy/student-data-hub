#!/usr/bin/env bash
set -e
echo "[auto-commit] watcher running… (Ctrl+C to stop)"
while inotifywait -r -e modify,create,delete,move --exclude '(\.git|node_modules|logs|inbox/grades/.*\.tmp)$' .; do
  CHANGES=$(git status --porcelain)
  if [ -n "$CHANGES" ]; then
    git add -A
    MSG="💾 Auto-save update ($(date +'%Y-%m-%d %H:%M:%S'))"
    git commit -m "$MSG" || true
    git push origin main || true
    echo "$(date -Is) | $MSG" >> logs/auto-commit.log
    # עדכן README בתיעוד קצר
    echo "📊 עדכון אוטומטי: $(date +'%Y-%m-%d %H:%M:%S')" >> README.md
    git add README.md && git commit -m "🧾 Update README timestamp" || true
    git push origin main || true
  fi
done
