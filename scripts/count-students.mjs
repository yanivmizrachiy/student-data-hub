import fs from 'fs';
const load = k => JSON.parse(fs.readFileSync(`data/rosters/${k}.json`, 'utf8'));
const Z = fs.existsSync('data/rosters/Z.json') ? load('Z') : [];
const H = fs.existsSync('data/rosters/H.json') ? load('H') : [];
const T = fs.existsSync('data/rosters/T.json') ? load('T') : [];
const counts = { Z: Z.length, H: H.length, T: T.length, total: Z.length+H.length+T.length, timestamp: Date.now() };
fs.mkdirSync('data/summary', {recursive:true});
fs.writeFileSync('data/summary/counts.json', JSON.stringify(counts, null, 2), 'utf8');
console.log('✔ data/summary/counts.json', counts);
