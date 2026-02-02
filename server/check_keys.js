require('dotenv').config();
console.log("Keys in .env:", Object.keys(process.env).filter(k => k.startsWith('SUPA')));
