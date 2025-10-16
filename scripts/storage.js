// storage.js - localStorage operations (streamlined)

const KEYS = {
    data: 'financeTracker:data',
    settings: 'financeTracker:settings'
};

const defaults = {
    budgetCap: 500,
    rates: { EUR: 0.92, GBP: 0.79 }
};

export const storage = {
    /**
     * Load transactions from localStorage
     * @returns {Array} - Array of transactions
     */
    load: () => {
        try {
            const data = localStorage.getItem(KEYS.data);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Load error:', error);
            return [];
        }
    },

    /**
     * Save transactions to localStorage
     * @param {Array} data - Transactions array
     */
    save: (data) => {
        try {
            localStorage.setItem(KEYS.data, JSON.stringify(data));
        } catch (error) {
            console.error('Save error:', error);
        }
    },

    /**
     * Load settings from localStorage
     * @returns {object} - Settings object
     */
    loadSettings: () => {
        try {
            const settings = localStorage.getItem(KEYS.settings);
            return settings ? JSON.parse(settings) : defaults;
        } catch (error) {
            console.error('Load settings error:', error);
            return defaults;
        }
    },

    /**
     * Save settings to localStorage
     * @param {object} settings - Settings object
     */
    saveSettings: (settings) => {
        try {
            localStorage.setItem(KEYS.settings, JSON.stringify(settings));
        } catch (error) {
            console.error('Save settings error:', error);
        }
    },

    /**
     * Clear all data
     */
    clear: () => {
        try {
            localStorage.removeItem(KEYS.data);
        } catch (error) {
            console.error('Clear error:', error);
        }
    }
};