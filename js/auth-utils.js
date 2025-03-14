/**
 * Authentication UI utilities for StoxMate
 * Provides consistent handling of auth buttons across the application
 */

const AuthUtils = {
    /**
     * Initialize auth buttons on any page
     */
    initAuthButtons: function() {
        // Check for user session immediately on page load
        this.checkAndSetAuthState();
        
        // Then attach event listeners to buttons
        this.attachEventToButton('login-btn', () => window.location.href = 'login.html');
        this.attachEventToButton('register-btn', () => window.location.href = 'register.html');
        this.attachEventToButton('logout-btn', this.handleLogout);
        
        // Find and attach handlers to buttons with text content
        this.findAndAttachButtonsByText();
    },
    
    /**
     * Check auth state and update UI accordingly
     */
    checkAndSetAuthState: function() {
        const authButtons = document.querySelector('.auth-buttons');
        const profileLink = document.querySelector('a[href="profile.html"]');
        if (!authButtons) return;
        
        // Check for user in localStorage (prioritize stoxmate_user)
        const storedUser = localStorage.getItem('stoxmate_user') || localStorage.getItem('indivest_user');
        
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
                
                // Dispatch event for other scripts to know auth state changed
                document.dispatchEvent(new CustomEvent('stoxmate:userloggedin', { detail: user }));
                return true;
            } catch (e) {
                console.error('Error parsing stored user:', e);
                localStorage.removeItem('stoxmate_user');
                localStorage.removeItem('indivest_user');
            }
        }
        
        // No valid user found - show login/register UI
        this.showLoggedOutUI(authButtons, profileLink);
        
        // Dispatch event for logged out state
        document.dispatchEvent(new CustomEvent('stoxmate:userloggedout'));
        return false;
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
    handleLogout: function() {
        // Clear all local storage keys
        localStorage.removeItem('stoxmate_user');
        localStorage.removeItem('indivest_user');
        
        // Clear any session storage items
        sessionStorage.removeItem('auth_redirect_in_progress');
        sessionStorage.removeItem('redirecting');
        
        // Update UI to show logged out state
        const authButtons = document.querySelector('.auth-buttons');
        const profileLink = document.querySelector('a[href="profile.html"]');
        
        if (authButtons) {
            authButtons.innerHTML = `
                <button class="btn btn-outline" id="login-btn">Login</button>
                <button class="btn btn-primary" id="register-btn">Register</button>
            `;
            
            // Re-attach event listeners
            const loginBtn = document.getElementById('login-btn');
            const registerBtn = document.getElementById('register-btn');
            
            if (loginBtn) {
                loginBtn.addEventListener('click', () => window.location.href = 'login.html');
            }
            
            if (registerBtn) {
                registerBtn.addEventListener('click', () => window.location.href = 'register.html');
            }
        }
        
        // Redirect to home page
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

// Run immediately on script load
AuthUtils.initAuthButtons();

// Also run when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', function() {
    AuthUtils.initAuthButtons();
});

// Export for use in other scripts
window.stoxmate = window.stoxmate || {};
window.stoxmate.AuthUtils = AuthUtils;
