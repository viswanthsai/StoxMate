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

/**
 * Asset Allocation Calculator
 * Handles both simple and advanced calculation modes
 */

document.addEventListener('DOMContentLoaded', function() {
    // Handle calculation mode tabs
    const simpleModeTab = document.querySelector('.calc-tab[data-mode="simple"]');
    const advancedModeTab = document.querySelector('.calc-tab[data-mode="advanced"]');
    const simpleFields = document.querySelector('.simple-calculation-fields');
    const advancedFields = document.querySelector('.advanced-calculation-fields');
    const modeDescription = document.getElementById('mode-description');
    let currentMode = 'simple';
    
    // Tab switching
    if (simpleModeTab && advancedModeTab) {
        simpleModeTab.addEventListener('click', function() {
            simpleModeTab.classList.add('active');
            advancedModeTab.classList.remove('active');
            simpleFields.style.display = 'block';
            advancedFields.classList.remove('active');
            currentMode = 'simple';
            
            // Update description
            modeDescription.innerHTML = '<strong>Simple calculation</strong> provides a quick allocation based on your risk profile and investment duration. Perfect for new investors or quick planning.';
        });
        
        advancedModeTab.addEventListener('click', function() {
            advancedModeTab.classList.add('active');
            simpleModeTab.classList.remove('active');
            simpleFields.style.display = 'none';
            advancedFields.classList.add('active');
            currentMode = 'advanced';
            
            // Update description
            modeDescription.innerHTML = '<strong>Advanced calculation</strong> considers additional factors like tax bracket, inflation expectations, and market conditions for a more comprehensive allocation strategy.';
            
            // Sync values from simple to advanced fields (one-way)
            document.getElementById('adv-investment-amount').value = document.getElementById('investment-amount').value;
            document.getElementById('adv-investment-horizon').value = document.getElementById('investment-horizon').value;
            document.getElementById('adv-risk-tolerance').value = document.getElementById('risk-tolerance').value;
            document.getElementById('adv-monthly-contribution').value = document.getElementById('monthly-contribution').value;
            
            // Update advanced risk display
            updateAdvancedRiskDisplay();
        });
    }
    
    // Initialize risk slider behavior
    const riskSlider = document.getElementById('risk-tolerance');
    const riskValue = document.querySelector('.risk-value');
    const riskDescription = document.getElementById('risk-description');
    
    const advRiskSlider = document.getElementById('adv-risk-tolerance');
    const advRiskValue = document.getElementById('adv-risk-value');
    const advRiskDescription = document.getElementById('adv-risk-description');
    
    if (riskSlider && riskValue && riskDescription) {
        riskSlider.addEventListener('input', updateRiskDisplay);
        updateRiskDisplay(); // Initialize with default value
    }
    
    if (advRiskSlider && advRiskValue && advRiskDescription) {
        advRiskSlider.addEventListener('input', updateAdvancedRiskDisplay);
    }
    
    function updateRiskDisplay() {
        const value = riskSlider.value;
        setRiskInfo(value, riskValue, riskDescription);
    }
    
    function updateAdvancedRiskDisplay() {
        const value = advRiskSlider.value;
        setRiskInfo(value, advRiskValue, advRiskDescription);
    }
    
    function setRiskInfo(value, valueElement, descriptionElement) {
        let riskText, description;
        
        switch(parseInt(value)) {
            case 1:
                riskText = 'Very Conservative';
                description = 'Prioritizes capital preservation with minimal risk. Expect lower returns with minimal fluctuations.';
                break;
            case 2:
                riskText = 'Conservative';
                description = 'Focuses on stability with some growth potential. Small market fluctuations may occur.';
                break;
            case 3:
                riskText = 'Moderate';
                description = 'Balanced approach with moderate market fluctuations. Aims for medium-term growth.';
                break;
            case 4:
                riskText = 'Aggressive';
                description = 'Growth-oriented strategy with higher volatility. Suitable for longer investment horizons.';
                break;
            case 5:
                riskText = 'Very Aggressive';
                description = 'Maximum growth potential with significant market fluctuations. For long-term investors comfortable with volatility.';
                break;
            default:
                riskText = 'Moderate';
                description = 'Balanced approach with moderate market fluctuations.';
        }
        
        valueElement.textContent = riskText;
        descriptionElement.textContent = description;
    }
    
    // Handle form submission
    const allocationForm = document.getElementById('allocation-form');
    const resultsSection = document.getElementById('allocation-results');
    
    if (allocationForm) {
        allocationForm.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Get form data based on current mode
            let formData;
            if (currentMode === 'simple') {
                formData = {
                    mode: 'simple',
                    investmentAmount: parseFloat(document.getElementById('investment-amount').value) || 100000,
                    investmentHorizon: document.getElementById('investment-horizon').value || '3-7',
                    riskTolerance: parseInt(document.getElementById('risk-tolerance').value) || 3,
                    monthlyContribution: parseFloat(document.getElementById('monthly-contribution').value) || 0
                };
            } else {
                formData = {
                    mode: 'advanced',
                    investmentAmount: parseFloat(document.getElementById('adv-investment-amount').value) || 100000,
                    investmentHorizon: document.getElementById('adv-investment-horizon').value || '3-7',
                    riskTolerance: parseInt(document.getElementById('adv-risk-tolerance').value) || 3,
                    monthlyContribution: parseFloat(document.getElementById('adv-monthly-contribution').value) || 0,
                    currentInvestments: parseFloat(document.getElementById('current-investments').value) || 0,
                    inflationRate: parseFloat(document.getElementById('inflation-rate').value) || 6.0,
                    taxBracket: parseInt(document.getElementById('tax-bracket').value) || 0,
                    existingEquity: parseFloat(document.getElementById('existing-equity').value) || 0,
                    existingDebt: parseFloat(document.getElementById('existing-debt').value) || 0,
                    useCurrentMarket: document.querySelector('input[name="market-outlook"]:checked').value === 'current',
                    goals: Array.from(document.querySelectorAll('input[name="goals"]:checked')).map(el => el.value)
                };
            }
            
            // Calculate allocation based on inputs
            const allocation = calculateAllocation(formData);
            
            // Display results
            displayResults(allocation, formData);
            
            // Show results section
            resultsSection.style.display = 'block';
            
            // Show recommendations for advanced mode
            document.getElementById('investment-recommendations').style.display = 
                formData.mode === 'advanced' ? 'block' : 'none';
            
            // Scroll to results
            resultsSection.scrollIntoView({ behavior: 'smooth' });
        });
    }
    
    // Edit allocation button functionality
    document.getElementById('edit-allocation-btn')?.addEventListener('click', function() {
        window.scrollTo({
            top: document.querySelector('.allocation-form').offsetTop - 100,
            behavior: 'smooth'
        });
    });
    
    // Calculate allocation based on inputs
    function calculateAllocation(formData) {
        // Base allocation percentages by risk level (1-5)
        const baseAllocations = [
            { equity: 20, debt: 50, gold: 20, cash: 10 }, // Very Conservative
            { equity: 35, debt: 40, gold: 15, cash: 10 }, // Conservative
            { equity: 50, debt: 30, gold: 15, cash: 5 },  // Moderate
            { equity: 70, debt: 20, gold: 7, cash: 3 },   // Aggressive
            { equity: 85, debt: 10, gold: 3, cash: 2 }    // Very Aggressive
        ];
        
        // Get base allocation by risk level (0-indexed)
        let allocation = { ...baseAllocations[formData.riskTolerance - 1] };
        
        // Adjust based on investment horizon
        if (formData.investmentHorizon === '1-3') {
            // Short term: Less equity, more debt and cash
            allocation.equity = Math.max(allocation.equity - 15, 10);
            allocation.debt += 10;
            allocation.cash += 5;
        } else if (formData.investmentHorizon === '7-10') {
            // Long term: More equity, less cash
            allocation.equity = Math.min(allocation.equity + 10, 90);
            allocation.cash = Math.max(allocation.cash - 5, 0);
        } else if (formData.investmentHorizon === '10+') {
            // Very long term: Maximum equity
            allocation.equity = Math.min(allocation.equity + 15, 95);
            allocation.cash = Math.max(allocation.cash - 5, 0);
        }
        
        // For advanced mode, apply additional adjustments
        if (formData.mode === 'advanced') {
            // Adjust for inflation rate if high
            if (formData.inflationRate > 7) {
                allocation.equity = Math.min(allocation.equity + 5, 95);
                allocation.gold = Math.min(allocation.gold + 5, 25);
                allocation.cash = Math.max(allocation.cash - 5, 0);
            }
            
            // Adjust for tax bracket
            if (formData.taxBracket >= 20) {
                allocation.debt -= 5;
                allocation.equity += 5;
            }
            
            // Adjust for current market conditions
            if (formData.useCurrentMarket) {
                allocation.equity -= 3;
                allocation.debt += 3;
            }
            
            // Adjust for goals
            if (formData.goals?.includes('retirement')) {
                allocation.equity = Math.min(allocation.equity + 5, 95);
            }
            
            if (formData.goals?.includes('income')) {
                allocation.debt = Math.min(allocation.debt + 8, 70);
                allocation.equity = Math.max(allocation.equity - 8, 10);
            }
            
            if (formData.goals?.includes('tax-saving')) {
                allocation.equity = Math.min(allocation.equity + 5, 95);
                allocation.debt -= 5;
            }
        }
        
        // Ensure allocations add up to 100%
        let total = allocation.equity + allocation.debt + allocation.gold + allocation.cash;
        if (total !== 100) {
            // Normalize all values
            allocation.equity = Math.round(allocation.equity * 100 / total);
            allocation.debt = Math.round(allocation.debt * 100 / total);
            allocation.gold = Math.round(allocation.gold * 100 / total);
            
            // Ensure everything adds to 100% by adjusting cash
            const subtotal = allocation.equity + allocation.debt + allocation.gold;
            allocation.cash = 100 - subtotal;
        }
        
        // Calculate amounts for each asset class
        const amount = formData.investmentAmount;
        allocation.equityAmount = Math.round(amount * allocation.equity / 100);
        allocation.debtAmount = Math.round(amount * allocation.debt / 100);
        allocation.goldAmount = Math.round(amount * allocation.gold / 100);
        allocation.cashAmount = amount - allocation.equityAmount - allocation.debtAmount - allocation.goldAmount;
        
        // Calculate expected returns
        const expectedReturns = {
            equity: 12,
            debt: 7,
            gold: 8,
            cash: 3
        };
        
        // Calculate weighted average expected return
        allocation.expectedReturn = (
            (allocation.equity * expectedReturns.equity) +
            (allocation.debt * expectedReturns.debt) +
            (allocation.gold * expectedReturns.gold) +
            (allocation.cash * expectedReturns.cash)
        ) / 100;
        
        // Calculate years from investment horizon
        let years;
        switch (formData.investmentHorizon) {
            case '1-3': years = 3; break;
            case '3-7': years = 5; break;
            case '7-10': years = 8; break;
            case '10+': years = 10; break;
            default: years = 5;
        }
        allocation.years = years;
        
        // Calculate projected value
        allocation.projectedValue = calculateProjectedValue(
            formData.investmentAmount,
            formData.monthlyContribution,
            allocation.expectedReturn,
            years
        );
        
        return allocation;
    }
    
    // Calculate projected value with monthly contributions
    function calculateProjectedValue(principal, monthlyContribution, annualRate, years) {
        const monthlyRate = annualRate / 100 / 12;
        const months = years * 12;
        
        // Calculate future value of initial investment
        const fvInitial = principal * Math.pow(1 + (annualRate / 100), years);
        
        // Calculate future value of monthly contributions
        let fvMonthly = 0;
        if (monthlyContribution > 0) {
            if (monthlyRate > 0) {
                fvMonthly = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
            } else {
                fvMonthly = monthlyContribution * months;
            }
        }
        
        return Math.round(fvInitial + fvMonthly);
    }
    
    // Display allocation results
    function displayResults(allocation, formData) {
        // Update summary card
        document.getElementById('total-investment-value').textContent = `₹${formatNumber(formData.investmentAmount)}`;
        document.getElementById('total-monthly').textContent = `₹${formatNumber(formData.monthlyContribution)}`;
        document.getElementById('expected-return').textContent = `+${allocation.expectedReturn.toFixed(1)}%`;
        document.getElementById('projected-value').textContent = `₹${formatNumber(allocation.projectedValue)}`;
        document.getElementById('projection-years').textContent = allocation.years;
        
        // Create chart
        createAllocationChart(allocation);
        
        // Update table
        const tableBody = document.getElementById('allocation-table-body');
        tableBody.innerHTML = `
            <tr>
                <td>Equity</td>
                <td>${allocation.equity}%</td>
                <td>₹${formatNumber(allocation.equityAmount)}</td>
            </tr>
            <tr>
                <td>Debt</td>
                <td>${allocation.debt}%</td>
                <td>₹${formatNumber(allocation.debtAmount)}</td>
            </tr>
            <tr>
                <td>Gold</td>
                <td>${allocation.gold}%</td>
                <td>₹${formatNumber(allocation.goldAmount)}</td>
            </tr>
            <tr>
                <td>Cash</td>
                <td>${allocation.cash}%</td>
                <td>₹${formatNumber(allocation.cashAmount)}</td>
            </tr>
        `;
        
        // Update total
        document.getElementById('allocation-total').innerHTML = `<strong>₹${formatNumber(formData.investmentAmount)}</strong>`;
        
        // Generate investment recommendations if in advanced mode
        if (formData.mode === 'advanced') {
            generateRecommendations(allocation);
        }
        
        // Generate allocation notes
        document.getElementById('allocation-notes').innerHTML = generateNotes(allocation, formData);
    }
    
    // Create allocation chart
    function createAllocationChart(allocation) {
        const ctx = document.getElementById('allocation-chart').getContext('2d');
        
        // Destroy existing chart if it exists
        if (window.allocationChart) {
            window.allocationChart.destroy();
        }
        
        window.allocationChart = new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: ['Equity', 'Debt', 'Gold', 'Cash'],
                datasets: [{
                    data: [allocation.equity, allocation.debt, allocation.gold, allocation.cash],
                    backgroundColor: [
                        '#3b82f6', // Blue for equity
                        '#f59e0b', // Amber for debt
                        '#fcd34d', // Yellow for gold
                        '#9ca3af'  // Gray for cash
                    ],
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'bottom'
                    },
                    tooltip: {
                        callbacks: {
                            label: function(context) {
                                const label = context.label || '';
                                const value = context.raw || 0;
                                return `${label}: ${value}%`;
                            }
                        }
                    }
                }
            }
        });
    }
    
    // Generate investment recommendations for advanced mode
    function generateRecommendations(allocation) {
        const container = document.getElementById('recommendations-container');
        container.innerHTML = '';
        
        // Equity recommendations
        if (allocation.equity > 0) {
            let equityHtml = '<div class="recommendation-card">';
            equityHtml += '<h4><i class="fas fa-chart-line"></i> Equity (₹' + formatNumber(allocation.equityAmount) + ')</h4>';
            equityHtml += '<ul>';
            equityHtml += '<li>Nifty 50 Index Fund - 40%</li>';
            equityHtml += '<li>Blue Chip Equity Fund - 40%</li>';
            equityHtml += '<li>Mid-Cap Fund - 20%</li>';
            equityHtml += '</ul></div>';
            container.innerHTML += equityHtml;
        }
        
        // Debt recommendations
        if (allocation.debt > 0) {
            let debtHtml = '<div class="recommendation-card">';
            debtHtml += '<h4><i class="fas fa-landmark"></i> Debt (₹' + formatNumber(allocation.debtAmount) + ')</h4>';
            debtHtml += '<ul>';
            debtHtml += '<li>Government Securities Fund - 40%</li>';
            debtHtml += '<li>Corporate Bond Fund - 40%</li>';
            debtHtml += '<li>Short Term Debt Fund - 20%</li>';
            debtHtml += '</ul></div>';
            container.innerHTML += debtHtml;
        }
        
        // Gold recommendations
        if (allocation.gold > 0) {
            let goldHtml = '<div class="recommendation-card">';
            goldHtml += '<h4><i class="fas fa-coins"></i> Gold (₹' + formatNumber(allocation.goldAmount) + ')</h4>';
            goldHtml += '<ul>';
            goldHtml += '<li>Gold ETF - 70%</li>';
            goldHtml += '<li>Gold Savings Fund - 30%</li>';
            goldHtml += '</ul></div>';
            container.innerHTML += goldHtml;
        }
        
        // Cash recommendations
        if (allocation.cash > 0) {
            let cashHtml = '<div class="recommendation-card">';
            cashHtml += '<h4><i class="fas fa-wallet"></i> Cash (₹' + formatNumber(allocation.cashAmount) + ')</h4>';
            cashHtml += '<ul>';
            cashHtml += '<li>High-yield Savings Account - 50%</li>';
            cashHtml += '<li>Liquid Funds - 50%</li>';
            cashHtml += '</ul></div>';
            container.innerHTML += cashHtml;
        }
    }
    
    // Generate allocation notes
    function generateNotes(allocation, formData) {
        let notes = '';
        
        // Risk-based notes
        switch(formData.riskTolerance) {
            case 1:
                notes += '<p>Your <strong>very conservative</strong> risk profile emphasizes capital preservation above growth. This allocation prioritizes stability with a significant portion in debt and gold.</p>';
                break;
            case 2:
                notes += '<p>Your <strong>conservative</strong> risk profile balances modest growth with stability. This allocation maintains a significant position in debt while allowing some equity exposure.</p>';
                break;
            case 3:
                notes += '<p>Your <strong>moderate</strong> risk profile provides a balanced approach. This allocation offers good diversification across equity, debt, and alternative assets.</p>';
                break;
            case 4:
                notes += '<p>Your <strong>aggressive</strong> risk profile focuses on growth. This allocation emphasizes equities with moderate diversification into other asset classes to manage volatility.</p>';
                break;
            case 5:
                notes += '<p>Your <strong>very aggressive</strong> risk profile maximizes growth potential. This allocation heavily favors equities and may experience significant short-term volatility.</p>';
                break;
        }
        
        // Time horizon notes
        switch(formData.investmentHorizon) {
            case '1-3':
                notes += '<p>With a <strong>short-term</strong> investment horizon (1-3 years), your allocation maintains higher levels of debt and cash to protect against market volatility.</p>';
                break;
            case '3-7':
                notes += '<p>With a <strong>medium-term</strong> investment horizon (3-7 years), your allocation provides a good balance between growth and stability.</p>';
                break;
            case '7-10':
                notes += '<p>With a <strong>long-term</strong> investment horizon (7-10 years), your allocation emphasizes growth assets with reduced cash holdings.</p>';
                break;
            case '10+':
                notes += '<p>With a <strong>very long-term</strong> investment horizon (10+ years), your allocation maximizes growth potential through higher equity exposure.</p>';
                break;
        }
        
        // Monthly contribution note
        if (formData.monthlyContribution > 0) {
            notes += `<p>Your monthly contribution of ₹${formatNumber(formData.monthlyContribution)} will significantly enhance your portfolio growth over time through the power of compounding.</p>`;
        }
        
        // Advanced mode-specific notes
        if (formData.mode === 'advanced') {
            // Inflation notes
            if (formData.inflationRate > 7) {
                notes += '<p><strong>High inflation</strong> conditions have increased your allocation to equity and gold, which typically perform better in inflationary environments.</p>';
            }
            
            // Tax bracket notes
            if (formData.taxBracket >= 20) {
                notes += '<p>Your <strong>higher tax bracket</strong> has influenced the allocation to favor more tax-efficient investment options.</p>';
            }
            
            // Goal-specific notes
            if (formData.goals?.includes('retirement')) {
                notes += '<p>Your <strong>retirement goal</strong> has increased the equity allocation for long-term growth potential.</p>';
            }
            
            if (formData.goals?.includes('income')) {
                notes += '<p>Your <strong>regular income goal</strong> has increased the allocation to debt instruments which typically provide more stable income.</p>';
            }
            
            if (formData.goals?.includes('tax-saving')) {
                notes += '<p>Your <strong>tax-saving goal</strong> has influenced the allocation to include tax-efficient investment options.</p>';
            }
        }
        
        // Return projection note
        notes += `<p>Based on historical average returns, this portfolio has a projected annual return of <strong>${allocation.expectedReturn.toFixed(1)}%</strong>, potentially growing to <strong>₹${formatNumber(allocation.projectedValue)}</strong> after ${allocation.years} years.</p>`;
        
        // General recommendation
        notes += '<p>Remember that this allocation is a starting point and should be periodically reviewed. Markets change, and your financial circumstances may evolve over time.</p>';
        
        return notes;
    }
    
    // Format numbers with commas
    function formatNumber(number) {
        return new Intl.NumberFormat('en-IN').format(Math.round(number));
    }
    
    // Add CSS for recommendation cards
    const style = document.createElement('style');
    style.textContent = `
        .recommendation-card {
            background-color: var(--neutral-50, #f8fafc);
            border-radius: 8px;
            padding: 1rem;
            margin-bottom: 1rem;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
        }
        
        .recommendation-card h4 {
            margin-top: 0;
            margin-bottom: 0.75rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }
        
        .recommendation-card h4 i {
            color: var(--primary-color, #3b82f6);
        }
        
        .recommendation-card ul {
            margin: 0;
            padding-left: 1.5rem;
        }
        
        .recommendation-card li {
            margin-bottom: 0.5rem;
        }
        
        .recommendations-container {
            display: grid;
            grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
            gap: 1rem;
            margin: 1.5rem 0;
        }
        
        @media (max-width: 768px) {
            .recommendations-container {
                grid-template-columns: 1fr;
            }
        }
    `;
    document.head.appendChild(style);
});
