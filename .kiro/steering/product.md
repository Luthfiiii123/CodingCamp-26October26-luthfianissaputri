# Product: Expense & Budget Visualizer

A single-page web app for tracking personal expenses, built as part of the **RevoU Software Engineering Mini Bootcamp**.

## Core Features
- Add expense transactions with a name, amount (in Indonesian Rupiah), and one of three categories: Food, Transport, Fun
- Delete individual transactions (with confirmation dialog)
- Sort transaction list by date, amount, or category
- Breakdown summary of spending per category
- Pie chart visualization of spending distribution (via Chart.js)
- Monthly spending summary
- Dark/light mode toggle with persistence

## Target Users
Indonesian-speaking users tracking daily personal expenses. All UI copy is in **Bahasa Indonesia**.

## Data Persistence
All data (transactions and theme preference) is stored in `localStorage`. There is no backend or server.
