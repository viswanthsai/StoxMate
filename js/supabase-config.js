// Supabase configuration for StoxMate app

// Environment-specific configurations
const ENV = {
    development: {
        supabaseUrl: 'https://jfyspkdsurhcoqahhmnv.supabase.co',
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeXNwa2RzdXJoY29xYWhobW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NjE5NTcsImV4cCI6MjA1NzMzNzk1N30.ddXNG8_9ghDmz0fXja4AaO8YbyaSvgxyB8WgGtcxbOc'
    },
    production: {
        supabaseUrl: 'https://jfyspkdsurhcoqahhmnv.supabase.co',
        supabaseKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImpmeXNwa2RzdXJoY29xYWhobW52Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE3NjE5NTcsImV4cCI6MjA1NzMzNzk1N30.ddXNG8_9ghDmz0fXja4AaO8YbyaSvgxyB8WgGtcxbOc'
    }
};

// Determine current environment
const currentEnv = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
    ? 'development' 
    : 'production';

// Get configuration for current environment
const config = ENV[currentEnv];

let supabase;

// Initialize the Supabase client
if (typeof window.supabase !== 'undefined') {
    // Using globally loaded Supabase
    supabase = window.supabase.createClient(config.supabaseUrl, config.supabaseKey);
    console.log("Supabase initialized from global object");
} else if (typeof window.supabaseClient !== 'undefined') {
    // Some CDN versions expose it as supabaseClient
    supabase = window.supabaseClient.createClient(config.supabaseUrl, config.supabaseKey);
    console.log("Supabase initialized from supabaseClient");
} else {
    console.error('Supabase client could not be initialized. Make sure to include the Supabase JS library.');
}

// Check if initialization succeeded
if (!supabase) {
    console.error('Failed to initialize Supabase client');
    // Create a placeholder to prevent errors
    supabase = {
        auth: { 
            onAuthStateChange: () => {}, 
            getUser: () => ({ data: { user: null }, error: new Error('Supabase not initialized') }),
            signInWithPassword: () => ({ error: new Error('Supabase not initialized') }),
            signUp: () => ({ error: new Error('Supabase not initialized') }),
            signOut: () => ({ error: new Error('Supabase not initialized') }),
        }
    };
}

// Enhanced version of the onAuthStateChange handler that fixes email confirmation
supabase.auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event, session);
    
    if (event === 'SIGNED_IN' || event === 'USER_UPDATED') {
        // User has signed in, update UI
        console.log('User signed in:', session?.user);
        
        // Always ensure the user has email_confirmed_at set
        if (session.user) {
            let needsUpdate = false;
            const user = {...session.user}; // Create a copy to modify
            
            // Check if email is not confirmed and fix it
            if (user.email_confirmed_at === null || !user.email_confirmed_at) {
                console.log('New sign-in with unconfirmed email, fixing locally...');
                needsUpdate = true;
                
                // Fix the email confirmation
                const now = new Date().toISOString();
                user.email_confirmed_at = now;
                user.confirmed_at = now;
                
                // Update email verification in identities if it exists
                if (user.identities && Array.isArray(user.identities)) {
                    user.identities.forEach(identity => {
                        if (identity.identity_data && identity.identity_data.email === user.email) {
                            identity.identity_data.email_verified = true;
                        }
                    });
                }
            }
            
            // Always store the user - either original or fixed version
            localStorage.setItem('stoxmate_user', JSON.stringify(user));
            
            // If there was a fix applied, log it
            if (needsUpdate) {
                console.log('Applied email confirmation fix for:', user.email);
            }
        }
        
        updateUserUI(session.user);
        
        // Check if this was a new sign-up that hasn't been redirected yet
        const currentPage = window.location.pathname;
        if (currentPage.includes('register.html') && !sessionStorage.getItem('redirecting')) {
            sessionStorage.setItem('redirecting', 'true');
            window.location.href = 'profile.html';
        }
    } else if (event === 'SIGNED_OUT') {
        // User has signed out, update UI
        console.log('User signed out');
        updateUserUI(null);
        // Clear user session
        localStorage.removeItem('stoxmate_user');
    } else if (event === 'PASSWORD_RECOVERY') {
        // Handle password recovery event
        if (window.location.pathname !== '/update-password.html') {
            window.location.href = 'update-password.html';
        }
    }
});

// Add this function to handle auto-confirmation when needed
async function ensureEmailConfirmed(userId, bypass = false) {
    // Only try this in development or if explicitly bypassing
    if (bypass || currentEnv === 'development') {
        try {
            // We can't directly use the admin API here, but we can update localStorage
            const { data: { user }, error } = await supabase.auth.getUser();
            if (!error && user && user.email_confirmed_at === null) {
                // Update the user object locally
                user.email_confirmed_at = new Date().toISOString();
                user.confirmed_at = user.email_confirmed_at;
                
                // Store in localStorage
                localStorage.setItem('stoxmate_user', JSON.stringify(user));
                console.log('Auto-confirmed email in localStorage');
                return true;
            }
        } catch (e) {
            console.error('Error in email confirmation bypass:', e);
        }
    }
    return false;
}

// Check if user is already logged in
async function checkUser() {
    try {
        const { data: { user }, error } = await supabase.auth.getUser();
        if (error) throw error;
        
        if (user) {
            updateUserUI(user);
            return user;
        }
    } catch (error) {
        console.error('Error checking user:', error);
    }
    return null;
}

// Check if essential tables exist (to be called after API utils are loaded)
async function checkDatabaseTables() {
    if (window.stoxmate.API && typeof window.stoxmate.API.checkAndSetupTables === 'function') {
        return await window.stoxmate.API.checkAndSetupTables();
    }
    return false;
}

// Update UI based on auth state
function updateUserUI(user) {
    const authButtons = document.querySelector('.auth-buttons');
    const profileLink = document.querySelector('a[href="profile.html"]');
    
    if (user) {
        // User is logged in
        if (authButtons) {
            authButtons.innerHTML = `
                <span class="user-greeting">Hello, ${user.user_metadata?.full_name || 'User'}</span>
                <button class="btn btn-outline" id="logout-btn">Logout</button>
            `;
            // Add logout button listener
            const logoutBtn = document.getElementById('logout-btn');
            if (logoutBtn) {
                logoutBtn.addEventListener('click', async () => {
                    try {
                        const { error } = await supabase.auth.signOut();
                        if (error) throw error;
                        localStorage.removeItem('stoxmate_user'); // Clear local storage immediately
                        window.location.href = 'index.html';
                    } catch (err) {
                        console.error('Error signing out:', err);
                        alert('Error signing out. Please try again.');
                    }
                });
            }
        }
        
        // Enable profile link
        if (profileLink) {
            profileLink.classList.remove('disabled');
        }
    } else {
        // User is logged out
        if (authButtons) {
            authButtons.innerHTML = `
                <button class="btn btn-outline" id="login-btn">Login</button>
                <button class="btn btn-primary" id="register-btn">Register</button>
            `;
            // Add login/register button listeners
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            
            if (loginBtn) {
                loginBtn.addEventListener('click', () => {
                    window.location.href = 'login.html';
                });
            }
            
            if (registerBtn) {
                registerBtn.addEventListener('click', () => {
                    window.location.href = 'register.html';
                });
            }
        }
        
        // Prevent redirect loops on profile page
        const currentPath = window.location.pathname;
        if (currentPath.includes('profile.html') && !sessionStorage.getItem('auth_redirect_in_progress')) {
            sessionStorage.setItem('auth_redirect_in_progress', 'true');
            window.location.href = 'login.html';
            return;
        }
        
        // Disable profile link
        if (profileLink) {
            profileLink.classList.add('disabled');
            profileLink.addEventListener('click', (e) => {
                if (profileLink.classList.contains('disabled')) {
                    e.preventDefault();
                    alert('Please login to view your profile');
                }
            });
        }
    }
    
    // Dispatch an event to notify that auth UI has been updated
    document.dispatchEvent(new CustomEvent('stoxmate:authupdated', { detail: { user } }));
}

// Error handling helper
function handleError(error, message = 'An error occurred') {
    console.error(message, error);
    return { error: { message: `${message}: ${error.message}` } };
}

// Add new helper function to validate login credentials against database
async function validateLogin(email, password) {
    try {
        // First try to sign in with the credentials
        const { data, error } = await supabase.auth.signInWithPassword({
            email,
            password
        });
        
        // If successful, we have valid credentials
        if (data?.user) {
            return { 
                success: true, 
                user: data.user 
            };
        }
        
        // If there's an email confirmation error but credentials are otherwise valid
        if (error && error.message.includes('Email not confirmed')) {
            // Try to get the user by email (requires special permissions)
            const { data: userData, error: userError } = await supabase
                .from('users')
                .select('id, email')
                .eq('email', email)
                .single();
                
            if (!userError && userData) {
                // We found the user in the database, so credentials are likely valid
                return { 
                    success: true,
                    emailConfirmed: false,
                    userId: userData.id,
                    email: email
                };
            }
        }
        
        return { 
            success: false, 
            error: error 
        };
    } catch (error) {
        return { 
            success: false, 
            error: error 
        };
    }
}

// Export the Supabase client and auth functions
window.stoxmate = {
    supabase,
    checkUser,
    checkDatabaseTables,
    handleError,
    ensureEmailConfirmed,
    validateLogin
};
