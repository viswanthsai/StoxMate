/**
 * Utility to clear redirect flags and help resolve redirect loops
 */
(function() {
    // If URL has a ?clear parameter, clear the auth redirect flag
    if (window.location.search.includes('clear=true')) {
        console.log('Clearing auth redirect flags');
        sessionStorage.removeItem('auth_redirect_in_progress');
        sessionStorage.removeItem('redirecting');
        
        // Remove the query parameter
        const url = new URL(window.location.href);
        url.searchParams.delete('clear');
        history.replaceState({}, document.title, url.toString());
    }
    
    // Only add debug button if explicitly requested with a query param
    if (window.location.search.includes('show-debug=true')) {
        const clearButton = document.createElement('button');
        clearButton.textContent = 'Clear Redirect Flags';
        clearButton.style.position = 'fixed';
        clearButton.style.bottom = '10px';
        clearButton.style.right = '10px';
        clearButton.style.zIndex = '9999';
        clearButton.style.background = '#ef4444';
        clearButton.style.color = 'white';
        clearButton.style.border = 'none';
        clearButton.style.borderRadius = '4px';
        clearButton.style.padding = '8px 12px';
        clearButton.style.opacity = '0.7';
        clearButton.style.fontSize = '12px';
        
        clearButton.addEventListener('click', function() {
            sessionStorage.removeItem('auth_redirect_in_progress');
            sessionStorage.removeItem('redirecting');
            alert('Auth redirect flags cleared!');
        });
        
        document.addEventListener('DOMContentLoaded', function() {
            document.body.appendChild(clearButton);
        });
    }
})();
