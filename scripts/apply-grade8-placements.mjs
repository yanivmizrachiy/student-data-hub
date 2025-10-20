import fs from 'fs';
import path from 'path';
import YAML from 'js-yaml';
import * as XLSX from 'xlsx';

const EXCEL = 'שכבת ח.xlsx';
const CFG_PATH = 'data/config/grade8-placements.yaml';
const INPUT_PATH = 'inbox/placements/H_A1_yaniv-raz_list.txt';
const OUT_CSV = 'data-samples/placements_grade8.csv';
const REVIEW_PATH = 'inbox/placements/review_grade8.md';

function norm(s){ return String(s||'').replace(/["׳״]/g,'').replace(/\s+/g,' ').trim(); }
function parseInputLine(line){
  const parts = line.split(/\t|\s{2,}/).map(s=>s.trim()).filter(Boolean);
  if(parts.length<3) return null;
  return { class_hint: parts[0], first: parts[1], last: parts.slice(2).join(' ') };
}
function loadExcel(){
  if(!fs.existsSync(EXCEL)) throw new Error('Excel not found: '+EXCEL);
  const wb = XLSX.readFile(EXCEL, {codepage:65001});
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, {defval:''});
}
function getFullName(row){
  return norm(row['שם'] || row['שם מלא'] || row['תלמיד'] || '');
}
function getClass(row){
  return norm(row['כיתה'] || row['מחנך/כיתה'] || row['class'] || '');
}

const cfg = YAML.load(fs.readFileSync(CFG_PATH, 'utf8'));
const excelRows = loadExcel();
const students = excelRows.map(r=>({
  full: getFullName(r),
  class: getClass(r),
  row: r
})).filter(s=>s.full);

// שלב 1: אימות overrides
const inputLines = fs.existsSync(INPUT_PATH) ? fs.readFileSync(INPUT_PATH,'utf8').split(/\r?\n/).filter(Boolean) : [];
const overrides = [];
const multi = [], notfound = [];
for(const line of inputLines){
  const parsed = parseInputLine(line);
  if(!parsed) continue;
  // חפש התאמה מלאה
  const exact = students.find(s=>s.full===norm(parsed.first+' '+parsed.last));
  if(exact){ overrides.push(exact.full); continue; }
  // חיפוש רך
  const candidates = students.filter(s=>s.full.includes(norm(parsed.first)) && s.full.includes(norm(parsed.last)));
  if(candidates.length===1){ overrides.push(candidates[0].full); continue; }
  if(candidates.length>1){ multi.push({input:parsed.first+' '+parsed.last, options:candidates.map(s=>s.full)}); continue; }
  notfound.push(parsed.first+' '+parsed.last);
}

// עדכון YAML עם overrides
if(overrides.length){
  cfg.overrides = cfg.overrides || {};
  cfg.overrides.students = overrides;
  fs.writeFileSync(CFG_PATH, YAML.dump(cfg), 'utf8');
}

// שלב 2: בניית השיבוץ
const assignments = [];
for(const s of students){
  let status = 'ok';
  let track = '', group = '', teacher = '';
  // כלל overrides גובר
  if(cfg.overrides && cfg.overrides.students && cfg.overrides.students.includes(s.full)){
    group = 'א1'; teacher = 'יניב רז'; track = '';
  }else if(cfg.rules && cfg.rules.length){
    const rule = cfg.rules.find(r=>r.match && r.match.class_equals && s.class===r.match.class_equals);
    if(rule){
      track = rule.assign.track||'';
      group = rule.assign.group||'';
      teacher = rule.assign.teacher||'';
    }
  }
  assignments.push({
    student_name: s.full,
    grade: cfg.grade,
    class: s.class,
    track,
    group,
    teacher,
    status
  });
}

// דו"ח בעיות
if(multi.length || notfound.length){
  const lines = [
    '# בעיות שיבוץ שכבת ח׳',
    '',
    '## ריבוי מועמדים',
    ...multi.map(m=>`- **${m.input}**\n${m.options.map(o=>`  - [ ] ${o}`).join('\n')}`),
    '',
    '## לא נמצאו באקסל',
    ...notfound.map(n=>`- ${n}`)
  ];
  fs.writeFileSync(REVIEW_PATH, lines.join('\n'), 'utf8');
  process.exit(2);
}

// כתיבת CSV
const head = 'student_name,grade,class,track,group,teacher,status';
const body = assignments.map(a=>[a.student_name,a.grade,a.class,a.track,a.group,a.teacher,a.status].map(v=>/[,"\n]/.test(v)?`"${String(v).replace(/"/g,'""')}`:v).join(',')).join('\n');
fs.writeFileSync(OUT_CSV, head+'\n'+body, 'utf8');
console.log('WROTE', OUT_CSV);
