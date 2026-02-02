const axios = require('axios');

const TEST_EMAIL = `test_${Date.now()}@example.com`;
const API_URL = 'http://localhost:3000';

async function testRegistration() {
    console.log("1. Testing Health...");
    try {
        // Just checking if server is up (auth/status or similar)
        // We don't have a simple health check, but let's try calling challenge directly
    } catch (e) { }

    console.log(`2. Requesting Challenge for ${TEST_EMAIL}...`);
    try {
        const response = await axios.post(`${API_URL}/register/challenge`, {
            username: TEST_EMAIL
        });
        console.log("✅ Success! Status:", response.status);
        console.log("Challenge:", response.data.challenge);
        console.log("Full Options:", JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error("❌ Failed!");
        if (error.response) {
            console.error("Status:", error.response.status);
            console.error("Data:", error.response.data);
        } else {
            console.error("Error:", error.message);
        }
    }
}

testRegistration();
