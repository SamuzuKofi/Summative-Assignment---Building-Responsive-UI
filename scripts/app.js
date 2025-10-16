// app.js - Main application logic

import { validateTransaction, compileRegex } from './validators.js';
import { exportToJSON, validateImportData, clearAllData } from './storage.js';
import { 
    initState, 
    getTransactions, 
    addTransaction, 
    updateTransaction, 
    deleteTransaction,
    setTransactions,
    getSettings,
    updateSettings,
    setCurrentPage,
    setEditingId,
    getEditingId,
    setSearchPattern,
    getSearchPattern,
    setSortBy,
    getSortBy,
    getTransaction,
    clearAllTransactions
} from './state.js';
import { filterTransactions, sortTransactions } from './search.js';
import {
    renderTransactions,
    updateDashboard,
    showError,
    clearError,
    clearAllErrors,
    resetForm,
    populateForm,
    showPage,
    announceStatus,
    updateCurrencyConverter,
    updateSettingsDisplay
} from './ui.js';

// Initialize application
document.addEventListener('DOMContentLoaded', () => {
    initState();
    setupEventListeners();
    
    // Set initial date to today
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('date').value = today;
    
    // Initial render
    showPage('dashboard');
    refreshDisplay();
});

/**
 * Sets up all event listeners
 */
function setupEventListeners() {
    // Navigation
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', handleNavigation);
    });
    
    // Transaction form
    document.getElementById('transaction-form').addEventListener('submit', handleFormSubmit);
    document.getElementById('cancel-btn').addEventListener('click', handleCancelEdit);
    
    // Real-time validation
    document.getElementById('description').addEventListener('input', () => {
        clearError('description');
    });
    document.getElementById('amount').addEventListener('input', () => {
        clearError('amount');
    });
    document.getElementById('date').addEventListener('input', () => {
        clearError('date');
    });
    document.getElementById('category').addEventListener('change', () => {
        clearError('category');
    });
    
    // Search
    document.getElementById('search-input').addEventListener('input', handleSearch);
    document.getElementById('case-sensitive').addEventListener('change', handleSearch);
    document.getElementById('clear-search').addEventListener('click', handleClearSearch);
    
    // Sort
    document.getElementById('sort-by').addEventListener('change', handleSort);
    
    // Settings
    document.getElementById('save-budget').addEventListener('click', handleSaveBudget);
    document.getElementById('save-rates').addEventListener('click', handleSaveRates);
    document.getElementById('convert-amount').addEventListener('input', handleConvert);
    
    // Data management
    document.getElementById('export-btn').addEventListener('click', handleExport);
    document.getElementById('import-file').addEventListener('change', handleImport);
    document.getElementById('clear-all-btn').addEventListener('click', handleClearAll);
    
    // Event delegation for edit/delete buttons
    document.getElementById('transactions-body').addEventListener('click', handleTableAction);
    
    // Keyboard shortcut: Escape to cancel edit
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && getEditingId()) {
            handleCancelEdit();
        }
    });
}

/**
 * Handles navigation between pages
 */
function handleNavigation(e) {
    e.preventDefault();
    const page = e.target.dataset.page;
    
    if (page) {
        setCurrentPage(page);
        showPage(page);
        
        if (page === 'dashboard') {
            refreshDisplay();
        } else if (page === 'settings') {
            updateSettingsDisplay(getSettings());
        }
    }
}

/**
 * Handles form submission (add or edit)
 */
function handleFormSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const data = {
        description: document.getElementById('description').value,
        amount: document.getElementById('amount').value,
        category: document.getElementById('category').value,
        date: document.getElementById('date').value
    };
    
    // Validate
    const validation = validateTransaction(data);
    
    if (!validation.valid) {
        // Show errors
        clearAllErrors();
        for (const [field, message] of Object.entries(validation.errors)) {
            showError(field, message);
        }
        announceStatus('Please fix the errors in the form', 'assertive');
        return;
    }
    
    // Check if editing or adding
    const editId = document.getElementById('edit-id').value;
    
    if (editId) {
        // Update existing transaction
        updateTransaction(editId, data);
        announceStatus('Transaction updated successfully');
        setEditingId(null);
    } else {
        // Add new transaction
        addTransaction(data);
        announceStatus('Transaction added successfully');
    }
    
    // Reset form and refresh
    resetForm();
    refreshDisplay();
    
    // Switch to transactions page
    setCurrentPage('transactions');
    showPage('transactions');
}

/**
 * Handles cancel edit button
 */
function handleCancelEdit() {
    resetForm();
    setEditingId(null);
    announceStatus('Edit cancelled');
}

/**
 * Handles edit and delete button clicks in table
 */
function handleTableAction(e) {
    const target = e.target;
    
    if (target.classList.contains('btn-edit')) {
        const id = target.dataset.id;
        handleEdit(id);
    } else if (target.classList.contains('btn-delete')) {
        const id = target.dataset.id;
        handleDelete(id);
    }
}

/**
 * Handles editing a transaction
 */
function handleEdit(id) {
    const transaction = getTransaction(id);
    
    if (transaction) {
        setEditingId(id);
        populateForm(transaction);
        setCurrentPage('add-transaction');
        showPage('add-transaction');
        
        // Focus on description field
        document.getElementById('description').focus();
        announceStatus('Editing transaction. Press Escape to cancel.');
    }
}

/**
 * Handles deleting a transaction
 */
function handleDelete(id) {
    const transaction = getTransaction(id);
    
    if (!transaction) {
        return;
    }
    
    const confirmed = confirm(`Delete transaction "${transaction.description}"?`);
    
    if (confirmed) {
        deleteTransaction(id);
        announceStatus('Transaction deleted');
        refreshDisplay();
    }
}

/**
 * Handles search input
 */
function handleSearch() {
    const input = document.getElementById('search-input').value;
    const caseSensitive = document.getElementById('case-sensitive').checked;
    
    if (!input.trim()) {
        setSearchPattern(null);
        refreshTransactionsDisplay();
        return;
    }
    
    const pattern = compileRegex(input, caseSensitive);
    
    if (!pattern) {
        announceStatus('Invalid regex pattern', 'assertive');
        return;
    }
    
    setSearchPattern(pattern);
    refreshTransactionsDisplay();
    
    const transactions = getTransactions();
    const filtered = filterTransactions(transactions, pattern);
    announceStatus(`Found ${filtered.length} matching transaction(s)`);
}

/**
 * Handles clear search button
 */
function handleClearSearch() {
    document.getElementById('search-input').value = '';
    document.getElementById('case-sensitive').checked = false;
    setSearchPattern(null);
    refreshTransactionsDisplay();
    announceStatus('Search cleared');
}

/**
 * Handles sort change
 */
function handleSort() {
    const sortBy = document.getElementById('sort-by').value;
    setSortBy(sortBy);
    refreshTransactionsDisplay();
}

/**
 * Handles saving budget cap
 */
function handleSaveBudget() {
    const budgetCap = parseFloat(document.getElementById('budget-cap').value);
    
    if (isNaN(budgetCap) || budgetCap < 0) {
        announceStatus('Invalid budget amount', 'assertive');
        return;
    }
    
    const settings = getSettings();
    updateSettings({ ...settings, budgetCap });
    
    announceStatus('Budget cap saved');
    refreshDisplay();
}

/**
 * Handles saving exchange rates
 */
function handleSaveRates() {
    const eurRate = parseFloat(document.getElementById('rate-eur').value);
    const gbpRate = parseFloat(document.getElementById('rate-gbp').value);
    
    if (isNaN(eurRate) || isNaN(gbpRate) || eurRate <= 0 || gbpRate <= 0) {
        announceStatus('Invalid exchange rates', 'assertive');
        return;
    }
    
    const settings = getSettings();
    updateSettings({
        ...settings,
        exchangeRates: { EUR: eurRate, GBP: gbpRate }
    });
    
    announceStatus('Exchange rates saved');
    handleConvert();
}

/**
 * Handles currency conversion
 */
function handleConvert() {
    const amount = parseFloat(document.getElementById('convert-amount').value);
    const settings = getSettings();
    
    updateCurrencyConverter(amount, settings.exchangeRates);
}

/**
 * Handles export to JSON
 */
function handleExport() {
    const transactions = getTransactions();
    
    if (transactions.length === 0) {
        announceStatus('No transactions to export', 'assertive');
        return;
    }
    
    exportToJSON(transactions);
    announceStatus('Transactions exported successfully');
}

/**
 * Handles import from JSON
 */
function handleImport(e) {
    const file = e.target.files[0];
    
    if (!file) {
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = (event) => {
        try {
            const data = JSON.parse(event.target.result);
            const validation = validateImportData(data);
            
            if (!validation.valid) {
                announceStatus(validation.message, 'assertive');
                return;
            }
            
            const confirmed = confirm(
                `Import ${validation.data.length} transaction(s)? This will replace all current data.`
            );
            
            if (confirmed) {
                setTransactions(validation.data);
                refreshDisplay();
                announceStatus(validation.message);
            }
        } catch (error) {
            announceStatus('Error reading file. Make sure it\'s a valid JSON file.', 'assertive');
        }
        
        // Reset file input
        e.target.value = '';
    };
    
    reader.onerror = () => {
        announceStatus('Error reading file', 'assertive');
        e.target.value = '';
    };
    
    reader.readAsText(file);
}

/**
 * Handles clear all data
 */
function handleClearAll() {
    const confirmed = confirm(
        'Are you sure you want to delete ALL transactions? This cannot be undone.'
    );
    
    if (confirmed) {
        clearAllTransactions();
        refreshDisplay();
        announceStatus('All transactions deleted');
    }
}

/**
 * Refreshes all displays
 */
function refreshDisplay() {
    const transactions = getTransactions();
    updateDashboard(transactions);
    refreshTransactionsDisplay();
}

/**
 * Refreshes only the transactions display
 */
function refreshTransactionsDisplay() {
    let transactions = getTransactions();
    const searchPattern = getSearchPattern();
    const sortBy = getSortBy();
    
    // Filter by search
    transactions = filterTransactions(transactions, searchPattern);
    
    // Sort
    transactions = sortTransactions(transactions, sortBy);
    
    // Render
    renderTransactions(transactions, searchPattern);
}