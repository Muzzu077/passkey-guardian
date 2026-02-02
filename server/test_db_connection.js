const supabase = require('./db');

async function testConnection() {
    console.log("Testing connection...");
    try {
        const { data, error } = await supabase.from('users').select('count', { count: 'exact', head: true });

        if (error) {
            console.error("Connection failed or table 'users' does not exist.");
            console.error("Error details:", error);
        } else {
            console.log("Success! Connected to Supabase and 'users' table exists.");
        }
    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

testConnection();
