
# student-data-hub

[![Excel Import](https://img.shields.io/github/actions/workflow/status/yanivmizrachiy/student-data-hub/validate-excels.yml?label=Excel%20Import)](https://github.com/yanivmizrachiy/student-data-hub/actions/workflows/validate-excels.yml)

## Live Preview (HMR) עם Vite

להרצת Live Preview עם HMR:

```bash
npm run dev
```

המערכת תעלה על פורט 5173 ותבצע רענון אוטומטי לכל שינוי בקבצי הפרונט.

### קבצים רלוונטיים:
- vite.config.js
- package.json (סקריפט dev)

### סטטוס:
שלב 1 (הגדרת Live Preview) הושלם.
[![Live Preview SelfTest](https://img.shields.io/github/actions/workflow/status/${{ github.repository }}/livepreview-selftest.yml?label=Live%20Preview%20SelfTest)](../../actions/workflows/livepreview-selftest.yml)

# עמוד כניסה — ניהול תלמידים

קבצים שנוצרו בריפו זה להכלת עמוד כניסה סטטי בעברית (RTL). הקוד אמיתי ומוכן לפריסה סטטית.

קבצים שנמצאים בריפו:

- `index.html` — עמוד הכניסה בעברית (`dir="rtl"`) עם כותרת, תת-כותרת, שלושה כרטיסי שכבות וקישור לעמודי שכבות עתידיים.
- `assets/styles.css` — סגנונות: משתני צבעים, רקע גרדיאנטי, שכבת glass, אנימציות והגדרות רספונסיביות ונגישות.
- `assets/app.js` — לוגיקת טעינת הנתונים וחשבון הספירות. נטען בשולב `fetch('data/students.json', { cache: 'no-store' })`.
- `data/students.json` — מקור הנתונים (כרגע מערך `תלמידים: []`).

התנהגות חשובה:

- בעת טעינת העמוד הסקריפט ינסה לקרוא את `data/students.json`. אם הקובץ לא קיים או ריק, יוצג badge קטן בצד שמאל-עליון ("אין נתונים זמינים") והמספרים בכל שכבה יוצגו כ־0. השגיאות נרשמות באמצעות `console.info` בלבד.
- הקוד מתמודד בחן עם שדות חסרים ברשומות — אם `שכבה` חסר, הרשומה לא נספרת.

כיצד לבדוק מקומית / לראות תצוגה חיה:

1. פתח את התיקייה בסביבת פיתוח שמכילה שרת סטטי (למשל GitHub Pages, VS Code Live Server, או `python -m http.server`).
2. טען את `index.html` בדפדפן — העמוד נטען RTL ויציג את הכרטיסים.

הערה: אין טקסט "דמו" מוצג על המסך. קובץ ה־JSON יכול להכיל נתונים אמיתיים בפורמט המפורט בבקשה המקורית.
📊 עדכון אוטומטי: 2025-10-21 12:40:34
📊 עדכון אוטומטי: 2025-10-21 12:40:36
📊 עדכון אוטומטי: 2025-10-21 12:40:38
📊 עדכון אוטומטי: 2025-10-21 12:40:40
📊 עדכון אוטומטי: 2025-10-21 12:40:42
📊 עדכון אוטומטי: 2025-10-21 12:40:43
📊 עדכון אוטומטי: 2025-10-21 12:40:45
📊 עדכון אוטומטי: 2025-10-21 12:40:47
📊 עדכון אוטומטי: 2025-10-21 12:40:48
📊 עדכון אוטומטי: 2025-10-21 12:44:36
📊 עדכון אוטומטי: 2025-10-21 12:44:36
📊 עדכון אוטומטי: 2025-10-21 12:45:45
📊 עדכון אוטומטי: 2025-10-21 12:56:34
📊 עדכון אוטומטי: 2025-10-21 12:56:46
