if(window.__APP_INIT__){throw new Error('__APP_INIT__ duplicate')}window.__APP_INIT__=true;document.addEventListener('DOMContentLoaded',init,{once:true});
// מאזין לטעינה ומפעיל את כל הלוגיקה
window.addEventListener('load', () => {
  // אלמנטים מרכזיים
  const body = document.body;
  const desktopBtn = document.getElementById('desktopViewBtn');
  const mobileBtn = document.getElementById('mobileViewBtn');
  const searchInput = document.getElementById('searchInput');
  const classSelect = document.getElementById('classSelect');
  const studentsTableBody = document.querySelector('#studentsTable tbody');
  const whatsappBtn = document.getElementById('whatsappBtn');
  const emailBtn = document.getElementById('emailBtn');
  const pdfBtn = document.getElementById('pdfBtn');

  // מצב תצוגה
  function setDesktopView(){
    body.classList.remove('mobile-view');
    body.classList.add('desktop-view');
    desktopBtn.classList.add('primary');
    mobileBtn.classList.remove('primary');
  }
  function setMobileView(){
    body.classList.remove('desktop-view');
    body.classList.add('mobile-view');
    mobileBtn.classList.add('primary');
    desktopBtn.classList.remove('primary');
  }

  desktopBtn.addEventListener('click', setDesktopView);
  mobileBtn.addEventListener('click', setMobileView);

  // מערך דמו של 6 תלמידים (פיקטיבי) - אין כאן מידע אמיתי
  const students = [
    {id:1, first:'אדם', last:'כהן', klass:'ז1', group:'A', mathTeacher:'מ. לוי', date:'2025-06-12', gradeName:'מבחן א', grade:85, notes:'מצוין'},
    {id:2, first:'אילן', last:'ברק', klass:'ז2', group:'B', mathTeacher:'מ. לוי', date:'2025-06-12', gradeName:'מבחן א', grade:73, notes:''},
    {id:3, first:'נועה', last:'אלמוג', klass:'ח1', group:'A', mathTeacher:'ר. אבן', date:'2025-07-01', gradeName:'מבחן ב', grade:92, notes:'נדרש מעקב'},
    {id:4, first:'טל', last:'דגן', klass:'ח2', group:'C', mathTeacher:'ר. אבן', date:'2025-07-01', gradeName:'מבחן ב', grade:66, notes:'שיפור רצוי'},
    {id:5, first:'יובל', last:'זמיר', klass:'ט1', group:'B', mathTeacher:'מ. לוי', date:'2025-05-20', gradeName:'חוברת', grade:78, notes:''},
    {id:6, first:'ליה', last:'חיים', klass:'ט2', group:'A', mathTeacher:'ד. שביט', date:'2025-05-20', gradeName:'חוברת', grade:88, notes:'מעורבב בקבוצה'}
  ];

  // בניית שורת טבלה
  function buildRow(student){
    const tr = document.createElement('tr');
    tr.dataset.id = student.id;

    // עמודת בחירה
    const tdSelect = document.createElement('td');
    tdSelect.className = 'select-col';
    const chk = document.createElement('input');
    chk.type = 'checkbox';
    chk.className = 'row-select';
    chk.dataset.id = student.id;
    tdSelect.appendChild(chk);
    tr.appendChild(tdSelect);

    const addCell = (text) => { const td = document.createElement('td'); td.textContent = text; return td; };

    tr.appendChild(addCell(student.first));
    tr.appendChild(addCell(student.last));
    tr.appendChild(addCell(student.klass));
    tr.appendChild(addCell(student.group));
    tr.appendChild(addCell(student.mathTeacher));
    tr.appendChild(addCell(student.date));
    tr.appendChild(addCell(student.gradeName));
    tr.appendChild(addCell(student.grade));
    tr.appendChild(addCell(student.notes));

    return tr;
  }

  // רינדור טבלה לפי פילטרים
  function renderTable(){
    const q = (searchInput.value || '').trim().toLowerCase();
    const klass = classSelect.value;
    studentsTableBody.innerHTML = '';

    const filtered = students.filter(s => {
      if(klass && s.klass !== klass) return false;
      if(!q) return true;
      // חיפוש חופשי על שדות עיקריים
      return [s.first, s.last, s.klass, s.group, s.mathTeacher, s.gradeName, String(s.grade), s.notes]
        .join(' ').toLowerCase().includes(q);
    });

    if(filtered.length === 0){
      const tr = document.createElement('tr');
      const td = document.createElement('td');
      td.colSpan = 10;
      td.textContent = 'לא נמצאו תלמידים.';
      td.style.textAlign = 'center';
      tr.appendChild(td);
      studentsTableBody.appendChild(tr);
      return;
    }

    filtered.forEach(s => studentsTableBody.appendChild(buildRow(s)));
  }

  // חיבורים לאירועי חיפוש/סינון
  searchInput.addEventListener('input', () => renderTable());
  classSelect.addEventListener('change', () => renderTable());

  // פעולות שיתוף
  function getSelectedStudents(){
    const checks = Array.from(document.querySelectorAll('.row-select:checked'));
    const ids = checks.map(c => Number(c.dataset.id));
    return students.filter(s => ids.includes(s.id));
  }

  whatsappBtn.addEventListener('click', () => {
    const sel = getSelectedStudents();
    if(sel.length === 0){ alert('בחר/י לפחות תלמיד אחד לשיתוף ב-WhatsApp.'); return; }
    const lines = sel.map(s => `${s.first} ${s.last} (${s.klass}) - ${s.gradeName}: ${s.grade}`);
    const text = encodeURIComponent(lines.join('\n'));
    // פתיחה בלשונית חדשה באמצעות wa.me (משתמש במספר ריק - המשתמש ישלים את המספר ב-WhatsApp)
    const url = `https://wa.me/?text=${text}`;
    window.open(url, '_blank');
  });

  emailBtn.addEventListener('click', () => {
    const sel = getSelectedStudents();
    if(sel.length === 0){ alert('בחר/י לפחות תלמיד אחד לשיתוף במייל.'); return; }
    const subject = encodeURIComponent('דוח ציונים - מרכז נתוני תלמידים');
    const body = encodeURIComponent(sel.map(s => `${s.first} ${s.last} (${s.klass}) - ${s.gradeName}: ${s.grade}`).join('\n'));
    const mailto = `mailto:?subject=${subject}&body=${body}`;
    window.location.href = mailto;
  });

  pdfBtn.addEventListener('click', () => {
    // בשלב זה פשוט קורא ל-print; שיפור עתידי: יצירת PDF מהתוכן
    window.print();
  });

  // אינטראקציה קלה: לחיצה על שורה מסמנת את הצ'קבוקס
  studentsTableBody.addEventListener('click', (e) => {
    const tr = e.target.closest('tr');
    if(!tr) return;
    const chk = tr.querySelector('.row-select');
    if(!chk) return;
    // אם לחצו על ה-checkbox עצמו — אין צורך להחליף סטייט
    if(e.target === chk) return;
    chk.checked = !chk.checked;
  });

  // אתחול ריאקטיבי קטן
  renderTable();
  // סיבוב תחילי לפי מחלקת body הנוכחית
  if(body.classList.contains('mobile-view')){ setMobileView(); } else { setDesktopView(); }
});

// ========================
// טיוב קוד: טעינת נתונים אמיתיים
// ========================
const gradeFiles = {
  Z: `מאור\tמזרחי\tז’1\t100\nאדל\tפאילייב\tז' 1\t100\nטליה\tברימט\tז' 1\t99\nדניאל\tברקוביץ\tז' 1\t99\nשיר\tזכריה\tז' 1\t98\nמאיה\tחודורוב\tז' 1\t98\nסופיה ניצה\tשוורצר\tז' 1\t98\nמעיין\tעמדי\tז' 1\t97\nאריאל\tפינקס\tז' 1\t97\nיעל\tשצמן\tז' 1\t97\nעדי\tבאנון\tז' 3\t96\nנועה\tמכחל\tז' 1\t95\nדניאלה\tמוגס\tז' 1\t94\nאוריה\tסיאנוב\tז' 1\t93\nאופק\tכהן\tז' 1\t92\nנתנאל\tמלניק\tז' 1\t89\nיהלי\tציקווש\tז' 1\t89\nאופיר חיים\tאופק\tז' 4\t89\nליהי\tאוסקר\tז' 1\t88\nאוריה אברהם\tששון\tז' 1\t88\nלירן\tאזולאי\tז' 1\t87\nבנימין\tדהן\tז' 1\t87\nעילי\tשוורץ\tז' 1\t87\nדניאל\tכהן נחמו\tז' 4\t87\nעידן ישראל\tאמויאל\tז' 3\t85\nנתנאל\tירמיהו\tז' 3\t85\nאייל\tרחמים\tז' 3\t85\nאריאל\tבן כליפה\tז' 4\t82\nאושרי\tגבאי\tז' 4\t82\nעילאי\tלוי אילוז\tז’2\t81\nדוד\tסולטן\tז' 4\t80\nטאמנסאו\tסנבטו\tז' 3\t80\nרבקה\tקוסשוילי\tז' 3\t80\nנהוראי שלמה\tששון\tז' 4\t79\nנווה\tאסיאג\tז' 4\t77\nניר\tשכטמן\tז' 1\t76\nסתיו\tמזרחי\tז' 3\t76\nגבריאל\tאלישקובי\tז' 3\t74\nאלרואי משה\tגידניאן\tז' 4\t74\nגיא\tכהן\tז' 4\t71\nירין\tגיא\tז' 4\t69\nארטיום\tחקימוב\tז' 3\t69\nעדי\tבאנון\tז' 3\t68\nאגם\tכהן\tז' 4\t68\nאלין\tבנישו\tז' 3\t66\nליאם ציון\tפרטוק\tז’2\t65\nליאו\tבנד\tז’2\t61\nליעד מאיר\tבר\tז’2\t56\nאייל\tדוידוב\tז’2\t56\nאסף\tדאבוש\tז' 3\t55\nשי\tקידן\tז’2\t55\nליאן\tאגמי\tז' 3\t53\nאורי\tמטר\tז’3\t53\nירין עמרם\tבן חמו\tז' 3\t52\nיהלי\tארגאו\tז' 3\t51\nאושר\tבן מיכאל\tז' 3\t51\nליאן\tמזרחי\tז' 4\t51\nליאן\tאלמליח\tז' 4\t49\nנועם\tאליאב\tז’2\t48\nאליה\tמנזור\tז’2\t46\nאושרי\tהולנדר\tז' 4\t45\nגלי\tבן חיים\tז’2\t45\nלייה\tמזרחי\tז' 4\t43\nמאור\tבביוב\tז’2\t41\nליה\tחפצדי\tז’2\t40\nמאור\tאדרי\tז' 4\t39\nבת אל\tהאילו\tז' 4\t37\nאושר עזרא\tמזרחי\tז’2\t30\nאורי שמעון\tצרפי\tז’2\t17\nהודיה\tטל-שיר\tז’2\t15\nנטליה\tצ'יגירב\tז' 4\t9\nעדינה\tרזייב\tז' 1\t\nאמילי\tשמש\tז' 1\t\nנטע\tאיסיאס\tז' 3\t` ,
  H: `אלירן שם טוב\t59\nאופיר עובדיה\t72\nאלירן ארגאו\t74\nאיתי בן דוד\t64\nמילאן חנניה\t76\nאורי אזולאי\t90\nאדל אמין זאדה\t61\nוזה קרטבלשווילי\t67\nיפת פוסטרלוב\t78\nקליקידן צ'קול\t78\nנועם חיים כהן\t85\nמאור עבו\t76\nאתגר זקין\t93\nיובל ראובני\t88\nליאן חפצדי\t56\nנוי אבוקסיס\t100\nאליה שמש\t50\nאופיר מעלומי\t53\nטליה עמר\t78\nמישל יזרעאלוב\t69\nאיתי שרביט\t50\nרומי סולומון\t88\nעמית יוסף\t73\nאיתי רומי\t74\n` ,
  T: '' // אין קובץ ט' כרגע
};

function countStudents(raw, sep='\t') {
  if (!raw) return 0;
  return raw.trim().split(/\n/).filter(line => line.trim() && line.split(sep)[0]).length;
}

window.addEventListener('DOMContentLoaded', () => {
  document.getElementById('countZ').textContent = countStudents(gradeFiles.Z);
  document.getElementById('countH').textContent = countStudents(gradeFiles.H);
  document.getElementById('countT').textContent = countStudents(gradeFiles.T);
  document.getElementById('countTotal').textContent =
    countStudents(gradeFiles.Z) + countStudents(gradeFiles.H) + countStudents(gradeFiles.T);
});

/* Landing interactions + counts loading */
const ADMIN_CODE = "maya1167";

const qs = (s, r = document) => r.querySelector(s);
const countsEls = {
  g7: qs("#count7"),
  g8: qs("#count8"),
  g9: qs("#count9"),
  total: qs("#totalCount")
};

/* 1) אימות מנהל */
const editBtn = qs("#editBtn");
const dlg = qs("#adminDialog");
const codeInput = qs("#adminCode");
const err = qs("#adminError");
const cancelBtn = qs("#cancelAdmin");

editBtn?.addEventListener("click", () => {
  err.hidden = true;
  dlg.showModal();
  setTimeout(() => codeInput.focus(), 50);
});

cancelBtn?.addEventListener("click", () => dlg.close());

qs("#adminForm")?.addEventListener("submit", (e) => {
  e.preventDefault();
  const ok = codeInput.value.trim() === ADMIN_CODE;
  if (!ok) {
    err.hidden = false;
    codeInput.select();
    return;
  }
  dlg.close();
  // הפניה למסך הניהול
  window.location.href = "admin.html";
});

/* 2) טעינת מוני תלמידים
   – עובד אוטומטית אם קיים /data/counts.json 
   – אחרת יש “פולבק” לערכים מקומיים.
   מבנה counts.json:
   {
     "grade7": 0,
     "grade8": 0,
     "grade9": 0,
     "total": 0
   }
*/
async function loadCounts() {
  const fallback = { grade7: "—", grade8: "—", grade9: "—", total: "—" };

  try {
    const res = await fetch("./data/counts.json", { cache: "no-store" });
    if (!res.ok) throw new Error("no counts.json yet");
    const data = await res.json();

    const g7 = Number(data.grade7 ?? 0);
    const g8 = Number(data.grade8 ?? 0);
    const g9 = Number(data.grade9 ?? 0);
    const total = Number(data.total ?? (g7 + g8 + g9)) || "—";

    countsEls.g7.textContent = g7 || "—";
    countsEls.g8.textContent = g8 || "—";
    countsEls.g9.textContent = g9 || "—";
    countsEls.total.textContent = total;

  } catch (_e) {
    // פולבק — ניתן לעדכן ידנית פה אם תרצה מספרי ברירת מחדל:
    countsEls.g7.textContent = fallback.grade7;
    countsEls.g8.textContent = fallback.grade8;
    countsEls.g9.textContent = fallback.grade9;
    countsEls.total.textContent = fallback.total;
  }
}

loadCounts();
