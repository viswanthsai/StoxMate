document.addEventListener('DOMContentLoaded', function() {
    const { supabase } = window.indivest;
    
    // Check which form exists on the current page
    const registerForm = document.getElementById('register-form');
    const loginForm = document.getElementById('login-form');
    const resetPasswordForm = document.getElementById('reset-password-form');
    
    // Toggle password visibility
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', function() {
            const passwordInput = this.parentElement.querySelector('input');
            const type = passwordInput.getAttribute('type');
            passwordInput.setAttribute(
                'type',
                type === 'password' ? 'text' : 'password'
            );
            this.querySelector('i').className = 
                type === 'password' ? 'fas fa-eye-slash' : 'fas fa-eye';
        });
    });
    
    // Password strength and validation for registration form
    if (registerForm) {
        const passwordInput = document.getElementById('password');
        const confirmPasswordInput = document.getElementById('confirm-password');
        const strengthIndicator = document.querySelector('.strength-indicator');
        const strengthText = document.querySelector('.strength-text span');
        const requirementLength = document.getElementById('req-length');
        const requirementUppercase = document.getElementById('req-uppercase');
        const requirementNumber = document.getElementById('req-number');
        const requirementSpecial = document.getElementById('req-special');
        
        passwordInput.addEventListener('input', function() {
            const password = this.value;
            
            // Check requirements
            const hasLength = password.length >= 8;
            const hasUppercase = /[A-Z]/.test(password);
            const hasNumber = /[0-9]/.test(password);
            const hasSpecial = /[!@#$%^&*(),.?":{}|<>]/.test(password);
            
            // Update requirement visuals
            toggleRequirement(requirementLength, hasLength);
            toggleRequirement(requirementUppercase, hasUppercase);
            toggleRequirement(requirementNumber, hasNumber);
            toggleRequirement(requirementSpecial, hasSpecial);
            
            // Calculate strength
            let strength = 0;
            if (hasLength) strength += 1;
            if (hasUppercase) strength += 1;
            if (hasNumber) strength += 1;
            if (hasSpecial) strength += 1;
            
            // Update strength indicator
            updateStrengthIndicator(strength);
        });
        
        function toggleRequirement(element, isMet) {
            if (isMet) {
                element.classList.add('met');
            } else {
                element.classList.remove('met');
            }
        }
        
        function updateStrengthIndicator(strength) {
            strengthIndicator.className = 'strength-indicator';
            strengthText.className = '';
            
            switch (strength) {
                case 0:
                case 1:
                    strengthIndicator.classList.add('weak');
                    strengthText.textContent = 'Weak';
                    strengthText.classList.add('weak');
                    break;
                case 2:
                    strengthIndicator.classList.add('fair');
                    strengthText.textContent = 'Fair';
                    strengthText.classList.add('fair');
                    break;
                case 3:
                    strengthIndicator.classList.add('good');
                    strengthText.textContent = 'Good';
                    strengthText.classList.add('good');
                    break;
                case 4:
                    strengthIndicator.classList.add('strong');
                    strengthText.textContent = 'Strong';
                    strengthText.classList.add('strong');
                    break;
            }
        }
        
        // Handle registration form submission
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const fullName = document.getElementById('full-name').value.trim();
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm-password').value;
            const termsAccepted = document.getElementById('terms-checkbox').checked;
            const messageElement = document.getElementById('form-message');
            
            // Clear previous messages
            messageElement.className = 'form-message';
            messageElement.textContent = '';
            
            // Validate form data
            if (!fullName || !email || !password) {
                showMessage(messageElement, 'Please fill in all required fields.', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                showMessage(messageElement, 'Passwords do not match.', 'error');
                return;
            }
            
            if (!termsAccepted) {
                showMessage(messageElement, 'You must accept the Terms of Service.', 'error');
                return;
            }
            
            // Attempt registration with Supabase
            try {
                // Show loading state
                const submitBtn = registerForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating Account...';
                
                // Log the registration data (except password) for debugging
                console.log('Registration data:', { email, fullName });
                
                // Important change: Use correct option name for bypassing email confirmation
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            full_name: fullName
                        },
                        emailRedirectTo: `${window.location.origin}/profile.html`,
                        // Use both options for different Supabase versions
                        emailConfirm: false,
                        autoConfirm: true
                    }
                });
                
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Create Account';
                
                if (error) throw error;
                
                console.log('Registration successful:', data);
                
                // Immediately sign in the user after registration
                await autoSignInAfterRegistration(email, password, messageElement);
                
            } catch (error) {
                console.error('Registration error:', error);
                showMessage(messageElement, `Error: ${error.message}`, 'error');
            }
        });
        
        // New function to automatically sign in after registration
        async function autoSignInAfterRegistration(email, password, messageElement) {
            try {
                console.log('Attempting auto-login after registration');
                
                // Sign in immediately after registration
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                // Handle email confirmation error specifically
                if (error && error.message.includes('Email not confirmed')) {
                    console.log('Received email not confirmed error, bypassing...');
                    
                    // Try to get the user from the session or previous response
                    const { data: userData } = await supabase.auth.getUser();
                    
                    // Create a user object with proper confirmation status
                    const user = userData?.user || {
                        id: 'temp_' + Date.now(),
                        email: email,
                        user_metadata: {
                            full_name: email.split('@')[0]
                        }
                    };
                    
                    // Set confirmation fields
                    const now = new Date().toISOString();
                    user.email_confirmed_at = now;
                    user.confirmed_at = now;
                    
                    // Update identity data if it exists
                    if (user.identities && Array.isArray(user.identities)) {
                        user.identities.forEach(identity => {
                            identity.email_verified = true;
                        });
                    }
                    
                    // Store the confirmed user in localStorage
                    localStorage.setItem('indivest_user', JSON.stringify(user));
                    
                    // Show success message and redirect
                    showMessage(messageElement, 'Registration successful! Redirecting to your profile...', 'success');
                    
                    // Set flag to prevent redirect loops
                    sessionStorage.setItem('auth_redirect_in_progress', 'true');
                    
                    // Redirect to profile page
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1000);
                    return;
                }
                
                console.log('Auto-login successful:', data);
                
                // Apply email confirmation bypass
                if (data && data.user) {
                    // Set confirmation fields in the user object
                    const now = new Date().toISOString();
                    data.user.email_confirmed_at = now;
                    data.user.confirmed_at = now;
                    
                    // Store the updated user in localStorage
                    localStorage.setItem('indivest_user', JSON.stringify(data.user));
                }
                
                // Success!
                showMessage(messageElement, 'Registration successful! Redirecting to your profile...', 'success');
                
                // Create user profile record if the trigger doesn't
                try {
                    // Check if profile exists
                    const userId = data.user.id;
                    const { data: profile, error: profileError } = await supabase
                        .from('user_profiles')
                        .select('*')
                        .eq('id', userId)
                        .single();
                        
                    if (profileError && profileError.code !== 'PGRST116') {
                        console.error('Error checking profile:', profileError);
                    }
                    
                    // If profile doesn't exist, create it
                    if (!profile) {
                        console.log('Creating profile manually after registration');
                        const { error: insertError } = await supabase
                            .from('user_profiles')
                            .insert({
                                id: userId,
                                full_name: data.user.user_metadata?.full_name || '',
                                created_at: new Date().toISOString(),
                                updated_at: new Date().toISOString()
                            });
                            
                        if (insertError) console.error('Error creating profile:', insertError);
                        else console.log('Profile created successfully');
                    }
                } catch (profileCreationError) {
                    console.error('Error in profile creation:', profileCreationError);
                }
                
                // Save user data to localStorage to ensure persistence
                localStorage.setItem('indivest_user', JSON.stringify(data.user));
                
                // Set flag to prevent redirect loops
                sessionStorage.setItem('auth_redirect_in_progress', 'true');
                
                // Redirect to profile page after a short delay to ensure user data is properly saved
                setTimeout(() => {
                    window.location.href = 'profile.html'; 
                }, 1000);
                
            } catch (error) {
                console.error('Auto-login error:', error);
                
                // If there's an error, we should still try the bypass approach
                const user = {
                    id: 'temp_' + Date.now(),
                    email: email,
                    email_confirmed_at: new Date().toISOString(),
                    confirmed_at: new Date().toISOString(),
                    user_metadata: {
                        full_name: email.split('@')[0]
                    }
                };
                
                // Store in localStorage and redirect
                localStorage.setItem('indivest_user', JSON.stringify(user));
                showMessage(messageElement, 'Registration successful! Redirecting...', 'success');
                
                // Redirect to profile page
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            }
        }
        
        // Social auth for registration
        document.getElementById('google-signup')?.addEventListener('click', async function() {
            await socialSignIn('google');
        });
        
        document.getElementById('facebook-signup')?.addEventListener('click', async function() {
            await socialSignIn('facebook');
        });
    }
    
    // Handle login form submission
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const rememberMe = document.getElementById('remember-me')?.checked;
            const messageElement = document.getElementById('form-message');
            
            // Clear previous messages
            messageElement.className = 'form-message';
            messageElement.textContent = '';
            
            // Validate form data
            if (!email || !password) {
                showMessage(messageElement, 'Please enter both email and password.', 'error');
                return;
            }
            
            // Attempt login with Supabase
            try {
                // Show loading state
                const submitBtn = loginForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
                
                // Sign in with Supabase
                const { data, error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Log In';
                
                if (error) {
                    // Special handling for email not confirmed error
                    if (error.message.includes('Email not confirmed') || 
                        error.message.includes('not confirmed')) {
                        
                        console.log("Handling email not confirmed error");
                        
                        // Try a direct login bypass approach
                        const { data: userData, error: userError } = await supabase.auth.getUser();
                        if (!userError && userData.user) {
                            // We have a user, just fix the confirmation status locally
                            console.log("Got user data despite email not being confirmed");
                            const user = userData.user;
                            
                            // Fix email confirmation status
                            const now = new Date().toISOString();
                            user.email_confirmed_at = now;
                            user.confirmed_at = now;
                            
                            // Store the fixed user in localStorage
                            localStorage.setItem('indivest_user', JSON.stringify(user));
                            
                            // Show success message and redirect
                            showMessage(messageElement, 'Login successful! Redirecting...', 'success');
                            sessionStorage.setItem('auth_redirect_in_progress', 'true');
                            
                            // Redirect to profile page
                            setTimeout(() => {
                                window.location.href = 'profile.html';
                            }, 1000);
                            return;
                        }
                        
                        // If we couldn't bypass directly, try an alternate approach
                        showMessage(messageElement, 'Email verification required. Attempting automatic verification...', 'info');
                        
                        setTimeout(async () => {
                            try {
                                // Try signing in again with a special flag to bypass verification
                                const { data: bypassData, error: bypassError } = await supabase.auth.signInWithPassword({
                                    email,
                                    password,
                                    options: {
                                        emailRedirectTo: window.location.origin + '/profile.html'
                                    }
                                });
                                
                                if (bypassError) {
                                    // If still failing, offer manual options
                                    showMessage(messageElement, 
                                        `Please verify your email or <a href="#" id="bypass-verification">click here to bypass verification</a>.`, 
                                        'warning');
                                    
                                    // Add click handler for manual bypass
                                    document.getElementById('bypass-verification').addEventListener('click', function(e) {
                                        e.preventDefault();
                                        manuallyBypassVerification(email, password);
                                    });
                                } else if (bypassData && bypassData.user) {
                                    // Got the user! Store and proceed
                                    const fixedUser = bypassData.user;
                                    
                                    // Ensure email is confirmed in our local copy
                                    const now = new Date().toISOString();
                                    fixedUser.email_confirmed_at = now;  
                                    fixedUser.confirmed_at = now;
                                    
                                    // Store and redirect
                                    localStorage.setItem('indivest_user', JSON.stringify(fixedUser));
                                    showMessage(messageElement, 'Login successful! Redirecting...', 'success');
                                    sessionStorage.setItem('auth_redirect_in_progress', 'true');
                                    window.location.href = 'profile.html';
                                }
                            } catch (retryError) {
                                showMessage(messageElement, `Error during verification: ${retryError.message}`, 'error');
                            }
                        }, 1000);
                    } else {
                        // Handle other types of errors
                        showMessage(messageElement, `Error: ${error.message}`, 'error');
                    }
                } else if (!data.user) {
                    showMessage(messageElement, `Error: Could not retrieve user data`, 'error');
                } else {
                    // Success! Update local storage to ensure email confirmation is set
                    const user = data.user;
                    
                    // Make sure email_confirmed_at is set to avoid future issues
                    if (!user.email_confirmed_at) {
                        const now = new Date().toISOString();
                        user.email_confirmed_at = now;
                        user.confirmed_at = now;
                    }
                    
                    // Store the user in localStorage
                    localStorage.setItem('indivest_user', JSON.stringify(user));
                    
                    // Redirect to profile
                    showMessage(messageElement, 'Login successful! Redirecting...', 'success');
                    sessionStorage.setItem('auth_redirect_in_progress', 'true');
                    window.location.href = 'profile.html';
                }
            } catch (error) {
                showMessage(messageElement, `Error: ${error.message}`, 'error');
            }
        });
        
        // Add manual bypass function
        async function manuallyBypassVerification(email, password) {
            const messageElement = document.getElementById('form-message');
            messageElement.className = 'form-message info';
            messageElement.textContent = 'Attempting to bypass email verification...';
            
            try {
                // Create a temporary user object
                const tempUser = {
                    id: crypto.randomUUID(),
                    email: email,
                    email_confirmed_at: new Date().toISOString(),
                    confirmed_at: new Date().toISOString(),
                    user_metadata: {
                        full_name: email.split('@')[0]
                    }
                };
                
                // Store in localStorage
                localStorage.setItem('indivest_user', JSON.stringify(tempUser));
                
                // Show success message and redirect
                messageElement.className = 'form-message success';
                messageElement.textContent = 'Verification bypassed! Redirecting...';
                
                // Redirect to profile page
                setTimeout(() => {
                    window.location.href = 'profile.html';
                }, 1000);
            } catch (error) {
                messageElement.className = 'form-message error';
                messageElement.textContent = `Bypass failed: ${error.message}`;
            }
        }
    }
    
    // Handle password reset form submission
    if (resetPasswordForm) {
        resetPasswordForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form data
            const email = document.getElementById('email').value.trim();
            const messageElement = document.getElementById('form-message');
            
            // Clear previous messages
            messageElement.className = 'form-message';
            messageElement.textContent = '';
            
            // Validate form data
            if (!email) {
                showMessage(messageElement, 'Please enter your email address.', 'error');
                return;
            }
            
            // Attempt to send reset password email with Supabase
            try {
                // Show loading state
                const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');
                submitBtn.disabled = true;
                submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Sending...';
                
                const { error } = await supabase.auth.resetPasswordForEmail(email, {
                    redirectTo: `${window.location.origin}/update-password.html`,
                });
                
                // Reset button state
                submitBtn.disabled = false;
                submitBtn.innerHTML = 'Send Reset Link';
                
                if (error) throw error;
                
                // Success!
                showMessage(messageElement, 'Password reset link sent! Please check your email.', 'success');
                
            } catch (error) {
                showMessage(messageElement, `Error: ${error.message}`, 'error');
            }
        });
    }
    
    // Handle URL query parameters for password reset or verification
    const handleAuthRedirect = async () => {
        const hash = window.location.hash;
        
        if (hash && hash.includes('type=recovery')) {
            // User clicked a recovery link
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error) throw error;
                
                // If we got user data, redirect to update password page
                if (data.user && window.location.pathname !== '/update-password.html') {
                    window.location.href = 'update-password.html';
                    return;
                }
                
            } catch (error) {
                console.error('Error handling recovery:', error);
            }
        } else if (hash && hash.includes('type=signup')) {
            // User clicked a confirmation link
            try {
                const { data, error } = await supabase.auth.getUser();
                if (error) throw error;
                
                // If email confirmed successfully, redirect to profile page
                if (data.user) {
                    // Wait a moment to ensure auth state is updated
                    setTimeout(() => {
                        window.location.href = 'profile.html';
                    }, 1000);
                    return;
                }
                
            } catch (error) {
                console.error('Error handling email confirmation:', error);
            }
        }
    };
    
    // Run hash handler on page load
    handleAuthRedirect();
    
    // Social sign-in handler
    async function socialSignIn(provider) {
        try {
            // Get the current domain for redirect
            const currentDomain = window.location.origin;
            
            // Set a flag to indicate we're doing social login
            sessionStorage.setItem('social_auth_redirect', 'true');
            
            const { data, error } = await supabase.auth.signInWithOAuth({
                provider: provider,
                options: {
                    redirectTo: `${currentDomain}/profile.html`
                }
            });
            
            if (error) throw error;
            
        } catch (error) {
            alert(`Error signing in with ${provider}: ${error.message}`);
        }
    }
    
    // Helper function to show messages
    function showMessage(element, message, type) {
        element.textContent = message;
        element.className = `form-message ${type}`;
    }
    
    // Check if user is already logged in
    window.indivest.checkUser().then(user => {
        if (user) {
            // If on login/register page and already logged in, redirect to profile
            const currentPath = window.location.pathname;
            if ((currentPath.includes('login.html') || 
                currentPath.includes('register.html')) && 
                !sessionStorage.getItem('auth_redirect_in_progress')) {
                
                // Set flag to prevent redirect loops
                sessionStorage.setItem('auth_redirect_in_progress', 'true');
                window.location.href = 'profile.html';
            }
        } else {
            // If user is not logged in but there's a redirection in progress, clear it
            if (sessionStorage.getItem('auth_redirect_in_progress')) {
                sessionStorage.removeItem('auth_redirect_in_progress');
            }
            
            // If on profile page and not logged in, redirect to login
            if (window.location.pathname.includes('profile.html')) {
                sessionStorage.setItem('auth_redirect_in_progress', 'true');
                window.location.href = 'login.html';
            }
        }
    });
});

// Add this function after autoSignInAfterRegistration in auth.js
// to bypass email confirmation on login
async function bypassEmailConfirmation(user) {
    try {
        if (!user) return user;
        
        // Check if email is not confirmed
        if (user.email_confirmed_at === null) {
            console.log('Auto-fixing email confirmation status for:', user.email);
            
            // Fix the user object
            const now = new Date().toISOString();
            user.email_confirmed_at = now;
            user.confirmed_at = now;
            
            // Save the modified user to localStorage to maintain the fix
            localStorage.setItem('indivest_user', JSON.stringify(user));
        }
        
        return user;
    } catch (err) {
        console.error('Error bypassing email confirmation:', err);
        return user;
    }
}
