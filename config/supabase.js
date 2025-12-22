const { createClient } = require('@supabase/supabase-js');

// Only try to load config.env if we are NOT on Render (local development)
if (process.env.NODE_ENV !== 'production') {
    require('dotenv').config({ path: './config.env' });
}

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;