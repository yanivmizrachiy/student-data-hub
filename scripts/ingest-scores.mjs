import fs from "fs";
import path from "path";
import { loadExcelByGrade, extractStudents, norm, csvEscape } from "./util-xlsx.mjs";

function parseMeta(file){
  const base = path.basename(file).replace(/\.txt$/,"");
  const [grade, group, teacher, ...examParts] = base.split("_");
  return { grade: norm(grade), group: norm(group), teacher: norm(teacher), exam: norm(examParts.join(" ")) };
}
function isNumericScore(s){ return /^\d+(\.\d+)?$/.test(s); }

const inboxFile = process.env.INBOX_PATH;
if (!inboxFile) throw new Error("INBOX_PATH is required");

const { grade, group, teacher, exam } = parseMeta(inboxFile);

// קרא פתרונות אוטומטיים מ-match-names
const resolvedPath = path.join("inbox/review/tmp", path.basename(inboxFile)+".resolved.json");
if (!fs.existsSync(resolvedPath)) throw new Error("Resolved file missing. Run match-names first.");
let resolved = JSON.parse(fs.readFileSync(resolvedPath,"utf8"));

// প্রয়וג רזולוציות (אם יש)
const yamlPath = path.join("inbox/resolutions", path.basename(inboxFile).replace(/\.txt$/, ".yaml"));
if (fs.existsSync(yamlPath)){
  const map = Object.fromEntries(fs.readFileSync(yamlPath,"utf8").split(/\r?\n/).filter(l=>l.includes(":" )).map(l=>{
    const i=l.indexOf(":"); const k=norm(l.slice(0,i)); const v=norm(l.slice(i+1));
    return [k, v.replace(/^['\"]|['\"]$/g,"")];
  }));
  resolved = resolved.map(r => ({
    student_name: map[r.student_name] ? map[r.student_name] : r.student_name,
    score: r.score
  }));
}

// בניית CSV
const safe = s => s.replace(/\s+/g,"-");
const outDir = "data-samples";
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, {recursive:true});
const outFile = path.join(outDir, `grades_${safe(exam)}_${grade}_${safe(group)}_${safe(teacher)}.csv`);

const head = "student_name,grade,group,teacher,score,exam";
const body = resolved.map(r => {
  const arr = [
    r.student_name,
    grade, group, teacher,
    isNumericScore(r.score) ? r.score : r.score,
    exam
  ].map(csvEscape);
  return arr.join(",");
}).join("\n");

fs.writeFileSync(outFile, head+"\n"+body, "utf8");
console.log("WROTE", outFile);
