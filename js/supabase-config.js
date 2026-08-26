// ============================================================
// SUPABASE CONFIG
// Replace the two values below with YOUR project's values.
// Find them in: Supabase Dashboard > Project Settings > API
// ============================================================

const SUPABASE_URL = "https://lkhrmaxyvgumalnbswsl.supabase.co"
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxraHJtYXh5dmd1bWFsbmJzd3NsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODc2NDQyMTcsImV4cCI6MjEwMzIyMDIxN30.PrCyOHdNQuDuW0DCVnG7E0ZTTR-AIr0gMmcrINuEr4w"

// Creates one shared client every page can use.
// (`supabase` here is the global loaded from the CDN script tag in each HTML file.)
const supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
