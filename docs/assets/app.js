// קובץ JS לעמוד הכניסה
// מטפל בטעינת הנתונים, חישוב ספירות לפי שכבה ועדכון הממשק

document.addEventListener('DOMContentLoaded', () => {
  const DATA_URL = 'data/students.json';
  const badge = document.getElementById('no-data-badge');
  const countEls = Array.from(document.querySelectorAll('.count[data-layer]'));

  // פונקציה: ספירה לפי שכבה
  // מקבלת מערך תלמידים על פי המבנה המוסכם.
  function countByLayer(students, layer){
    if(!Array.isArray(students)) return 0;
    return students.reduce((acc, s) => {
      try{
        if(!s) return acc;
        // שדה 'שכבה' עלול להיות חסר — התעלם במקרה כזה
        if(String(s['שכבה'] || '').trim() === String(layer)) return acc + 1;
        return acc;
      }catch(e){
        return acc;
      }
    }, 0);
  }

  // עדכון טקסט ספירה עם אנימציה עדינה
  function setCount(el, n){
    if(!el) return;
    // יצירת מלל לפי פורמט
    el.classList.remove('updated');
    const strong = el.querySelector('strong') || document.createElement('strong');
    strong.textContent = String(n);
    if(!strong.parentNode) el.appendChild(strong);
    // הפעלת אנימציית fade-in קלה
    requestAnimationFrame(() => {
      el.classList.add('updated');
      // להראות את המספר אחרי עדכון
      setTimeout(() => {
        strong.classList.add('show');
      }, 20);
      setTimeout(() => {
        el.classList.remove('updated');
        strong.classList.remove('show');
      }, 300);
    });
  }

  // טיפול במצבי חוסר נתונים
  function handleNoData(){
    // הצגה עדינה של badge (aria-live מגיע מה-HTML)
    if(badge) badge.hidden = false;
  }

  // טעינת קובץ ה-JSON
  async function loadData(){
    try{
      const res = await fetch(DATA_URL, { cache: 'no-store' });
      if(!res.ok){
        console.info('data/students.json לא נמצא או שגיאה בטעינה, מציבים 0.');
        handleNoData();
        updateCountsWith([]);
        return;
      }
      const json = await res.json();
      const students = Array.isArray(json['תלמידים']) ? json['תלמידים'] : [];
      if(students.length === 0){
        handleNoData();
      }
      updateCountsWith(students);
    }catch(err){
      // שגיאות נטוורק/פורמט מטופלות בעדינות
      console.info('שגיאה בקריאת data/students.json — שימוש ב-0.', err);
      handleNoData();
      updateCountsWith([]);
    }
  }

  function updateCountsWith(students){
    // לכל אלמנט count[data-layer] עדכן את המספר המתאים
    countEls.forEach(el => {
      const layer = el.getAttribute('data-layer');
      const n = countByLayer(students, layer);
      setCount(el, n);
    });
  }

  // אתחול
  loadData();
});
