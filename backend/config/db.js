/**
 * Fast Supabase Cloud Database Initializer
 * Replaces legacy MongoDB connection with zero-latency Supabase connection
 */
const { testConnection, getSupabase } = require('./supabase');

const connectDB = async () => {
  const supabase = getSupabase();
  if (!supabase) {
    console.warn('⚠️ Supabase credentials not found in environment.');
    return false;
  }

  // Non-blocking fast background health check
  testConnection().then(res => {
    if (res.connected) {
      console.log(`⚡ Supabase Cloud Database connected! Latency: ${res.latencyMs}ms`);
    } else {
      console.warn(`⚠️ Supabase connection status: ${res.message}`);
    }
  }).catch(err => {
    console.warn(`⚠️ Supabase connection check warning: ${err.message}`);
  });

  return true;
};

module.exports = connectDB;

