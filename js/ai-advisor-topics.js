/**
 * StoxMate AI Advisor Topics
 * Handles topic selection and populates predefined questions for topics
 */

document.addEventListener('DOMContentLoaded', function() {
    // Get topic items
    const topicItems = document.querySelectorAll('.topic-item');
    if (!topicItems) return;
    
    // Topic definitions with predefined questions
    const topics = {
        'Asset Allocation': [
            "How should I allocate my portfolio in the current market?",
            "What's the ideal allocation for a conservative investor?",
            "How does market PE affect asset allocation?",
            "When should I rebalance my portfolio?"
        ],
        'Market Analysis': [
            "Is this a good time to invest in the market?",
            "What does the current NIFTY PE ratio indicate?",
            "How to interpret market indicators?",
            "Which sectors are performing well currently?"
        ],
        'Fixed Deposits': [
            "Are FDs a good investment right now?",
            "How do I compare FD rates across banks?",
            "Should I choose cumulative or non-cumulative FD?",
            "What are tax implications of fixed deposits?"
        ],
        'Personal Finance': [
            "How much should I invest every month?",
            "How do I create an emergency fund?",
            "How to plan for retirement?",
            "What's the 50-30-20 budget rule?"
        ],
        'Investment Education': [
            "What is dollar cost averaging?",
            "Explain the concept of compound interest",
            "What are index funds and how do they work?",
            "What's the difference between active and passive investing?"
        ]
    };
    
    // Add click event to topic items
    topicItems.forEach(item => {
        item.addEventListener('click', function() {
            const topicName = this.querySelector('span').textContent;
            displayTopicQuestions(topicName);
            
            // Highlight the selected topic
            topicItems.forEach(i => i.classList.remove('active'));
            this.classList.add('active');
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
        
        // Add questions as chips
        questions.forEach(question => {
            const chip = document.createElement('button');
            chip.className = 'question-chip';
            chip.textContent = question;
            
            // Add click event to set the question in chat input
            chip.addEventListener('click', function() {
                const chatInput = document.querySelector('.chat-input input');
                if (chatInput) {
                    chatInput.value = this.textContent;
                    chatInput.focus();
                    
                    // Trigger send button if it exists
                    const sendBtn = document.querySelector('.chat-input .send-btn');
                    if (sendBtn) {
                        sendBtn.click();
                    }
                }
            });
            
            questionsContainer.appendChild(chip);
        });
    }
});
