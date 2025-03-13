/**
 * Debug utilities for profile page
 */

document.addEventListener('DOMContentLoaded', function() {
    // Only create debug elements in development mode or with special query param
    const isDebugMode = window.location.hostname === 'localhost' || 
                        window.location.hostname === '127.0.0.1' ||
                        window.location.search.includes('debug=true');
    
    // If not in debug mode, add keyboard shortcut to toggle debug tools
    if (!isDebugMode) {
        // Add keyboard shortcut (Ctrl+Shift+D) to show debug panel
        document.addEventListener('keydown', function(e) {
            if (e.ctrlKey && e.shiftKey && e.key === 'D') {
                e.preventDefault();
                createDebugTools();
                const debugBtn = document.getElementById('profile-debug-btn');
                if (debugBtn) debugBtn.click();
            }
        });
        return;
    } else {
        // Only create debug tools UI in debug mode
        createDebugTools();
    }
    
    function createDebugTools() {
        // Don't create duplicates
        if (document.getElementById('profile-debug-btn')) return;
        
        // Create debug button
        const debugBtn = document.createElement('button');
        debugBtn.id = 'profile-debug-btn';
        debugBtn.textContent = 'Debug Profile';
        debugBtn.style.position = 'fixed';
        debugBtn.style.bottom = '10px';
        debugBtn.style.left = '10px';
        debugBtn.style.zIndex = '999';
        debugBtn.style.backgroundColor = '#3b82f6';
        debugBtn.style.color = 'white';
        debugBtn.style.border = 'none';
        debugBtn.style.borderRadius = '4px';
        debugBtn.style.padding = '8px 12px';
        debugBtn.style.opacity = '0.7';
        debugBtn.style.fontSize = '12px';
        
        // Create debug panel
        const debugPanel = document.createElement('div');
        debugPanel.id = 'profile-debug-panel';
        debugPanel.style.position = 'fixed';
        debugPanel.style.bottom = '50px';
        debugPanel.style.left = '10px';
        debugPanel.style.width = '80%';
        debugPanel.style.maxWidth = '400px';
        debugPanel.style.backgroundColor = 'rgba(0,0,0,0.9)';
        debugPanel.style.color = 'white';
        debugPanel.style.padding = '15px';
        debugPanel.style.borderRadius = '4px';
        debugPanel.style.zIndex = '998';
        debugPanel.style.display = 'none';
        debugPanel.style.maxHeight = '80%';
        debugPanel.style.overflowY = 'auto';
        debugPanel.style.fontFamily = 'monospace';
        debugPanel.style.fontSize = '12px';
        
        document.body.appendChild(debugBtn);
        document.body.appendChild(debugPanel);
        
        debugBtn.addEventListener('click', function() {
            if (debugPanel.style.display === 'none') {
                debugPanel.style.display = 'block';
                loadDebugInfo();
            } else {
                debugPanel.style.display = 'none';
            }
        });
    }
    
    async function loadDebugInfo() {
        debugPanel.innerHTML = '<h3 style="margin-top:0">Profile Debug Tools</h3>';
        
        // Add user info section
        appendSection('User Authentication Info');
        
        // Check localStorage
        const storedUser = localStorage.getItem('indivest_user');
        if (storedUser) {
            try {
                const user = JSON.parse(storedUser);
                appendLine(`User ID: ${user.id}`);
                appendLine(`Email: ${user.email}`);
                appendLine(`Metadata: ${JSON.stringify(user.user_metadata || {})}`);
            } catch (e) {
                appendLine(`Error parsing stored user: ${e.message}`);
            }
        } else {
            appendLine('No user found in localStorage');
        }
        
        // Check Supabase session
        appendLine('\nChecking Supabase session...');
        if (window.indivest?.supabase) {
            try {
                const { data, error } = await window.indivest.supabase.auth.getSession();
                if (error) {
                    appendLine(`Session error: ${error.message}`);
                } else if (data?.session) {
                    appendLine(`Session active for: ${data.session.user.email}`);
                } else {
                    appendLine('No active session');
                }
            } catch (e) {
                appendLine(`Error checking session: ${e.message}`);
            }
        } else {
            appendLine('Supabase not initialized');
        }
        
        // Add UI status section
        appendSection('UI Status');
        const displayNameElement = document.getElementById('user-displayname');
        if (displayNameElement) {
            appendLine(`Display name: ${displayNameElement.textContent}`);
        } else {
            appendLine('Display name element not found');
        }
        
        const fullNameInput = document.getElementById('fullname');
        if (fullNameInput) {
            appendLine(`Name input value: ${fullNameInput.value}`);
        } else {
            appendLine('Name input not found');
        }
        
        const emailInput = document.getElementById('email');
        if (emailInput) {
            appendLine(`Email input value: ${emailInput.value}`);
        } else {
            appendLine('Email input not found');
        }
        
        // Add repair tools section
        appendSection('Repair Tools');
        
        const fixDisplayNameBtn = createButton('Fix Display Name');
        fixDisplayNameBtn.addEventListener('click', fixDisplayName);
        debugPanel.appendChild(fixDisplayNameBtn);
        
        const fixAvatarBtn = createButton('Fix Avatar');
        fixAvatarBtn.addEventListener('click', fixAvatar);
        debugPanel.appendChild(fixAvatarBtn);
        
        const reloadProfileBtn = createButton('Reload Profile Data');
        reloadProfileBtn.addEventListener('click', reloadProfile);
        debugPanel.appendChild(reloadProfileBtn);
        
        const reloadPageBtn = createButton('Reload Page');
        reloadPageBtn.addEventListener('click', () => window.location.reload());
        debugPanel.appendChild(reloadPageBtn);
    }
    
    function appendSection(title) {
        const section = document.createElement('div');
        section.innerHTML = `<h4 style="margin-bottom:5px;margin-top:15px;border-bottom:1px solid #666">${title}</h4>`;
        debugPanel.appendChild(section);
    }
    
    function appendLine(text) {
        const line = document.createElement('div');
        line.textContent = text;
        line.style.margin = '4px 0';
        debugPanel.appendChild(line);
    }
    
    function createButton(text) {
        const button = document.createElement('button');
        button.textContent = text;
        button.style.display = 'block';
        button.style.margin = '8px 0';
        button.style.padding = '6px 10px';
        button.style.backgroundColor = '#10b981';
        button.style.border = 'none';
        button.style.borderRadius = '4px';
        button.style.color = 'white';
        button.style.cursor = 'pointer';
        return button;
    }
    
    function fixDisplayName() {
        const storedUser = localStorage.getItem('stoxmate_user') || localStorage.getItem('indivest_user');
        if (!storedUser) {
            appendLine('No user data found to fix display name');
            return;
        }
        
        try {
            const user = JSON.parse(storedUser);
            const displayNameElement = document.getElementById('user-displayname');
            const fullNameInput = document.getElementById('fullname');
            
            if (displayNameElement) {
                const name = user.user_metadata?.full_name || user.email || 'User';
                displayNameElement.textContent = name;
                appendLine(`Updated display name to: ${name}`);
            }
            
            if (fullNameInput) {
                fullNameInput.value = user.user_metadata?.full_name || '';
                appendLine(`Updated name input to: ${fullNameInput.value}`);
            }
        } catch (e) {
            appendLine(`Error fixing display name: ${e.message}`);
        }
    }
    
    function fixAvatar() {
        const storedUser = localStorage.getItem('indivest_user');
        if (!storedUser) {
            appendLine('No user data found to fix avatar');
            return;
        }
        
        try {
            const user = JSON.parse(storedUser);
            const avatarImg = document.querySelector('.profile-avatar img');
            
            if (avatarImg) {
                const name = user.user_metadata?.full_name || user.email || 'User';
                avatarImg.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff&size=128`;
                appendLine(`Updated avatar for: ${name}`);
            } else {
                appendLine('Avatar image element not found');
            }
        } catch (e) {
            appendLine(`Error fixing avatar: ${e.message}`);
        }
    }
    
    async function reloadProfile() {
        if (!window.indivest?.supabase) {
            appendLine('Supabase not initialized, cannot reload profile');
            return;
        }
        
        try {
            appendLine('Reloading profile data...');
            
            // Get current user
            const { data: userData, error: userError } = await window.indivest.supabase.auth.getUser();
            
            if (userError) {
                appendLine(`Error getting user: ${userError.message}`);
                return;
            }
            
            if (!userData.user) {
                appendLine('No authenticated user found');
                return;
            }
            
            const user = userData.user;
            appendLine(`Found authenticated user: ${user.email}`);
            
            // Get profile data
            const { data: profile, error: profileError } = await window.indivest.supabase
                .from('user_profiles')
                .select('*')
                .eq('id', user.id)
                .single();
                
            if (profileError && profileError.code !== 'PGRST116') {
                appendLine(`Error loading profile: ${profileError.message}`);
                return;
            }
            
            if (!profile) {
                appendLine('No profile found, creating one');
                
                const { error: createError } = await window.indivest.supabase
                    .from('user_profiles')
                    .insert({
                        id: user.id,
                        full_name: user.user_metadata?.full_name || '',
                        created_at: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                    
                if (createError) {
                    appendLine(`Error creating profile: ${createError.message}`);
                    return;
                }
                
                appendLine('Profile created successfully');
            } else {
                appendLine('Profile found:');
                appendLine(`Name: ${profile.full_name}`);
                appendLine(`Phone: ${profile.phone_number || 'Not set'}`);
                
                // Update UI fields
                if (document.getElementById('fullname')) {
                    document.getElementById('fullname').value = profile.full_name || user.user_metadata?.full_name || '';
                }
                
                if (document.getElementById('phone')) {
                    document.getElementById('phone').value = profile.phone_number || '';
                }
                
                if (document.getElementById('dob') && profile.date_of_birth) {
                    document.getElementById('dob').value = profile.date_of_birth;
                }
                
                if (document.getElementById('pan')) {
                    document.getElementById('pan').value = profile.pan_number || '';
                }
                
                if (document.getElementById('address')) {
                    document.getElementById('address').value = profile.address || '';
                }
                
                // Update header
                const userDisplayName = document.getElementById('user-displayname');
                if (userDisplayName) {
                    userDisplayName.textContent = profile.full_name || user.email || 'User';
                }
            }
            
            appendLine('Profile reload complete');
            
        } catch (e) {
            appendLine(`Error reloading profile: ${e.message}`);
        }
    }
});
