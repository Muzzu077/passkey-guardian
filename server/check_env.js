require('dotenv').config();

console.log("SUPABASE_URL:", process.env.SUPABASE_URL ? "Set (" + process.env.SUPABASE_URL.substring(0, 10) + "...)" : "Not Set");
console.log("SUPABASE_KEY:", process.env.SUPABASE_KEY ? "Set (Length: " + process.env.SUPABASE_KEY.length + ")" : "Not Set");
console.log("PORT:", process.env.PORT);
