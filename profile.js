document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            // Remove active class from all buttons and tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked button and corresponding tab
            button.classList.add('active');
            const tabId = button.getAttribute('data-tab') + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });

    // Risk slider functionality
    const riskSlider = document.getElementById('risk-tolerance');
    const riskValue = document.querySelector('.risk-value');

    if (riskSlider && riskValue) {
        riskSlider.addEventListener('input', function() {
            const value = this.value;
            let riskText;
            
            switch(value) {
                case '1': riskText = 'Very Conservative'; break;
                case '2': riskText = 'Conservative'; break;
                case '3': riskText = 'Moderate'; break;
                case '4': riskText = 'Aggressive'; break;
                case '5': riskText = 'Very Aggressive'; break;
                default: riskText = 'Moderate';
            }
            
            riskValue.textContent = riskText;
        });
    }

    // Password validation
    const newPasswordInput = document.getElementById('new-password');
    const passwordRequirements = document.querySelectorAll('.requirement');

    if (newPasswordInput && passwordRequirements.length) {
        newPasswordInput.addEventListener('input', function() {
            const password = this.value;
            
            // Check length
            if (password.length >= 8) {
                passwordRequirements[0].classList.add('met');
            } else {
                passwordRequirements[0].classList.remove('met');
            }
            
            // Check uppercase
            if (/[A-Z]/.test(password)) {
                passwordRequirements[1].classList.add('met');
            } else {
                passwordRequirements[1].classList.remove('met');
            }
            
            // Check number
            if (/[0-9]/.test(password)) {
                passwordRequirements[2].classList.add('met');
            } else {
                passwordRequirements[2].classList.remove('met');
            }
            
            // Check special character
            if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
                passwordRequirements[3].classList.add('met');
            } else {
                passwordRequirements[3].classList.remove('met');
            }
        });
    }

    // Create portfolio charts
    createAllocationChart();
    createPerformanceChart();

    // Form submission handling
    const forms = document.querySelectorAll('.profile-form');
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // Show a success message
            showToast('Changes saved successfully!', 'success');
        });
    });

    // Filter buttons for performance chart
    const filterBtns = document.querySelectorAll('.time-filter .filter-btn');
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            filterBtns.forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const period = this.getAttribute('data-period');
            updatePerformanceChart(period);
        });
    });

    /**
     * Show toast notification
     * @param {string} message - Message to display
     * @param {string} type - Type of toast (success, error, info)
     */
    function showToast(message, type = 'info') {
        // Create toast element if it doesn't exist
        let toast = document.getElementById('toast');
        if (!toast) {
            toast = document.createElement('div');
            toast.id = 'toast';
            document.body.appendChild(toast);
        }
        
        // Set toast content and style
        toast.textContent = message;
        toast.className = `toast ${type}`;
        
        // Show the toast
        toast.classList.add('show');
        
        // Hide after 3 seconds
        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    /**
     * Create allocation chart
     */
    function createAllocationChart() {
        const chartContainer = document.getElementById('allocation-chart');
        if (!chartContainer) return;
        
        // Placeholder is already styled in CSS
        // In a real app, we would create a real chart using Chart.js or similar
    }

    /**
     * Create performance chart
     */
    function createPerformanceChart() {
        const chartCanvas = document.getElementById('performance-chart');
        if (!chartCanvas) return;
        
        // Get Chart.js from window object if available, otherwise use a placeholder
        if (window.Chart) {
            const ctx = chartCanvas.getContext('2d');
            const chart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: generateDateLabels(180),
                    datasets: [{
                        label: 'Your Portfolio',
                        data: generatePerformanceData(180, 12.4),
                        borderColor: 'rgba(59, 130, 246, 0.8)',
                        backgroundColor: 'rgba(59, 130, 246, 0.1)',
                        fill: true,
                        tension: 0.4,
                        borderWidth: 3,
                        pointRadius: 0,
                        pointHoverRadius: 6
                    }, {
                        label: 'NIFTY 50',
                        data: generatePerformanceData(180, 8.7),
                        borderColor: 'rgba(100, 116, 139, 0.8)',
                        backgroundColor: 'transparent',
                        fill: false,
                        tension: 0.4,
                        borderWidth: 2,
                        pointRadius: 0,
                        borderDash: [5, 5]
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: {
                        legend: {
                            position: 'top',
                            align: 'end',
                            labels: {
                                usePointStyle: true,
                                boxWidth: 6
                            }
                        },
                        tooltip: {
                            mode: 'index',
                            intersect: false,
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            titleColor: '#1e293b',
                            bodyColor: '#1e293b',
                            borderColor: 'rgba(226, 232, 240, 1)',
                            borderWidth: 1,
                            bodyFont: {
                                family: "'Poppins', sans-serif"
                            },
                            padding: 12,
                            boxPadding: 6,
                            callbacks: {
                                label: function(context) {
                                    return context.dataset.label + ': ' + context.formattedValue + '%';
                                }
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: {
                                display: false
                            },
                            ticks: {
                                maxTicksLimit: 6,
                                maxRotation: 0
                            }
                        },
                        y: {
                            grid: {
                                color: 'rgba(226, 232, 240, 0.5)'
                            },
                            ticks: {
                                callback: function(value) {
                                    return value + '%';
                                }
                            }
                        }
                    }
                }
            });
            
            // Store chart reference for updates
            window.portfolioPerformanceChart = chart;
        } else {
            // Fallback to a simple placeholder
            chartCanvas.style.backgroundColor = '#f1f5f9';
            chartCanvas.style.borderRadius = '8px';
            
            const ctx = chartCanvas.getContext('2d');
            if (ctx) {
                ctx.font = '14px Poppins';
                ctx.fillStyle = '#64748b';
                ctx.textAlign = 'center';
                ctx.fillText('Chart.js not loaded. This would show your portfolio performance.', chartCanvas.width / 2, chartCanvas.height / 2);
            }
        }
    }

    /**
     * Update performance chart based on selected time period
     * @param {string} period - Time period (1m, 6m, 1y, all)
     */
    function updatePerformanceChart(period) {
        if (!window.portfolioPerformanceChart) return;
        
        let days, portfolioReturn, benchmarkReturn;
        
        switch(period) {
            case '1m':
                days = 30;
                portfolioReturn = 3.2;
                benchmarkReturn = 2.4;
                break;
            case '6m':
                days = 180;
                portfolioReturn = 12.4;
                benchmarkReturn = 8.7;
                break;
            case '1y':
                days = 365;
                portfolioReturn = 19.8;
                benchmarkReturn = 15.3;
                break;
            case 'all':
                days = 730; // 2 years
                portfolioReturn = 35.2;
                benchmarkReturn = 27.6;
                break;
            default:
                days = 180;
                portfolioReturn = 12.4;
                benchmarkReturn = 8.7;
        }
        
        const statCard = document.querySelector('.stat-card.up');
        if (statCard) {
            statCard.querySelector('.stat-value').textContent = `+${portfolioReturn}%`;
            
            // Calculate amount based on return and portfolio value
            const portfolioValue = 845000;
            const returnAmount = (portfolioValue * portfolioReturn / 100).toFixed(0);
            statCard.querySelector('.stat-amount').textContent = `+₹${numberWithCommas(returnAmount)}`;
        }
        
        const niftyCard = document.querySelector('.stat-card:not(.up)');
        if (niftyCard) {
            niftyCard.querySelector('.stat-value').textContent = `+${benchmarkReturn}%`;
        }
        
        // Update chart data
        const labels = generateDateLabels(days);
        const portfolioData = generatePerformanceData(days, portfolioReturn);
        const benchmarkData = generatePerformanceData(days, benchmarkReturn);
        
        const chart = window.portfolioPerformanceChart;
        chart.data.labels = labels;
        chart.data.datasets[0].data = portfolioData;
        chart.data.datasets[1].data = benchmarkData;
        chart.update();
    }

    /**
     * Generate date labels for chart x-axis
     * @param {number} days - Number of days to generate
     * @returns {Array} Array of date labels
     */
    function generateDateLabels(days) {
        const labels = [];
        const today = new Date();
        
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(today.getDate() - i);
            
            let label;
            if (days <= 31) {
                // For short periods, use day of month
                label = date.getDate().toString();
            } else if (days <= 366) {
                // For medium periods, use abbreviated month
                label = date.toLocaleString('default', { month: 'short', day: 'numeric' });
            } else {
                // For long periods, use month and year
                label = date.toLocaleString('default', { month: 'short', year: '2-digit' });
            }
            
            labels.push(label);
        }
        
        return labels;
    }

    /**
     * Generate performance data with realistic curve
     * @param {number} days - Number of data points
     * @param {number} totalReturn - Total return percentage
     * @returns {Array} Array of performance values
     */
    function generatePerformanceData(days, totalReturn) {
        const data = [];
        const dailyReturn = Math.pow(1 + totalReturn / 100, 1 / days) - 1;
        let currentValue = 0;
        
        for (let i = 0; i <= days; i++) {
            // Add some randomness to simulate real market fluctuations
            const volatility = Math.random() * 0.4 - 0.2; // -0.2 to +0.2
            const dayReturn = dailyReturn + volatility * dailyReturn;
            currentValue = (i === 0) ? 0 : currentValue + (100 + currentValue) * dayReturn;
            data.push(parseFloat(currentValue.toFixed(2)));
        }
        
        return data;
    }

    /**
     * Format number with commas for Indian numbering system
     * @param {number|string} num - Number to format
     * @returns {string} Formatted number
     */
    function numberWithCommas(num) {
        return new Intl.NumberFormat('en-IN').format(num);
    }

    // Update navigation links based on current page
    updateNavActiveState();

    // Add CSS for toast notifications
    addToastStyles();

    /**
     * Update active state of navigation links
     */
    function updateNavActiveState() {
        const navLinks = document.querySelectorAll('.nav-links a');
        const currentPage = window.location.pathname.split('/').pop();
        
        navLinks.forEach(link => {
            const href = link.getAttribute('href');
            if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    /**
     * Add CSS for toast notifications
     */
    function addToastStyles() {
        const styleElement = document.createElement('style');
        styleElement.textContent = `
            .toast {
                position: fixed;
                bottom: 20px;
                right: 20px;
                padding: 12px 24px;
                border-radius: 4px;
                color: white;
                font-weight: 500;
                z-index: 9999;
                transform: translateY(100px);
                opacity: 0;
                transition: transform 0.3s ease-out, opacity 0.3s ease-out;
                box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
            }
            .toast.show {
                transform: translateY(0);
                opacity: 1;
            }
            .toast.success {
                background-color: var(--success-color);
            }
            .toast.error {
                background-color: var(--danger-color);
            }
            .toast.info {
                background-color: var(--primary-color);
            }
        `;
        document.head.appendChild(styleElement);
    }
});
