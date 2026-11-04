/* VEXOcar API · conexão única com o Firebase Admin (banco e conferência do login). */
const { initializeApp, getApps, cert } = require('firebase-admin/app');
const config = require('./config');

const app = getApps()[0] || initializeApp({ credential: cert(config.firebase) });
module.exports = app;
