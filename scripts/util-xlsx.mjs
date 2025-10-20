import * as XLSX from 'xlsx';
import fs from 'fs';

export function norm(s){
  return String(s||'')
    .replace(/\s+/g,' ')
    .replace(/[״"]/g,'')
    .replace(/[׳']/g,'')
    .trim();
}

export function loadExcelByGrade(grade){
  const map = { 'ז':'שכבת ז.xlsx', 'ח':'שכבת ח.xlsx', 'ט':'שכבת ט.xlsx' };
  const file = map[grade];
  if(!file || !fs.existsSync(file)) throw new Error(`Excel for grade ${grade} not found: ${file||'(undefined)'}`);
  const wb = XLSX.readFile(file, {cellDates:false, codepage:65001});
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, {defval:''});
}

export function extractStudents(rows){
  return rows.map(r => ({
    full: norm(r['שם'] || r['שם מלא'] || r['תלמיד'] || r['Student'] || ''),
    grade: norm(r['כיתה'] || r['שכבה'] || r['Grade'] || ''),
    group: norm(r['הקבצה'] || r['קבוצה'] || r['Group'] || ''),
    teacher: norm(r['מורה'] || r['Teacher'] || '')
  })).filter(s => s.full);
}

export function csvEscape(v){
  const s = String(v===undefined||v===null? '': v);
  return /[",\n]/.test(s) ? `"${s.replace(/"/g,'""')}"` : s;
}
import * as XLSX from "xlsx";
import fs from "fs";

export function norm(s){
  return String(s||"")
    .replace(/\s+/g," ")
    .replace(/[״"]/g,"")
    .replace(/[׳']/g,"")
    .trim();
}

export function loadExcelByGrade(grade){
  const map = { "ז":"שכבת ז.xlsx", "ח":"שכבת ח.xlsx", "ט":"שכבת ט.xlsx" };
  const file = map[grade];
  if (!file || !fs.existsSync(file)) throw new Error(`Excel for grade ${grade} not found: ${file||"(undefined)"}`);
  const wb = XLSX.readFile(file, {cellDates:false, codepage:65001});
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json(ws, {defval:""});
}

export function extractStudents(rows){
  return rows.map(r => ({
    full:   norm(r["שם"] || r["שם מלא"] || r["תלמיד"] || r["Student"] || ""),
    grade:  norm(r["כיתה"] || r["שכבה"] || r["Grade"] || ""),
    group:  norm(r["הקבצה"]|| r["קבוצה"] || r["Group"] || ""),
    teacher:norm(r["מורה"] || r["Teacher"] || "")
  })).filter(s => s.full);
}

export function csvEscape(v){
  return /[",\n]/.test(v) ? `"${String(v).replace(/"/g,'""')}"` : String(v);
}
