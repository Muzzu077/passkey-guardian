# 🔐 Passkey Guardian

A modern, passwordless authentication system built with WebAuthn/Passkeys. Say goodbye to passwords and embrace the future of secure, phishing-resistant authentication.

![Security](https://img.shields.io/badge/Security-WebAuthn-blue)
![React](https://img.shields.io/badge/Frontend-React-61dafb)
![Node.js](https://img.shields.io/badge/Backend-Node.js-339933)
![Supabase](https://img.shields.io/badge/Database-Supabase-3fcf8e)

## ✨ Features

### 🔑 Passwordless Authentication
- **Passkey Registration** - Register using biometrics (fingerprint, face) or hardware keys
- **Passkey Login** - Authenticate instantly with your device
- **Recovery Codes** - Backup codes for account recovery

### 📱 Multi-Device Management
- View all registered devices
- Add new passkeys from any device
- Rename devices for easy identification
- Revoke compromised or lost devices

### 🛡️ Advanced Security
- **User Verification (UV) Enforcement** - Biometric/PIN required for login
- **Challenge Expiration** - Prevents replay attacks (5-minute TTL)
- **Re-Authentication** - Sensitive actions require identity confirmation
- **Anti-Lockout Protection** - Cannot remove last device without recovery codes
- **Risk-Based Alerts** - Monitors for suspicious activity

### 📊 Security Dashboard
- Real-time security status
- Activity log with detailed audit trail
- Device management interface
- Security alerts and notifications

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ & npm
- Supabase account (or any PostgreSQL database)

### Installation

```bash
# Clone the repository
git clone https://github.com/Muzzu077/passkey-guardian.git
cd passkey-guardian

# Install frontend dependencies
npm install

# Install backend dependencies
cd server
npm install
```

### Environment Setup

Create a `.env` file in the `server` directory:

```env
PORT=3000
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
RP_ID=localhost
RP_NAME=Passkey Guardian
ORIGIN=http://localhost:8081
SESSION_SECRET=your_super_secret_session_key
```

### Database Setup

Run the following SQL in your Supabase SQL editor:

```sql
-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username TEXT UNIQUE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Authenticators (Passkeys)
CREATE TABLE authenticators (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    credential_id TEXT UNIQUE NOT NULL,
    credential_public_key TEXT NOT NULL,
    counter BIGINT DEFAULT 0,
    transports TEXT[],
    friendly_name TEXT,
    last_used TIMESTAMPTZ,
    revoked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recovery Codes
CREATE TABLE recovery_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    code_hash TEXT NOT NULL,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit Logs
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES users(id),
    action TEXT NOT NULL,
    details JSONB,
    ip_address TEXT,
    user_agent TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Run the Application

```bash
# Terminal 1: Start backend
cd server
node index.js

# Terminal 2: Start frontend
npm run dev
```

Visit `http://localhost:8081` to access the application.

## 🏗️ Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React, TypeScript, Vite, Tailwind CSS, shadcn/ui |
| **Backend** | Node.js, Express.js |
| **Authentication** | @simplewebauthn/server & browser |
| **Database** | Supabase (PostgreSQL) |
| **Styling** | Tailwind CSS, Framer Motion |

## 📁 Project Structure

```
passkey-guardian/
├── src/                    # Frontend source
│   ├── components/         # Reusable components
│   ├── pages/              # Page components
│   │   ├── Index.tsx       # Landing page
│   │   ├── Register.tsx    # Passkey registration
│   │   ├── Login.tsx       # Passkey login
│   │   ├── Recovery.tsx    # Recovery code login
│   │   └── Dashboard.tsx   # Security dashboard
│   ├── hooks/              # Custom React hooks
│   └── api.ts              # API client
├── server/                 # Backend source
│   ├── index.js            # Express server & routes
│   └── db.js               # Supabase client
└── README.md
```

## 🔒 Security Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Client (Browser)                     │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  Passkey    │  │  Recovery   │  │  Dashboard      │  │
│  │  Auth       │  │  Codes      │  │  Management     │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
└─────────┼────────────────┼──────────────────┼───────────┘
          │                │                  │
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                   Express Backend                        │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────┐  │
│  │  WebAuthn   │  │  Session    │  │  Audit          │  │
│  │  Challenge  │  │  Management │  │  Logging        │  │
│  └──────┬──────┘  └──────┬──────┘  └────────┬────────┘  │
└─────────┼────────────────┼──────────────────┼───────────┘
          │                │                  │
          ▼                ▼                  ▼
┌─────────────────────────────────────────────────────────┐
│                   Supabase (PostgreSQL)                  │
│  ┌─────────┐  ┌──────────────┐  ┌──────────┐  ┌───────┐ │
│  │  users  │  │authenticators│  │ recovery │  │ audit │ │
│  │         │  │              │  │  _codes  │  │ _logs │ │
│  └─────────┘  └──────────────┘  └──────────┘  └───────┘ │
└─────────────────────────────────────────────────────────┘
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License.

---

Built with ❤️ for a passwordless future
