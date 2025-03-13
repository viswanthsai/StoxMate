// Direct initialization for Supabase
// Use this file if the regular initialization doesn't work

// These are the credentials to connect to your Supabase instance
const SUPABASE_URL = 'https://jfyspkdsurhcoqahhmnv.supabase.co';
const SUPABASE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeXNwa2RzdXJoY29xYWhobW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NjE5NTcsImV4cCI6MjA1NzMzNzk1N30.ddXNG8_9ghDmz0fXja4AaO8YbyaSvgxyB8WgGtcxbOc';

// Wait for Supabase to be available
document.addEventListener('DOMContentLoaded', function() {
    console.log('Attempting direct Supabase initialization');
    
    // Check if Supabase is available
    if (typeof window.supabase !== 'undefined') {
        try {
            // Initialize Supabase client
            const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            
            // Store in window object for access by other scripts
            window.indivest = window.indivest || {};
            window.indivest.supabase = supabase;
            
            console.log('Direct Supabase initialization successful');
            
            // Test authentication
            testAuth(supabase);
        } catch (error) {
            console.error('Error initializing Supabase directly:', error);
        }
    } else {
        console.error('Supabase library not available for direct initialization');
    }
    
    // Function to test authentication
    async function testAuth(supabaseClient) {
        try {
            const { data, error } = await supabaseClient.auth.getSession();
            if (error) throw error;
            console.log('Auth check successful:', data);
        } catch (e) {
            console.error('Auth test failed:', e);
        }
    }
});
