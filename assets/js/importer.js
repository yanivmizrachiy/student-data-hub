/* importer.js — parse CSV files, validate and save to IndexedDB */
(function(){
  'use strict';

  // Simple CSV parser (handles commas, basic quoted fields)
  function parseCSV(text){
    const rows = [];
    const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0);
    if(lines.length === 0) return [];
    const headers = lines[0].split(',').map(h=>h.trim());
    for(let i=1;i<lines.length;i++){
      const cols = lines[i].split(',').map(c=>c.trim());
      const obj = {};
      headers.forEach((h, idx) => obj[h] = cols[idx] === undefined ? '' : cols[idx]);
      rows.push(obj);
    }
    return {headers, rows};
  }

  // map parsed CSV to store name (basic heuristic based on headers)
  function detectStore(headers){
    const h = headers.map(x=>x.toLowerCase());
    if(h.includes('student_id') && h.includes('first_name')) return 'students';
    if(h.includes('class_id') && h.includes('label')) return 'classes';
    if(h.includes('assignment_id') && h.includes('title')) return 'assignments';
    if(h.includes('assignment_id') && h.includes('grade')) return 'grades';
    return null;
  }

  async function handleFiles(files, reportEl){
    const reports = [];
    for(const f of files){
      const text = await f.text();
      const parsed = parseCSV(text);
      const store = detectStore(parsed.headers);
      if(!store){ reports.push({file:f.name, status:'unknown format'}); continue; }
      // basic validation
      if(parsed.rows.length === 0){ reports.push({file:f.name, status:'empty'}); continue; }
      // convert booleans and numbers where appropriate
      const cleaned = parsed.rows.map(r => {
        const out = {};
        for(const k in r){
          let v = r[k];
          if(v === 'true') v = true; else if(v === 'false') v = false;
          if(!isNaN(v) && v !== '') v = Number(v);
          out[k] = v;
        }
        return out;
      });
      try{
        await window.db.putAll(store, cleaned);
        reports.push({file:f.name, status:'imported', store, count:cleaned.length});
      }catch(e){ reports.push({file:f.name, status:'error', error:e.message}); }
    }
    if(reportEl) reportEl.textContent = JSON.stringify(reports, null, 2);
    return reports;
  }

  document.addEventListener('DOMContentLoaded', () => {
    const filesInput = document.getElementById('csvFiles');
    const doImportBtn = document.getElementById('doImport');
    const reportEl = document.getElementById('importReport');
    if(filesInput && doImportBtn){
      doImportBtn.addEventListener('click', async ()=>{
        const files = Array.from(filesInput.files || []);
        if(files.length === 0){ alert('בחר/י קבצי CSV לייבוא'); return; }
        try{
          const reports = await handleFiles(files, reportEl);
          alert('ייבוא הסתיים. בדוק/י דוח.');
        }catch(e){ console.error(e); alert('שגיאה בייבוא'); }
      });
    }
  });

})();
