/**
 * Global fixes for common issues across the site
 */
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        // Fix 1: Make sure auth buttons work on all pages
        fixAuthButtons();
        
        // Fix 2: Make sure profile page shows correct user
        if (window.location.pathname.includes('profile.html')) {
            fixProfilePage();
        }
        
        // Fix 3: Clear any redirect loops
        clearRedirectLoops();
    });
    
    function fixAuthButtons() {
        // Direct fixes for login/register buttons
        const allButtons = document.querySelectorAll('button');
        
        allButtons.forEach(button => {
            const text = button.textContent.trim().toLowerCase();
            if (!button.hasEventListener) {
                if (text === 'register' || text.includes('sign up')) {
                    button.addEventListener('click', function() {
                        window.location.href = 'register.html';
                    });
                    button.hasEventListener = true;
                } else if (text === 'login' || text.includes('log in') || text.includes('sign in')) {
                    button.addEventListener('click', function() {
                        window.location.href = 'login.html';
                    });
                    button.hasEventListener = true;
                } else if (text === 'logout' || text.includes('log out') || text.includes('sign out')) {
                    button.addEventListener('click', function() {
                        localStorage.removeItem('indivest_user');
                        window.location.href = 'index.html';
                    });
                    button.hasEventListener = true;
                }
            }
        });
    }
    
    function fixProfilePage() {
        const storedUser = localStorage.getItem('indivest_user');
        
        if (!storedUser) {
            // Redirect to login if not logged in
            console.log('No user data found, redirecting to login page');
            sessionStorage.setItem('redirect_after_login', 'profile.html');
            window.location.href = 'login.html';
        } else {
            try {
                // Update UI with stored user
                const user = JSON.parse(storedUser);
                const userName = user.user_metadata?.full_name || user.email.split('@')[0];
                
                // Update name in profile header
                const nameElement = document.querySelector('.profile-info h1');
                if (nameElement) {
                    nameElement.textContent = userName;
                }
                
                // Update form fields
                if (document.getElementById('fullname')) {
                    document.getElementById('fullname').value = user.user_metadata?.full_name || '';
                }
                
                if (document.getElementById('email')) {
                    document.getElementById('email').value = user.email || '';
                }
                
                // Add handler for form submission
                const profileForm = document.querySelector('.profile-form');
                if (profileForm) {
                    profileForm.addEventListener('submit', function(e) {
                        e.preventDefault();
                        
                        // Update stored user metadata
                        if (document.getElementById('fullname')) {
                            user.user_metadata = user.user_metadata || {};
                            user.user_metadata.full_name = document.getElementById('fullname').value;
                            localStorage.setItem('indivest_user', JSON.stringify(user));
                        }
                        
                        // Show success message
                        alert('Profile updated successfully');
                    });
                }
            } catch (e) {
                console.error('Error parsing user data:', e);
            }
        }
    }
    
    function clearRedirectLoops() {
        // If we detect too many redirects (3+ within 10 seconds)
        const now = Date.now();
        const redirects = sessionStorage.getItem('redirect_count') || 0;
        const lastRedirect = sessionStorage.getItem('last_redirect_time') || 0;
        
        if (now - lastRedirect < 10000) { // Within 10 seconds
            sessionStorage.setItem('redirect_count', parseInt(redirects) + 1);
        } else {
            sessionStorage.setItem('redirect_count', 1);
        }
        
        sessionStorage.setItem('last_redirect_time', now);
        
        // If too many redirects, clear flags
        if (parseInt(sessionStorage.getItem('redirect_count')) >= 3) {
            console.log('Detected redirect loop, clearing flags');
            sessionStorage.removeItem('auth_redirect_in_progress');
            sessionStorage.removeItem('redirecting');
            sessionStorage.removeItem('redirect_count');
            sessionStorage.removeItem('last_redirect_time');
        }
    }
})();
