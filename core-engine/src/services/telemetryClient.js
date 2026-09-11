import axios from 'axios';

const TELEMETRY_URL = process.env.TELEMETRY_INGEST_URL || 'http://localhost:5000/api/v1/telemetry';

export async function reportThreat(payload) {
  try {
    // ቴሌሜትሪውን ወደ backend-telemetry መላክ (Non-blocking)
    await axios.post(TELEMETRY_URL, payload, { timeout: 1000 });
  } catch (err) {
    console.error('[CORE-ENGINE] Telemetry dispatch failed:', err.message);
  }
}