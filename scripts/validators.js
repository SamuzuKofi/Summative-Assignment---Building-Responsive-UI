// validators.js - Regex validation (streamlined)

// Regex patterns
const patterns = {
    desc: /^\S(?:.*\S)?$/,                                    // No leading/trailing spaces
    amt: /^(0|[1-9]\d*)(\.\d{1,2})?$/,                       // Valid amount with 2 decimals
    date: /^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$/,  // YYYY-MM-DD
    dupWord: /\b(\w+)\s+\1\b/i                                // Duplicate words (back-reference)
};

/**
 * Validates all transaction fields
 * @param {object} txn - Transaction data
 * @returns {object} - Object with error messages
 */
export function validate(txn) {
    const errors = {};
    
    // Description
    if (!txn.description?.trim()) {
        errors.description = 'Description required';
    } else if (!patterns.desc.test(txn.description)) {
        errors.description = 'Remove extra spaces';
    } else if (patterns.dupWord.test(txn.description)) {
        errors.description = 'Duplicate words detected';
    } else if (txn.description.length < 3) {
        errors.description = 'Min 3 characters';
    } else if (txn.description.length > 100) {
        errors.description = 'Max 100 characters';
    }
    
    // Amount
    if (!txn.amount?.trim()) {
        errors.amount = 'Amount required';
    } else if (!patterns.amt.test(txn.amount)) {
        errors.amount = 'Invalid format (e.g., 12.50)';
    } else if (parseFloat(txn.amount) <= 0) {
        errors.amount = 'Must be greater than 0';
    } else if (parseFloat(txn.amount) > 999999.99) {
        errors.amount = 'Amount too large';
    }
    
    // Category
    if (!txn.category?.trim()) {
        errors.category = 'Category required';
    }
    
    // Date
    if (!txn.date?.trim()) {
        errors.date = 'Date required';
    } else if (!patterns.date.test(txn.date)) {
        errors.date = 'Format: YYYY-MM-DD';
    } else {
        const d = new Date(txn.date);
        if (isNaN(d.getTime())) {
            errors.date = 'Invalid date';
        } else if (d > new Date()) {
            errors.date = 'Cannot be in future';
        }
    }
    
    return errors;
}

/**
 * Compiles a regex pattern safely
 * @param {string} pattern - User input pattern
 * @param {boolean} caseSensitive - Case sensitivity flag
 * @returns {RegExp|null} - Compiled regex or null
 */
export function compileRegex(pattern, caseSensitive = false) {
    if (!pattern?.trim()) return null;
    
    try {
        return new RegExp(pattern, caseSensitive ? 'g' : 'gi');
    } catch {
        return null;
    }
}

// Export patterns for testing
export { patterns };