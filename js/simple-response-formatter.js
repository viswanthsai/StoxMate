/**
 * Simple Response Formatter
 * Helps format AI advisor responses in a more straightforward way
 */

(function() {
    // Add this script to the ai-advisor.html page
    document.addEventListener('DOMContentLoaded', function() {
        // Check if we're on the AI advisor page
        if (!document.querySelector('.full-chat')) return;
        
        // Create a global formatter object
        window.stoxmate = window.stoxmate || {};
        window.stoxmate.responseFormatter = {
            /**
             * Extract the direct answer from a longer AI response
             * @param {string} response - The full AI response
             * @returns {string} - The simplified response
             */
            simplify: function(response) {
                // If response is already short, return it as is
                if (response.length < 200) return response;
                
                // Try to find the direct answer in the first paragraph
                const paragraphs = response.split('\n\n');
                if (paragraphs.length > 0) {
                    // Return first paragraph if it's not too long
                    if (paragraphs[0].length < 150) return paragraphs[0];
                }
                
                // Find key sentences with numbers or recommendations
                const sentences = response.match(/[^.!?]+[.!?]+/g) || [];
                const keyPhrases = sentences.filter(s => 
                    s.match(/\d+%/) || // Contains percentages
                    s.match(/recommend|suggest|advise/i) || // Contains recommendation words
                    s.match(/should|could|would/i) // Contains advisory language
                );
                
                if (keyPhrases.length > 0) {
                    return keyPhrases.slice(0, 2).join(' ');
                }
                
                // Default: return first 1-2 sentences
                return sentences.slice(0, 2).join(' ');
            },
            
            /**
             * Enhance response highlighting
             * @param {string} response - The AI response
             * @returns {string} - The enhanced response with better formatting
             */
            enhanceFormatting: function(response) {
                return response
                    // Highlight percentages
                    .replace(/(\d+(?:\.\d+)?\s*%)/g, '<strong class="highlight-number">$1</strong>')
                    // Highlight currency amounts
                    .replace(/(₹\s*\d+(?:,\d+)*(?:\.\d+)?)/g, '<strong class="highlight-number">$1</strong>')
                    // Highlight "recommended" phrases
                    .replace(/(recommend(?:ed)?\s+[^.!?]+[.!?]+)/gi, '<span class="highlight-recommendation">$1</span>')
                    // Format simple lists better
                    .replace(/(\d+\.\s+[^\n]+)/g, '<div class="formatted-list-item">$1</div>')
                    // Improve readability for YES/NO answers
                    .replace(/\b(yes|no)\b/gi, '<strong class="highlight-answer">$1</strong>');
            }
        };
        
        // Add custom CSS for formatting
        const style = document.createElement('style');
        style.textContent = `
            .highlight-number {
                color: #2563eb;
                font-weight: 600;
            }
            
            .highlight-recommendation {
                background-color: rgba(59, 130, 246, 0.1);
                padding: 2px 4px;
                border-radius: 3px;
            }
            
            .highlight-answer {
                font-size: 1.05em;
                text-transform: uppercase;
            }
            
            .formatted-list-item {
                margin: 8px 0;
                padding-left: 12px;
                border-left: 2px solid #3b82f6;
            }
        `;
        document.head.appendChild(style);
    });
})();
