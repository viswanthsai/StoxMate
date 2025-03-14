/**
 * StoxMate AI Advisor
 * This module handles interactions with ChatGPT API to provide investment advice
 */

class AIAdvisor {
    constructor() {
        this.apiKey = null;
        this.isLoading = false;
        this.chatHistory = [];
        this.initialized = false;
        
        // Investment context updated for more straightforward responses
        this.investmentContext = `
            You are StoxMate AI, an investment advisor assistant. You specialize in helping users with:
            1. Asset allocation between stocks, gold, and fixed deposits
            2. Understanding market indicators like PE ratios and market trends
            3. Basic investment concepts and education
            4. Personal finance guidance
            
            Current market information:
            - NIFTY 50 PE Ratio: Around 20.0 (considered neutral)
            - Recommended allocation for neutral market: 40% stocks, 30% gold, 30% fixed deposits
            - Current interest rates for fixed deposits: 6.0% - 7.5%
            
            IMPORTANT INSTRUCTIONS FOR YOUR RESPONSES:
            - Keep your responses very concise and straightforward
            - Use simple language, avoid complex financial jargon
            - Limit responses to 2-3 short paragraphs maximum
            - For complex topics, break information into bullet points
            - Start with a direct answer to the user's question first
            - Always clarify that you're providing general guidance, not personalized financial advice
            - When providing numbers or recommendations, bold the key figures
            
            Example of good response format:
            "Based on the neutral market conditions, I recommend allocating **40% to stocks**, **30% to gold**, and **30% to fixed deposits** for a moderate risk profile.
            
            This balanced approach helps protect your capital while still providing growth opportunities."
        `;
    }

    /**
     * Initialize the advisor with API key
     * @returns {Promise<boolean>} Whether initialization was successful
     */
    async init() {
        try {
            // Try to load API key from config file (higher priority)
            if (window.STOXMATE_CONFIG && window.STOXMATE_CONFIG.OPENAI_API_KEY) {
                this.apiKey = window.STOXMATE_CONFIG.OPENAI_API_KEY;
                console.log("API key loaded from config file");
                this.initialized = true;
                return true;
            }
            
            // If no config file, try to load from localStorage (for development)
            const savedKey = localStorage.getItem('stoxmate_api_key');
            if (savedKey) {
                this.apiKey = savedKey;
                console.log("API key loaded from localStorage");
                this.initialized = true;
                return true;
            }
            
            // No API key found
            console.warn("No API key found for AI Advisor");
            return false;
        } catch (error) {
            console.error("Error initializing AI Advisor:", error);
            return false;
        }
    }

    /**
     * Set API key manually (for development only)
     * @param {string} key - OpenAI API key
     */
    setApiKey(key) {
        if (!key) return false;
        
        this.apiKey = key;
        localStorage.setItem('stoxmate_api_key', key);
        this.initialized = true;
        return true;
    }

    /**
     * Send a query to ChatGPT and get a response
     * @param {string} userQuery - The user's question
     * @returns {Promise<string>} - ChatGPT's response
     */
    async getResponse(userQuery) {
        if (!this.initialized || !this.apiKey) {
            return "AI Advisor is not properly initialized. Please check your API key configuration.";
        }

        if (!userQuery.trim()) {
            return "Please ask a question about investments or financial planning.";
        }

        try {
            this.isLoading = true;
            
            // Add the user message to chat history
            this.chatHistory.push({
                role: "user",
                content: userQuery
            });
            
            // Prepare messages including context and history
            const messages = [
                {
                    role: "system",
                    content: this.investmentContext
                },
                ...this.limitChatHistory(this.chatHistory)
            ];
            
            // Configure the API request with lower max tokens for more concise responses
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${this.apiKey}`
                },
                body: JSON.stringify({
                    model: "gpt-3.5-turbo",
                    messages: messages,
                    max_tokens: 350, // Reduced from 500 for more concise responses
                    temperature: 0.6  // Slightly lower temperature for more focused responses
                })
            });
            
            const data = await response.json();
            
            if (!response.ok) {
                console.error('API error:', data);
                throw new Error(data.error?.message || 'Error communicating with AI service');
            }
            
            const answer = data.choices[0]?.message?.content || "Sorry, I couldn't generate a response.";
            
            // Add the AI response to chat history
            this.chatHistory.push({
                role: "assistant",
                content: answer
            });
            
            return answer;
            
        } catch (error) {
            console.error("AI Advisor error:", error);
            return `Sorry, there was an error: ${error.message}. Please try again later.`;
        } finally {
            this.isLoading = false;
        }
    }

    /**
     * Limit the chat history to prevent token overflow
     * @param {Array} history - The full chat history
     * @returns {Array} - Limited chat history
     */
    limitChatHistory(history) {
        // Keep last 10 messages only to avoid context length issues
        if (history.length > 10) {
            return history.slice(-10);
        }
        return history;
    }

    /**
     * Clear chat history
     */
    clearHistory() {
        this.chatHistory = [];
    }
}

// Initialize the advisor on script load
document.addEventListener('DOMContentLoaded', async function() {
    // Create global instance
    window.stoxmate = window.stoxmate || {};
    window.stoxmate.aiAdvisor = new AIAdvisor();
    
    // Try to initialize
    await window.stoxmate.aiAdvisor.init();
    
    // Setup chat UI if on a page with chat interface
    setupChatInterface();
});

/**
 * Set up the chat interface if it exists on the page
 */
function setupChatInterface() {
    const chatContainer = document.querySelector('.chat-container');
    const chatInput = document.querySelector('.chat-input input');
    const sendBtn = document.querySelector('.chat-input .send-btn');
    const messagesContainer = document.querySelector('.chat-messages');
    
    // Exit if no chat interface on this page
    if (!chatContainer || !chatInput || !sendBtn || !messagesContainer) return;
    
    // Setup event listeners for chat
    sendBtn.addEventListener('click', handleSendMessage);
    chatInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    });
    
    // Also handle question chip clicks
    const questionChips = document.querySelectorAll('.question-chip');
    questionChips.forEach(chip => {
        chip.addEventListener('click', function() {
            chatInput.value = this.textContent;
            handleSendMessage();
        });
    });
    
    // Check if advisor is initialized and show appropriate message
    if (!window.stoxmate.aiAdvisor.initialized) {
        const apiKeyPrompt = document.createElement('div');
        apiKeyPrompt.className = 'message bot';
        apiKeyPrompt.innerHTML = `
            <p>To use the AI advisor, please enter your OpenAI API key:</p>
            <div class="api-key-input">
                <input type="password" id="api-key-input" placeholder="Enter API key">
                <button id="save-api-key">Save</button>
            </div>
        `;
        messagesContainer.appendChild(apiKeyPrompt);
        
        // Add event listener to the save button
        document.getElementById('save-api-key').addEventListener('click', function() {
            const apiKey = document.getElementById('api-key-input').value;
            if (window.stoxmate.aiAdvisor.setApiKey(apiKey)) {
                // Remove the API key prompt
                apiKeyPrompt.remove();
                
                // Add welcome message
                addBotMessage("Thank you! I'm the StoxMate AI Investment Advisor. How can I help you with your investment decisions today?");
            }
        });
    } else {
        // Add welcome message
        addBotMessage("Hello! I'm the StoxMate AI Investment Advisor. How can I help you with your investment decisions today?");
    }
    
    /**
     * Handle sending a message
     */
    async function handleSendMessage() {
        const message = chatInput.value.trim();
        if (!message) return;
        
        // Clear input
        chatInput.value = '';
        
        // Add user message to chat
        addUserMessage(message);
        
        // Show typing indicator
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'message bot typing';
        typingIndicator.innerHTML = `
            <div class="typing-indicator">
                <span></span>
                <span></span>
                <span></span>
            </div>
        `;
        messagesContainer.appendChild(typingIndicator);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
        
        // Get AI response
        const response = await window.stoxmate.aiAdvisor.getResponse(message);
        
        // Remove typing indicator
        typingIndicator.remove();
        
        // Add bot response
        addBotMessage(response);
    }
    
    /**
     * Add a user message to the chat
     * @param {string} message - The message text
     */
    function addUserMessage(message) {
        const userMessage = document.createElement('div');
        userMessage.className = 'message user';
        userMessage.innerHTML = `<p>${message}</p>`;
        messagesContainer.appendChild(userMessage);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
    
    /**
     * Add a bot message to the chat with enhanced formatting for simpler responses
     * @param {string} message - The message text
     */
    function addBotMessage(message) {
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot';
        
        // Format message with enhanced markdown-like syntax
        let formattedMessage = message
            .replace(/\*\*(.*?)\*\*/g, '<span class="bot-response-highlight">$1</span>')  // Bold with highlight
            .replace(/\*(.*?)\*/g, '<em>$1</em>')              // Italic
            .split('\n').join('<br>');                         // Line breaks
        
        // Handle lists with improved formatting
        if (message.includes('\n- ')) {
            formattedMessage = formattedMessage.replace(/<br>- /g, '<br>• ');
        }
        
        // Handle section headings for better structure
        formattedMessage = formattedMessage.replace(/^(#+)\s+(.+?)$/gm, function(match, hashes, content) {
            return `<div class="bot-section-heading">${content}</div>`;
        });
        
        botMessage.innerHTML = `<p>${formattedMessage}</p>`;
        messagesContainer.appendChild(botMessage);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
