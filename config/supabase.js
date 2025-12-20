// const { createClient } = require('@supabase/supabase-js');
// const dotenv = require('dotenv');

// // Link the config.env file
// dotenv.config({ path: './config.env' });

// const supabaseUrl = process.env.SUPABASE_URL;
// const supabaseKey = process.env.SUPABASE_ANON_KEY;

// // Initialize the Supabase Client
// const supabase = createClient(supabaseUrl, supabaseKey);

// module.exports = supabase;


const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: './config.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

// Initialize the Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

module.exports = supabase;