// src/lib/dbConnect.js
// 🔗 Shim file: re-exports dbConnect and helpers from db.js
// Use this if some older code still imports "lib/dbConnect" instead of "lib/db".

export { default } from './db';
export * from './db';
