import fs from 'fs';
import path from 'path';
import xlsx from 'xlsx';

const allowedGroups = JSON.parse(fs.readFileSync('data/meta/allowed_groups.json','utf8'));
const excelFile = 'שכבת ז.xlsx';
const logFile = 'logs/group-errors.log';

function normGroup(val) {
  let v = String(val||'').trim();
  v = v.replace(/^[\s\u200F]+|[\s\u200F]+$/g,'');
  v = v.replace(/א[\s־-]?1/g,'א1');
  v = v.replace(/א[\s־-]?([0-9]+)/g,'א$1');
  v = v.replace(/\u05D0\u05B7/g,'א'); // ניקוד
  v = v.replace(/\u05D0\u05B8/g,'א');
  v = v.replace(/\u05D0\u05BC/g,'א');
  v = v.replace(/\u05D0\u05C1/g,'א');
  v = v.replace(/\u05D0\u05C2/g,'א');
  v = v.replace(/\u05D0\u05C3/g,'א');
  v = v.replace(/\u05D0\u05C4/g,'א');
  v = v.replace(/\u05D0\u05C5/g,'א');
  v = v.replace(/\u05D0\u05C6/g,'א');
  v = v.replace(/\u05D0\u05C7/g,'א');
  v = v.replace(/\u05D0\u05C8/g,'א');
  v = v.replace(/\u05D0\u05C9/g,'א');
  v = v.replace(/\u05D0\u05CA/g,'א');
  v = v.replace(/\u05D0\u05CB/g,'א');
  v = v.replace(/\u05D0\u05CC/g,'א');
  v = v.replace(/\u05D0\u05CD/g,'א');
  v = v.replace(/\u05D0\u05CE/g,'א');
  v = v.replace(/\u05D0\u05CF/g,'א');
  v = v.replace(/\u05D0\u05D0/g,'א');
  v = v.replace(/\u05D0\u05D1/g,'א');
  v = v.replace(/\u05D0\u05D2/g,'א');
  v = v.replace(/\u05D0\u05D3/g,'א');
  v = v.replace(/\u05D0\u05D4/g,'א');
  v = v.replace(/\u05D0\u05D5/g,'א');
  v = v.replace(/\u05D0\u05D6/g,'א');
  v = v.replace(/\u05D0\u05D7/g,'א');
  v = v.replace(/\u05D0\u05D8/g,'א');
  v = v.replace(/\u05D0\u05D9/g,'א');
  v = v.replace(/\u05D0\u05DA/g,'א');
  v = v.replace(/\u05D0\u05DB/g,'א');
  v = v.replace(/\u05D0\u05DC/g,'א');
  v = v.replace(/\u05D0\u05DD/g,'א');
  v = v.replace(/\u05D0\u05DE/g,'א');
  v = v.replace(/\u05D0\u05DF/g,'א');
  v = v.replace(/\u05D0\u05E0/g,'א');
  v = v.replace(/\u05D0\u05E1/g,'א');
  v = v.replace(/\u05D0\u05E2/g,'א');
  v = v.replace(/\u05D0\u05E3/g,'א');
  v = v.replace(/\u05D0\u05E4/g,'א');
  v = v.replace(/\u05D0\u05E5/g,'א');
  v = v.replace(/\u05D0\u05E6/g,'א');
  v = v.replace(/\u05D0\u05E7/g,'א');
  v = v.replace(/\u05D0\u05E8/g,'א');
  v = v.replace(/\u05D0\u05E9/g,'א');
  v = v.replace(/\u05D0\u05EA/g,'א');
  v = v.replace(/\u05D0\u05EB/g,'א');
  v = v.replace(/\u05D0\u05EC/g,'א');
  v = v.replace(/\u05D0\u05ED/g,'א');
  v = v.replace(/\u05D0\u05EE/g,'א');
  v = v.replace(/\u05D0\u05EF/g,'א');
  v = v.replace(/\u05D0\u05F0/g,'א');
  v = v.replace(/\u05D0\u05F1/g,'א');
  v = v.replace(/\u05D0\u05F2/g,'א');
  v = v.replace(/\u05D0\u05F3/g,'א');
  v = v.replace(/\u05D0\u05F4/g,'א');
  v = v.replace(/\u05D0\u05F5/g,'א');
  v = v.replace(/\u05D0\u05F6/g,'א');
  v = v.replace(/\u05D0\u05F7/g,'א');
  v = v.replace(/\u05D0\u05F8/g,'א');
  v = v.replace(/\u05D0\u05F9/g,'א');
  v = v.replace(/\u05D0\u05FA/g,'א');
  v = v.replace(/\u05D0\u05FB/g,'א');
  v = v.replace(/\u05D0\u05FC/g,'א');
  v = v.replace(/\u05D0\u05FD/g,'א');
  v = v.replace(/\u05D0\u05FE/g,'א');
  v = v.replace(/\u05D0\u05FF/g,'א');
  return v;
}

function readStudentsFromExcel(file) {
  if (!fs.existsSync(file)) throw new Error('Missing file '+file);
  const wb = xlsx.readFile(file);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, {defval:'', raw:false});
  return rows.filter(r => String(r['שם משפחה']||'').trim() && String(r['שם פרטי']||'').trim());
}

const students = readStudentsFromExcel(excelFile)
  .filter(s => !(s['שם משפחה'] === 'עידו' && s['שם פרטי'] === 'יונה') && !(s['שם משפחה'] === 'יואל' && s['שם פרטי'] === 'עדי'));

const groupMap = {};
const groupCounts = {};
const errors = [];

for (const s of students) {
  const orig = s['הקבצה'] || '';
  const norm = normGroup(orig);
  if (!allowedGroups.includes(norm)) {
    errors.push({student: s, original: orig, normalized: norm});
    continue;
  }
  if (!groupMap[norm]) groupMap[norm] = [];
  groupMap[norm].push(s);
}
for (const g of Object.keys(groupMap)) {
  groupCounts[g] = groupMap[g].length;
}

if (errors.length) {
  fs.appendFileSync(logFile, errors.map(e => `${e.student['שם משפחה']} ${e.student['שם פרטי']} | ${e.original} -> ${e.normalized}`).join('\n')+'\n');
}

fs.writeFileSync('data/meta/group_counts.json', JSON.stringify(groupCounts, null, 2), 'utf8');
fs.writeFileSync('data/meta/group_students.json', JSON.stringify(groupMap, null, 2), 'utf8');

if (errors.length) {
  console.error('Group errors found:', errors.length);
  process.exit(2);
}
console.log('Groups:', groupCounts);
