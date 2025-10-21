const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const EXCEL = "שכבת ח.xlsx";
const EXAM_TYPE = "מיפוי אוקטובר";
const EXAM_MONTH = "2025-10";
const GRADE = "ח";
const GROUP = "א";
const TEACHER = "טל נחמיה";
const INBOX = "inbox/grades/2025-10_mapping_H_tal-A.txt";
const OUTDIR = "data/grades/2025-10/mapping/H/tal-nechemya-A";

function norm(s){
  return String(s||"")
    .replace(/["׳״]/g,"")
    .replace(/\s+/g," ")
    .trim();
}
function parseLine(line){
  // מפרק שם וציון (טאב או רווחים)
  const m = line.split(/\t|\s{2,}/);
  if(m.length<2){
    // נסה רווח אחד
    const idx = line.lastIndexOf(" ");
    if(idx>-1) return [line.slice(0,idx), line.slice(idx+1)];
    return [line,""];
  }
  return [m[0], m.slice(1).join(" ")];
}
function loadExcel(){
  if(!fs.existsSync(EXCEL)) throw new Error("Excel not found: "+EXCEL);
  const wb = XLSX.readFile(EXCEL, {codepage:65001});
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, {defval:""});
}
function findStudent(nameRaw, students){
  // התאמה מדויקת
  const exact = students.find(s => norm(s) === norm(nameRaw));
  if(exact) return {kind:"ok", name:exact};
  // התאמה רכה: מתחיל/מכיל
  const candidates = students.filter(s => norm(s).includes(norm(nameRaw)) || norm(s).startsWith(norm(nameRaw.split(" ")[0]+" ")));
  if(candidates.length===1) return {kind:"ok", name:candidates[0]};
  if(candidates.length>1) return {kind:"multi", options:candidates};
  return {kind:"notfound"};
}

const studentsRaw = loadExcel().map(r => r["שם"] || r["שם מלא"] || r["תלמיד"] || "").filter(Boolean);
const lines = fs.readFileSync(INBOX,"utf8").split(/\r?\n/).filter(Boolean);
const results = [];
const multi = [], notfound = [];
for(const line of lines){
  const [nameRaw, scoreRaw] = parseLine(line);
  const res = findStudent(nameRaw, studentsRaw);
  if(res.kind==="ok"){
    results.push({
      student_name: res.name,
      grade: GRADE,
      group: GROUP,
      teacher: TEACHER,
      exam_type: EXAM_TYPE,
      exam_month: EXAM_MONTH,
      score: scoreRaw,
      status: "ok"
    });
  }else if(res.kind==="multi"){
    multi.push({input:nameRaw, options:res.options, score:scoreRaw});
    results.push({
      student_name: nameRaw,
      grade: GRADE,
      group: GROUP,
      teacher: TEACHER,
      exam_type: EXAM_TYPE,
      exam_month: EXAM_MONTH,
      score: scoreRaw,
      status: "needs_review"
    });
  }else{
    notfound.push({input:nameRaw, score:scoreRaw});
    results.push({
      student_name: nameRaw,
      grade: GRADE,
      group: GROUP,
      teacher: TEACHER,
      exam_type: EXAM_TYPE,
      exam_month: EXAM_MONTH,
      score: scoreRaw,
      status: "needs_review"
    });
  }
}
// כתיבת פלטים
if(!fs.existsSync(OUTDIR)) fs.mkdirSync(OUTDIR,{recursive:true});
const csvHead = "student_name,grade,group,teacher,exam_type,exam_month,score,status";
const csvBody = results.map(r=>[
  r.student_name,r.grade,r.group,r.teacher,r.exam_type,r.exam_month,r.score,r.status
].map(v=>/[,"\n]/.test(v)?`"${String(v).replace(/"/g,'""')}"`:v).join(",")).join("\n");
fs.writeFileSync(path.join(OUTDIR,"grades.csv"), csvHead+"\n"+csvBody, "utf8");
fs.writeFileSync(path.join(OUTDIR,"grades.json"), JSON.stringify(results,null,2), "utf8");
// סטטוס ingest
const summary = {
  ok: results.filter(r=>r.status==="ok").length,
  needs_review: results.filter(r=>r.status==="needs_review").length,
  total: results.length,
  exam_type: EXAM_TYPE,
  exam_month: EXAM_MONTH,
  grade: GRADE,
  group: GROUP,
  teacher: TEACHER,
  generated_at: new Date().toISOString()
};
fs.writeFileSync("data/summary/last-ingest.json", JSON.stringify(summary,null,2), "utf8");
// דו"ח בעיות
if(multi.length || notfound.length){
  const lines = [
    `# בעיות קליטה — שכבת ח׳ / הקבצה א׳ / טל נחמיה`,
    `## ריבוי מועמדים`,
    ...multi.map(m=>`- **${m.input}** — ציון: ${m.score}\n${m.options.map(o=>`  - [ ] ${o}`).join("\n")}`),
    `\n## לא נמצאו`,
    ...notfound.map(n=>`- ${n.input} — ציון: ${n.score}`)
  ];
  const out = "inbox/grades/review_H_tal-A.md";
  fs.writeFileSync(out, lines.join("\n"), "utf8");
  process.exit(2);
}
