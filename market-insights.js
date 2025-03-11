document.addEventListener('DOMContentLoaded', function() {
    // Initialize market data
    let currentPE = 19.2;
    let marketMood = 'neutral';
    
    // PE ratio ranges for market mood
    const peRanges = {
        bearish: { min: 12, max: 17 },
        neutral: { min: 17, max: 22 },
        bullish: { min: 22, max: 28 }
    };
    
    // Allocation percentages by market mood
    const allocations = {
        bearish: { stocks: 20, gold: 30, fd: 50 },
        neutral: { stocks: 40, gold: 30, fd: 30 },
        bullish: { stocks: 60, gold: 20, fd: 20 }
    };
    
    // Initialize charts and visualizations
    initializePEHistoryChart();
    initializeSectorCharts();
    updateGaugePointer(currentPE);
    
    // Update timestamps
    document.getElementById('market-update-time').textContent = new Date().toLocaleTimeString();
    
    // Set up event listeners
    setupEventListeners();
    
    // Periodically update market data
    setInterval(simulateMarketUpdates, 8000);
    
    /**
     * Initialize PE History chart using Chart.js
     */
    function initializePEHistoryChart() {
        const ctx = document.getElementById('pe-history-chart');
        
        // Generate labels and data for the past 30 days
        const labels = generateDateLabels(30);
        const data = generateHistoricalPEData(30);
        
        // Create the chart
        window.peHistoryChart = new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: 'NIFTY 50 PE Ratio',
                    data: data,
                    fill: {
                        target: 'origin',
                        above: 'rgba(59, 130, 246, 0.1)'
                    },
                    borderColor: 'rgba(59, 130, 246, 0.8)',
                    borderWidth: 3,
                    pointRadius: 0,
                    pointHoverRadius: 6,
                    pointBackgroundColor: 'white',
                    pointHoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                    pointBorderColor: 'rgba(59, 130, 246, 1)',
                    pointHoverBorderColor: 'white',
                    pointBorderWidth: 2,
                    tension: 0.4
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        titleColor: '#1e293b',
                        bodyColor: '#1e293b',
                        titleFont: {
                            family: "'Poppins', sans-serif",
                            weight: '600'
                        },
                        bodyFont: {
                            family: "'Poppins', sans-serif"
                        },
                        borderColor: 'rgba(226, 232, 240, 1)',
                        borderWidth: 1,
                        padding: 12,
                        boxPadding: 6,
                        usePointStyle: true,
                        callbacks: {
                            title: function(context) {
                                return context[0].label;
                            },
                            label: function(context) {
                                return 'PE Ratio: ' + context.raw.toFixed(2);
                            }
                        }
                    }
                },
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            maxTicksLimit: 8
                        }
                    },
                    y: {
                        grid: {
                            color: 'rgba(226, 232, 240, 0.5)'
                        },
                        border: {
                            dash: [5, 5]
                        },
                        min: 12,
                        max: 28,
                        ticks: {
                            stepSize: 4
                        }
                    }
                }
            }
        });
    }
    
    /**
     * Initialize mini charts for sector performance
     */
    function initializeSectorCharts() {
        const sectors = ['it', 'pharma', 'banking', 'fmcg'];
        
        sectors.forEach(sector => {
            const chartContainer = document.getElementById(`${sector}-chart`);
            if (!chartContainer) return;
            
            // Create SVG sparkline
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.setAttribute('viewBox', '0 0 100 40');
            svg.setAttribute('preserveAspectRatio', 'none');
            
            // Create path for the line
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            
            // Generate random points for the sparkline
            const points = generateSparklineData(sector);
            let pathData = `M 0,${points[0]} `;
            
            for (let i = 1; i < points.length; i++) {
                pathData += `L ${i * (100 / (points.length - 1))},${points[i]} `;
            }
            
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            
            // Set color based on sector trend
            const isUp = sector !== 'banking';
            path.setAttribute('stroke', isUp ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            
            svg.appendChild(path);
            chartContainer.appendChild(svg);
        });
    }
    
    /**
     * Set up event listeners for interactive elements
     */
    function setupEventListeners() {
        // Time period filter buttons for PE chart
        const timePeriodBtns = document.querySelectorAll('.historical-trends .filter-btn');
        timePeriodBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remove active class from all buttons in this section
                timePeriodBtns.forEach(b => b.classList.remove('active'));
                // Add active class to clicked button
                this.classList.add('active');
                
                // Update chart data
                const period = this.getAttribute('data-period');
                updateChartTimePeriod(period);
            });
        });
        
        // Chart type toggle buttons
        const chartTypeBtns = document.querySelectorAll('.chart-type-btn');
        chartTypeBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                chartTypeBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const chartType = this.getAttribute('data-chart');
                changeChartType(chartType);
            });
        });
        
        // Sector time period buttons
        const sectorPeriodBtns = document.querySelectorAll('.sector-performance .filter-btn');
        sectorPeriodBtns.forEach(btn => {
            btn.addEventListener('click', function() {
                sectorPeriodBtns.forEach(b => b.classList.remove('active'));
                this.classList.add('active');
                
                const period = this.getAttribute('data-period');
                updateSectorData(period);
            });
        });
    }
    
    /**
     * Update PE gauge pointer position based on current PE
     * @param {number} pe - Current PE value
     */
    function updateGaugePointer(pe) {
        const pointer = document.getElementById('pe-pointer');
        if (!pointer) return;
        
        // Calculate position percentage based on PE range
        let positionPercent;
        if (pe < peRanges.neutral.min) {
            // Bearish zone (0-33%)
            positionPercent = (pe - peRanges.bearish.min) / (peRanges.neutral.min - peRanges.bearish.min) * 33;
        } else if (pe < peRanges.bullish.min) {
            // Neutral zone (33-66%)
            positionPercent = 33 + (pe - peRanges.neutral.min) / (peRanges.bullish.min - peRanges.neutral.min) * 33;
        } else {
            // Bullish zone (66-100%)
            positionPercent = 66 + (pe - peRanges.bullish.min) / (peRanges.bullish.max - peRanges.bullish.min) * 34;
        }
        
        // Limit position to 0-100%
        positionPercent = Math.max(0, Math.min(100, positionPercent));
        
        // Update pointer position
        pointer.style.left = `${positionPercent}%`;
        
        // Update text values
        document.getElementById('current-pe-value').textContent = pe.toFixed(1);
        document.getElementById('pe-ratio-value').textContent = pe.toFixed(1);
        
        // Determine market mood
        let mood;
        if (pe < peRanges.neutral.min) mood = 'bearish';
        else if (pe < peRanges.bullish.min) mood = 'neutral';
        else mood = 'bullish';
        
        marketMood = mood;
        document.getElementById('market-mood-text').textContent = mood;
        
        // Update allocation bars
        updateAllocationBars(mood);
    }
    
    /**
     * Update allocation bar percentages
     * @param {string} mood - Market mood (bearish, neutral, bullish)
     */
    function updateAllocationBars(mood) {
        const allocation = allocations[mood];
        
        document.querySelector('.bar-fill.stocks').style.width = `${allocation.stocks}%`;
        document.querySelector('.bar-fill.stocks').textContent = `${allocation.stocks}%`;
        
        document.querySelector('.bar-fill.gold').style.width = `${allocation.gold}%`;
        document.querySelector('.bar-fill.gold').textContent = `${allocation.gold}%`;
        
        document.querySelector('.bar-fill.fd').style.width = `${allocation.fd}%`;
        document.querySelector('.bar-fill.fd').textContent = `${allocation.fd}%`;
    }
    
    /**
     * Update chart based on selected time period
     * @param {string} period - Time period (1m, 6m, 1y, 5y, max)
     */
    function updateChartTimePeriod(period) {
        let days;
        
        switch(period) {
            case '1m': days = 30; break;
            case '6m': days = 180; break;
            case '1y': days = 365; break;
            case '5y': days = 1825; break;
            case 'max': days = 3650; break;
            default: days = 30;
        }
        
        const labels = generateDateLabels(days);
        const data = generateHistoricalPEData(days);
        
        window.peHistoryChart.data.labels = labels;
        window.peHistoryChart.data.datasets[0].data = data;
        window.peHistoryChart.update();
    }
    
    /**
     * Change chart type between line and bar
     * @param {string} type - Chart type (line, candlestick)
     */
    function changeChartType(type) {
        if (type === 'line') {
            window.peHistoryChart.config.type = 'line';
            window.peHistoryChart.data.datasets[0].pointRadius = 0;
        } else if (type === 'candlestick') {
            // Simulating candlestick with bars for simplicity
            window.peHistoryChart.config.type = 'bar';
            window.peHistoryChart.data.datasets[0].pointRadius = 0;
            window.peHistoryChart.data.datasets[0].backgroundColor = function(context) {
                const value = context.raw;
                return value > 19 ? 'rgba(16, 185, 129, 0.7)' : 'rgba(239, 68, 68, 0.7)';
            };
        }
        
        window.peHistoryChart.update();
    }
    
    /**
     * Update sector data based on selected time period
     * @param {string} period - Time period (1d, 1w, 1m, 3m, 1y)
     */
    function updateSectorData(period) {
        // In a real app, this would fetch data from an API
        // Here we'll simulate with random data
        const sectorCards = document.querySelectorAll('.sector-card');
        
        sectorCards.forEach(card => {
            // Generate random percentage change
            const change = ((Math.random() * 6) - 2).toFixed(1);
            const isPositive = parseFloat(change) > 0;
            
            // Update sector header
            const changeEl = card.querySelector('.sector-change');
            changeEl.textContent = isPositive ? `+${change}%` : `${change}%`;
            
            // Update card class
            card.classList.remove('up', 'down');
            card.classList.add(isPositive ? 'up' : 'down');
            
            // Update stock changes
            const stockChanges = card.querySelectorAll('.stock-change');
            stockChanges.forEach(stock => {
                const stockChange = ((Math.random() * 8) - 3).toFixed(1);
                const stockPositive = parseFloat(stockChange) > 0;
                
                stock.textContent = stockPositive ? `+${stockChange}%` : `${stockChange}%`;
                stock.classList.remove('up', 'down');
                stock.classList.add(stockPositive ? 'up' : 'down');
            });
            
            // Re-create the mini chart
            const chartId = card.querySelector('.mini-chart').id;
            const sector = chartId.split('-')[0];
            
            const chartContainer = document.getElementById(chartId);
            chartContainer.innerHTML = '';
            
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.setAttribute('width', '100%');
            svg.setAttribute('height', '100%');
            svg.setAttribute('viewBox', '0 0 100 40');
            svg.setAttribute('preserveAspectRatio', 'none');
            
            const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const points = generateSparklineData(sector);
            
            let pathData = `M 0,${points[0]} `;
            for (let i = 1; i < points.length; i++) {
                pathData += `L ${i * (100 / (points.length - 1))},${points[i]} `;
            }
            
            path.setAttribute('d', pathData);
            path.setAttribute('fill', 'none');
            path.setAttribute('stroke', isPositive ? 'rgba(16, 185, 129, 0.8)' : 'rgba(239, 68, 68, 0.8)');
            path.setAttribute('stroke-width', '2');
            path.setAttribute('stroke-linecap', 'round');
            
            svg.appendChild(path);
            chartContainer.appendChild(svg);
        });
    }
    
    /**
     * Simulate market data updates
     */
    function simulateMarketUpdates() {
        // Update PE ratio with small random changes
        const peChange = (Math.random() - 0.5) * 0.3;
        currentPE = Math.max(peRanges.bearish.min, Math.min(peRanges.bullish.max, currentPE + peChange));
        
        // Update gauge and related displays
        updateGaugePointer(currentPE);
        
        // Update NIFTY value with corresponding change
        const niftyChange = (currentPE > 19.2) ? '+0.7%' : ((currentPE < 19) ? '-0.4%' : '+0.2%');
        document.querySelector('.summary-item.nifty .summary-change').innerHTML = 
            `<i class="fas fa-caret-${currentPE > 19.2 ? 'up' : 'down'}"></i> ${niftyChange}`;
        
        // Update timestamp
        document.getElementById('market-update-time').textContent = new Date().toLocaleTimeString();
    }
    
    /**
     * Generate date labels for x-axis
     * @param {number} days - Number of days to generate
     * @returns {Array} Array of date strings
     */
    function generateDateLabels(days) {
        const labels = [];
        const today = new Date();
        
        for (let i = days - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            
            // Format date as "15 Jun" or similar
            const day = date.getDate();
            const month = date.toLocaleString('default', { month: 'short' });
            labels.push(`${day} ${month}`);
        }
        
        return labels;
    }
    
    /**
     * Generate historical PE data with realistic patterns
     * @param {number} days - Number of data points
     * @returns {Array} Array of PE values
     */
    function generateHistoricalPEData(days) {
        const data = [];
        const volatility = 0.05;
        let value = currentPE;
        
        // Generate data for the specified number of days
        for (let i = 0; i < days; i++) {
            // Add small random changes with mean reversion
            const change = (Math.random() - 0.5) * volatility;
            const meanReversion = (19 - value) * 0.01;
            value = value + change + meanReversion;
            
            // Keep within bounds
            value = Math.max(peRanges.bearish.min, Math.min(peRanges.bullish.max, value));
            
            data.push(value);
        }
        
        return data;
    }
    
    /**
     * Generate sparkline data for sector charts
     * @param {string} sector - Sector name
     * @returns {Array} Array of y coordinates for the sparkline
     */
    function generateSparklineData(sector) {
        const points = [];
        const numPoints = 20;
        let trend = 0;
        
        // Different trends based on sector
        switch(sector) {
            case 'it': trend = 0.2; break;
            case 'pharma': trend = 0.15; break;
            case 'banking': trend = -0.1; break;
            case 'fmcg': trend = 0.05; break;
            default: trend = 0;
        }
        
        let value = 20; // Middle position
        
        for (let i = 0; i < numPoints; i++) {
            // Add random movement with trend
            const change = (Math.random() - 0.5) * 4 + trend;
            value = Math.max(5, Math.min(35, value + change));
            points.push(value);
        }
        
        return points;
    }
});
