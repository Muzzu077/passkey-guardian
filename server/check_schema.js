const supabase = require('./db');

async function checkColumns() {
    console.log("Checking columns for 'authenticators'...");

    // There isn't a direct "describe table" in supabase-js, but we can try to select a column and see if it errors,
    // or use a known tricky column logic. 
    // Better: try to insert a dummy row with just the required fields + transports and see if it fails.
    // Actually, let's just inspect the error from the server logs if possible, but since I can't see them well,
    // I'll try to insert a dummy row.

    // Wait, I can't easily insert a dummy row because of foreign key constraints (user_id).
    // I'll create a dummy user first.

    try {
        // 1. Create dummy user
        const { data: user, error: userError } = await supabase.from('users').insert({ username: 'test_schema_check_' + Date.now() }).select().single();
        if (userError) {
            console.error("Failed to create dummy user:", userError.message);
            return;
        }
        console.log("Dummy user created:", user.id);

        // 2. Try to insert into authenticators with 'transports'
        const { error: authError } = await supabase.from('authenticators').insert({
            credential_id: 'test_cred_' + Date.now(),
            user_id: user.id,
            public_key: 'test_key',
            counter: 0,
            transports: ['usb'] // Test this column
        });

        if (authError) {
            console.error("❌ Insert failed. Likely missing 'transports' column or other schema issue:", authError.message);
        } else {
            console.log("✅ Insert successful. Schema appears correct.");

            // Cleanup
            await supabase.from('authenticators').delete().eq('user_id', user.id);
            await supabase.from('users').delete().eq('id', user.id);
        }

    } catch (err) {
        console.error("Unexpected error:", err);
    }
}

checkColumns();
