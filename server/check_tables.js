const supabase = require('./db');

async function checkTables() {
    console.log("Checking tables...");

    // Check users
    const { error: usersError } = await supabase.from('users').select('count', { count: 'exact', head: true });
    if (usersError) {
        console.error("❌ 'users' table error:", usersError.message);
    } else {
        console.log("✅ 'users' table exists.");
    }

    // Check authenticators
    const { error: authError } = await supabase.from('authenticators').select('count', { count: 'exact', head: true });
    if (authError) {
        console.error("❌ 'authenticators' table error:", authError.message);
    } else {
        console.log("✅ 'authenticators' table exists.");
    }
}

checkTables();
