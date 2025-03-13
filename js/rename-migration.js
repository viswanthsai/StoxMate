/**
 * Helper script to migrate data from Indivest to StoxMate
 */
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Running StoxMate migration helper');
        migrateLocalStorageData();
        updatePageBranding();
    });
    
    // Migrate local storage data
    function migrateLocalStorageData() {
        // Migrate user data
        const oldUserData = localStorage.getItem('indivest_user');
        if (oldUserData && !localStorage.getItem('stoxmate_user')) {
            localStorage.setItem('stoxmate_user', oldUserData);
            console.log('User data migrated to StoxMate');
            
            // Don't remove the old data right away to ensure a smooth transition
            setTimeout(() => {
                localStorage.removeItem('indivest_user');
                console.log('Old Indivest user data removed after migration');
            }, 10000); // Remove after 10 seconds to ensure no data loss
        }
        
        // Update any other localStorage keys as needed
        const keysToMigrate = [
            {old: 'indivest_settings', new: 'stoxmate_settings'},
            {old: 'indivest_theme', new: 'stoxmate_theme'},
            {old: 'indivest_recent_searches', new: 'stoxmate_recent_searches'}
        ];
        
        keysToMigrate.forEach(keyPair => {
            const oldData = localStorage.getItem(keyPair.old);
            if (oldData && !localStorage.getItem(keyPair.new)) {
                localStorage.setItem(keyPair.new, oldData);
                console.log(`Migrated ${keyPair.old} to ${keyPair.new}`);
            }
        });
    }
    
    // Update branding in the page
    function updatePageBranding() {
        // Update page title
        if (document.title.includes('Indivest')) {
            document.title = document.title.replace(/Indivest/gi, 'StoxMate');
        }
        
        // Update logo text elements
        const logoElements = document.querySelectorAll('.logo-text');
        logoElements.forEach(el => {
            if (el.textContent.includes('Indi')) {
                // Keep the accent span if present
                const accentSpan = el.querySelector('.logo-accent');
                if (accentSpan) {
                    el.textContent = 'Stox';
                    el.appendChild(accentSpan);
                    accentSpan.textContent = 'Mate';
                } else {
                    el.textContent = el.textContent.replace(/Indivest/gi, 'StoxMate');
                }
            }
        });
        
        // Update loading logo text
        const loadingLogo = document.querySelector('.loading-logo');
        if (loadingLogo && loadingLogo.textContent.includes('Indi')) {
            const accentSpan = loadingLogo.querySelector('.logo-accent');
            if (accentSpan) {
                loadingLogo.textContent = 'Stox';
                loadingLogo.appendChild(accentSpan);
                accentSpan.textContent = 'Mate';
            } else {
                loadingLogo.textContent = loadingLogo.textContent.replace(/Indivest/gi, 'StoxMate');
            }
        }
        
        // Update footer logo text
        const footerLogo = document.querySelector('.footer-logo .logo-text');
        if (footerLogo && footerLogo.textContent.includes('Indi')) {
            const accentSpan = footerLogo.querySelector('.logo-accent');
            if (accentSpan) {
                footerLogo.textContent = 'Stox';
                footerLogo.appendChild(accentSpan);
                accentSpan.textContent = 'Mate';
            } else {
                footerLogo.textContent = footerLogo.textContent.replace(/Indivest/gi, 'StoxMate');
            }
        }
        
        // Update copyright text in footer
        const footerCopyright = document.querySelector('.footer-bottom p');
        if (footerCopyright && footerCopyright.textContent.includes('Indivest')) {
            footerCopyright.textContent = footerCopyright.textContent.replace(/Indivest/gi, 'StoxMate');
        }
        
        // Update header subtitles and paragraphs
        const headers = document.querySelectorAll('h1, h2, h3, h4, h5, h6, p');
        headers.forEach(el => {
            if (el.textContent.includes('Indivest')) {
                el.textContent = el.textContent.replace(/Indivest/gi, 'StoxMate');
            }
        });
        
        // Update any remaining text nodes
        const textNodes = [];
        const walker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            null,
            false
        );
        
        while (walker.nextNode()) {
            const node = walker.currentNode;
            if (node.textContent.includes('Indivest')) {
                textNodes.push(node);
            }
        }
        
        textNodes.forEach(node => {
            node.textContent = node.textContent.replace(/Indivest/gi, 'StoxMate');
        });
        
        console.log("Name changed from Indivest to StoxMate throughout the page");
    }
})();
