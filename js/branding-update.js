/**
 * Enhanced branding update script for StoxMate (formerly Indivest)
 * This script ensures all references to the old brand name are updated
 */
(function() {
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Running enhanced StoxMate branding update');
        updatePageBranding();
        updateFavicon();
    });
    
    // Update page branding comprehensively
    function updatePageBranding() {
        // Update document title if needed
        if (document.title.includes('Indivest')) {
            document.title = document.title.replace(/Indivest/gi, 'StoxMate');
        }
        
        // Update all text content recursively
        const textWalker = document.createTreeWalker(
            document.body,
            NodeFilter.SHOW_TEXT,
            {
                acceptNode: function(node) {
                    // Skip script and style tags
                    if (node.parentNode.nodeName === 'SCRIPT' || 
                        node.parentNode.nodeName === 'STYLE') {
                        return NodeFilter.FILTER_REJECT;
                    }
                    // Check if text contains the old brand name
                    if (node.textContent.includes('Indivest')) {
                        return NodeFilter.FILTER_ACCEPT;
                    }
                    return NodeFilter.FILTER_SKIP;
                }
            }
        );
        
        // Replace text in all matched nodes
        let currentNode;
        while (currentNode = textWalker.nextNode()) {
            currentNode.textContent = currentNode.textContent.replace(/Indivest/gi, 'StoxMate');
        }
        
        // Update special elements that might need specific handling
        updateSpecialBrandElements();
        
        // Check for meta tags
        const metaTags = document.querySelectorAll('meta');
        metaTags.forEach(tag => {
            ['name', 'property', 'content'].forEach(attr => {
                if (tag.getAttribute(attr) && tag.getAttribute(attr).includes('Indivest')) {
                    tag.setAttribute(attr, tag.getAttribute(attr).replace(/Indivest/gi, 'StoxMate'));
                }
            });
        });
    }
    
    // Update favicon
    function updateFavicon() {
        const favicon = document.querySelector('link[rel="icon"]') || 
                        document.querySelector('link[rel="shortcut icon"]');
        
        if (favicon && favicon.href.includes('indivest')) {
            // Create a new favicon URL by replacing 'indivest' with 'stoxmate'
            const newFaviconUrl = favicon.href.replace(/indivest/gi, 'stoxmate');
            favicon.href = newFaviconUrl;
        }
    }
    
    // Update specific brand elements that require special handling
    function updateSpecialBrandElements() {
        // Update logo text
        document.querySelectorAll('.logo-text').forEach(el => {
            if (el.textContent.includes('Indi')) {
                const accentSpan = el.querySelector('.logo-accent');
                if (accentSpan) {
                    // Clear previous text content but keep the structure
                    el.textContent = '';
                    el.appendChild(document.createTextNode('Stox'));
                    el.appendChild(accentSpan);
                    accentSpan.textContent = 'Mate';
                } else {
                    el.textContent = el.textContent.replace(/Indivest/gi, 'StoxMate');
                }
            }
        });
        
        // Update loading screen logo
        const loadingLogo = document.querySelector('.loading-logo');
        if (loadingLogo) {
            const accentSpan = loadingLogo.querySelector('.logo-accent');
            if (accentSpan) {
                loadingLogo.textContent = '';
                loadingLogo.appendChild(document.createTextNode('Stox'));
                loadingLogo.appendChild(accentSpan);
                accentSpan.textContent = 'Mate';
            }
        }
        
        // Update footer logo
        const footerLogo = document.querySelector('.footer-logo .logo-text');
        if (footerLogo) {
            const accentSpan = footerLogo.querySelector('.logo-accent');
            if (accentSpan) {
                footerLogo.textContent = '';
                footerLogo.appendChild(document.createTextNode('Stox'));
                footerLogo.appendChild(accentSpan);
                accentSpan.textContent = 'Mate';
            }
        }
        
        // Update copyright notice specifically
        document.querySelectorAll('.footer-bottom p').forEach(p => {
            if (p.textContent.includes('©') && p.textContent.includes('Indivest')) {
                p.textContent = p.textContent.replace(/Indivest/gi, 'StoxMate');
            }
        });
    }
})();
