import fs from 'fs';
import path from 'path';
import { loadExcelByGrade, extractStudents, norm } from './util-xlsx.mjs';

// Single clean implementation for matching inbox entries to students
function parseMeta(file){
  const base = path.basename(file).replace(/\.txt$/,'');
  const [grade, group, teacher, ...examParts] = base.split('_');
  if(!grade || !group || !teacher) throw new Error(`Bad inbox filename: ${base}`);
  return { grade: norm(grade), group: norm(group), teacher: norm(teacher), exam: norm(examParts.join(' ')) };
}

function parseLines(text){
  return text.split(/\r?\n/)
    .map(s=>s.trim())
    .filter(Boolean)
    .map(line=>{
      const m = line.split('-'); if(m.length<2) throw new Error(`Bad line: ${line}`);
      const name = norm(m[0]); const scoreRaw = norm(m.slice(1).join('-'));
      return { name, scoreRaw };
    });
}

function isNumericScore(s){ return /^\d+(\.\d+)?$/.test(s); }

const inboxFile = process.env.INBOX_PATH || process.argv[2];
if(!inboxFile) throw new Error('INBOX_PATH required (env or arg)');
if(!fs.existsSync(inboxFile)) throw new Error('INBOX not found: '+inboxFile);

const meta = parseMeta(inboxFile);
const txt = fs.readFileSync(inboxFile,'utf8');
const entries = parseLines(txt);

const rows = loadExcelByGrade(meta.grade);
const students = extractStudents(rows);

const candidates = students.filter(s => (!s.group || s.group===meta.group) && (!s.teacher || s.teacher===meta.teacher));

const byExact = new Map(candidates.map(s => [s.full, s]));
const byNormalized = new Map(candidates.map(s => [s.full.replace(/\s+/g,' '), s]));

const results = [];
const MULTI = [], NOT_FOUND = [];
for(const {name, scoreRaw} of entries){
  const exact = byExact.get(name);
  if(exact){ results.push({kind:'EXACT', full: exact.full, scoreRaw}); continue; }

  const key = name.replace(/\s+/g,' ');
  const uniq = byNormalized.get(key);
  if(uniq){ results.push({kind:'UNIQUE_PARTIAL', full: uniq.full, scoreRaw}); continue; }

  const nameParts = name.split(' ');
  const first = nameParts[0];
  const candidatesByFirst = candidates.filter(s=>s.full.startsWith(first+' '));
  const soft = candidatesByFirst.length ? candidatesByFirst : candidates.filter(s=>s.full.includes(name));

  const uniqSoft = soft.length===1 ? soft[0] : null;
  if(uniqSoft) results.push({kind:'UNIQUE_PARTIAL', full: uniqSoft.full, scoreRaw, note:`matched by soft search from "${name}"`});
  else if(soft.length>1) MULTI.push({input:name, options: soft.map(s=>s.full), scoreRaw});
  else NOT_FOUND.push({input:name, scoreRaw});
}

const reviewDir = 'inbox/review'; if(!fs.existsSync(reviewDir)) fs.mkdirSync(reviewDir,{recursive:true});
const outReview = path.join(reviewDir, path.basename(inboxFile).replace(/\.txt$/,'_review.md'));
const lines = [];
lines.push(`# ביקורת התאמות שמות — ${path.basename(inboxFile)}`);
lines.push(`- שכבה: **${meta.grade}**  • הקבצה: **${meta.group}**  • מורה: **${meta.teacher}**  • מבחן: **${meta.exam}**`);
lines.push('');
lines.push(`## סטטוס`);
lines.push(`- EXACT: ${results.filter(r=>r.kind==='EXACT').length}`);
lines.push(`- UNIQUE_PARTIAL: ${results.filter(r=>r.kind==='UNIQUE_PARTIAL').length}`);
lines.push(`- MULTIPLE_CANDIDATES: ${MULTI.length}`);
lines.push(`- NOT_FOUND: ${NOT_FOUND.length}`);
lines.push('');

if(MULTI.length){
  lines.push('## יש כמה אפשרויות (צריך בחירה ממך)');
  MULTI.forEach(m=>{
    lines.push(`- **${m.input}** — ציון: ${m.scoreRaw}`);
    m.options.forEach(opt=>lines.push(`  - [ ] ${opt}`));
  });
  lines.push('');
}
if(NOT_FOUND.length){
  lines.push('## לא נמצאו באקסל (צריך להשלים/לתקן שם מדויק)');
  NOT_FOUND.forEach(m=>lines.push(`- **${m.input}** — ציון: ${m.scoreRaw}`));
  lines.push('');
}

fs.writeFileSync(outReview, lines.join('\n'),'utf8');

const ambiguous = MULTI.length + NOT_FOUND.length;
if(ambiguous>0){ console.log(`AMBIGUOUS=${ambiguous}`); console.log(`REVIEW_FILE=${outReview}`); }
else { console.log(`AMBIGUOUS=0`); console.log(`REVIEW_FILE=${outReview}`); }

const resolved = results.map(r=>({ student_name: r.full, score: isNumericScore(r.scoreRaw)? r.scoreRaw : r.scoreRaw }));
const tmpDir = 'inbox/review/tmp'; if(!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir,{recursive:true});
fs.writeFileSync(path.join(tmpDir, path.basename(inboxFile)+'.resolved.json'), JSON.stringify(resolved,null,2),'utf8');

import path from 'path';
import { loadExcelByGrade, extractStudents, norm } from './util-xlsx.mjs';

function parseMeta(file){
  const base = path.basename(file).replace(/\.txt$/,'');
  const [grade, group, teacher, ...examParts] = base.split('_');
  if(!grade || !group || !teacher) throw new Error(`Bad inbox filename: ${base}`);
  return { grade: norm(grade), group: norm(group), teacher: norm(teacher), exam: norm(examParts.join(' ')) };
}
function parseLines(text){
  return text.split(/\r?\n/).map(s=>s.trim()).filter(Boolean).map(line=>{
    const m = line.split('-'); if(m.length<2) throw new Error(`Bad line: ${line}`);
    const name = norm(m[0]); const scoreRaw = norm(m.slice(1).join('-'));
    return { name, scoreRaw };
  });
}
function isNumericScore(s){ return /^\d+(\.\d+)?$/.test(s); }

const inboxFile = process.env.INBOX_PATH || process.argv[2];
if(!inboxFile) throw new Error('INBOX_PATH required (env or arg)');
if(!fs.existsSync(inboxFile)) throw new Error('INBOX not found: '+inboxFile);

const meta = parseMeta(inboxFile);
import fs from 'fs';
import path from 'path';
import { loadExcelByGrade, extractStudents, norm } from './util-xlsx.mjs';

// פורמט שם קובץ inbox: inbox/<grade>_<group>_<teacher>_<exam>.txt
function parseMeta(file){
  const base = path.basename(file).replace(/\.txt$/,'');
  const [grade, group, teacher, ...examParts] = base.split('_');
  if(!grade || !group || !teacher) throw new Error(`Bad inbox filename: ${base}`);
  return { grade: norm(grade), group: norm(group), teacher: norm(teacher), exam: norm(examParts.join(' ')) };
}

function parseLines(text){
  return text.split(/\r?\n/)
    .map(s=>s.trim())
    .filter(Boolean)
    .map(line=>{
      const m = line.split('-'); if(m.length<2) throw new Error(`Bad line: ${line}`);
      const name = norm(m[0]); const scoreRaw = norm(m.slice(1).join('-'));
      return { name, scoreRaw };
    });
}

function isNumericScore(s){ return /^\d+(\.\d+)?$/.test(s); }

const inboxFile = process.env.INBOX_PATH || process.argv[2];
if(!inboxFile) throw new Error('INBOX_PATH required (env or arg)');
if(!fs.existsSync(inboxFile)) throw new Error('INBOX not found: '+inboxFile);

const meta = parseMeta(inboxFile);
const txt = fs.readFileSync(inboxFile,'utf8');
const entries = parseLines(txt);

const rows = loadExcelByGrade(meta.grade);
const students = extractStudents(rows);

// סינון מועמדים לפי group/teacher רק אם יש באקסל עמודות כאלה
const candidates = students.filter(s => (!s.group || s.group===meta.group) && (!s.teacher || s.teacher===meta.teacher));

// מיפויים מהירים
const byExact = new Map(candidates.map(s => [s.full, s]));
const byNormalized = new Map(candidates.map(s => [s.full.replace(/\s+/g,' '), s]));

// נסה התאמות
const results = [];
const MULTI = [], NOT_FOUND = [];
for(const {name, scoreRaw} of entries){
  const exact = byExact.get(name);
  if(exact){ results.push({kind:'EXACT', full: exact.full, scoreRaw}); continue; }

  // התאמת "רווח אחד" — אם נותן תוצאה יחידה בלבד
  const key = name.replace(/\s+/g,' ');
  const uniq = byNormalized.get(key);
  if(uniq){ results.push({kind:'UNIQUE_PARTIAL', full: uniq.full, scoreRaw}); continue; }

  // חיפוש חלקי זהיר: מתחיל באותו שם פרטי, או מכיל את המחרוזת (בלי להכריע)
  const nameParts = name.split(' ');
  const first = nameParts[0];
  const candidatesByFirst = candidates.filter(s=>s.full.startsWith(first+' '));
  const soft = candidatesByFirst.length ? candidatesByFirst : candidates.filter(s=>s.full.includes(name));

  const uniqSoft = soft.length===1 ? soft[0] : null;
  if(uniqSoft){
    results.push({kind:'UNIQUE_PARTIAL', full: uniqSoft.full, scoreRaw, note:`matched by soft search from "${name}"`});
  }
  else if(soft.length>1) MULTI.push({input:name, options: soft.map(s=>s.full), scoreRaw});
  else NOT_FOUND.push({input:name, scoreRaw});
}

// הפקת דוח ביקורת
const reviewDir = 'inbox/review'; if(!fs.existsSync(reviewDir)) fs.mkdirSync(reviewDir,{recursive:true});
const outReview = path.join(reviewDir, path.basename(inboxFile).replace(/\.txt$/,'_review.md'));
const lines = [];
lines.push(`# ביקורת התאמות שמות — ${path.basename(inboxFile)}`);
lines.push(`- שכבה: **${meta.grade}**  • הקבצה: **${meta.group}**  • מורה: **${meta.teacher}**  • מבחן: **${meta.exam}**`);
lines.push('');
lines.push(`## סטטוס`);
lines.push(`- EXACT: ${results.filter(r=>r.kind==='EXACT').length}`);
lines.push(`- UNIQUE_PARTIAL: ${results.filter(r=>r.kind==='UNIQUE_PARTIAL').length}`);
lines.push(`- MULTIPLE_CANDIDATES: ${MULTI.length}`);
lines.push(`- NOT_FOUND: ${NOT_FOUND.length}`);
lines.push('');

if(MULTI.length){ lines.push('## יש כמה אפשרויות (צריך בחירה ממך)'); MULTI.forEach(m=>{ lines.push(`- **${m.input}** — ציון: ${m.scoreRaw}`); m.options.forEach(opt=>lines.push(`  - [ ] ${opt}`)); }); lines.push(''); }
if(NOT_FOUND.length){ lines.push('## לא נמצאו באקסל (צריך להשלים/לתקן שם מדויק)'); NOT_FOUND.forEach(m=>lines.push(`- **${m.input}** — ציון: ${m.scoreRaw}`)); lines.push(''); }

fs.writeFileSync(outReview, lines.join('\n'),'utf8');

const ambiguous = MULTI.length + NOT_FOUND.length;
if(ambiguous>0){ console.log(`AMBIGUOUS=${ambiguous}`); console.log(`REVIEW_FILE=${outReview}`); }
else { console.log(`AMBIGUOUS=0`); console.log(`REVIEW_FILE=${outReview}`); }

const resolved = results.map(r=>({ student_name: r.full, score: isNumericScore(r.scoreRaw)? r.scoreRaw : r.scoreRaw }));
const tmpDir = 'inbox/review/tmp'; if(!fs.existsSync(tmpDir)) fs.mkdirSync(tmpDir,{recursive:true});
fs.writeFileSync(path.join(tmpDir, path.basename(inboxFile)+'.resolved.json'), JSON.stringify(resolved,null,2),'utf8');
// נסה התאמות
