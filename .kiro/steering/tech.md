# Tech Stack

## Languages & Runtime
- **HTML5** — semantic markup, `lang="id"` (Bahasa Indonesia)
- **CSS3** — custom properties (CSS variables) for theming, CSS Grid for layout
- **Vanilla JavaScript (ES6+)** — no framework, no build step, no npm

## External Libraries
- **Chart.js 4.4.0** — loaded via CDN (`cdn.jsdelivr.net`). Referenced as `window.Chart` in JS. Used only for the pie chart.

## Build & Tooling
There is no build system, bundler, transpiler, or package manager. The project runs directly in the browser.

## Running the Project
Open `index.html` in a browser. No server, install step, or CLI command is required.

For a local dev server (optional, for avoiding CORS issues with some browsers):
```
npx serve .
# or
python -m http.server
```

## Browser Storage
`localStorage` only — two keys:
- `expense_transactions` — JSON array of transaction objects
- `expense_theme` — `"light"` or `"dark"`
