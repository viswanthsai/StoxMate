document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            
            if (navLinks) {
                navLinks.classList.toggle('active');
                navLinks.style.display = navLinks.classList.contains('active') ? 'flex' : 'none';
            }
            
            if (authButtons) {
                authButtons.classList.toggle('active');
                authButtons.style.display = authButtons.classList.contains('active') ? 'flex' : 'none';
            }
        });
    }
    
    // Animate elements when they enter the viewport
    const animateOnScroll = function() {
        const elements = document.querySelectorAll('.feature-card, .step, .market-card');
        
        elements.forEach(element => {
            const position = element.getBoundingClientRect();
            
            // If element is in viewport
            if(position.top < window.innerHeight && position.bottom >= 0) {
                element.classList.add('animate-in');
            }
        });
    };
    
    window.addEventListener('scroll', animateOnScroll);
    animateOnScroll(); // Initial check for elements in viewport
    
    // Simulate typing in the chatbot
    setTimeout(() => {
        const typingIndicator = document.querySelector('.typing-indicator');
        const messageContainer = document.querySelector('.chat-messages');
        
        if (typingIndicator && messageContainer) {
            // Remove typing indicator
            typingIndicator.parentElement.remove();
            
            // Add bot message
            const botMessage = document.createElement('div');
            botMessage.className = 'message bot';
            botMessage.innerHTML = `
                <p>The Price to Earnings (PE) ratio is a key valuation metric that compares a company's share price to its earnings per share. For NIFTY 50, it represents the average PE of the 50 largest Indian companies.</p>
                <p>A high PE ratio (above 22) suggests the market may be overvalued and optimistic (bullish), while a low PE ratio (below 17) suggests the market may be undervalued or pessimistic (bearish).</p>
                <p>We use this as one of our indicators to recommend optimal asset allocation.</p>
            `;
            
            messageContainer.appendChild(botMessage);
            
            // Scroll to the bottom of the chat
            messageContainer.scrollTop = messageContainer.scrollHeight;
        }
    }, 3000);
    
    // Mock chat input functionality
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.send-btn');
    
    if (chatInput && sendButton) {
        const handleSendMessage = () => {
            const message = chatInput.value.trim();
            if (message === '') return;
            
            const messageContainer = document.querySelector('.chat-messages');
            
            // Add user message
            const userMessage = document.createElement('div');
            userMessage.className = 'message user';
            userMessage.innerHTML = `<p>${message}</p>`;
            messageContainer.appendChild(userMessage);
            
            // Clear input
            chatInput.value = '';
            
            // Auto-scroll
            messageContainer.scrollTop = messageContainer.scrollHeight;
            
            // Simulate bot typing
            const botTyping = document.createElement('div');
            botTyping.className = 'message bot typing';
            botTyping.innerHTML = `
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            messageContainer.appendChild(botTyping);
            
            // Scroll to the bottom of the chat
            messageContainer.scrollTop = messageContainer.scrollHeight;
        };
        
        sendButton.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }
    
    // Update PE ratio and market mood dynamically with animation
    let peValue = 19.2;
    const peElement = document.getElementById('pe-ratio');
    
    // Simulate live market data by updating PE ratio periodically
    setInterval(() => {
        // Generate small random fluctuations in PE ratio
        const change = (Math.random() - 0.5) * 0.3;
        peValue = parseFloat((peValue + change).toFixed(1));
        
        // Update PE ratio display with animation
        if (peElement) {
            peElement.textContent = peValue;
            peElement.style.color = change > 0 ? '#10b981' : '#ef4444';
            setTimeout(() => {
                peElement.style.color = '';
            }, 1000);
        }
        
        // Update market mood indicator
        let marketMood;
        let moodColor;
        let markerPosition;
        
        if (peValue > 22) {
            marketMood = 'Bullish';
            moodColor = 'var(--bullish-color)';
            markerPosition = '80%';
        } else if (peValue < 17) {
            marketMood = 'Bearish';
            moodColor = 'var(--bearish-color)';
            markerPosition = '20%';
        } else {
            marketMood = 'Neutral';
            moodColor = 'var(--neutral-market-color)';
            markerPosition = '50%';
        }
        
        // Update mood indicator in hero section
        const moodIndicator = document.querySelector('.mood');
        if (moodIndicator) {
            moodIndicator.textContent = marketMood;
            moodIndicator.className = `mood ${marketMood.toLowerCase()}`;
        }
        
        // Update marker position in market pulse section
        const moodMarker = document.querySelector('.mood-marker');
        if (moodMarker) {
            moodMarker.style.left = markerPosition;
        }
        
    }, 5000); // Update every 5 seconds
});
