
// Guard נגד רינדור כפול
if (window.__APP_MOUNTED__) {
  throw new Error('Script loaded twice – aborting second init');
}
window.__APP_MOUNTED__ = true;

function init() {
  // ========================
  // טיוב קוד: טעינת נתונים אמיתיים
  // ========================
  const gradeFiles = {
    Z: `מאור	מזרחי	ז’1	100
אדל	פאילייב	ז' 1	100
טליה	ברימט	ז' 1	99
דניאל	ברקוביץ	ז' 1	99
שיר	זכריה	ז' 1	98
מאיה	חודורוב	ז' 1	98
סופיה ניצה	שוורצר	ז' 1	98
מעיין	עמדי	ז' 1	97
אריאל	פינקס	ז' 1	97
יעל	שצמן	ז' 1	97
עדי	באנון	ז' 3	96
נועה	מכחל	ז' 1	95
דניאלה	מוגס	ז' 1	94
אוריה	סיאנוב	ז' 1	93
אופק	כהן	ז' 1	92
נתנאל	מלניק	ז' 1	89
יהלי	ציקווש	ז' 1	89
אופיר חיים	אופק	ז' 4	89
ליהי	אוסקר	ז' 1	88
אוריה אברהם	ששון	ז' 1	88
לירן	אזולאי	ז' 1	87
בנימין	דהן	ז' 1	87
עילי	שוורץ	ז' 1	87
דניאל	כהן נחמו	ז' 4	87
עידן ישראל	אמויאל	ז' 3	85
נתנאל	ירמיהו	ז' 3	85
אייל	רחמים	ז' 3	85
אריאל	בן כליפה	ז' 4	82
אושרי	גבאי	ז' 4	82
עילאי	לוי אילוז	ז’2	81
דוד	סולטן	ז' 4	80
טאמנסאו	סנבטו	ז' 3	80
רבקה	קוסשוילי	ז' 3	80
נהוראי שלמה	ששון	ז' 4	79
נווה	אסיאג	ז' 4	77
ניר	שכטמן	ז' 1	76
סתיו	מזרחי	ז' 3	76
גבריאל	אלישקובי	ז' 3	74
אלרואי משה	גידניאן	ז' 4	74
גיא	כהן	ז' 4	71
ירין	גיא	ז' 4	69
ארטיום	חקימוב	ז' 3	69
עדי	באנון	ז' 3	68
אגם	כהן	ז' 4	68
אלין	בנישו	ז' 3	66
ליאם ציון	פרטוק	ז’2	65
ליאו	בנד	ז’2	61
ליעד מאיר	בר	ז’2	56
אייל	דוידוב	ז’2	56
אסף	דאבוש	ז' 3	55
שי	קידן	ז’2	55
ליאן	אגמי	ז' 3	53
אורי	מטר	ז’3	53
ירין עמרם	בן חמו	ז' 3	52
יהלי	ארגאו	ז' 3	51
אושר	בן מיכאל	ז' 3	51
ליאן	מזרחי	ז' 4	51
ליאן	אלמליח	ז' 4	49
נועם	אליאב	ז’2	48
אליה	מנזור	ז’2	46
אושרי	הולנדר	ז' 4	45
גלי	בן חיים	ז’2	45
לייה	מזרחי	ז' 4	43
מאור	בביוב	ז’2	41
ליה	חפצדי	ז’2	40
מאור	אדרי	ז' 4	39
בת אל	האילו	ז' 4	37
אושר עזרא	מזרחי	ז’2	30
אורי שמעון	צרפי	ז’2	17
הודיה	טל-שיר	ז’2	15
נטליה	צ'יגירב	ז' 4	9
עדינה	רזייב	ז' 1	
אמילי	שמש	ז' 1	
נטע	איסיאס	ז' 3	` ,
    H: `אלירן שם טוב	59
אופיר עובדיה	72
אלירן ארגאו	74
איתי בן דוד	64
מילאן חנניה	76
אורי אזולאי	90
אדל אמין זאדה	61
וזה קרטבלשווילי	67
יפת פוסטרלוב	78
קליקידן צ'קול	78
נועם חיים כהן	85
מאור עבו	76
אתגר זקין	93
יובל ראובני	88
ליאן חפצדי	56
נוי אבוקסיס	100
אליה שמש	50
אופיר מעלומי	53
טליה עמר	78
מישל יזרעאלוב	69
איתי שרביט	50
רומי סולומון	88
עמית יוסף	73
איתי רומי	74
` ,
    T: '' // אין קובץ ט' כרגע
  };
  function countStudents(raw, sep='\t') {
    if (!raw) return 0;
    return raw.trim().split(/\n/).filter(line => line.trim() && line.split(sep)[0]).length;
  }

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

  // ========================
  // כל הלוגיקה של דף הבית, טבלאות, חיפוש, שיתוף וכו'
  // ========================
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
    desktopBtn?.classList.add('primary');
    mobileBtn?.classList.remove('primary');
  }
  function setMobileView(){
    body.classList.remove('desktop-view');
    body.classList.add('mobile-view');
    mobileBtn?.classList.add('primary');
    desktopBtn?.classList.remove('primary');
  }
  desktopBtn?.addEventListener('click', setDesktopView);
  mobileBtn?.addEventListener('click', setMobileView);

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
}

document.addEventListener('DOMContentLoaded', () => {
  if (!window.__INIT_DONE__) {
    window.__INIT_DONE__ = true;
    init();
  }
});
