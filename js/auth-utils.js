/**
 * Authentication UI utilities for StoxMate
 * Provides consistent handling of auth buttons across the application
 */

const AuthUtils = {
    /**
     * Initialize auth buttons on any page
     */
    initAuthButtons: function() {
        // Ensure we have the correct auth state first
        this.checkAndSetAuthState();
        
        // Then attach event listeners to buttons
        this.attachEventToButton('login-btn', () => window.location.href = 'login.html');
        this.attachEventToButton('register-btn', () => window.location.href = 'register.html');
        this.attachEventToButton('logout-btn', this.handleLogout);
        
        // For buttons added dynamically or with different selectors
        this.findAndAttachButtonsByText();
        
        // Listen for auth state changes
        document.addEventListener('stoxmate:authupdated', (event) => {
            setTimeout(() => {
                this.checkAndSetAuthState();
                this.initAuthButtons();
            }, 100);
        });
    },
    
    /**
     * Check auth state and update UI accordingly
     */
    checkAndSetAuthState: function() {
        const authButtons = document.querySelector('.auth-buttons');
        const profileLink = document.querySelector('a[href="profile.html"]');
        if (!authButtons) return;
        
        // Check if we have a stored user session AND we're not on the profile page
        const storedUser = localStorage.getItem('stoxmate_user');
        const isProfilePage = window.location.pathname.includes('profile.html');
        
        if (storedUser && this.isValidUserSession(storedUser)) {
            try {
                const user = JSON.parse(storedUser);
                
                // Update auth buttons
                authButtons.innerHTML = `
                    <span class="user-greeting">Hello, ${user.user_metadata?.full_name || 'User'}</span>
                    <button class="btn btn-outline" id="logout-btn">Logout</button>
                `;
                
                // Enable profile link
                if (profileLink) {
                    profileLink.classList.remove('disabled');
                }
                
                // Attach logout event listener
                this.attachEventToButton('logout-btn', this.handleLogout);
            } catch (e) {
                console.error('Error parsing stored user:', e);
                // Clear invalid session data and show login/register UI
                localStorage.removeItem('stoxmate_user');
                this.showLoggedOutUI(authButtons, profileLink);
            }
        } else {
            // No valid user found - show login/register UI
            this.showLoggedOutUI(authButtons, profileLink);
            
            // If we're on profile page but not logged in, redirect to login
            if (isProfilePage && !storedUser) {
                if (!sessionStorage.getItem('auth_redirect_in_progress')) {
                    sessionStorage.setItem('auth_redirect_in_progress', 'true');
                    window.location.href = 'login.html';
                }
            }
        }
    },
    
    /**
     * Validate user session object
     */
    isValidUserSession: function(userJson) {
        try {
            const user = JSON.parse(userJson);
            return user && typeof user === 'object' && user.email && 
                   (user.id || user.user_id);
        } catch (e) {
            return false;
        }
    },
    
    /**
     * Show UI for logged out state
     */
    showLoggedOutUI: function(authButtons, profileLink) {
        // Default login/register buttons
        authButtons.innerHTML = `
            <button class="btn btn-outline" id="login-btn">Login</button>
            <button class="btn btn-primary" id="register-btn">Register</button>
        `;
        
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
    },
    
    /**
     * Find buttons by text content and attach appropriate events
     */
    findAndAttachButtonsByText: function() {
        const authButtons = document.querySelector('.auth-buttons');
        if (!authButtons) return;
        
        const buttons = authButtons.querySelectorAll('button');
        buttons.forEach(btn => {
            const text = btn.textContent.trim().toLowerCase();
            if (text.includes('login') || text.includes('sign in')) {
                btn.addEventListener('click', () => window.location.href = 'login.html');
            } else if (text.includes('register') || text.includes('sign up')) {
                btn.addEventListener('click', () => window.location.href = 'register.html');
            } else if (text.includes('logout') || text.includes('sign out')) {
                btn.addEventListener('click', this.handleLogout);
            }
        });
    },
    
    /**
     * Set up auth UI based on locally stored session
     */
    setupFromLocalStorage: function() {
        const authButtons = document.querySelector('.auth-buttons');
        const profileLink = document.querySelector('a[href="profile.html"]');
        if (!authButtons) return;
        
        // Check if we have a stored user session
        const storedUser = localStorage.getItem('stoxmate_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                
                // Update auth buttons
                authButtons.innerHTML = `
                    <span class="user-greeting">Hello, ${user.user_metadata?.full_name || 'User'}</span>
                    <button class="btn btn-outline" id="logout-btn">Logout</button>
                `;
                
                // Enable profile link
                if (profileLink) {
                    profileLink.classList.remove('disabled');
                }
                
                // Attach logout event
                this.attachEventToButton('logout-btn', this.handleLogout);
            } catch (e) {
                console.error('Error parsing stored user:', e);
                localStorage.removeItem('stoxmate_user');
            }
        }
    },
    
    /**
     * Handle logout action
     */
    handleLogout: async function() {
        if (window.stoxmate && window.stoxmate.supabase) {
            try {
                const { error } = await window.stoxmate.supabase.auth.signOut();
                if (error) throw error;
            } catch (err) {
                console.error('Error signing out:', err);
            }
        }
        
        // Clear local storage
        localStorage.removeItem('stoxmate_user');
        
        // Redirect to home
        window.location.href = 'index.html';
    },
    
    /**
     * Attach event to button by ID
     */
    attachEventToButton: function(id, handler) {
        const button = document.getElementById(id);
        if (button && !button.hasAttachedEvent) {
            button.addEventListener('click', handler);
            button.hasAttachedEvent = true;
        }
    }
};

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    AuthUtils.initAuthButtons();
});

// Export for use in other scripts
window.stoxmate = window.stoxmate || {};
window.stoxmate.AuthUtils = AuthUtils;
