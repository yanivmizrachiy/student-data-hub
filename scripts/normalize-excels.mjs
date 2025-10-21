// סקריפט נרמול וקליטה אוטומטית של כל קבצי האקסל בריפו
import xlsx from 'xlsx';
import fs from 'fs-extra';
import { globby } from 'globby';
import iconv from 'iconv-lite';
import chardet from 'chardet';
import levenshtein from 'fast-levenshtein';

const LOG = 'logs/excel-import.log';
const ROSTERS_DIR = 'data/rosters';
const COUNTS = 'data/summary/counts.json';
const EXCLUDE = [
  {first: 'יונה', last: 'עידו'},
  {first: 'עדי', last: 'יואל'}
];
const HEADER_MAP = {
  'שם פרטי': 'first', 'פרטי': 'first', 'first': 'first', 'שם': 'first',
  'שם משפחה': 'last', 'משפחה': 'last', 'last': 'last',
  'כיתה': 'grade', 'שכבה': 'grade', 'grade': 'grade', 'class': 'grade',
  'הקבצה': 'group', 'קבוצה': 'group', 'group': 'group',
  'ציון': 'score', 'grade_score': 'score'
};
const AMBIGUITY_THRESHOLD = 0.85;

function log(msg) {
  fs.appendFileSync(LOG, `[${new Date().toISOString()}] ${msg}\n`);
}
function normHeader(h) {
  return String(h||'').replace(/["'׳`’]/g, '').replace(/\s+/g, ' ').trim();
}
function normName(str) {
  return String(str||'').replace(/["'׳`’]/g, '').replace(/\s+/g, ' ').trim();
}
function isExcluded(first, last) {
  return EXCLUDE.some(e => normName(e.first) === normName(first) && normName(e.last) === normName(last));
}
function mapHeaders(headers) {
  return headers.map(h => HEADER_MAP[normHeader(h)] || normHeader(h));
}
function detectEncoding(file) {
  try {
    const buf = fs.readFileSync(file);
    return chardet.detect(buf) || 'utf8';
  } catch { return 'utf8'; }
}
function readSheet(file) {
  let wb, sheet, sheetName;
  try {
    wb = xlsx.readFile(file);
    let maxRows = 0;
    for(const name of wb.SheetNames){
      const rows = xlsx.utils.sheet_to_json(wb.Sheets[name], {header:1, defval:''});
      if(rows.length > maxRows && rows[0].length > 1){
        maxRows = rows.length;
        sheet = wb.Sheets[name];
        sheetName = name;
      }
    }
    if(!sheet) throw new Error('No valid sheet found');
    return {sheet, sheetName};
  }catch(e){
    log(`❌ ${file}: ${e.message}`);
    return null;
  }
}
async function main(){
  await fs.ensureDir(ROSTERS_DIR);
  let files = await globby(['**/*.xlsx','!node_modules']);
  let grades = {Z:[],H:[],T:[]};
  let total = 0;
  for(const file of files){
    let encoding = detectEncoding(file);
    let {sheet,sheetName} = readSheet(file) || {};
    if(!sheet) continue;
    let rows = xlsx.utils.sheet_to_json(sheet, {header:1, defval:''});
    let headers = mapHeaders(rows[0]);
    let idxs = {
      first: headers.findIndex(h=>h==='first'),
      last: headers.findIndex(h=>h==='last'),
      grade: headers.findIndex(h=>h==='grade'),
      group: headers.findIndex(h=>h==='group'),
      score: headers.findIndex(h=>h==='score')
    };
    let gradeKey = 'UNKNOWN';
    if(/ז|7/.test(file+sheetName)) gradeKey = 'Z';
    else if(/ח|8/.test(file+sheetName)) gradeKey = 'H';
    else if(/ט|9/.test(file+sheetName)) gradeKey = 'T';
    let students = [];
    let seen = new Set();
    for(let i=1;i<rows.length;i++){
      let row = rows[i];
      let first = normName(row[idxs.first]);
      let last = normName(row[idxs.last]);
      if(!first && !last) continue;
      if(isExcluded(first,last)) continue;
      let grade = gradeKey !== 'UNKNOWN' ? gradeKey : normName(row[idxs.grade])||'UNKNOWN';
      let group = idxs.group>=0 ? normName(row[idxs.group]) : 'לא שובצו';
      let score = idxs.score>=0 ? row[idxs.score] : '';
      let key = `${first}|${last}|${grade}|${group}`;
      if(seen.has(key)) continue;
      seen.add(key);
      students.push({first,last,grade,group,score});
    }
    grades[gradeKey] = grades[gradeKey].concat(students);
    log(`✔️ ${file}: ${students.length} תלמידים, גיליון: ${sheetName}, קידוד: ${encoding}`);
  }
  for(const k of ['Z','H','T']){
    grades[k].sort((a,b)=>a.last.localeCompare(b.last,'he'));
    await fs.writeJson(`${ROSTERS_DIR}/${k}.json`, grades[k], {spaces:2});
    total += grades[k].length;
  }
  await fs.writeJson(COUNTS, {Z:grades.Z.length,H:grades.H.length,T:grades.T.length,total,timestamp:Date.now()}, {spaces:2});
  log(`סך הכל תלמידים: ${total}`);
}
main().catch(e=>{log('CRASH: '+e.message+'\n'+e.stack);process.exit(2);});
