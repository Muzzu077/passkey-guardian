import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const api = axios.create({
    baseURL: API_URL,
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json',
    },
});

export const endpoints = {
    registerChallenge: '/register/challenge',
    registerVerify: '/register/verify',
    loginChallenge: '/login/challenge',
    loginVerify: '/login/verify',
    recoveryCodes: '/user/recovery-codes',
    recoverAccount: '/auth/recover',
    auditLogs: '/admin/audit-logs',
    userDevices: '/user/devices',
    securityAlerts: '/user/security-alerts',
};
