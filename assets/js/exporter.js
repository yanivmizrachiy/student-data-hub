/* exporter.js — יצוא CSV/JSON ודוח תלמיד להדפסה */
(function(){
  'use strict';

  function toCSV(rows){
    if(!rows || rows.length === 0) return '';
    const keys = Object.keys(rows[0]);
    const lines = [keys.join(',')];
    for(const r of rows){
      lines.push(keys.map(k => {
        const v = r[k] === undefined || r[k] === null ? '' : String(r[k]);
        return v.includes(',') ? `"${v.replace(/"/g,'""')}"` : v;
      }).join(','));
    }
    return lines.join('\n');
  }

  async function exportCSVForClass(class_id){
    // export students and grades for the class
    const students = await window.db.getAll('students');
    const classStudents = students.filter(s => !class_id || s.class_id === class_id);
    const grades = await window.db.getAll('grades');
    const rows = [];
    for(const g of grades){
      if(classStudents.find(s=>s.student_id===g.student_id)) rows.push(g);
    }
    const csv = toCSV(rows);
    const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
    window.downloadBlob(class_id ? `grades-${class_id}.csv` : 'grades-all.csv', blob);
  }

  async function exportJSONAll(){
    const all = await window.db.exportAll();
    const blob = new Blob([JSON.stringify(all, null, 2)], {type:'application/json'});
    window.downloadBlob('grades-all.json', blob);
  }

  // build print view for a student (page-006 expects ?id=)
  async function renderStudentReport(student_id){
    const student = await window.db.get('students', student_id);
    const grades = await window.db.queryGradesByStudent(student_id);
    const container = document.getElementById('studentProfile');
    if(!container) return;
    const nameEl = document.getElementById('studentName');
    nameEl.textContent = `${student.first_name} ${student.last_name}`;
    const gradesEl = document.getElementById('studentGrades');
    const table = document.createElement('table');
    table.innerHTML = '<thead><tr><th>תאריך</th><th>שם משימה</th><th>קטגוריה</th><th>משקל</th><th>ציון</th></tr></thead>';
    const tbody = document.createElement('tbody');
    for(const g of grades){
      const assignment = await window.db.get('assignments', g.assignment_id);
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${assignment ? assignment.date : ''}</td><td>${assignment ? assignment.title : g.assignment_id}</td><td>${assignment ? assignment.category : ''}</td><td>${assignment ? assignment.weight : ''}</td><td>${g.grade}</td>`;
      tbody.appendChild(tr);
    }
    table.appendChild(tbody);
    gradesEl.innerHTML = '';
    gradesEl.appendChild(table);
  }

  document.addEventListener('DOMContentLoaded', ()=>{
    const exportCsvBtn = document.getElementById('exportCsvBtn');
    const exportJsonBtn = document.getElementById('exportJsonBtn');
    const exportClassSelect = document.getElementById('exportClassSelect');
    if(exportCsvBtn){
      exportCsvBtn.addEventListener('click', async ()=>{
        const classId = exportClassSelect ? exportClassSelect.value : '';
        await exportCSVForClass(classId);
      });
    }
    if(exportJsonBtn){ exportJsonBtn.addEventListener('click', exportJSONAll); }

    // page-006: render student if id in query
    if(window.location.pathname.endsWith('/pages/page-006.html')){
      const params = new URLSearchParams(location.search);
      const id = params.get('id');
      if(id) renderStudentReport(id);
      const waBtn = document.getElementById('waShareBtn');
      const mailBtn = document.getElementById('mailShareBtn');
      const pdfBtn = document.getElementById('pdfExportBtn');
      if(waBtn){ waBtn.addEventListener('click', async ()=>{
        const student = await window.db.get('students', id);
        const grades = await window.db.queryGradesByStudent(id);
        const summary = `${student.first_name} ${student.last_name}\n` + grades.map(g=>`${g.assignment_id}: ${g.grade}`).join('\n');
        window.waShare(summary);
      }); }
      if(mailBtn){ mailBtn.addEventListener('click', async ()=>{
        const student = await window.db.get('students', id);
        const grades = await window.db.queryGradesByStudent(id);
        const subject = `דו"ח ציונים - ${student.first_name} ${student.last_name}`;
        const body = grades.map(g=>`${g.assignment_id}: ${g.grade}`).join('\n');
        window.mailShare(subject, body);
      }); }
      if(pdfBtn){ pdfBtn.addEventListener('click', ()=>window.print()); }
    }
  });

  window.exporter = { exportCSVForClass, exportJSONAll, renderStudentReport };
})();
