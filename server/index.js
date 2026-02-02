const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
// Load environment variables immediately
dotenv.config();

const cookieParser = require('cookie-parser');
const session = require('express-session');
const {
    generateRegistrationOptions,
    verifyRegistrationResponse,
    generateAuthenticationOptions,
    verifyAuthenticationResponse
} = require('@simplewebauthn/server');
const supabase = require('./db');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');

const logError = (msg, error) => {
    const logPath = path.join(__dirname, 'server_error.log');
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : '';
    const logEntry = `[${timestamp}] ${msg}\nError: ${errorMessage}\nStack: ${stack}\n\n`;

    fs.appendFileSync(logPath, logEntry);
    console.error(msg, error);
};
// Load environment variables from .env file
dotenv.config();

const app = express();
app.use(cors({
    origin: ['http://localhost:8080', 'http://localhost:8081', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081', 'http://localhost:5173'],
    credentials: true
}));
app.use(express.json());
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'super-secret-key',
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        secure: false, // Set to true in production with HTTPS
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
    }
}));

const PORT = process.env.PORT || 3000;
const RP_ID = process.env.RP_ID || 'localhost';
const RP_NAME = process.env.RP_NAME || 'Passkey Guardian';
const ORIGIN = process.env.ORIGIN || 'http://localhost:8080';

// In-memory challenge store with expiration
// Key: userId, Value: { challenge: string, expiresAt: number }
const challengeStore = new Map();
const CHALLENGE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper to store challenge
const storeChallenge = (userId, challenge) => {
    challengeStore.set(userId, {
        challenge,
        expiresAt: Date.now() + CHALLENGE_TTL
    });
};

// Helper to get verify challenge
const getChallenge = (userId) => {
    const entry = challengeStore.get(userId);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
        challengeStore.delete(userId);
        return null;
    }

    return entry.challenge;
};

// Cleanup interval (every 10 mins)
setInterval(() => {
    const now = Date.now();
    for (const [userId, entry] of challengeStore.entries()) {
        if (now > entry.expiresAt) {
            challengeStore.delete(userId);
        }
    }
}, 10 * 60 * 1000);

app.get('/', (req, res) => {
    res.send('Server is running');
});

// ... (existing auth/status, logout code)

// --- Registration ---



// ...


// Check auth status
app.get('/auth/status', (req, res) => {
    if (req.session.user) {
        res.json({ isAuthenticated: true, user: req.session.user });
    } else {
        res.json({ isAuthenticated: false });
    }
});

app.post('/auth/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// --- Registration ---

app.post('/register/challenge', async (req, res) => {
    try {
        const { username } = req.body;

        if (!username) {
            return res.status(400).json({ error: 'Username is required' });
        }

        console.log(`[REGISTER] Requesting challenge for ${username}`);

        // Fetch user from DB
        console.log("[REGISTER] Fetching user from DB...");
        let { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('username', username)
            .single();
        console.log("[REGISTER] User fetch result:", user ? "Found" : "Not Found", error ? error.code : "No Error");

        if (error && error.code !== 'PGRST116') {
            console.error("Error fetching user:", error);
            return res.status(500).json({ error: error.message });
        }

        if (!user) {
            if (req.session.user && req.session.user.username === username) {
                console.log("[REGISTER] Using session user for new device.");
                user = { id: req.session.user.id, username: req.session.user.username };
            } else {
                console.log("[REGISTER] Creating new user...");
                const { data: newUser, error: createError } = await supabase
                    .from('users')
                    .insert([{ username }])
                    .select()
                    .single();

                if (createError) {
                    console.error("Error creating user:", createError);
                    return res.status(500).json({ error: createError.message });
                }
                console.log("[REGISTER] New user created:", newUser.id);
                user = newUser;
            }
        }

        console.log("[REGISTER] Fetching authenticators...");
        const { data: authenticators } = await supabase
            .from('authenticators')
            .select('*')
            .eq('user_id', user.id);
        console.log("[REGISTER] Authenticators fetched:", authenticators?.length || 0);

        const userID = new Uint8Array(Buffer.from(user.id));

        console.log("[REGISTER] Generating WebAuthn options...");
        const options = await generateRegistrationOptions({
            rpName: RP_NAME,
            rpID: RP_ID,
            userID: userID,
            userName: user.username,
            excludeCredentials: authenticators?.map(auth => ({
                id: auth.credential_id,
                transports: auth.transports,
            })),
            pubKeyCredParams: [{ alg: -7, type: 'public-key' }, { alg: -257, type: 'public-key' }],
            authenticatorSelection: {
                userVerification: 'preferred',
                residentKey: 'preferred',
            },
        });
        console.log("[REGISTER] WebAuthn options generated.");

        storeChallenge(user.id, options.challenge);
        console.log(`[REGISTER] Challenge generated for ${username}`);

        res.json(options);
    } catch (err) {
        console.error("[REGISTER] Challenge Error:", err);
        res.status(500).json({ error: "Server failed to generate options", details: err.message });
    }
});

app.post('/register/verify', async (req, res) => {
    try {
        const { username, response } = req.body;

        // Fetch user
        const { data: user } = await supabase.from('users').select('*').eq('username', username).single();
        if (!user) return res.status(400).json({ error: 'User not found' });

        const expectedChallenge = getChallenge(user.id);
        if (!expectedChallenge) {
            console.error("Challenge not found or expired for user:", user.id);
            return res.status(400).json({ error: 'Challenge not found or expired' });
        }

        console.log("Verifying registration for:", username);
        console.log("Expected Challenge:", expectedChallenge);
        console.log("Origin:", req.get('Origin'));
        console.log("RP_ID:", RP_ID);

        let verification;
        try {
            verification = await verifyRegistrationResponse({
                response,
                expectedChallenge,
                expectedOrigin: [ORIGIN, 'http://localhost:8080', 'http://localhost:8081', 'http://127.0.0.1:8080', 'http://127.0.0.1:8081'],
                expectedRPID: RP_ID,
            });
        } catch (error) {
            console.error("Verification Exception:", error);
            return res.status(400).json({ error: error.message, details: "Verification failed on server" });
        }

        const { verified, registrationInfo } = verification;

        if (verified && registrationInfo) {
            let { credentialPublicKey, credentialID, counter } = registrationInfo;

            if (!credentialID && registrationInfo.credential && registrationInfo.credential.id) {
                credentialID = registrationInfo.credential.id;
            }
            if (!credentialPublicKey && registrationInfo.credential && registrationInfo.credential.publicKey) {
                credentialPublicKey = registrationInfo.credential.publicKey;
            }

            const credentialIDBase64 = typeof credentialID === 'string'
                ? credentialID
                : Buffer.from(credentialID).toString('base64url');

            let publicKeyBuffer = credentialPublicKey;
            if (publicKeyBuffer && typeof publicKeyBuffer === 'object' && !Buffer.isBuffer(publicKeyBuffer) && !(publicKeyBuffer instanceof Uint8Array)) {
                publicKeyBuffer = Buffer.from(Object.values(credentialPublicKey));
            } else {
                publicKeyBuffer = Buffer.from(publicKeyBuffer);
            }

            const publicKeyBase64 = publicKeyBuffer.toString('base64');

            const { error } = await supabase.from('authenticators').insert({
                user_id: user.id,
                credential_id: credentialIDBase64,
                public_key: publicKeyBase64,
                counter: counter,
                transports: response.response.transports || [],
                friendly_name: 'New Device',
                last_used: new Date(),
                revoked: false
            });

            if (error) {
                logError("DB Insert Error:", error);
                logAudit(user.id, 'REGISTER_FAIL', { error: error.message }, req);
                return res.status(500).json({ error: 'Failed to save credential', details: error.message });
            }

            challengeStore.delete(user.id);

            req.session.user = { id: user.id, username: user.username };

            logAudit(user.id, 'REGISTER_SUCCESS', { credential_id: credentialIDBase64 }, req);

            res.json({ verified: true });
        } else {
            res.status(400).json({ verified: false });
        }
    } catch (err) {
        console.error("[REGISTER] Verify Error:", err);
        res.status(500).json({ error: "Server failed to verify registration", details: err.message });
    }
});

// --- Login ---

app.post('/login/challenge', async (req, res) => {
    const { username } = req.body;
    if (!username) return res.status(400).json({ error: 'Username required' });

    const { data: user } = await supabase.from('users').select('*').eq('username', username).single();
    if (!user) return res.status(400).json({ error: 'User not found' });

    const { data: authenticators } = await supabase.from('authenticators').select('*').eq('user_id', user.id);

    if (!authenticators || authenticators.length === 0) {
        return res.status(400).json({ error: 'No authenticators registered' });
    }

    const options = await generateAuthenticationOptions({
        rpID: RP_ID,
        allowCredentials: authenticators.map(auth => ({
            id: auth.credential_id,
            transports: auth.transports,
        })),
        userVerification: 'preferred',
    });

    storeChallenge(user.id, options.challenge);
    res.json(options);
});

app.post('/login/verify', async (req, res) => {
    const { username, response } = req.body;

    const { data: user } = await supabase.from('users').select('*').eq('username', username).single();
    if (!user) return res.status(400).json({ error: 'User not found' });

    const expectedChallenge = getChallenge(user.id);
    if (!expectedChallenge) return res.status(400).json({ error: 'Challenge not found or expired' });

    // Find the authenticator used
    const credentialID = response.id;
    const { data: authenticator } = await supabase
        .from('authenticators')
        .select('*')
        .eq('credential_id', credentialID)
        .eq('user_id', user.id)
        .single();

    if (!authenticator) return res.status(400).json({ error: 'Authenticator not found' });

    // Verify
    let verification;
    try {
        const publicKey = Buffer.from(authenticator.public_key, 'base64');

        verification = await verifyAuthenticationResponse({
            response,
            expectedChallenge,
            expectedOrigin: ORIGIN,
            expectedRPID: RP_ID,
            credential: {
                id: authenticator.credential_id,
                publicKey: publicKey,
                counter: Number(authenticator.counter) || 0,
                transports: authenticator.transports,
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(400).json({ error: error.message });
    }

    const { verified, authenticationInfo } = verification;

    if (verified) {
        // [Phase 3] Security Hardening: Enforce User Verification (UV)
        // Ensure the user actually performed biometric/PIN auth, not just presence (UP)
        if (!authenticationInfo.userVerified) {
            console.warn("User Verification (UV) flag missing. Blocking login.");
            return res.status(400).json({ error: 'User verification required (Biometrics/PIN). Please try again.' });
        }

        // Update counter AND last_used
        await supabase.from('authenticators')
            .update({
                counter: authenticationInfo.newCounter,
                last_used: new Date()
            })
            .eq('credential_id', credentialID);

        challengeStore.delete(user.id);

        // Create session
        req.session.user = { id: user.id, username: user.username };

        logAudit(user.id, 'LOGIN_SUCCESS', { method: 'passkey', credential_id: credentialID }, req);

        res.json({ verified: true });
    } else {
        logAudit(user.id, 'LOGIN_FAIL', { method: 'passkey', credential_id: credentialID }, req);
        res.status(400).json({ verified: false });
    }
});

// --- Helper: Audit Logging ---
const logAudit = async (userId, action, details = {}, req) => {
    try {
        const ip_address = req.ip || req.connection.remoteAddress;
        await supabase.from('audit_logs').insert({
            user_id: userId, // Can be null if generic action
            action,
            details,
            ip_address
        });
    } catch (err) {
        console.error("Failed to write audit log:", err);
    }
};

// --- Recovery Codes ---

// Generate Recovery Codes (Protected)
app.post('/user/recovery-codes', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.session.user.id;
    const codes = [];
    const hashes = [];

    // Generate 5 random 8-character codes
    for (let i = 0; i < 5; i++) {
        const code = crypto.randomBytes(4).toString('hex').toUpperCase(); // e.g., A1B2C3D4
        codes.push(code);
        // Store hash
        const hash = crypto.createHash('sha256').update(code).digest('hex');
        hashes.push({ user_id: userId, code_hash: hash });
    }

    // Delete old codes for this user
    await supabase.from('recovery_codes').delete().eq('user_id', userId);

    // Insert new hashes
    const { error } = await supabase.from('recovery_codes').insert(hashes);

    if (error) {
        console.error("Error saving recovery codes:", error);
        return res.status(500).json({ error: 'Failed to generate codes' });
    }

    logAudit(userId, 'RECOVERY_CODES_GENERATED', {}, req);

    // Return PLAIN text codes to user (one-time view)
    res.json({ codes });
});

// Login with Recovery Code
app.post('/auth/recover', async (req, res) => {
    const { username, code } = req.body;
    if (!username || !code) return res.status(400).json({ error: 'Username and code required' });

    // Find User
    const { data: user } = await supabase.from('users').select('*').eq('username', username).single();
    if (!user) return res.status(400).json({ error: 'User not found' });

    // Hash the provided code
    const codeHash = crypto.createHash('sha256').update(code.toUpperCase()).digest('hex');

    // Check if valid and unused
    const { data: codeRecord, error } = await supabase
        .from('recovery_codes')
        .select('*')
        .eq('user_id', user.id)
        .eq('code_hash', codeHash)
        .eq('used', false)
        .single();

    if (error || !codeRecord) {
        logAudit(user.id, 'RECOVER_FAIL', { reason: 'Invalid or used code' }, req);
        return res.status(400).json({ error: 'Invalid or already used recovery code' });
    }

    // Mark used
    await supabase.from('recovery_codes').update({ used: true }).eq('id', codeRecord.id);

    // Initialise Session
    req.session.user = { id: user.id, username: user.username };

    logAudit(user.id, 'RECOVER_SUCCESS', {}, req);

    res.json({ success: true, user: req.session.user });
});

// --- Audit Logs ---

app.get('/admin/audit-logs', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    // In a real app, check for ADMIN role. Here we just return user's own logs
    const userId = req.session.user.id;

    const { data: logs, error } = await supabase
        .from('audit_logs')
        .select('*')
        // .eq('user_id', userId) // Uncomment to restrict to self, comment to see ALL (Simulation View)
        .order('created_at', { ascending: false })
        .limit(50);

    if (error) return res.status(500).json({ error: error.message });

    res.json(logs);
});



// --- Phase 3: Device Management ---

// Get User Devices
app.get('/user/devices', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.session.user.id;

    const { data: authenticators, error } = await supabase
        .from('authenticators')
        .select('credential_id, created_at, last_used, friendly_name, revoked') // Don't return public_key
        .eq('user_id', userId)
        .eq('revoked', false) // Only active devices
        .order('last_used', { ascending: false, nullsFirst: false });

    if (error) return res.status(500).json({ error: error.message });

    // Mark current session device? (Requires tracking which credential started the session)
    // For now, we can just return the list. Frontend can infer based on other data if needed.

    res.json(authenticators);
});

// Revoke Device (Soft Delete)
app.delete('/user/devices/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.session.user.id;
    const credentialId = req.params.id;

    // Check if this is the LAST active device
    const { count, error: countError } = await supabase
        .from('authenticators')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('revoked', false);

    if (count <= 1) {
        // Check if they have recovery codes
        const { data: codes } = await supabase.from('recovery_codes').select('id').eq('user_id', userId).eq('used', false);
        if (!codes || codes.length === 0) {
            return res.status(400).json({ error: 'Cannot remove last device without recovery codes. Please generate recovery codes first.' });
        }
    }

    const { error } = await supabase
        .from('authenticators')
        .update({ revoked: true })
        .eq('credential_id', credentialId)
        .eq('user_id', userId);

    if (error) return res.status(500).json({ error: 'Failed to revoke device' });

    logAudit(userId, 'DEVICE_REVOKED', { credential_id: credentialId }, req);
    res.json({ success: true });
});

// Rename Device
app.patch('/user/devices/:id', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.session.user.id;
    const credentialId = req.params.id;
    const { friendly_name } = req.body;

    if (!friendly_name || friendly_name.trim().length === 0) {
        return res.status(400).json({ error: 'Friendly name is required' });
    }

    if (friendly_name.length > 50) {
        return res.status(400).json({ error: 'Name too long (max 50 chars)' });
    }

    const { error } = await supabase
        .from('authenticators')
        .update({ friendly_name: friendly_name.trim() })
        .eq('credential_id', credentialId)
        .eq('user_id', userId);

    if (error) return res.status(500).json({ error: 'Failed to rename device' });

    logAudit(userId, 'DEVICE_RENAMED', { credential_id: credentialId, new_name: friendly_name }, req);
    res.json({ success: true });
});

// Risk-Based Auth: Get security alerts
app.get('/user/security-alerts', async (req, res) => {
    if (!req.session.user) return res.status(401).json({ error: 'Unauthorized' });

    const userId = req.session.user.id;

    // Check for suspicious activity
    const { data: recentLogins, error } = await supabase
        .from('audit_logs')
        .select('*')
        .eq('user_id', userId)
        .in('action', ['LOGIN_SUCCESS', 'LOGIN_FAIL', 'RECOVER_SUCCESS', 'RECOVER_FAIL'])
        .order('created_at', { ascending: false })
        .limit(20);

    if (error) return res.status(500).json({ error: error.message });

    const alerts = [];

    // Check for failed login attempts
    const recentFailures = recentLogins.filter(l => l.action === 'LOGIN_FAIL' || l.action === 'RECOVER_FAIL');
    if (recentFailures.length >= 3) {
        alerts.push({
            type: 'warning',
            title: 'Multiple Failed Logins',
            message: `${recentFailures.length} failed login attempts detected recently.`,
            timestamp: recentFailures[0]?.created_at
        });
    }

    // Check for new IP addresses (simplified - compare to last known)
    const uniqueIPs = [...new Set(recentLogins.map(l => l.ip_address).filter(Boolean))];
    if (uniqueIPs.length > 2) {
        alerts.push({
            type: 'info',
            title: 'Multiple Locations',
            message: `Your account has been accessed from ${uniqueIPs.length} different IP addresses.`,
            timestamp: new Date().toISOString()
        });
    }

    // Check for recovery code usage
    const recoveryUse = recentLogins.find(l => l.action === 'RECOVER_SUCCESS');
    if (recoveryUse) {
        alerts.push({
            type: 'warning',
            title: 'Recovery Code Used',
            message: 'A recovery code was used to access your account. Consider adding a new device.',
            timestamp: recoveryUse.created_at
        });
    }

    res.json({ alerts, stats: { totalLogins: recentLogins.length, uniqueIPs: uniqueIPs.length } });
});

app.listen(PORT, () => { console.log('Server running on port ' + PORT); });


