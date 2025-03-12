document.addEventListener('DOMContentLoaded', function() {
    // Hide loading screen
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        setTimeout(() => {
            loadingScreen.classList.add('hidden');
            // Remove it from the DOM after animation completes
            setTimeout(() => {
                loadingScreen.remove();
            }, 500);
        }, 800);
    }
    
    // Mobile menu toggle
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links');
    const authButtons = document.querySelector('.auth-buttons');
    
    if (hamburger) {
        hamburger.addEventListener('click', function() {
            this.classList.toggle('active');
            
            if (navLinks) {
                navLinks.classList.toggle('active');
                // Fix initial display when menu is opened first time
                if (window.innerWidth <= 992) {
                    navLinks.style.display = navLinks.classList.contains('active') ? 'flex' : '';
                }
            }
            
            if (authButtons) {
                authButtons.classList.toggle('active');
                if (window.innerWidth <= 992) {
                    authButtons.style.display = authButtons.classList.contains('active') ? 'flex' : '';
                }
            }
            
            // Prevent scrolling when mobile menu is open
            document.body.style.overflow = navLinks.classList.contains('active') ? 'hidden' : '';
        });
    }
    
    // Animate elements when they enter the viewport with Intersection Observer
    const animateOnIntersect = function(entries, observer) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                // Stop observing once animated
                observer.unobserve(entry.target);
            }
        });
    };
    
    // Create observer
    const animationObserver = new IntersectionObserver(animateOnIntersect, {
        root: null, // viewport
        threshold: 0.15, // 15% of item must be visible
        rootMargin: '0px 0px -50px 0px' // trigger a bit earlier
    });
    
    // Observe all animatable elements
    document.querySelectorAll('.feature-card, .step, .market-card, .recommendation-card, .education-card, .insight-card').forEach(element => {
        animationObserver.observe(element);
    });
    
    // Simulate typing in the chatbot
    if (document.querySelector('.typing-indicator')) {
        setTimeout(() => {
            const typingIndicator = document.querySelector('.typing-indicator');
            const messageContainer = document.querySelector('.chat-messages');
            
            if (typingIndicator && messageContainer) {
                // Remove typing indicator
                const typingMessage = typingIndicator.closest('.message.bot.typing');
                if (typingMessage) typingMessage.remove();
                
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
    }
    
    // Mock chat input functionality for home page preview
    const chatInput = document.querySelector('.chat-input input');
    const sendButton = document.querySelector('.send-btn');
    
    if (chatInput && sendButton) {
        const handleSendMessage = () => {
            const message = chatInput.value.trim();
            if (message === '') return;
            
            const messageContainer = document.querySelector('.chat-messages');
            if (!messageContainer) return;
            
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
            messageContainer.scrollTop = messageContainer.scrollHeight;
            
            // Show response after a delay
            setTimeout(() => {
                // Remove typing indicator
                botTyping.remove();
                
                // Generate response based on keywords in message
                let response = '';
                const lowerMsg = message.toLowerCase();
                
                if (lowerMsg.includes('pe') || lowerMsg.includes('ratio')) {
                    response = `<p>The NIFTY 50 PE ratio is currently 19.2, which indicates a neutral market. This suggests that the market is fairly valued.</p>
                    <p>Based on historical data, PE ratios above 22 have often been followed by corrections, while PE ratios below 17 have presented good buying opportunities.</p>`;
                } else if (lowerMsg.includes('invest') || lowerMsg.includes('allocation')) {
                    response = `<p>Based on the current neutral market (PE ratio of 19.2), I recommend a balanced allocation:</p>
                    <ul>
                        <li>40% in Stocks (index funds are a good option)</li>
                        <li>30% in Gold (as a hedge against inflation)</li>
                        <li>30% in Fixed Deposits (for stability)</li>
                    </ul>
                    <p>Would you like specific investment recommendations?</p>`;
                } else {
                    response = `<p>I'm your AI investment advisor. I can help you make data-driven investment decisions based on market conditions.</p>
                    <p>Feel free to ask me about:</p>
                    <ul>
                        <li>Investment allocation strategies</li>
                        <li>Market indicators like PE ratios</li>
                        <li>Specific investment options</li>
                        <li>Your risk profile and goals</li>
                    </ul>`;
                }
                
                // Add bot response
                const botMessage = document.createElement('div');
                botMessage.className = 'message bot';
                botMessage.innerHTML = response;
                messageContainer.appendChild(botMessage);
                messageContainer.scrollTop = messageContainer.scrollHeight;
            }, 2000);
        };
        
        sendButton.addEventListener('click', handleSendMessage);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSendMessage();
            }
        });
    }
    
    // Update PE ratio and market mood dynamically with animation
    let peValue = 20.0;
    const peElement = document.getElementById('pe-ratio');
    
    // Simulate live market data by updating PE ratio periodically
    if (peElement) {
        // Update initial value
        peElement.textContent = peValue;
        
        setInterval(() => {
            // Generate small random fluctuations in PE ratio
            const change = (Math.random() - 0.5) * 0.2;
            peValue = parseFloat((peValue + change).toFixed(1));
            
            // Keep PE within realistic bounds
            peValue = Math.max(17, Math.min(23, peValue));
            
            // Update PE ratio display with animation
            peElement.textContent = peValue;
            peElement.style.color = change > 0 ? '#10b981' : '#ef4444';
            setTimeout(() => {
                peElement.style.color = '';
            }, 1000);
            
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
                markerPosition = '55%';
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
    }

    // Add smooth scrolling for anchor links on all pages
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            
            const targetElement = document.querySelector(targetId);
            if (targetElement) {
                e.preventDefault();
                window.scrollTo({
                    top: targetElement.offsetTop - 80, // Account for fixed header
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Update active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinkEls = document.querySelectorAll('.nav-links a');
    
    navLinkEls.forEach(link => {
        const linkPage = link.getAttribute('href');
        if (linkPage === currentPage || 
            (currentPage === 'index.html' && linkPage === '.') || 
            (currentPage === '' && linkPage === 'index.html')) {
            link.classList.add('active');
        } else {
            link.classList.remove('active');
        }
    });

    // Add navigation shadow on scroll
    const navElement = document.querySelector('nav');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 10) {
            navElement.classList.add('scrolled');
        } else {
            navElement.classList.remove('scrolled');
        }
    });
});
