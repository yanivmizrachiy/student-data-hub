import fs from 'fs'; import path from 'path'; import xlsx from 'xlsx';

const SRC = [
  {key:'Z', file:'data/שכבת ז.xlsx'},
  {key:'H', file:'data/שכבת ח.xlsx'},
  {key:'T', file:'data/שכבת ט.xlsx'},
];

const ALLOWED = new Set(["כיתה מדעית","הקבצה א","הקבצה א1","כיתה מקדמת"]);
const normGroup = (g='')=>{
  let s = String(g).trim().replace(/\s+/g,' ');
  s = s.replace(/^א[\s־-]?1$/,'א1'); // א 1 / א-1 / א־1 → א1
  return s;
};

const readExcel = (file)=>{
  if (!fs.existsSync(file)) throw new Error('קובץ חסר: '+file);
  const wb = xlsx.readFile(file);
  const ws = wb.Sheets[wb.SheetNames[0]];
  const rows = xlsx.utils.sheet_to_json(ws, {defval:'', raw:false});
  return rows;
};

for (const {key,file} of SRC){
  const rows = readExcel(file);
  const clean = [];
  for (const r of rows){
    const last = String(r['שם משפחה']||r['שם_משפחה']||'').trim();
    const first = String(r['שם פרטי']||r['שם_פרטי']||'').trim();
    if (!last || !first) continue;
    const klass = String(r['כיתה']||'').trim();
    const teacher = String(r['מורה']||r['מורה מלמד']||r['מורה מלמד/ת']||'').trim();
    let group = normGroup(r['הקבצה']||r['קבוצה']||'');
    if (!ALLOWED.has(group)) {
      fs.appendFileSync('logs/group-errors.log', `[${key}] דילוג: ${last} ${first} — הקבצה "${group}" לא תקינה\n`, 'utf8');
      continue;
    }
    if ((first==='יונה' && last==='עידו') || (first==='עדי' && last==='יואל')) continue; // החרגות קבועות
    clean.push({שם_משפחה:last, שם_פרטי:first, כיתה:klass, הקבצה:group, מורה:teacher});
  }
  fs.writeFileSync(`data/rosters/${key}.json`, JSON.stringify(clean, null, 2), 'utf8');
  console.log(`✔ data/rosters/${key}.json (${clean.length} תלמידים)`);
}
