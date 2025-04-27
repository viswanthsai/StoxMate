/**
 * StoxMate AI Advisor
 * This module handles interactions with Gemini API to provide investment advice
 */

class AIAdvisor {
    constructor() {
        // Hardcode Gemini API key - no need to prompt user
        this.apiKey = "AIzaSyDGYmnQPWCY1Yk00UUr1EbNO3f4VamEtwU";
        this.initialized = true;
        this.isLoading = false;
        this.chatHistory = [];
        // Updated context for shorter, conversational replies
        this.investmentContext = "You are StoxMate AI, a friendly investment advisor. Keep your answers short, conversational, and easy to understand. Focus on key takeaways. Provide helpful, conservative financial advice for the Indian market. Use NIFTY PE ratio (high >22 = conservative, low <17 = aggressive equities). Always clarify you're an AI, not a certified financial advisor.";
    }

    /**
     * Initialize the advisor - always returns true since API key is hardcoded
     * @returns {Promise<boolean>} Whether initialization was successful
     */
    async init() {
        try {
            // API key is hardcoded, so initialization always succeeds
            console.log("AI Advisor initialized with hardcoded Gemini API key");
            return true;
        } catch (error) {
            console.error("Error initializing AI Advisor:", error);
            return false;
        }
    }

    /**
     * Send a query to Gemini API and get a response
     * @param {string} userQuery - The user's question
     * @returns {Promise<string>} - Gemini's response
     */
    async getResponse(userQuery) {
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
            
            // Format messages for Gemini API - simplified for now
            // Include system context and the latest user query
            const contents = [
                {
                    role: "user",
                    parts: [{ text: this.investmentContext + "\n\nUser: " + userQuery }]
                }
                // Future improvement: Add limited chat history here if needed
            ];
            
            // Configure the API request using v1beta and gemini-1.5-flash-latest model
            const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${this.apiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    contents: contents,
                    safetySettings: [
                        {
                            category: "HARM_CATEGORY_HARASSMENT",
                            threshold: "BLOCK_ONLY_HIGH"
                        },
                        {
                            category: "HARM_CATEGORY_HATE_SPEECH",
                            threshold: "BLOCK_ONLY_HIGH"
                        },
                        {
                            category: "HARM_CATEGORY_SEXUALLY_EXPLICIT",
                            threshold: "BLOCK_ONLY_HIGH"
                        },
                        {
                            category: "HARM_CATEGORY_DANGEROUS_CONTENT",
                            threshold: "BLOCK_ONLY_HIGH"
                        }
                    ],
                    generationConfig: {
                        maxOutputTokens: 150, // Reduced max tokens for shorter responses
                        temperature: 0.7 // Slightly higher temp for more conversational tone
                    }
                })
            });
            
            const data = await response.json();
            
            if (!response.ok || data.error) {
                console.error('API error:', data);
                // Provide a more specific error message if available
                const errorMessage = data.error?.message || 'Error communicating with AI service';
                throw new Error(errorMessage);
            }
            
            // Extract text from Gemini response format
            let answer = data.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't generate a response.";
            
            // Use the formatter if available to enhance the response
            if (window.stoxmate && window.stoxmate.responseFormatter) {
                answer = window.stoxmate.responseFormatter.enhanceFormatting(answer);
            }

            // Add the AI response to chat history
            this.chatHistory.push({
                role: "assistant", // Use 'assistant' or 'model' consistently
                content: answer // Store the potentially formatted answer
            });
            
            return answer;
            
        } catch (error) {
            console.error("AI Advisor error:", error);
            // Return the specific error message to the user
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
    
    // Add welcome message - no need to check if advisor is initialized since it's always initialized
    addBotMessage("Hello! I'm the StoxMate AI Investment Advisor. How can I help you with your investment decisions today?");
    
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
     * @param {string} message - The message text (already formatted)
     */
    function addBotMessage(message) {
        const botMessage = document.createElement('div');
        botMessage.className = 'message bot';
        
        // Message is already formatted by enhanceFormatting, just set innerHTML
        botMessage.innerHTML = `<p>${message.split('\n').join('<br>')}</p>`; // Basic line break handling
        
        messagesContainer.appendChild(botMessage);
        
        // Scroll to bottom
        messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
}
