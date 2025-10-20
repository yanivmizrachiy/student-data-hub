import fs from 'fs';
import path from 'path';
import YAML from 'js-yaml';
import { loadExcelByGrade, extractStudents, norm, csvEscape } from './util-xlsx.mjs';

const cfgPath = 'data/config/grade7-placements.yaml';
if(!fs.existsSync(cfgPath)) throw new Error('Missing config: '+cfgPath);
const cfg = YAML.load(fs.readFileSync(cfgPath, 'utf8'));
if(cfg.grade !== 'ז') throw new Error('Config grade mismatch');

const rows = loadExcelByGrade('ז');
const students = extractStudents(rows);

function matchRule(s, rule){
  if(rule.match && rule.match.any) return true;
  if(rule.match && rule.match.class_equals){
    if(String(s.grade || '') !== String(rule.match.class_equals)) return false;
  }
  // אם יש tag_contains אך אין עמודת tags באקסל — לא מתאימים
  if(rule.match && rule.match.tag_contains && rule.match.tag_contains.length){
    const tags = String(s.tags || '').toString();
    if(!tags) return false;
    const ok = rule.match.tag_contains.some(t => tags.includes(t));
    if(!ok) return false;
  }
  return true;
}

const assignments = [];
const failures = [];
for(const s of students){
  const matched = cfg.rules.filter(r => matchRule(s, r));
  if(matched.length === 1){
    const a = matched[0].assign;
    assignments.push({ student_name: s.full, grade: cfg.grade, class: s.grade || '', track: a.track, group: a.group, teacher: a.teacher });
  } else if(matched.length === 0){
    failures.push({ student_name: s.full, reason: 'no matching rule' });
  } else {
    // יותר מחוקי התאמה — עמימות
    failures.push({ student_name: s.full, reason: 'multiple matching rules' });
  }
}

if(failures.length){
  const lines = ['# בעיות בשיבוץ שכבת ז', '', ...failures.map(f=> `- ${f.student_name} — ${f.reason}`)];
  const out = 'inbox/review/placements_grade7.md';
  if(!fs.existsSync(path.dirname(out))) fs.mkdirSync(path.dirname(out), {recursive:true});
  fs.writeFileSync(out, lines.join('\n'), 'utf8');
  console.log('FAILURES', failures.length);
  console.log('REVIEW_FILE', out);
  process.exit(2);
}

// כתיבת CSV
const outDir = 'data-samples'; if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
const outFile = path.join(outDir, 'placements_grade7.csv');
const head = 'student_name,grade,class,track,group,teacher';
const body = assignments.map(a => [a.student_name,a.grade,a.class,a.track,a.group,a.teacher].map(csvEscape).join(',')).join('\n');
fs.writeFileSync(outFile, head + '\n' + body, 'utf8');
console.log('WROTE', outFile);
