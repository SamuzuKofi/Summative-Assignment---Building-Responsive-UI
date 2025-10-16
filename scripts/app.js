// app.js - Main application logic (streamlined)

import { validate, compileRegex } from './validators.js';
import { storage } from './storage.js';

// State
let data = storage.load();
let settings = storage.loadSettings();
let searchRe = null;
let sortBy = 'date-desc';
let editId = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    setupNav();
    setupForm();
    setupSearch();
    setupSettings();
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    render();
});

// Navigation
function setupNav() {
    document.querySelectorAll('nav a').forEach(link => {
        link.addEventListener('click', e => {
            e.preventDefault();
            const page = link.dataset.page;
            document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
            link.classList.add('active');
            document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
            document.getElementById(page).classList.add('active');
            if (page === 'dashboard') render();
            if (page === 'settings') updateSettingsUI();
        });
    });
}

// Form
function setupForm() {
    const form = document.getElementById('form');
    
    form.addEventListener('submit', e => {
        e.preventDefault();
        
        const txn = {
            description: document.getElementById('desc').value,
            amount: document.getElementById('amt').value,
            category: document.getElementById('cat').value,
            date: document.getElementById('date').value
        };
        
        const errors = validate(txn);
        clearErrors();
        
        if (Object.keys(errors).length > 0) {
            Object.entries(errors).forEach(([k, msg]) => {
                document.getElementById(`err-${k}`).textContent = msg;
                document.getElementById(k === 'description' ? 'desc' : k === 'amount' ? 'amt' : k === 'category' ? 'cat' : k).classList.add('error');
            });
            announce('Please fix errors', true);
            return;
        }
        
        if (editId) {
            const idx = data.findIndex(t => t.id === editId);
            data[idx] = { ...data[idx], ...txn, amount: parseFloat(txn.amount), updatedAt: new Date().toISOString() };
            announce('Transaction updated');
        } else {
            data.push({
                id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                ...txn,
                amount: parseFloat(txn.amount),
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            });
            announce('Transaction added');
        }
        
        storage.save(data);
        resetForm();
        render();
        showPage('transactions');
    });
    
    document.getElementById('cancel').addEventListener('click', resetForm);
    
    // Clear errors on input
    ['desc', 'amt', 'cat', 'date'].forEach(id => {
        document.getElementById(id).addEventListener('input', () => {
            document.getElementById(`err-${id}`).textContent = '';
            document.getElementById(id).classList.remove('error');
        });
    });
    
    // Escape key
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && editId) resetForm();
    });
}

// Search & Sort
function setupSearch() {
    document.getElementById('search').addEventListener('input', handleSearch);
    document.getElementById('case').addEventListener('change', handleSearch);
    document.getElementById('sort').addEventListener('change', e => {
        sortBy = e.target.value;
        renderTransactions();
    });
    document.getElementById('clear-search').addEventListener('click', () => {
        document.getElementById('search').value = '';
        document.getElementById('case').checked = false;
        searchRe = null;
        renderTransactions();
    });
}

function handleSearch() {
    const input = document.getElementById('search').value;
    const caseSensitive = document.getElementById('case').checked;
    searchRe = input.trim() ? compileRegex(input, caseSensitive) : null;
    if (input.trim() && !searchRe) announce('Invalid regex', true);
    renderTransactions();
}

// Settings
function setupSettings() {
    document.getElementById('save-budget').addEventListener('click', () => {
        settings.budgetCap = parseFloat(document.getElementById('budget-input').value);
        storage.saveSettings(settings);
        announce('Budget saved');
        render();
    });
    
    document.getElementById('save-rates').addEventListener('click', () => {
        settings.rates.EUR = parseFloat(document.getElementById('rate-eur').value);
        settings.rates.GBP = parseFloat(document.getElementById('rate-gbp').value);
        storage.saveSettings(settings);
        announce('Rates saved');
    });
    
    document.getElementById('convert').addEventListener('input', () => {
        const amt = parseFloat(document.getElementById('convert').value);
        if (amt > 0) {
            document.getElementById('result').innerHTML = `
                <strong>USD:</strong> $${amt.toFixed(2)}<br>
                <strong>EUR:</strong> €${(amt * settings.rates.EUR).toFixed(2)}<br>
                <strong>GBP:</strong> £${(amt * settings.rates.GBP).toFixed(2)}
            `;
        } else {
            document.getElementById('result').textContent = '';
        }
    });
    
    document.getElementById('export').addEventListener('click', () => {
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `finance-${new Date().toISOString().split('T')[0]}.json`;
        a.click();
        URL.revokeObjectURL(url);
        announce('Exported');
    });
    
    document.getElementById('import').addEventListener('change', e => {
        const file = e.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = ev => {
            try {
                const imported = JSON.parse(ev.target.result);
                if (!Array.isArray(imported)) throw new Error('Invalid format');
                
                if (confirm(`Import ${imported.length} transactions? This replaces current data.`)) {
                    data = imported;
                    storage.save(data);
                    render();
                    announce('Imported successfully');
                }
            } catch {
                announce('Invalid JSON file', true);
            }
            e.target.value = '';
        };
        reader.readAsText(file);
    });
    
    document.getElementById('clear-all').addEventListener('click', () => {
        if (confirm('Delete ALL transactions? Cannot be undone.')) {
            data = [];
            storage.save(data);
            render();
            announce('All data cleared');
        }
    });
}

// Render
function render() {
    renderDashboard();
    renderTransactions();
}

function renderDashboard() {
    const total = data.length;
    const spent = data.reduce((sum, t) => sum + t.amount, 0);
    
    // Last 7 days
    const week = new Date();
    week.setDate(week.getDate() - 7);
    const weekSpent = data.filter(t => new Date(t.date) >= week).reduce((sum, t) => sum + t.amount, 0);
    
    // Top category
    const cats = {};
    data.forEach(t => cats[t.category] = (cats[t.category] || 0) + t.amount);
    const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0]?.[0] || '-';
    
    document.getElementById('stat-total').textContent = total;
    document.getElementById('stat-spent').textContent = `$${spent.toFixed(2)}`;
    document.getElementById('stat-cat').textContent = topCat;
    document.getElementById('stat-week').textContent = `$${weekSpent.toFixed(2)}`;
    
    // Budget
    const remaining = settings.budgetCap - spent;
    const percent = Math.min((spent / settings.budgetCap) * 100, 100);
    document.getElementById('budget-cap').textContent = `$${settings.budgetCap.toFixed(2)}`;
    document.getElementById('budget-amt').textContent = `$${Math.abs(remaining).toFixed(2)}`;
    document.getElementById('budget-text').innerHTML = remaining >= 0 
        ? `Remaining: <strong id="budget-amt">$${remaining.toFixed(2)}</strong>`
        : `Over: <strong id="budget-amt">$${Math.abs(remaining).toFixed(2)}</strong>`;
    document.getElementById('budget-fill').style.width = `${percent}%`;
    document.getElementById('budget-fill').classList.toggle('over', remaining < 0);
    
    // Chart
    const chart = Object.entries(cats).sort((a, b) => b[1] - a[1]).map(([cat, amt]) => {
        const max = Math.max(...Object.values(cats));
        const w = (amt / max) * 100;
        return `
            <div class="row">
                <span class="cat">${cat}</span>
                <div class="track"><div class="progress" style="width: ${w}%"></div></div>
                <span class="amt">$${amt.toFixed(2)}</span>
            </div>
        `;
    }).join('');
    document.getElementById('chart').innerHTML = chart || '<p class="empty">No data yet</p>';
}

function renderTransactions() {
    let filtered = searchRe ? data.filter(t => searchRe.test(`${t.description} ${t.category} ${t.amount}`)) : [...data];
    
    // Sort
    filtered.sort((a, b) => {
        if (sortBy === 'date-desc') return new Date(b.date) - new Date(a.date);
        if (sortBy === 'date-asc') return new Date(a.date) - new Date(b.date);
        if (sortBy === 'desc-asc') return a.description.localeCompare(b.description);
        if (sortBy === 'desc-desc') return b.description.localeCompare(a.description);
        if (sortBy === 'amount-desc') return b.amount - a.amount;
        if (sortBy === 'amount-asc') return a.amount - b.amount;
    });
    
    const list = document.getElementById('txn-list');
    if (filtered.length === 0) {
        list.innerHTML = '<div class="card empty">No transactions found</div>';
        return;
    }
    
    list.innerHTML = filtered.map(t => `
        <div class="card">
            <div class="info">
                <h3>${highlight(t.description)}</h3>
                <div class="meta">${t.date} • ${highlight(t.category)}</div>
            </div>
            <div class="right">
                <div class="amount">${t.amount.toFixed(2)}</div>
                <div class="actions">
                    <button onclick="editTxn('${t.id}')">Edit</button>
                    <button onclick="deleteTxn('${t.id}')" class="danger">Delete</button>
                </div>
            </div>
        </div>
    `).join('');
}

function highlight(text) {
    if (!searchRe) return text;
    return text.replace(searchRe, m => `<mark>${m}</mark>`);
}

// Helpers
function resetForm() {
    document.getElementById('form').reset();
    document.getElementById('edit-id').value = '';
    document.getElementById('form-title').textContent = 'Add Transaction';
    document.getElementById('submit').textContent = 'Add Transaction';
    document.getElementById('date').value = new Date().toISOString().split('T')[0];
    editId = null;
    clearErrors();
}

function clearErrors() {
    ['desc', 'amt', 'cat', 'date'].forEach(id => {
        document.getElementById(`err-${id}`).textContent = '';
        document.getElementById(id).classList.remove('error');
    });
}

function showPage(page) {
    document.querySelectorAll('nav a').forEach(a => a.classList.remove('active'));
    document.querySelector(`[data-page="${page}"]`).classList.add('active');
    document.querySelectorAll('section').forEach(s => s.classList.remove('active'));
    document.getElementById(page).classList.add('active');
}

function updateSettingsUI() {
    document.getElementById('budget-input').value = settings.budgetCap;
    document.getElementById('rate-eur').value = settings.rates.EUR;
    document.getElementById('rate-gbp').value = settings.rates.GBP;
}

function announce(msg, isAlert = false) {
    const el = document.getElementById(isAlert ? 'alert' : 'status');
    el.textContent = msg;
    setTimeout(() => el.textContent = '', 3000);
}

// Global functions for onclick
window.editTxn = (id) => {
    const t = data.find(tx => tx.id === id);
    if (!t) return;
    
    editId = id;
    document.getElementById('desc').value = t.description;
    document.getElementById('amt').value = t.amount;
    document.getElementById('cat').value = t.category;
    document.getElementById('date').value = t.date;
    document.getElementById('form-title').textContent = 'Edit Transaction';
    document.getElementById('submit').textContent = 'Update Transaction';
    showPage('add');
    document.getElementById('desc').focus();
};

window.deleteTxn = (id) => {
    const t = data.find(tx => tx.id === id);
    if (!t || !confirm(`Delete "${t.description}"?`)) return;
    
    data = data.filter(tx => tx.id !== id);
    storage.save(data);
    announce('Transaction deleted');
    render();
};
    