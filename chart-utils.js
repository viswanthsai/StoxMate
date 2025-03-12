/**
 * Indivest Chart Utilities
 * Provides consistent chart styling and helper functions for all charts in the application
 */

const IndivCharts = {
    /**
     * Common colors used in charts
     */
    colors: {
        primary: 'rgba(59, 130, 246, 0.8)',
        primaryLight: 'rgba(59, 130, 246, 0.1)',
        success: 'rgba(16, 185, 129, 0.8)',
        warning: 'rgba(245, 158, 11, 0.8)',
        danger: 'rgba(239, 68, 68, 0.8)',
        neutral: 'rgba(100, 116, 139, 0.8)',
        gridLines: 'rgba(226, 232, 240, 0.5)'
    },
    
    /**
     * Common Chart.js options for line charts
     */
    lineChartOptions: {
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
                usePointStyle: true
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
                    maxTicksLimit: 8,
                    font: {
                        family: "'Poppins', sans-serif"
                    }
                }
            },
            y: {
                grid: {
                    color: 'rgba(226, 232, 240, 0.5)'
                },
                border: {
                    dash: [5, 5]
                },
                ticks: {
                    font: {
                        family: "'Poppins', sans-serif"
                    }
                }
            }
        },
        elements: {
            line: {
                tension: 0.4
            },
            point: {
                radius: 0,
                hoverRadius: 6,
                backgroundColor: 'white',
                hoverBackgroundColor: 'rgba(59, 130, 246, 1)',
                borderColor: 'rgba(59, 130, 246, 1)',
                hoverBorderColor: 'white',
                borderWidth: 2
            }
        }
    },
    
    /**
     * Create a line dataset with standard styling
     */
    createLineDataset: function(data, label, color) {
        return {
            label: label || 'Data',
            data: data,
            fill: {
                target: 'origin',
                above: color ? color + '0.1' : this.colors.primaryLight
            },
            borderColor: color || this.colors.primary,
            borderWidth: 3
        };
    },
    
    /**
     * Create a simple SVG sparkline
     */
    createSparkline: function(container, points, color, width, height) {
        // Clear existing content
        container.innerHTML = '';
        
        // Set default values
        width = width || '100%';
        height = height || '100%';
        color = color || this.colors.primary;
        
        // Create SVG element
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', width);
        svg.setAttribute('height', height);
        svg.setAttribute('viewBox', '0 0 100 40');
        svg.setAttribute('preserveAspectRatio', 'none');
        
        // Create path for the line
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        
        // Generate path data
        let pathData = `M 0,${points[0]} `;
        for (let i = 1; i < points.length; i++) {
            pathData += `L ${i * (100 / (points.length - 1))},${points[i]} `;
        }
        
        path.setAttribute('d', pathData);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', '2');
        path.setAttribute('stroke-linecap', 'round');
        
        svg.appendChild(path);
        container.appendChild(svg);
        
        return svg;
    }
};
