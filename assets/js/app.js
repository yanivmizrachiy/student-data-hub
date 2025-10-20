/* app.js — ניווט, שיתוף, רישום PWA, כלים עזר */
// ES module entry for app utilities
export const ADMIN_HASH = 'e31cbffaa935ecedb42b4a07cebba1de50dae6b7fe19d82a16bda8ec919af8a0';

export async function sha256Hex(text){
  const enc = new TextEncoder().encode(text);
  const digest = await crypto.subtle.digest('SHA-256', enc);
  const hashArray = Array.from(new Uint8Array(digest));
  return hashArray.map(b => b.toString(16).padStart(2,'0')).join('');
}

export async function enterAdmin(){
  const code = prompt('הכנס/י קוד מנהל:');
  if(!code) return false;
  const h = await sha256Hex(code);
  if(h === ADMIN_HASH){
    sessionStorage.setItem('isAdmin','1');
    alert('אימות הצליח. במצב עריכה.');
    return true;
  }
  alert('קוד שגוי'); return false;
}

// window globals for backward compatibility
window.toPage = function(n){ if(Number.isInteger(n) && n>=0){ if(n===0){window.location.href='/index.html'; return;} const idx=String(n).padStart(3,'0'); window.location.href=`/pages/page-${idx}.html`; } };
window.waShare = function(text){ const url = `https://wa.me/?text=${encodeURIComponent(text)}`; window.open(url,'_blank'); };
window.mailShare = function(subject, body){ const mailto = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`; window.location.href = mailto; };
window.printOrPdf = function(){ window.print(); };

export async function loadTracksCsv(){
  try{
    const res = await fetch('/data-samples/tracks.csv');
    if(!res.ok) throw new Error('failed to fetch tracks');
    const text = await res.text();
    const lines = text.split(/\r?\n/).filter(l=>l.trim().length>0);
    const headers = lines.shift().split(',').map(h=>h.trim());
    const rows = lines.map(l=>{ const cols = l.split(',').map(c=>c.trim()); const obj={}; headers.forEach((h,i)=>obj[h]=cols[i]===undefined?'':cols[i]); return obj; });
    return rows;
  }catch(e){ console.error(e); return []; }
}

// expose on window for legacy pages
window.loadTracksCsv = loadTracksCsv;

// Enrollment/session management
export function getEnrollments(){
  try{ const s = sessionStorage.getItem('enrollments'); return s? JSON.parse(s): []; }catch(e){ return []; }
}
export function setEnrollments(arr){ sessionStorage.setItem('enrollments', JSON.stringify(arr)); }

export function addEnrollmentObj(obj){
  const arr = getEnrollments();
  arr.push(obj); setEnrollments(arr); return arr;
}

// Alias for loadTracks
export const loadTracks = loadTracksCsv;

// Populate tracks select element by grade
export async function populateTracksSelect(grade){
  const sel = document.getElementById('trackSelect');
  if(!sel) return;
  sel.innerHTML = '';
  const tracks = await loadTracksCsv();
  const filtered = tracks.filter(t => (t.grade||'').toString().trim() === (grade||'').toString().trim());
  filtered.sort((a,b)=> Number(a.order||0)-Number(b.order||0));
  for(const t of filtered){
    const opt = document.createElement('option');
    opt.value = t.track_name || t.track || '';
    opt.textContent = `${opt.value} — ${t.teacher_name || ''}`;
    opt.dataset.teacher = t.teacher_name || '';
    sel.appendChild(opt);
  }
  if(sel.options.length===0){ const opt = document.createElement('option'); opt.value=''; opt.textContent='אין הקבצות לשכבה זו'; sel.appendChild(opt); }
}

// Add enrollment from DOM inputs, validate and render
export function addEnrollment(){
  const f = document.getElementById('firstName');
  const l = document.getElementById('lastName');
  const g = document.getElementById('gradeSelect');
  const t = document.getElementById('trackSelect');
  if(!f||!l||!g||!t){ alert('טופס לא נמצא'); return; }
  const first_name = f.value.trim();
  const last_name = l.value.trim();
  const grade = g.value;
  const track = t.value;
  const teacher = t.selectedOptions[0] ? t.selectedOptions[0].dataset.teacher : '';
  if(!first_name || !last_name || !grade || !track){ alert('אנא מלא/י את כל השדות'); return; }
  // prevent duplicates in current session
  const arr = getEnrollments();
  const dup = arr.find(r => r.first_name===first_name && r.last_name===last_name && r.grade===grade && r.track===track);
  if(dup){ alert('רשומה זהה קיימת כבר במערכת למהלך זה'); return; }
  const timestamp = new Date().toISOString();
  const obj = { first_name, last_name, grade, track, teacher, timestamp };
  arr.push(obj); setEnrollments(arr);
  renderTable();
  // clear inputs
  f.value=''; l.value='';
}

// Render enrollments table
export function renderTable(){
  const tbody = document.getElementById('enrollTableBody');
  if(!tbody) return;
  const rows = getEnrollments();
  tbody.innerHTML = '';
  for(const r of rows){
    const tr = document.createElement('tr');
    tr.innerHTML = `<td>${r.first_name}</td><td>${r.last_name}</td><td>${r.grade}</td><td>${r.track}</td><td>${r.teacher || ''}</td><td>${r.timestamp}</td>`;
    tbody.appendChild(tr);
  }
}

// alias for wa share
export const waShare = waShareEnrollments;

export function exportCsvLocal(){
  const rows = getEnrollments();
  if(rows.length===0){ alert('אין רשומות לייצוא'); return; }
  const keys = ['first_name','last_name','grade','track','teacher','timestamp'];
  const lines = [keys.join(',')];
  for(const r of rows){ lines.push(keys.map(k=> (r[k]||'').toString().replace(/"/g,'""')).map(v=> v.includes(',')?`"${v}"`:v).join(',')); }
  const csv = lines.join('\n');
  const blob = new Blob([csv], {type:'text/csv;charset=utf-8;'});
  window.downloadBlob('students-local.csv', blob);
}

export function mailtoAll(){
  const rows = getEnrollments(); if(rows.length===0){ alert('אין רשומות'); return; }
  const subject = encodeURIComponent('רישום תלמידים - דוח');
  const body = encodeURIComponent(rows.map(r=> `${r.first_name} ${r.last_name} | שכבה: ${r.grade} | הקבצה: ${r.track} | מורה: ${r.teacher} | זמן: ${r.timestamp}`).join('\n'));
  window.location.href = `mailto:?subject=${subject}&body=${body}`;
}

export function waShareEnrollments(){
  const rows = getEnrollments(); if(rows.length===0){ alert('אין רשומות לשיתוף'); return; }
  const text = rows.map(r=> `${r.first_name} ${r.last_name} - ${r.grade}/${r.track}: ${r.teacher}`).join('\n');
  window.open(`https://wa.me/?text=${encodeURIComponent(text)}`,'_blank');
}

// Save to GitHub repo using Contents API. Do not store token.
export async function saveToRepoCsv(token){
  if(!token){ alert('אין טוקן'); return; }
  const OWNER = 'yanivmizrachiy';
  const REPO = 'student-data-hub';
  const PATH = 'data-samples/students.csv';
  const BRANCH = 'main';
  const rows = getEnrollments(); if(rows.length===0){ alert('אין רשומות לשמירה'); return; }

  // fetch existing file
  const headers = { 'Authorization': `token ${token}`, 'Accept':'application/vnd.github+json' };
  let existing = null; let sha = null;
  try{
    const r = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}?ref=${BRANCH}`, {headers});
    if(r.status === 200){ existing = await r.json(); sha = existing.sha; }
    else if(r.status !== 404){ const txt = await r.text(); throw new Error(`GitHub API error ${r.status}: ${txt}`); }
  }catch(e){ alert('שגיאה בגישה ל-GitHub: '+e.message); return; }

  // parse existing csv if present
  let existingRows = [];
  if(existing && existing.content){
    const content = atob(existing.content.replace(/\n/g,''));
    const lines = content.split(/\r?\n/).filter(l=>l.trim());
    const hdr = lines.shift().split(',').map(h=>h.trim());
    for(const l of lines){ const cols = l.split(',').map(c=>c.replace(/^"|"$/g,'')); const obj={}; hdr.forEach((h,i)=>obj[h]=cols[i]||''); existingRows.push(obj); }
  }

  // merge without duplicates by first_name,last_name,grade,track
  const combined = existingRows.slice();
  for(const nr of rows){
    const dup = combined.find(r => r.first_name===nr.first_name && r.last_name===nr.last_name && r.grade===nr.grade && r.track===nr.track);
    if(!dup){ combined.push({ first_name: nr.first_name, last_name: nr.last_name, grade: nr.grade, track: nr.track, teacher: nr.teacher || '', timestamp: nr.timestamp || new Date().toISOString() }); }
  }

  const keys = ['first_name','last_name','grade','track','teacher','timestamp'];
  const csvLines = [keys.join(',')];
  for(const r of combined){ csvLines.push(keys.map(k=> (r[k]||'').toString().replace(/"/g,'""')).map(v=> v.includes(',')?`"${v}"`:v).join(',')); }
  const csvContent = csvLines.join('\n');
  // base64 encode unicode-safe
  const b64 = btoa(unescape(encodeURIComponent(csvContent)));

  // prepare PUT body
  const body = { message: `feat(enroll): append ${rows.length} students to students.csv`, content: b64, branch: BRANCH };
  if(sha) body.sha = sha;

  try{
    const putRes = await fetch(`https://api.github.com/repos/${OWNER}/${REPO}/contents/${PATH}`, { method:'PUT', headers: {...headers, 'Content-Type':'application/json'}, body: JSON.stringify(body) });
    if(!putRes.ok){ const t = await putRes.text(); throw new Error(t); }
    const resp = await putRes.json();
    alert('נשמר בהצלחה ל-GitHub');
    return resp;
  }catch(e){ alert('שגיאה בשמירה ל-GitHub: '+e.message); throw e; }
}

// expose for legacy
window.exportCsvLocal = exportCsvLocal;
window.mailtoAll = mailtoAll;
window.waShareEnrollments = waShareEnrollments;
window.saveToRepoCsv = saveToRepoCsv;

// service worker registration
if('serviceWorker' in navigator){ window.addEventListener('load', ()=>{ navigator.serviceWorker.register('/service-worker.js').catch(err=>console.warn('SW register failed', err)); }); }

// helpers
window.downloadBlob = function(filename, blob){ const url = URL.createObjectURL(blob); const a = document.createElement('a'); a.href=url; a.download=filename; document.body.appendChild(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),5000); };

document.addEventListener('DOMContentLoaded', ()=>{
  const clearBtn = document.getElementById('clearDbBtn'); if(clearBtn) clearBtn.addEventListener('click', async ()=>{ if(!confirm('למחוק את כל הנתונים המקומיים? פעולה בלתי הפיכה.')) return; try{ await window.db.clearAll(); alert('הנתונים נמחקו'); location.reload(); }catch(e){ console.error(e); alert('שגיאה במחיקה'); } });
  const backupBtn = document.getElementById('backupBtn'); if(backupBtn) backupBtn.addEventListener('click', async ()=>{ try{ const all = await window.db.exportAll(); const blob = new Blob([JSON.stringify(all,null,2)],{type:'application/json'}); window.downloadBlob('grades-backup.json', blob); }catch(e){ console.error(e); alert('שגיאה ביצירת גיבוי'); } });
});
