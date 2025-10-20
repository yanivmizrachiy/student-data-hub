import fs from 'fs';
import path from 'path';
import { loadExcelByGrade, extractStudents, norm } from './util-xlsx.mjs';

// רשימת השמות שהתקבלה (inline const)
const INPUT = [
  'אופיר חיים אופק', 'גבריאל אלישקובי', 'עידן ישראל אמויאל', 'נווה אסיאג', 'עדי באנון',
  'אריאל בן כליפה', 'אלין בנישו', 'אושרי גבאי', 'ירין גיא', 'אלרואי משה גידניאן',
  'עדי דנון', 'ארטיום חקימוב', 'נתנאל ירמיהו', 'אגם כהן', 'גיא כהן',
  'דניאל כהן נחמו', 'סתיו מזרחי', 'דוד סולטן', 'טאמנסאו סנבטו', 'רבקה קוסשוילי',
  'אייל רחמים', 'נהוראי שלמה ששון'
];

function writeReview(lines, out){
  if(!fs.existsSync(path.dirname(out))) fs.mkdirSync(path.dirname(out), {recursive:true});
  fs.writeFileSync(out, lines.join('\n'), 'utf8');
}

(async function(){
  const grade = 'ז';
  const rows = loadExcelByGrade(grade);
  const students = extractStudents(rows);
  const official = students.map(s=>s.full);
  const exactSet = new Set(official);

  const ok = [], multi = [], notFound = [];
  for(const name of INPUT){
    if(exactSet.has(name)) { ok.push(name); continue; }
    // חיפוש רך
    const first = name.split(' ')[0];
    const candidates = official.filter(x => x.startsWith(first+' ') || x.includes(name));
    if(candidates.length === 1) ok.push(candidates[0]);
    else if(candidates.length > 1) multi.push({ input: name, options: candidates.slice(0,8) });
    else notFound.push(name);
  }

  if(multi.length || notFound.length){
    const lines = [
      `# אימות רשימת דגלים — שכבת ז`,
      '',
      '## ריבוי מועמדים',
      ...multi.map(m=> `- **${m.input}**\n${m.options.map(o=> `  - [ ] ${o}`).join('\n')}`),
      '',
      '## לא נמצאו',
      ...notFound.map(n=> `- ${n}`)
    ];
    const out = 'inbox/review/flags_grade7.md';
    writeReview(lines, out);
    console.log('AMBIGUOUS', multi.length + notFound.length);
    console.log('REVIEW_FILE', out);
    process.exit(2);
  }

  // יצירת JSON רשמי
  const outDir = 'data-flags'; if(!fs.existsSync(outDir)) fs.mkdirSync(outDir,{recursive:true});
  fs.writeFileSync(path.join(outDir,'malkot-limida.json'), JSON.stringify(ok, null, 2), 'utf8');
  console.log('WROTE', 'data-flags/malkot-limida.json');
})();
