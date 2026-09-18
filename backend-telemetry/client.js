/**
 * Wotmed-Net Supabase Telemetry Sync Connector
 * Architect: Ayitegeb Tilahun Demisie
 */

const { createClient } = require('@supabase/supabase-js');

// Support both standard and NEXT_PUBLIC environment variable naming conventions
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

let supabase = null;

if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
  console.log('[Wotmed-Net Telemetry]: Connected to Supabase Cloud.');
} else {
  console.log('[Wotmed-Net Warning]: Supabase credentials not found. Telemetry running in local buffer mode.');
}

async function sendTelemetry(telemetryPayload) {
  // Always log locally/console for immediate visibility
  console.log('[Wotmed SOC Telemetry Stream]:', JSON.stringify(telemetryPayload, null, 2));

  if (!supabase) {
    return; // Local buffer mode fallback
  }

  try {
    const { error } = await supabase
      .from('telemetry_logs')
      .insert([telemetryPayload]);

    if (error) {
      console.error('[Wotmed-Net Error]: Failed to sync telemetry to Supabase:', error.message);
    }
  } catch (err) {
    console.error('[Wotmed-Net Error]: Exception caught during Supabase sync:', err.message);
  }
}

module.exports = { sendTelemetry };