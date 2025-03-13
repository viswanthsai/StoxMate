/**
 * API Utilities for Indivest
 * Helper functions for working with the Supabase backend
 */

const API = {
    /**
     * Get the current authenticated user
     * @returns {Promise<Object>} User object or null
     */
    getCurrentUser: async function() {
        const { supabase, handleError } = window.indivest;
        
        try {
            const { data, error } = await supabase.auth.getUser();
            if (error) throw error;
            return data.user;
        } catch (error) {
            handleError(error, 'Failed to get current user');
            return null;
        }
    },

    /**
     * Get user profile data
     * @param {string} userId - User ID
     * @returns {Promise<Object>} User profile data
     */
    getUserProfile: async function(userId) {
        const { supabase, handleError } = window.indivest;
        
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('id', userId)
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            handleError(error, 'Failed to get user profile');
            return null;
        }
    },

    /**
     * Update user profile
     * @param {string} userId - User ID
     * @param {Object} profileData - Profile data to update
     * @returns {Promise<Object>} Updated profile data or error
     */
    updateUserProfile: async function(userId, profileData) {
        const { supabase, handleError } = window.indivest;
        
        try {
            // Add updated timestamp
            profileData.updated_at = new Date().toISOString();
            
            const { data, error } = await supabase
                .from('user_profiles')
                .update(profileData)
                .eq('id', userId)
                .select()
                .single();
                
            if (error) throw error;
            return data;
        } catch (error) {
            return handleError(error, 'Failed to update user profile');
        }
    },

    /**
     * Get market data
     * @param {string} period - Time period (1d, 1w, 1m, 6m, 1y)
     * @returns {Promise<Array>} Market data points
     */
    getMarketData: async function(period = '1m') {
        const { supabase, handleError } = window.indivest;
        
        try {
            // Calculate date range based on period
            const now = new Date();
            let startDate;
            
            switch(period) {
                case '1d': 
                    startDate = new Date(now); 
                    startDate.setDate(startDate.getDate() - 1);
                    break;
                case '1w': 
                    startDate = new Date(now); 
                    startDate.setDate(startDate.getDate() - 7);
                    break;
                case '1m': 
                    startDate = new Date(now); 
                    startDate.setMonth(startDate.getMonth() - 1);
                    break;
                case '6m': 
                    startDate = new Date(now); 
                    startDate.setMonth(startDate.getMonth() - 6);
                    break;
                case '1y': 
                    startDate = new Date(now); 
                    startDate.setFullYear(startDate.getFullYear() - 1);
                    break;
                default: 
                    startDate = new Date(now); 
                    startDate.setMonth(startDate.getMonth() - 1);
            }
            
            // Format date as ISO string
            const formattedStartDate = startDate.toISOString().split('T')[0];
            
            const { data, error } = await supabase
                .from('market_data')
                .select('*')
                .gte('date', formattedStartDate)
                .order('date', { ascending: true });
            
            if (error) {
                // Check if this is a table missing error and use mock data
                if (error.code === '42P01') {
                    console.warn('Market data table not found. Using mock data.');
                    return this.getMockMarketData(period);
                }
                throw error;
            }
                
            return data || this.getMockMarketData(period);
        } catch (error) {
            handleError(error, 'Failed to get market data');
            return this.getMockMarketData(period);
        }
    },
    
    /**
     * Generate mock market data for periods when the table doesn't exist
     * @param {string} period - Time period
     * @returns {Array} Mock market data
     */
    getMockMarketData: function(period) {
        // Calculate number of days based on period
        const now = new Date();
        let days;
        
        switch(period) {
            case '1d': days = 1; break;
            case '1w': days = 7; break;
            case '1m': days = 30; break;
            case '6m': days = 180; break;
            case '1y': days = 365; break;
            default: days = 30;
        }
        
        // Generate mock data
        const data = [];
        for (let i = days; i >= 0; i--) {
            const date = new Date();
            date.setDate(now.getDate() - i);
            const formattedDate = date.toISOString().split('T')[0];
            
            // Base values with small randomization
            const randomFactor = Math.sin(i * 0.3) * 0.05; // Creates a wave-like pattern
            const niftyValue = 22000 * (1 + randomFactor);
            const sensexValue = 72000 * (1 + randomFactor);
            const bankNiftyValue = 48000 * (1 + randomFactor);
            const goldValue = 6000 * (1 + randomFactor * 0.3);
            const peRatio = 19.5 * (1 + randomFactor * 1.5);
            
            // Determine market mood
            let marketMood;
            if (peRatio < 17) marketMood = 'bearish';
            else if (peRatio > 22) marketMood = 'bullish';
            else marketMood = 'neutral';
            
            data.push({
                date: formattedDate,
                nifty_value: niftyValue.toFixed(2),
                sensex_value: sensexValue.toFixed(2),
                bank_nifty_value: bankNiftyValue.toFixed(2),
                gold_value: goldValue.toFixed(2),
                nifty_pe_ratio: peRatio.toFixed(2),
                market_mood: marketMood
            });
        }
        
        return data;
    },

    /**
     * Get user investments
     * @param {string} userId - User ID
     * @returns {Promise<Array>} User investments
     */
    getUserInvestments: async function(userId) {
        const { supabase, handleError } = window.indivest;
        
        try {
            const { data, error } = await supabase
                .from('user_assets')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });
                
            if (error) throw error;
            return data || [];
        } catch (error) {
            handleError(error, 'Failed to get user investments');
            return [];
        }
    },

    /**
     * Check if required tables exist and create if missing
     * @returns {Promise<boolean>} Success indicator
     */
    checkAndSetupTables: async function() {
        const { supabase, handleError } = window.indivest;
        
        try {
            // Check for user_profiles table first as it's essential
            const { count, error } = await supabase
                .from('user_profiles')
                .select('*', { count: 'exact', head: true });
            
            // If no error, we know the table exists
            if (!error) {
                console.log('Database tables already exist.');
                return true;
            }
            
            if (error.code === '42P01') { // Table doesn't exist error
                console.log('Tables missing, redirecting to setup page...');
                
                // On a real production site, we would handle this better
                // For demo purposes, redirect to the db setup page
                alert('Database tables need to be set up. Redirecting to setup page...');
                window.location.href = 'db-setup.html';
                return false;
            }
            
            // For any other error, just report it
            console.error('Error checking tables:', error);
            return false;
        } catch (error) {
            handleError(error, 'Failed to check database tables');
            return false;
        }
    }
};

// On page load, check the database tables
document.addEventListener('DOMContentLoaded', function() {
    if (window.indivest && window.indivest.supabase) {
        API.checkAndSetupTables();
    }
});

// Export the API utilities to the global scope
window.indivest = window.indivest || {};
window.indivest.API = API;
