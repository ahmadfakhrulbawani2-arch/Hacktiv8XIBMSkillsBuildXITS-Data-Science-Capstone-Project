# Hacktiv8XIBMSkillsBuildXITS-Data-Science-Capstone-Project: FakhrulFinance Bank Dashboard

<div align="center">

![FakhrulFinance Bank Dashboard](https://img.shields.io/badge/FakhrulFinance-Bank%20Dashboard-3b82f6?style=for-the-badge&logo=data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIGZpbGw9Im5vbmUiIHZpZXdCb3g9IjAgMCAyNCAyNCIgc3Ryb2tlPSJ3aGl0ZSIgc3Ryb2tlLXdpZHRoPSIyIj48cGF0aCBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGQ9Ik0zIDIxaDE4TTMgMTBoMThNNSAxMFY2bDctMyA3IDN2NE05IDIxdi02aDZ2NiIvPjwvc3ZnPg==)
![HTML5](https://img.shields.io/badge/HTML5-Semantic-e34f26?style=flat-square&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-Custom-1572b6?style=flat-square&logo=css3&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind%20CSS-v3-06b6d4?style=flat-square&logo=tailwindcss&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-Vanilla%20ES6+-f7df1e?style=flat-square&logo=javascript&logoColor=black)

<!-- ![Chart.js](https://img.shields.io/badge/Chart.js-v4.4.3-ff6384?style=flat-square&logo=chartdotjs&logoColor=white)
![IBM Bob](https://img.shields.io/badge/Built%20with-IBM%20Bob-054ada?style=flat-square&logo=ibm&logoColor=white) -->

</div>

---

## 📋 Description

**FakhrulFinance Bank Dashboard** is a modern, interactive, and responsive bank account analytics dashboard. It is built with **HTML5**, **Tailwind CSS**, **Vanilla JavaScript**, and **Chart.js** — no additional frontend frameworks or build tools required.

The dashboard reads directly from a local JSON data source (`data/transactions_history.json`) to visualise **154 real transactions** spanning a 3-month period (July – September 2026), covering a Checking account in USD.

> 🤖 This project was entirely designed and generated with the assistance of **IBM Bob** (IBM's AI software engineering assistant), based on a detailed prompt specification by the project author.

---

## 🚀 Getting Started

### Prerequisites

No installation needed. The project uses CDN-hosted libraries:

| Library                                 | Version  | Purpose               |
| --------------------------------------- | -------- | --------------------- |
| [Tailwind CSS](https://tailwindcss.com) | v3 (CDN) | Utility-first styling |
| [Chart.js](https://www.chartjs.org)     | v4.4.3   | Data visualisation    |

### Running the Dashboard

> ⚠️ **Must be served via a local HTTP server** — direct `file://` open is blocked by browser CORS policy when fetching JSON.

**Option 1 — VS Code Live Server (recommended)**

1. Install the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension
2. Right-click `index.html` → **"Open with Live Server"**

**Option 2 — Node.js**

```bash
npx serve .
```

**Option 3 — Python**

```bash
python -m http.server 8080
```

Then open `http://localhost:<port>` in your browser.

---

## 📁 Project Structure

```
capstone-2/
├── data/
│   └── transactions_history.json   # Source data: 154 transactions, 3-month period
├── index.html                       # Semantic HTML structure + CDN imports
├── script.js                        # All application logic (modular, commented)
├── style.css                        # Custom component styles (supplements Tailwind)
└── README.md                        # This file
```

---

## ✨ Features

### 📊 KPI Cards

Four summary cards at the top of the dashboard, all computed directly from JSON data:

| Card                  | Metric                                                   |
| --------------------- | -------------------------------------------------------- |
| **Total Revenue**     | Sum of all `credit` transactions + transaction count     |
| **Total Expense**     | Sum of all `debit` transactions + transaction count      |
| **Avg Daily Balance** | Mean of the last balance value recorded per calendar day |
| **Net Cash Flow**     | Revenue − Expense (green if positive, red if negative)   |

### 📈 Data Visualisations (Chart.js)

| Chart                   | Type           | Description                                              |
| ----------------------- | -------------- | -------------------------------------------------------- |
| **Account Balance**     | Line Chart     | Last 30 calendar days — balance trend with gradient fill |
| **Expense by Category** | Horizontal Bar | Total spend per category, sorted highest first           |
| **Revenue by Category** | Vertical Bar   | Total income per category                                |

All charts re-render automatically when the theme is toggled (dark/light) to match the colour scheme.

### ➕ Add Transaction Form

- Fields: Date, Description, Category (dynamic dropdown), Channel, Type (Credit/Debit), Amount
- Full client-side validation — all required fields enforced
- On successful submit: KPI cards, all charts, and the history table update instantly **without page reload**
- New transaction ID auto-generated sequentially (e.g. `TXN00155`)

### 🗂 Transaction History Table

- **154 rows** of transaction data displayed in a sortable, filterable table
- **Search** — filter by description or transaction ID
- **Filter by Category** — dynamic dropdown populated from JSON categories
- **Filter by Type** — All / Revenue (Credit) / Expense (Debit)
- **Sort by** — Date Newest/Oldest, Description A→Z / Z→A, Amount High/Low
- Row count feedback shown after filtering

### 🎨 UI / UX

- **Dark Mode / Light Mode** toggle — preference persisted in `localStorage`, respects OS default
- **Mobile-first responsive** layout — grid collapses from 4 → 2 → 1 column
- **Hover lift** effect on KPI cards (`transform: translateY(-2px)`)
- **Fade-in animation** per section on page load
- **Smooth transitions** on all colour changes during theme switch
- Custom scrollbar, rounded corners, soft shadows, card layout

---

## 📝 Prompt Specification

This dashboard was built by IBM Bob following this exact prompt by the project author:

> _"Anda adalah seorang Senior Data Analyst dan Frontend Engineer yang berpengalaman membangun dashboard analitik modern menggunakan HTML, Tailwind CSS, Vanilla JavaScript dan Chart.js. Tugas Anda adalah menghasilkan dashboard yang informatif, interaktif, mudah dipahami, mengikuti prinsip data visualization, serta siap dijalankan. "_
> _"Buat sebuah dashboard akun bank menggunakan HTML, Tailwind CSS, dan Vanilla Js, dan Chart.js dan file JSON pada folder data sebagai sumber data history. Pisahkan kode ke dalam tiag file yaitu index.html, style.css, dan script.js. Dashboard harus menampilkan KPI (Total Revenue, Total Expense, Average Balance in a day), serta visualisasi account balance 30 hari terakhir, bar chart expense per category, dan bar chart revenue per catgory. Lalu di bagian bawah tambahkan form untuk menambah track baru dan di bawahnya tampilkan semua daftar data historynya. Buat juga filter category dan sort by name atau ascending/descending."_
> _"Buat tampilan yang modern, profesional, responsif (mobile-first), dark mode/light mode, menggunakan card dashboard, rounded corner, soft shadow, hover effect, smooth transition, dan warna yang konsisten. Terapkan HTML semantik, gunakan Tailwind CSS sebagai styling utama dengan style.css hanya untuk styling tambahan jika diperlukan, serta gunakan Vanilla JavaScript tanpa framework. Pastikan kode rapi, modular, mudah dipelajari, bebas error, berikan komentar pada bagian penting, dan seluruh visualisasi mengambil data langsung dari file JSON tanpa menggunakan data dummy."_

### What IBM Bob Built

Based on the prompt above, IBM Bob produced the following deliverables:

| File         | Lines | Responsibility                                                                                                                     |
| ------------ | ----- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `index.html` | ~280  | Semantic HTML5 layout, all Tailwind utility classes, CDN links for Tailwind and Chart.js                                           |
| `script.js`  | ~490  | Data fetching, KPI computation, Chart.js rendering, table filtering/sorting, form logic, dark mode toggle                          |
| `style.css`  | ~270  | Reusable component classes (`.card`, `.kpi-card`, `.form-input`, `.btn-primary`, `.table-row`, etc.), custom scrollbar, animations |

IBM Bob additionally:

- Audited all three files for ID/class consistency, Tailwind validity, and JavaScript correctness before delivery
- Used only data from `transactions_history.json` — zero hardcoded dummy values
- Applied modular, well-commented JavaScript following `'use strict'` ES6+ conventions

---

## 🛠 Tech Stack

| Technology                    | Role                                                                                  |
| ----------------------------- | ------------------------------------------------------------------------------------- |
| **HTML5**                     | Semantic structure (`<header>`, `<main>`, `<section>`, `<article>`, `<footer>`)       |
| **Tailwind CSS v3**           | Primary utility-first styling, responsive breakpoints, dark mode via `class` strategy |
| **Vanilla JavaScript (ES6+)** | `fetch`, `async/await`, `Intl.NumberFormat`, `DocumentFragment`, `localStorage`       |
| **Chart.js v4.4.3**           | Line chart, horizontal bar, vertical bar — responsive + theme-aware                   |
| **JSON**                      | Single source of truth for all transaction data                                       |

---

## 📊 Data Overview

| Field             | Value                                                                                                                                                        |
| ----------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Account Type      | Checking                                                                                                                                                     |
| Currency          | USD                                                                                                                                                          |
| Period            | 1 Jul 2026 – 30 Sep 2026                                                                                                                                     |
| Opening Balance   | $4,250.00                                                                                                                                                    |
| Closing Balance   | $5,756.14                                                                                                                                                    |
| Total Credits     | $12,189.61                                                                                                                                                   |
| Total Debits      | $10,683.47                                                                                                                                                   |
| Transaction Count | 154                                                                                                                                                          |
| Categories        | Cash, Dining Out, Groceries, Health & Fitness, Housing, Income, Insurance, Savings, Shopping, Subscriptions, Transport, Transfer In, Transfer Out, Utilities |

---

## 📜 License

This project is submitted as part of the **Hacktiv8 × IBM SkillsBuild × ITS Data Science Capstone Project**. All rights reserved by the author.

---

<div align="center">

Created with 💖 by **Ahmad Fakhrul Bawani** and **IBM Bob** (IBM's AI Software Engineering Assistant)

_Hacktiv8 × IBM SkillsBuild × ITS — Data Science Capstone Project · 2026_

</div>
