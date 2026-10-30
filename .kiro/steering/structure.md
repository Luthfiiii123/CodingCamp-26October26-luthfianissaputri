# Project Structure

```
/
├── index.html          # Single HTML page — all markup lives here
├── css/
│   └── style.css       # All styles — theming, layout, components
└── js/
    └── script.js       # All application logic
```

## JavaScript Architecture (`script.js`)
The JS is organized into named module objects (plain object literals with methods), called in sequence at the bottom via an IIFE:

| Module | Responsibility |
|---|---|
| `Storage` | Read/write `localStorage` |
| `Transactions` | Add, delete, and retrieve transaction records |
| `Validation` | Form input validation; shows/clears inline errors |
| `Render` | DOM updates — transaction list, totals, monthly summary |
| `Chart` | Manages the single Chart.js pie chart instance |
| `Sort` | Sorts a transaction array by date, amount, or category |
| `Theme` | Applies and persists dark/light mode |

The `init` IIFE at the bottom wires all event listeners (form submit, delete via delegation, sort buttons, theme toggle).

## CSS Architecture (`style.css`)
Sections are numbered with comment headers:
1. CSS custom properties for theming (`body.light` / `body.dark`)
2. Reset & base
3. Header
4. Main layout (CSS Grid, two columns on desktop → one column on mobile)
5. Cards
6. Form inputs
7. Sort bar
8. Transaction list & items
9. Totals summary
10. Pie chart
11. Monthly summary
12. Footer
13. Responsive breakpoints (`max-width: 768px`, `max-width: 400px`)

## Conventions
- All UI text (labels, placeholders, error messages) is in **Bahasa Indonesia**.
- Category values are English title-case strings: `"Food"`, `"Transport"`, `"Fun"`. CSS classes use lowercase: `dot-food`, `badge-transport`, etc.
- Currency is formatted as `"Rp X.XXX"` using `toLocaleString("id-ID")`.
- Dates are stored as ISO strings (`YYYY-MM-DD`) and displayed as `"DD Mon YYYY"` using the `MONTH_NAMES` constant.
- XSS prevention: user-supplied strings rendered into `innerHTML` must go through `Render._escapeHTML()`.
- Event delegation is used for delete buttons — one listener on the list container, not individual buttons.
- The `Chart` module is an IIFE returning `{ update }` to prevent multiple chart instances. Access it as `Chart.update(transactions)`.
