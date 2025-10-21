/* db.js — IndexedDB helper for grades-app */
(function(){
  'use strict';

  const DB_NAME = 'grades_db';
  const DB_VERSION = 1;
  const STORES = [
    {name:'students', key:'student_id'},
    {name:'classes', key:'class_id'},
    {name:'assignments', key:'assignment_id'},
    {name:'grades', key:['student_id','assignment_id']}
  ];

  let dbPromise = null;

  function openDB(){
    if(dbPromise) return dbPromise;
    dbPromise = new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);
      req.onupgradeneeded = (e) => {
        const db = e.target.result;
        STORES.forEach(s => {
          if(!db.objectStoreNames.contains(s.name)){
            if(Array.isArray(s.key)) db.createObjectStore(s.name, {keyPath: s.key});
            else db.createObjectStore(s.name, {keyPath: s.key});
          }
        });
      };
      req.onsuccess = (e) => resolve(e.target.result);
      req.onerror = (e) => reject(e.target.error);
    });
    return dbPromise;
  }

  async function tx(storeNames, mode='readonly'){
    const db = await openDB();
    const tx = db.transaction(storeNames, mode);
    return tx;
  }

  async function putAll(storeName, items){
    if(!Array.isArray(items)) throw new Error('items must be array');
    const db = await openDB();
    return new Promise((res, rej) => {
      const transaction = db.transaction([storeName], 'readwrite');
      const store = transaction.objectStore(storeName);
      items.forEach(item => store.put(item));
      transaction.oncomplete = () => res(true);
      transaction.onerror = (e) => rej(e.target.error);
    });
  }

  async function getAll(storeName){
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.getAll();
      req.onsuccess = () => res(req.result);
      req.onerror = (e) => rej(e.target.error);
    });
  }

  async function get(storeName, key){
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction([storeName], 'readonly');
      const store = tx.objectStore(storeName);
      const req = store.get(key);
      req.onsuccess = () => res(req.result);
      req.onerror = (e) => rej(e.target.error);
    });
  }

  async function put(storeName, obj){
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction([storeName], 'readwrite');
      const store = tx.objectStore(storeName);
      const req = store.put(obj);
      req.onsuccess = () => res(req.result);
      req.onerror = (e) => rej(e.target.error);
    });
  }

  // query grades by class or by student
  async function queryGradesByClass(class_id){
    const students = await getAll('students');
    const classStudents = students.filter(s => s.class_id === class_id).map(s => s.student_id);
    const allGrades = await getAll('grades');
    return allGrades.filter(g => classStudents.includes(g.student_id));
  }

  async function queryGradesByStudent(student_id){
    const all = await getAll('grades');
    return all.filter(g => g.student_id === student_id);
  }

  async function clearAll(){
    const db = await openDB();
    return new Promise((res, rej) => {
      const tx = db.transaction(STORES.map(s=>s.name), 'readwrite');
      tx.oncomplete = () => res(true);
      tx.onerror = (e) => rej(e.target.error);
      STORES.forEach(s => tx.objectStore(s.name).clear());
    });
  }

  async function exportAll(){
    const out = {};
    for(const s of STORES){ out[s.name] = await getAll(s.name); }
    return out;
  }

  // expose API
  window.db = {
    openDB, putAll, getAll, get, put, queryGradesByClass, queryGradesByStudent, clearAll, exportAll
  };

})();
