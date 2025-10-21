// סקריפט: חילוץ שמות תלמידים מקבצי אקסל אמת, שמירה, לוג ודיווח שגיאות
import xlsx from 'xlsx';
import fs from 'fs-extra';
import levenshtein from 'fast-levenshtein';

const EXCELS = [
  {file: 'שכבת ז.xlsx', out: 'Z.json', grade: 'ז'},
  {file: 'שכבת ח.xlsx', out: 'H.json', grade: 'ח'},
  {file: 'שכבת ט.xlsx', out: 'T.json', grade: 'ט'}
];
const LOG = 'logs/excel-import.log';
const COUNTS = 'data/summary/counts.json';
const ROSTERS_DIR = 'data/rosters';
const EXCLUDE = [
  {first: 'יונה', last: 'עידו'},
  {first: 'עדי', last: 'יואל'}
];
const AMBIGUITY_THRESHOLD = 0.85;

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}`;
  fs.appendFileSync(LOG, line + '\n');
}

function normName(str) {
  return String(str||'').replace(/["'׳`’]/g, '').replace(/\s+/g, ' ').trim();
}

function isExcluded(first, last) {
  return EXCLUDE.some(e => normName(e.first) === normName(first) && normName(e.last) === normName(last));
}

function parseSheet(sheet, grade) {
  const rows = xlsx.utils.sheet_to_json(sheet, {header:1, defval:''});
  let headers = rows[0].map(normName);
  let firstIdx = headers.findIndex(h=>h.includes('פרטי'));
  let lastIdx = headers.findIndex(h=>h.includes('משפחה'));
  let groupIdx = headers.findIndex(h=>h.includes('הקבצה')||h.includes('קבוצה'));
  let classIdx = headers.findIndex(h=>h.includes('כיתה'));
  if(firstIdx<0||lastIdx<0) throw new Error('Missing שם פרטי/משפחה');
  const data = [];
  for(let i=1;i<rows.length;i++){
    const row = rows[i];
    const first = normName(row[firstIdx]);
    const last = normName(row[lastIdx]);
    if(!first||!last) continue;
    if(isExcluded(first,last)) continue;
    let group = groupIdx>=0 ? normName(row[groupIdx]) : '';
    let klass = classIdx>=0 ? normName(row[classIdx]) : '';
    data.push({first,last,grade,group:group||'לא שובצו',class:klass});
  }
  return data;
}

async function main() {
  let total = 0, byGrade = {}, errors = [], ambiguous = [];
  await fs.ensureDir(ROSTERS_DIR);
  for(const {file,out,grade} of EXCELS){
    try{
      if(!fs.existsSync(file)) throw new Error('File not found: '+file);
      const wb = xlsx.readFile(file);
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const students = parseSheet(sheet, grade);
      await fs.writeJson(`${ROSTERS_DIR}/${out}`, students, {spaces:2});
      log(`✔️ ${file}: ${students.length} תלמידים`);
      byGrade[grade] = students.length;
      total += students.length;
      // בדיקת עמימות שמות
      for(let i=0;i<students.length;i++){
        for(let j=i+1;j<students.length;j++){
          const s1 = students[i], s2 = students[j];
          if(s1.grade!==s2.grade) continue;
          const sim = 1-levenshtein.get(s1.first+' '+s1.last, s2.first+' '+s2.last)/Math.max((s1.first+' '+s1.last).length,(s2.first+' '+s2.last).length);
          if(sim>=AMBIGUITY_THRESHOLD && (s1.first!==s2.first||s1.last!==s2.last)){
            ambiguous.push({grade, a:s1, b:s2, sim});
          }
        }
      }
    }catch(e){
      log(`❌ ${file}: ${e.message}`);
      errors.push({file, error: e.message, stack: e.stack});
    }
  }
  await fs.writeJson(COUNTS, {total, byGrade}, {spaces:2});
  log(`סך הכל תלמידים: ${total}`);
  if(errors.length){
    const issue = `# Excel Import Failure\n\n${errors.map(e=>`- **${e.file}**: ${e.error}\n\n\`\`\`\n${e.stack}\n\`\`\``).join('\n')}\n\n---\n\n20 שורות אחרונות מהלוג:\n\n\`\`\`\n${fs.readFileSync(LOG,'utf8').split('\n').slice(-20).join('\n')}\n\`\`\``;
    await fs.writeFile('logs/excel-import-issue.md', issue);
    process.exit(2);
  }
  if(ambiguous.length){
    const amb = `# Roster Ambiguity\n\n${ambiguous.map(a=>`- ${a.grade}: ${a.a.first} ${a.a.last} ↔ ${a.b.first} ${a.b.last} (דמיון: ${(a.sim*100).toFixed(1)}%)`).join('\n')}`;
    await fs.writeFile('logs/roster-ambiguity-issue.md', amb);
  }
}

main().catch(e=>{log('CRASH: '+e.message+'\n'+e.stack);process.exit(2);});
