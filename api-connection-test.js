/**
 * API Connection Test Tool
 * This provides diagnostic functions to troubleshoot ChatGPT API connections
 */
const APITester = {
    // Store test results
    testResults: {},
    
    /**
     * Run a comprehensive test of all connection methods
     */
    async runAllTests() {
        this.clearResults();
        this.logResult('status', 'Running tests...');
        
        // Test if window.aiAdvisor exists
        this.logResult('aiAdvisor', window.aiAdvisor ? 'Available' : 'Not available');
        
        // Test environment
        this.logResult('environment', {
            hostname: window.location.hostname,
            protocol: window.location.protocol,
            userAgent: navigator.userAgent
        });
        
        // Test direct API connection
        await this.testDirectAPI();
        
        // Test proxy connection
        await this.testProxyAPI();
        
        // Summary
        this.analyzeTesting();
        
        return this.testResults;
    },
    
    /**
     * Test direct API connection
     */
    async testDirectAPI() {
        if (!window.aiAdvisor) {
            this.logResult('directAPI', 'Failed - aiAdvisor not available');
            return;
        }
        
        try {
            this.logResult('directAPI', 'Testing...');
            const response = await window.aiAdvisor.sendMessage('This is a test message. Please respond with OK if you can hear me.', []);
            this.logResult('directAPI', {
                status: 'Success',
                response: response.substring(0, 100) + (response.length > 100 ? '...' : '')
            });
            
            // Check if it's a fallback response
            const isFallback = response.includes('offline mode') || 
                               response.includes('I\'m currently operating');
            
            if (isFallback) {
                this.logResult('directAPI_fallback', true);
                this.logResult('directAPI', 'Fallback response detected - API key might be invalid');
            } else {
                this.logResult('directAPI_fallback', false);
            }
        } catch (error) {
            this.logResult('directAPI', {
                status: 'Failed',
                error: error.message
            });
        }
    },
    
    /**
     * Test proxy API connection
     */
    async testProxyAPI() {
        try {
            this.logResult('proxyAPI', 'Testing...');
            const messages = [
                {
                    role: "system",
                    content: "You are a test assistant. Respond with OK to confirm the connection works."
                },
                {
                    role: "user",
                    content: "This is a test message. Please respond with OK if you can hear me."
                }
            ];
            
            const response = await fetch('/api/openai-proxy.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 50
                })
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Server returned ${response.status}: ${errorText.substring(0, 100)}`);
            }
            
            const data = await response.json();
            
            if (data.error) {
                throw new Error(data.error);
            }
            
            this.logResult('proxyAPI', {
                status: 'Success',
                response: data.response ? (data.response.substring(0, 100) + (data.response.length > 100 ? '...' : '')) : 'No response data'
            });
            
            // Check if it seems like a proper response
            const validResponse = data.response && 
                                (data.response.toLowerCase().includes('ok') || 
                                 data.response.toLowerCase().includes('hear you') || 
                                 data.response.toLowerCase().includes('test'));
                                
            this.logResult('proxyAPI_valid', validResponse);
        } catch (error) {
            this.logResult('proxyAPI', {
                status: 'Failed',
                error: error.message
            });
        }
    },
    
    /**
     * Analyze test results and provide recommendations
     */
    analyzeTesting() {
        // Check which methods worked
        const directWorked = this.testResults.directAPI?.status === 'Success' && !this.testResults.directAPI_fallback;
        const proxyWorked = this.testResults.proxyAPI?.status === 'Success' && this.testResults.proxyAPI_valid;
        
        let recommendation;
        
        if (directWorked && proxyWorked) {
            recommendation = "Both direct API and proxy connections are working! You can use either method.";
        } else if (directWorked) {
            recommendation = "Direct API connection is working, but proxy connection failed. Use the direct method for your application.";
        } else if (proxyWorked) {
            recommendation = "Proxy connection is working, but direct API connection failed. Use the proxy method for your application.";
        } else {
            recommendation = "Both connection methods failed. Please check your API key and server configuration.";
            
            // More specific recommendations
            if (this.testResults.directAPI?.error?.includes('API key')) {
                recommendation += " Your API key appears to be invalid or missing.";
            }
            
            if (this.testResults.proxyAPI?.error?.includes('404')) {
                recommendation += " The proxy endpoint was not found - check your server configuration.";
            }
        }
        
        this.logResult('recommendation', recommendation);
        this.logResult('status', 'Tests completed');
    },
    
    /**
     * Log a test result
     */
    logResult(key, value) {
        this.testResults[key] = value;
        console.log(`API Test [${key}]:`, value);
        
        // If we have a display element, update it
        const resultDisplay = document.getElementById('api-test-results');
        if (resultDisplay) {
            // Update or add this result
            let resultHTML = '';
            for (const [testKey, testValue] of Object.entries(this.testResults)) {
                resultHTML += `<div class="test-result">
                    <strong>${testKey}:</strong> 
                    <span>${typeof testValue === 'object' ? JSON.stringify(testValue, null, 2) : testValue}</span>
                </div>`;
            }
            resultDisplay.innerHTML = resultHTML;
        }
    },
    
    /**
     * Clear previous test results
     */
    clearResults() {
        this.testResults = {};
        const resultDisplay = document.getElementById('api-test-results');
        if (resultDisplay) {
            resultDisplay.innerHTML = '';
        }
    }
};

// Add to global scope for access from console
window.APITester = APITester;

// Auto-run tests if the page includes a trigger element
document.addEventListener('DOMContentLoaded', function() {
    const autorunElement = document.getElementById('api-test-autorun');
    if (autorunElement) {
        APITester.runAllTests();
    }
    
    // Set up test button if it exists
    const testButton = document.getElementById('run-api-test');
    if (testButton) {
        testButton.addEventListener('click', function() {
            APITester.runAllTests();
        });
    }
});
