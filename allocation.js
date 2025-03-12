document.addEventListener('DOMContentLoaded', function() {
    // Market data
    let currentPE = 20.0;
    let marketMood = 'neutral';
    let investmentAmount = 50000; // Default amount
    let riskProfile = 'conservative'; // Default risk profile

    // Allocation percentages by market condition and risk profile
    const allocationPercentages = {
        bearish: {
            conservative: { stocks: 15, gold: 30, fd: 55 },
            moderate: { stocks: 20, gold: 30, fd: 50 },
            aggressive: { stocks: 25, gold: 25, fd: 50 }
        },
        neutral: {
            conservative: { stocks: 30, gold: 30, fd: 40 },
            moderate: { stocks: 40, gold: 30, fd: 30 },
            aggressive: { stocks: 50, gold: 25, fd: 25 }
        },
        bullish: {
            conservative: { stocks: 50, gold: 20, fd: 30 },
            moderate: { stocks: 60, gold: 20, fd: 20 },
            aggressive: { stocks: 70, gold: 15, fd: 15 }
        }
    };

    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and content
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding content
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab');
            document.getElementById(tabId + '-tab').classList.add('active');
        });
    });

    // Risk preference selection
    const riskOptions = document.querySelectorAll('input[name="risk"]');
    riskOptions.forEach(option => {
        option.addEventListener('change', function() {
            riskProfile = this.value;
            updateAllocation();
        });
    });

    // Investment amount input handling
    const investmentInput = document.getElementById('investment-amount');
    if (investmentInput) {
        investmentInput.addEventListener('input', function() {
            if (this.value && !isNaN(this.value)) {
                investmentAmount = parseFloat(this.value);
                updateAllocation();
            }
        });
    }

    // Calculate button action
    const calculateBtn = document.getElementById('calculate-btn');
    if (calculateBtn) {
        calculateBtn.addEventListener('click', function() {
            if (investmentInput.value) {
                investmentAmount = parseFloat(investmentInput.value);
            }
            updateAllocation();
            
            // Animate the result section
            const resultsEl = document.querySelector('.allocation-results');
            resultsEl.classList.add('animate-pulse');
            setTimeout(() => {
                resultsEl.classList.remove('animate-pulse');
            }, 1000);
        });
    }

    // Update allocation based on current PE, risk profile and investment amount
    function updateAllocation() {
        // Determine market mood based on PE ratio
        if (currentPE > 22) {
            marketMood = 'bullish';
        } else if (currentPE < 17) {
            marketMood = 'bearish';
        } else {
            marketMood = 'neutral';
        }
        
        // Update UI elements showing market mood
        const marketMoodEl = document.getElementById('market-mood');
        if (marketMoodEl) {
            marketMoodEl.textContent = marketMood.charAt(0).toUpperCase() + marketMood.slice(1);
            marketMoodEl.className = 'status-value ' + marketMood;
        }
        
        // Update current PE display
        const currentPEEl = document.getElementById('current-pe');
        const resultsPE = document.getElementById('results-pe');
        if (currentPEEl) currentPEEl.textContent = currentPE.toFixed(1);
        if (resultsPE) resultsPE.textContent = currentPE.toFixed(1);
        
        // Get allocation percentages based on market mood and risk profile
        const allocation = allocationPercentages[marketMood][riskProfile];
        
        // Calculate actual amounts
        const stocksAmount = (investmentAmount * allocation.stocks / 100).toFixed(0);
        const goldAmount = (investmentAmount * allocation.gold / 100).toFixed(0);
        const fdAmount = (investmentAmount * allocation.fd / 100).toFixed(0);
        
        // Update allocation display
        document.getElementById('stocks-percentage').textContent = allocation.stocks + '%';
        document.getElementById('gold-percentage').textContent = allocation.gold + '%';
        document.getElementById('fd-percentage').textContent = allocation.fd + '%';
        
        document.getElementById('stocks-amount').textContent = '₹' + formatNumber(stocksAmount);
        document.getElementById('gold-amount').textContent = '₹' + formatNumber(goldAmount);
        document.getElementById('fd-amount').textContent = '₹' + formatNumber(fdAmount);
        
        // Update the allocation chart
        updateAllocationChart(allocation);
    }

    // Update the chart to reflect new allocation
    function updateAllocationChart(allocation) {
        const chartEl = document.getElementById('allocation-chart');
        if (chartEl) {
            // Remove loading indicator if present
            const loadingIndicator = chartEl.querySelector('.chart-loading');
            if (loadingIndicator) {
                loadingIndicator.style.display = 'none';
            }
            
            // Update chart with new allocation percentages
            chartEl.style.background = `conic-gradient(
                var(--primary-color) 0% ${allocation.stocks}%, 
                var(--warning-color) ${allocation.stocks}% ${allocation.stocks + allocation.gold}%, 
                var(--accent-color) ${allocation.stocks + allocation.gold}% 100%
            )`;
        }
    }

    // Format number with commas
    function formatNumber(num) {
        return new Intl.NumberFormat('en-IN').format(num);
    }

    // Simulate market data changes
    function simulateMarketChanges() {
        // Random PE change within a small range
        const change = (Math.random() - 0.5) * 0.3;
        currentPE = Math.max(14, Math.min(25, currentPE + change)); // Keep PE between 14 and 25
        
        // Update the last updated time
        const updateTimeEl = document.getElementById('update-time');
        if (updateTimeEl) {
            updateTimeEl.textContent = new Date().toLocaleTimeString();
        }
        
        // Update allocation if needed
        updateAllocation();
    }

    // Question chip functionality
    const questionChips = document.querySelectorAll('.question-chip');
    questionChips.forEach(chip => {
        chip.addEventListener('click', () => {
            const question = chip.textContent;
            addUserMessage(question);
            
            // Simulate typing delay
            simulateTyping();
            
            // Generate answer based on question
            setTimeout(() => {
                const answer = getAIResponse(question);
                addBotMessage(answer);
            }, 1500); // Delay to simulate thinking
        });
    });

    // Add user message to chat
    function addUserMessage(message) {
        const messagesContainer = document.querySelector('.chat-messages');
        if (messagesContainer) {
            const messageEl = document.createElement('div');
            messageEl.className = 'message user';
            messageEl.innerHTML = `<p>${message}</p>`;
            messagesContainer.appendChild(messageEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Add bot message to chat
    function addBotMessage(message) {
        const messagesContainer = document.querySelector('.chat-messages');
        const typingIndicator = document.querySelector('.message.bot.typing');
        
        if (messagesContainer && typingIndicator) {
            // Remove typing indicator
            typingIndicator.remove();
            
            // Add bot message
            const messageEl = document.createElement('div');
            messageEl.className = 'message bot';
            messageEl.innerHTML = message;
            messagesContainer.appendChild(messageEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Simulate bot typing
    function simulateTyping() {
        const messagesContainer = document.querySelector('.chat-messages');
        if (messagesContainer) {
            const typingEl = document.createElement('div');
            typingEl.className = 'message bot typing';
            typingEl.innerHTML = `
                <div class="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            `;
            messagesContainer.appendChild(typingEl);
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }

    // Chat input handling
    const chatInput = document.querySelector('.chat-input input');
    const sendBtn = document.querySelector('.send-btn');
    
    if (chatInput && sendBtn) {
        const handleSend = () => {
            const message = chatInput.value.trim();
            if (message === '') return;
            
            addUserMessage(message);
            chatInput.value = '';
            
            // Simulate typing delay
            simulateTyping();
            
            // Generate answer based on question
            setTimeout(() => {
                const answer = getAIResponse(message);
                addBotMessage(answer);
            }, 1500); // Delay to simulate thinking
        };
        
        sendBtn.addEventListener('click', handleSend);
        chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                handleSend();
            }
        });
    }

    // Get AI response based on user question
    function getAIResponse(question) {
        question = question.toLowerCase();
        
        if (question.includes('pe ratio')) {
            return `<p>The Price-to-Earnings (PE) ratio is a key valuation metric that compares a company's share price to its earnings per share.</p>
            <p>For NIFTY 50, it represents the collective PE of India's 50 largest companies. We use this metric to determine if the market is:</p>
            <ul>
                <li><strong>Bullish</strong>: When PE > 22 (potentially overvalued)</li>
                <li><strong>Neutral</strong>: When PE is between 17-22 (fairly valued)</li>
                <li><strong>Bearish</strong>: When PE < 17 (potentially undervalued)</li>
            </ul>
            <p>Currently, the NIFTY 50 PE ratio is ${currentPE.toFixed(1)}, indicating a ${marketMood} market.</p>`;
        }
        
        else if (question.includes('index fund') || question.includes('safe')) {
            return `<p>Index funds are generally considered safer than individual stocks because they provide instant diversification across many companies.</p>
            <p>NIFTY 50 index funds track India's 50 largest companies, reducing single-company risk. These are appropriate for conservative investors because:</p>
            <ul>
                <li>Lower volatility than individual stocks</li>
                <li>Professional management with low fees</li>
                <li>Long-term growth that typically outpaces inflation</li>
            </ul>
            <p>However, all equity investments carry some risk. In a bearish market like we recommend keeping only ${allocationPercentages.bearish.conservative.stocks}% of your portfolio in stocks.</p>`;
        }
        
        else if (question.includes('gold') && question.includes('fd')) {
            return `<p>Gold and Fixed Deposits serve different purposes in your portfolio:</p>
            <p><strong>Gold</strong> is a hedge against inflation and market uncertainty. It often performs well during market downturns when stocks struggle.</p>
            <p><strong>Fixed Deposits</strong> provide guaranteed returns and capital protection. They're ideal for stability and predictable income.</p>
            <p>In the current ${marketMood} market, we recommend:</p>
            <ul>
                <li>${allocationPercentages[marketMood][riskProfile].gold}% in Gold</li>
                <li>${allocationPercentages[marketMood][riskProfile].fd}% in Fixed Deposits</li>
            </ul>
            <p>If safety is your priority, FDs are better. If you're concerned about inflation, gold provides better protection.</p>`;
        }
        
        else if (question.includes('invest monthly')) {
            const monthlyAmount = 10000;
            const stocks = Math.round(monthlyAmount * allocationPercentages[marketMood][riskProfile].stocks / 100);
            const gold = Math.round(monthlyAmount * allocationPercentages[marketMood][riskProfile].gold / 100);
            const fd = Math.round(monthlyAmount * allocationPercentages[marketMood][riskProfile].fd / 100);
            
            return `<p>For regular monthly investments, consistency is key. A SIP (Systematic Investment Plan) approach works well.</p>
            <p>For a typical monthly investment of ₹10,000 in the current ${marketMood} market with a ${riskProfile} risk profile, I recommend:</p>
            <ul>
                <li><strong>Stocks:</strong> ₹${formatNumber(stocks)} (${allocationPercentages[marketMood][riskProfile].stocks}%)</li>
                <li><strong>Gold:</strong> ₹${formatNumber(gold)} (${allocationPercentages[marketMood][riskProfile].gold}%)</li>
                <li><strong>Fixed Deposits:</strong> ₹${formatNumber(fd)} (${allocationPercentages[marketMood][riskProfile].fd}%)</li>
            </ul>
            <p>This balanced approach helps reduce risk through rupee-cost averaging while maintaining optimal asset allocation.</p>`;
        }
        
        else {
            return `<p>I'm here to help with your investment questions.</p>
            <p>Based on the current NIFTY 50 PE ratio of ${currentPE.toFixed(1)}, we're in a ${marketMood} market. For a ${riskProfile} investor, I recommend:</p>
            <ul>
                <li>${allocationPercentages[marketMood][riskProfile].stocks}% in Stocks</li>
                <li>${allocationPercentages[marketMood][riskProfile].gold}% in Gold</li>
                <li>${allocationPercentages[marketMood][riskProfile].fd}% in Fixed Deposits</li>
            </ul>
            <p>Feel free to ask about specific investments, market indicators, or how to adjust your strategy.</p>`;
        }
    }

    // Initialize the page
    updateAllocation();
    
    // Set up interval to simulate market changes
    setInterval(simulateMarketChanges, 10000); // Update every 10 seconds
    
    // Add animation class to recommendation cards
    document.querySelectorAll('.recommendation-card, .education-card').forEach((card, index) => {
        setTimeout(() => {
            card.classList.add('animate-in');
        }, 300 * index);
    });
});
