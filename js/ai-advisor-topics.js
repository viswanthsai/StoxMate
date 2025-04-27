/**
 * AI Advisor Topics
 * Organizes investment topics and common questions for the AI advisor
 */

document.addEventListener('DOMContentLoaded', function() {
    // Define topics and their associated questions
    const topics = {
        'general': [
            'How should I start investing?',
            'What investment strategy is best for beginners?', 
            'How to build a balanced portfolio?',
            'What are the current market conditions?'
        ],
        'stocks': [
            'How to pick good stocks?',
            'What is the NIFTY PE ratio now?', 
            'Are blue chip stocks good investments?',
            'Should I invest in smallcap stocks?'
        ],
        'mutual-funds': [
            'What are index funds?',
            'How to select the best mutual fund?',
            'What is expense ratio?',
            'Active vs passive mutual funds?'
        ],
        'retirement': [
            'How much should I save for retirement?',
            'What is an NPS account?',
            'Best options for retirement in India?',
            'When should I start retirement planning?'
        ],
        'tax': [
            'How to save taxes on investments?',
            'Tell me about ELSS funds',
            'What is Section 80C?',
            'Tax implications of selling stocks?'
        ],
        'risk': [
            'How to reduce risk in my portfolio?',
            'What is risk-adjusted return?',
            'How much risk should I take?',
            'Hedging strategies for volatile markets'
        ]
    };

    // Find topic items in the sidebar
    const topicItems = document.querySelectorAll('.topic-item');
    
    // Add click events to topic items
    topicItems.forEach(item => {
        item.addEventListener('click', function() {
            // Remove active class from all topics
            topicItems.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked topic
            this.classList.add('active');
            
            // Get the topic name
            const topicName = this.getAttribute('data-topic');
            
            // Display questions for this topic
            displayTopicQuestions(topicName);
        });
    });
    
    /**
     * Display predefined questions for the selected topic
     * @param {string} topicName - The name of the selected topic
     */
    function displayTopicQuestions(topicName) {
        const questionsContainer = document.querySelector('.question-chips');
        if (!questionsContainer) return;
        
        // Clear existing questions
        questionsContainer.innerHTML = '';
        
        // Get questions for this topic
        const questions = topics[topicName] || [];
        
        // Add questions as chips with animation
        questions.forEach((question, index) => {
            const chip = document.createElement('button');
            chip.className = 'question-chip';
            chip.textContent = question;
            chip.style.opacity = '0';
            chip.style.transform = 'translateY(10px)';
            
            // Add click event to set the question in chat input
            chip.addEventListener('click', function() {
                const chatInput = document.querySelector('.chat-input input');
                if (chatInput) {
                    chatInput.value = this.textContent;
                    
                    // Collapse the suggestion panel
                    const suggestionPanel = document.querySelector('.suggestion-panel');
                    if (suggestionPanel) {
                        suggestionPanel.classList.add('collapsed');
                        localStorage.setItem('suggestionsPanelCollapsed', 'true');
                    }
                    
                    // Small delay to allow visual feedback
                    setTimeout(() => {
                        // Trigger send button if it exists
                        const sendBtn = document.querySelector('.send-btn');
                        if (sendBtn) sendBtn.click();
                        
                        // Focus on input for next question
                        chatInput.focus();
                    }, 100);
                }
            });
            
            questionsContainer.appendChild(chip);
            
            // Stagger the animation of chips appearing
            setTimeout(() => {
                chip.style.opacity = '1';
                chip.style.transform = 'translateY(0)';
                chip.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
            }, 50 * index);
        });
        
        // Show the suggestion panel when changing topics
        const suggestionPanel = document.querySelector('.suggestion-panel');
        if (suggestionPanel) {
            suggestionPanel.classList.remove('collapsed');
        }
    }
    
    // Initialize with the first topic (general)
    const defaultTopic = document.querySelector('.topic-item.active');
    if (defaultTopic) {
        displayTopicQuestions(defaultTopic.getAttribute('data-topic'));
    }
});
