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
