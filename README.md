Student Finance Tracker

A modern, accessible finance tracking app with Spotify-inspired design. Built with vanilla HTML, CSS, and JavaScript.

Live Demo: [Your GitHub Pages URL]
Theme Choice

Student Finance Tracker - Track expenses, manage budgets, and analyze spending patterns.
Features

    Dashboard - Real-time stats, budget tracking, and category charts
    Transaction Management - Add, edit, delete, and search transactions
    Regex Search - Powerful pattern-based filtering with highlighting
    Sorting - Sort by date, description, or amount
    Currency Converter - USD, EUR, GBP with custom rates
    Data Persistence - localStorage + JSON import/export
    Fully Accessible - Keyboard navigation, ARIA live regions, screen reader support
    Responsive Design - Mobile-first with 3 breakpoints (360px, 768px, 1024px)

Regex Catalog
Validation Patterns

    Description - ^\S(?:.*\S)?$
        No leading/trailing spaces
        Examples: "Coffee" " Coffee " "Coffee "
    Amount - ^(0|[1-9]\d*)(\.\d{1,2})?$
        Valid numbers with max 2 decimals
        Examples: "12.50" "100" "12.345" "-5"
    Date - ^\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])$
        YYYY-MM-DD format
        Examples: "2025-10-16" "2025-13-01" "10/16/2025"
    Duplicate Words (Advanced) - \b(\w+)\s+\1\b (back-reference)
        Catches repeated consecutive words
        Examples: "coffee coffee" "the the book" "coffee"

Search Patterns

    Cents present: \.\d{2}\b - Finds amounts with cents (e.g., $12.50)
    Beverages: (coffee|tea|juice) - Finds beverage-related transactions
    Case insensitive: Toggle for flexible searching
    Category filter: ^Food$ - Exact category match

Keyboard Navigation

Key	Action
Tab / Shift+Tab	Navigate between elements
Enter / Space	Activate buttons and links
Esc	Cancel edit mode
All form inputs and controls are keyboard accessible	

Accessibility Features

    Semantic HTML - Proper landmarks (<nav>, <main>, <section>)
    ARIA Live Regions - Status announcements (polite/assertive)
    Keyboard Navigation - Full keyboard support, visible focus styles
    Skip Link - Jump to main content
    Labels & Roles - All inputs properly labeled
    Color Contrast - WCAG AA compliant
    Screen Reader Friendly - Descriptive button labels and announcements

Project Structure

finance-tracker/
├── index.html              # Main HTML structure
├── styles/
│   └── style.css          # Spotify-inspired dark theme
├── scripts/
│   ├── app.js             # Main application logic (~220 lines)
│   ├── validators.js      # Regex validation (~80 lines)
│   └── storage.js         # localStorage operations (~50 lines)
├── seed.json              # Sample data (12 transactions)
└── README.md              # This file

Total JavaScript: ~350 lines (streamlined from 800+)
Setup & Installation

    Clone the repository

bash

   git clone https://github.com/SamuzuKofi/finance-tracker.git
   cd finance-tracker

    Open in browser

bash

   # No build process needed!
   open index.html
   # or use Live Server in VS Code

    Import sample data
        Go to Settings → Import JSON
        Select seed.json

Testing
Manual Testing

    Form Validation
        Try submitting empty fields
        Enter "coffee coffee" (duplicate words)
        Enter "12.345" (too many decimals)
        Enter future date
    Regex Search
        Search: coffee|tea (finds beverages)
        Search: \.\d{2}\b (finds amounts with cents)
        Search: ^Food$ (exact category)
        Test invalid regex: [invalid]
    Keyboard Navigation
        Tab through all elements
        Use Enter/Space on buttons
        Press Esc during edit
    Import/Export
        Export data to JSON
        Clear all data
        Re-import the exported file

Edge Cases Tested

    Empty state (no transactions)
    Large amounts (999,999.99)
    Very long descriptions (100 chars)
    Special characters in descriptions
    Same-day multiple transactions
    Budget overage scenarios

Assignment Compliance
Milestones Completed

    M1 - Spec & wireframes (Spotify-inspired dark theme)
    M2 - Semantic HTML & mobile-first CSS
    M3 - 4+ regex validations (incl. back-reference)
    M4 - Rendering, sorting, regex search with highlighting
    M5 - Dashboard stats, budget cap, ARIA live updates
    M6 - localStorage, JSON import/export, settings
    M7 - Accessibility audit, animations, documentation

Requirements Met

    ES Modules - Modular code structure
    localStorage - Auto-save on all changes
    Regex Validation - 4+ patterns including advanced back-reference
    Responsive - 3 breakpoints (360px, 768px, 1024px)
    Accessibility - Full keyboard support, ARIA, semantic HTML
    Animation - Smooth transitions and fade-ins
    No Frameworks - Pure vanilla JavaScript

Design Philosophy

Spotify-inspired aesthetic:

    Dark theme with #121212 background
    Accent green (#1db954) for primary actions
    Card-based layouts with hover effects
    Smooth animations and transitions
    Clean, modern typography
    Mobile-first responsive design

Data Privacy

    All data stored locally in browser (localStorage)
    No external APIs or tracking
    No data sent to servers
    Full user control with export/clear options

Contact

Developer: Sedem Amuzu
GitHub: @SamuzuKofi
Email: s.amuzu@alustudent.com

Note: This project uses no frameworks or libraries. All functionality is implemented in vanilla JavaScript with ES6 modules.
