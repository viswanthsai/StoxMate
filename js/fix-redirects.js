/**
 * Fix redirects and authentication flows
 * This script helps ensure users are properly redirected after 
 * registration and login
 */

(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Clear any potential redirect loops
        checkAndClearRedirectLoops();
        
        // Force login check on pages that should be protected
        handleProtectedPages();
        
        // Make sure redirects happen correctly
        ensureRedirects();
        
        // Add event listener for clicks on auth buttons
        document.body.addEventListener('click', function(e) {
            // Find closest button element
            const button = e.target.closest('button');
            if (!button) return;
            
            // Check if it's a login or register button
            const text = button.textContent.trim().toLowerCase();
            if ((text.includes('login') || text.includes('sign in')) && !button.closest('form')) {
                e.preventDefault();
                window.location.href = 'login.html';
            } else if ((text.includes('register') || text.includes('sign up')) && !button.closest('form')) {
                e.preventDefault();
                window.location.href = 'register.html';
            } else if ((text.includes('logout') || text.includes('sign out')) && !button.closest('form')) {
                e.preventDefault();
                handleLogout();
            }
        });
    });
    
    // Handle protected pages
    function handleProtectedPages() {
        const currentPath = window.location.pathname;
        const protectedPaths = ['profile.html', 'dashboard.html', 'portfolio.html'];
        
        // Check if current page is protected
        if (protectedPaths.some(path => currentPath.includes(path))) {
            const storedUser = localStorage.getItem('stoxmate_user') || localStorage.getItem('indivest_user');
            
            if (!storedUser && !sessionStorage.getItem('auth_redirect_in_progress')) {
                console.log('Protected page accessed without authentication, redirecting...');
                sessionStorage.setItem('auth_redirect_in_progress', 'true');
                sessionStorage.setItem('redirect_after_login', currentPath);
                window.location.href = 'login.html';
            }
        }
    }
    
    // Handle logout action
    function handleLogout() {
        // Clear authentication data
        localStorage.removeItem('stoxmate_user');
        localStorage.removeItem('indivest_user');
        
        // Redirect to home page
        window.location.href = 'index.html';
    }
    
    // Check for and clear redirect loops
    function checkAndClearRedirectLoops() {
        const redirectCount = parseInt(sessionStorage.getItem('redirect_count') || '0');
        const now = Date.now();
        const lastRedirect = parseInt(sessionStorage.getItem('last_redirect_time') || '0');
        
        // If we've had multiple redirects in a short time, clear all redirect flags
        if (now - lastRedirect < 10000 && redirectCount > 2) { // 10 seconds
            console.log('Detected possible redirect loop, clearing flags');
            sessionStorage.removeItem('auth_redirect_in_progress');
            sessionStorage.removeItem('redirect_count');
            sessionStorage.removeItem('last_redirect_time');
            return;
        }
        
        // Update redirect tracking
        if (now - lastRedirect < 10000) {
            sessionStorage.setItem('redirect_count', redirectCount + 1);
        } else {
            sessionStorage.setItem('redirect_count', 1);
        }
        sessionStorage.setItem('last_redirect_time', now);
    }
    
    // Ensure redirects happen correctly
    function ensureRedirects() {
        // Check if we're coming from a registration page
        const urlParams = new URLSearchParams(window.location.search);
        
        if (urlParams.has('registered') && !sessionStorage.getItem('registration_handled')) {
            sessionStorage.setItem('registration_handled', 'true');
            
            // Check if we have user data
            const storedUser = localStorage.getItem('stoxmate_user') || localStorage.getItem('indivest_user');
            if (storedUser) {
                // User is logged in, redirect to profile
                window.location.href = 'profile.html';
            }
        }
        
        // Handle login redirects
        const redirectAfterLogin = sessionStorage.getItem('redirect_after_login');
        if (redirectAfterLogin && window.location.pathname.includes('profile.html')) {
            sessionStorage.removeItem('redirect_after_login');
            
            // Only redirect if different from current page
            if (redirectAfterLogin !== window.location.pathname) {
                window.location.href = redirectAfterLogin;
            }
        }
    }
})();
