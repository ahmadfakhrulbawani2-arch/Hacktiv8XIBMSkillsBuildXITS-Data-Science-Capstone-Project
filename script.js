/**
 * ============================================================
 * Bank Account Dashboard — script.js
 * ============================================================
 * Responsibilities:
 *  1. Load JSON data from data/transactions_history.json
 *  2. Render KPI cards
 *  3. Render Chart.js charts (balance trend, expense bar, revenue bar)
 *  4. Render & filter transaction history table
 *  5. Handle "Add Transaction" form
 *  6. Dark / Light mode toggle
 * ============================================================
 */

"use strict";

// ── Global state ─────────────────────────────────────────────
/** @type {{ account: object, transactions: object[] }} */
let DATA = { account: {}, transactions: [] };

/** Filtered + sorted subset currently shown in the table */
let filteredTransactions = [];

/** Chart instances – kept so we can destroy & re-draw on theme switch */
let chartBalance = null;
let chartExpense = null;
let chartRevenue = null;

// ── Constants ─────────────────────────────────────────────────
const DATA_URL = "data/transactions_history.json";
const CURRENCY = "USD";

/** Colour palette for charts — consistent across light/dark */
const PALETTE = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#06b6d4",
  "#f97316",
  "#ec4899",
  "#84cc16",
  "#6366f1",
  "#14b8a6",
  "#a855f7",
  "#fb923c",
  "#22c55e",
  "#e11d48",
];

// ════════════════════════════════════════════════════════════
// 1. ENTRY POINT
// ════════════════════════════════════════════════════════════

document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  loadData();
});

// ════════════════════════════════════════════════════════════
// 2. THEME TOGGLE (dark / light mode)
// ════════════════════════════════════════════════════════════

function initTheme() {
  const html = document.documentElement;
  const btn = document.getElementById("themeToggle");
  const iconSun = document.getElementById("iconSun");
  const iconMoon = document.getElementById("iconMoon");

  // Persist preference in localStorage
  const saved = localStorage.getItem("theme");
  if (
    saved === "dark" ||
    (!saved && window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {
    html.classList.add("dark");
    html.classList.remove("light");
  }

  function applyIconState() {
    const isDark = html.classList.contains("dark");
    iconSun.classList.toggle("hidden", !isDark);
    iconMoon.classList.toggle("hidden", isDark);
  }

  applyIconState();

  btn.addEventListener("click", () => {
    html.classList.toggle("dark");
    html.classList.toggle("light");
    const isDark = html.classList.contains("dark");
    localStorage.setItem("theme", isDark ? "dark" : "light");
    applyIconState();
    // Re-draw charts so grid / label colours match new theme
    if (DATA.transactions.length) redrawCharts();
  });
}

// ════════════════════════════════════════════════════════════
// 3. DATA LOADING
// ════════════════════════════════════════════════════════════

async function loadData() {
  try {
    const res = await fetch(DATA_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    DATA = await res.json();

    // Sort transactions by date ascending (safeguard in case JSON is unsorted)
    DATA.transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    initDashboard();
  } catch (err) {
    console.error("Failed to load transaction data:", err);
    document.body.insertAdjacentHTML(
      "afterbegin",
      `<div class="fixed inset-0 flex items-center justify-center bg-black/50 z-50">
         <div class="bg-white dark:bg-gray-900 rounded-2xl p-8 max-w-sm text-center shadow-2xl">
           <p class="text-red-500 font-semibold text-lg mb-2">Data Load Error</p>
           <p class="text-sm text-gray-500">${err.message}</p>
           <p class="text-xs mt-3 text-gray-400">Make sure you are serving the files from a local server (e.g. Live Server).</p>
         </div>
       </div>`,
    );
  }
}

// ════════════════════════════════════════════════════════════
// 4. DASHBOARD INITIALISATION
// ════════════════════════════════════════════════════════════

function initDashboard() {
  renderHeaderBadge();
  renderKPIs();
  renderBalanceChart();
  renderExpenseChart();
  renderRevenueChart();
  populateCategoryDropdowns();
  attachTableListeners();
  renderTable();
  attachFormListener();
}

// ════════════════════════════════════════════════════════════
// 5. HEADER BADGE
// ════════════════════════════════════════════════════════════

function renderHeaderBadge() {
  const { account } = DATA;
  document.getElementById("headerAccountType").textContent =
    account.type || "Account";
  document.getElementById("headerCurrency").textContent =
    account.currency || CURRENCY;
  document.getElementById("headerAccountBadge").classList.remove("hidden");
}

// ════════════════════════════════════════════════════════════
// 6. KPI CARDS
// ════════════════════════════════════════════════════════════

function renderKPIs() {
  const txns = DATA.transactions;

  // Total revenue = sum of all credit values
  const credits = txns.filter((t) => t.credit !== null && t.credit > 0);
  const totalRevenue = credits.reduce((s, t) => s + t.credit, 0);

  // Total expense = sum of all debit values
  const debits = txns.filter((t) => t.debit !== null && t.debit > 0);
  const totalExpense = debits.reduce((s, t) => s + t.debit, 0);

  // Average daily balance: get last balance entry for each calendar day
  const dailyBalances = getDailyBalances(txns);
  const avgBalance = dailyBalances.length
    ? dailyBalances.reduce((s, d) => s + d.balance, 0) / dailyBalances.length
    : 0;

  // Net cash flow
  const net = totalRevenue - totalExpense;

  // Update DOM
  document.getElementById("kpiRevenue").textContent = fmt(totalRevenue);
  document.getElementById("kpiRevenueCount").textContent =
    `${credits.length} transactions`;
  document.getElementById("kpiExpense").textContent = fmt(totalExpense);
  document.getElementById("kpiExpenseCount").textContent =
    `${debits.length} transactions`;
  document.getElementById("kpiAvgBalance").textContent = fmt(avgBalance);
  document.getElementById("kpiPeriod").textContent =
    `over ${dailyBalances.length} days`;

  const netEl = document.getElementById("kpiNet");
  netEl.textContent = (net >= 0 ? "+" : "") + fmt(net);
  netEl.className =
    "kpi-value " +
    (net >= 0
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400");
}

/**
 * Returns an array of { date, balance } — the last balance of each calendar day.
 * @param {object[]} txns – sorted ascending by date
 * @returns {{ date: string, balance: number }[]}
 */
function getDailyBalances(txns) {
  const map = new Map(); // date string → balance
  for (const t of txns) {
    map.set(t.date, t.balance); // later entries overwrite, giving last-of-day balance
  }
  return Array.from(map.entries()).map(([date, balance]) => ({
    date,
    balance,
  }));
}

// ════════════════════════════════════════════════════════════
// 7. CHARTS
// ════════════════════════════════════════════════════════════

/** Returns Chart.js default options adapted to current theme */
function chartDefaults() {
  const isDark = document.documentElement.classList.contains("dark");
  return {
    gridColor: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.07)",
    tickColor: isDark ? "#9ca3af" : "#6b7280",
    legendColor: isDark ? "#d1d5db" : "#374151",
  };
}

/** Re-draws all three charts (called after theme toggle) */
function redrawCharts() {
  renderBalanceChart();
  renderExpenseChart();
  renderRevenueChart();
}

// ── 7a. Balance trend (line chart, last 30 days) ─────────────

function renderBalanceChart() {
  if (chartBalance) {
    chartBalance.destroy();
    chartBalance = null;
  }

  const txns = DATA.transactions;
  const daily = getDailyBalances(txns);

  // Take the last 30 calendar days that appear in the data
  const last30 = daily.slice(-30);
  const labels = last30.map((d) => fmtDateShort(d.date));
  const values = last30.map((d) => d.balance);

  const { gridColor, tickColor, legendColor } = chartDefaults();
  const ctx = document.getElementById("chartBalance").getContext("2d");

  // Gradient fill
  const gradient = ctx.createLinearGradient(0, 0, 0, 256);
  gradient.addColorStop(0, "rgba(59,130,246,0.35)");
  gradient.addColorStop(1, "rgba(59,130,246,0)");

  chartBalance = new Chart(ctx, {
    type: "line",
    data: {
      labels,
      datasets: [
        {
          label: "Balance (USD)",
          data: values,
          borderColor: "#3b82f6",
          backgroundColor: gradient,
          borderWidth: 2.5,
          pointRadius: 3,
          pointHoverRadius: 6,
          pointBackgroundColor: "#3b82f6",
          fill: true,
          tension: 0.35,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: "index", intersect: false },
      plugins: {
        legend: { labels: { color: legendColor, font: { size: 12 } } },
        tooltip: {
          callbacks: {
            label: (ctx) => ` Balance: ${fmt(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: tickColor, maxRotation: 45, font: { size: 10 } },
          grid: { color: gridColor },
        },
        y: {
          ticks: {
            color: tickColor,
            font: { size: 10 },
            callback: (v) => "$" + v.toLocaleString(),
          },
          grid: { color: gridColor },
        },
      },
    },
  });
}

// ── 7b. Expense by Category (horizontal bar chart) ───────────

function renderExpenseChart() {
  if (chartExpense) {
    chartExpense.destroy();
    chartExpense = null;
  }

  const expByCategory = aggregateByCategory(
    DATA.transactions.filter((t) => t.debit !== null && t.debit > 0),
    "debit",
  );

  // Sort by value descending for readability
  const sorted = Object.entries(expByCategory).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map((e) => e[0]);
  const values = sorted.map((e) => e[1]);

  const { gridColor, tickColor, legendColor } = chartDefaults();
  const ctx = document.getElementById("chartExpense").getContext("2d");

  chartExpense = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Expense (USD)",
          data: values,
          backgroundColor: labels.map(
            (_, i) => PALETTE[i % PALETTE.length] + "cc",
          ),
          borderColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      indexAxis: "y",
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${fmt(ctx.parsed.x)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: {
            color: tickColor,
            font: { size: 10 },
            callback: (v) => "$" + v.toLocaleString(),
          },
          grid: { color: gridColor },
        },
        y: {
          ticks: { color: tickColor, font: { size: 10 } },
          grid: { display: false },
        },
      },
    },
  });
}

// ── 7c. Revenue by Category (vertical bar chart) ─────────────

function renderRevenueChart() {
  if (chartRevenue) {
    chartRevenue.destroy();
    chartRevenue = null;
  }

  const revByCategory = aggregateByCategory(
    DATA.transactions.filter((t) => t.credit !== null && t.credit > 0),
    "credit",
  );

  const sorted = Object.entries(revByCategory).sort((a, b) => b[1] - a[1]);
  const labels = sorted.map((e) => e[0]);
  const values = sorted.map((e) => e[1]);

  const { gridColor, tickColor } = chartDefaults();
  const ctx = document.getElementById("chartRevenue").getContext("2d");

  chartRevenue = new Chart(ctx, {
    type: "bar",
    data: {
      labels,
      datasets: [
        {
          label: "Revenue (USD)",
          data: values,
          backgroundColor: labels.map(
            (_, i) => PALETTE[i % PALETTE.length] + "cc",
          ),
          borderColor: labels.map((_, i) => PALETTE[i % PALETTE.length]),
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx) => ` ${fmt(ctx.parsed.y)}`,
          },
        },
      },
      scales: {
        x: {
          ticks: { color: tickColor, font: { size: 11 } },
          grid: { display: false },
        },
        y: {
          ticks: {
            color: tickColor,
            font: { size: 10 },
            callback: (v) => "$" + v.toLocaleString(),
          },
          grid: { color: chartDefaults().gridColor },
        },
      },
    },
  });
}

/**
 * Groups transaction values by category.
 * @param {object[]} txns
 * @param {'debit'|'credit'} field
 * @returns {Record<string, number>}
 */
function aggregateByCategory(txns, field) {
  return txns.reduce((acc, t) => {
    const cat = t.category || "Uncategorized";
    acc[cat] = (acc[cat] || 0) + (t[field] || 0);
    return acc;
  }, {});
}

// ════════════════════════════════════════════════════════════
// 8. TRANSACTION TABLE
// ════════════════════════════════════════════════════════════

/** Collects unique categories from all transactions and populates <select> dropdowns */
function populateCategoryDropdowns() {
  const categories = [
    ...new Set(DATA.transactions.map((t) => t.category)),
  ].sort();
  const selectors = ["#filterCategory", "#fCategory"];

  selectors.forEach((sel) => {
    const el = document.querySelector(sel);
    if (!el) return;
    const isFilter = sel === "#filterCategory";
    if (!isFilter) {
      // Clear existing options except the placeholder
      while (el.options.length > 1) el.remove(1);
    }
    categories.forEach((cat) => {
      const opt = document.createElement("option");
      opt.value = cat;
      opt.textContent = cat;
      el.appendChild(opt);
    });
  });
}

/** Attaches change/input listeners for search, filter, sort controls */
function attachTableListeners() {
  ["searchInput", "filterCategory", "sortBy", "filterType"].forEach((id) => {
    document.getElementById(id).addEventListener("input", renderTable);
  });
}

/** Reads current filter/sort state and re-renders the table body */
function renderTable() {
  const search = document
    .getElementById("searchInput")
    .value.trim()
    .toLowerCase();
  const category = document.getElementById("filterCategory").value;
  const sortBy = document.getElementById("sortBy").value;
  const typeFilter = document.getElementById("filterType").value;

  // 1. Filter
  filteredTransactions = DATA.transactions.filter((t) => {
    const matchSearch =
      !search ||
      t.description.toLowerCase().includes(search) ||
      t.transaction_id.toLowerCase().includes(search);
    const matchCategory = !category || t.category === category;
    const matchType =
      !typeFilter ||
      (typeFilter === "credit" && t.credit !== null) ||
      (typeFilter === "debit" && t.debit !== null);
    return matchSearch && matchCategory && matchType;
  });

  // 2. Sort
  filteredTransactions.sort((a, b) => {
    switch (sortBy) {
      case "date-asc":
        return new Date(a.date) - new Date(b.date);
      case "date-desc":
        return new Date(b.date) - new Date(a.date);
      case "description-asc":
        return a.description.localeCompare(b.description);
      case "description-desc":
        return b.description.localeCompare(a.description);
      case "amount-desc":
        return getAmount(b) - getAmount(a);
      case "amount-asc":
        return getAmount(a) - getAmount(b);
      default:
        return 0;
    }
  });

  // 3. Render rows
  const tbody = document.getElementById("transactionTableBody");
  const empty = document.getElementById("emptyState");
  const countEl = document.getElementById("resultCount");

  tbody.innerHTML = "";

  if (filteredTransactions.length === 0) {
    empty.classList.remove("hidden");
    countEl.textContent = "No results found.";
    return;
  }

  empty.classList.add("hidden");
  countEl.textContent = `Showing ${filteredTransactions.length} of ${DATA.transactions.length} transactions`;

  const fragment = document.createDocumentFragment();
  filteredTransactions.forEach((t, idx) => {
    const tr = document.createElement("tr");
    tr.className =
      "table-row" +
      (idx % 2 === 0
        ? " bg-white dark:bg-gray-900"
        : " bg-gray-50/60 dark:bg-gray-800/40");

    const isCredit = t.credit !== null && t.credit > 0;
    const isDebit = t.debit !== null && t.debit > 0;

    tr.innerHTML = `
      <td class="td-cell text-gray-500 dark:text-gray-400 whitespace-nowrap">${fmtDate(t.date)}</td>
      <td class="td-cell font-mono text-xs text-gray-400 dark:text-gray-500">${escHtml(t.transaction_id)}</td>
      <td class="td-cell font-medium max-w-[220px] truncate" title="${escHtml(t.description)}">${escHtml(t.description)}</td>
      <td class="td-cell">
        <span class="category-badge">${escHtml(t.category)}</span>
      </td>
      <td class="td-cell text-gray-500 dark:text-gray-400 text-xs whitespace-nowrap">${escHtml(t.channel)}</td>
      <td class="td-cell text-right font-medium ${isDebit ? "text-red-600 dark:text-red-400" : "text-gray-300 dark:text-gray-700"}">
        ${isDebit ? fmt(t.debit) : "—"}
      </td>
      <td class="td-cell text-right font-medium ${isCredit ? "text-green-600 dark:text-green-400" : "text-gray-300 dark:text-gray-700"}">
        ${isCredit ? fmt(t.credit) : "—"}
      </td>
      <td class="td-cell text-right font-semibold text-gray-700 dark:text-gray-200 whitespace-nowrap">${fmt(t.balance)}</td>
    `;
    fragment.appendChild(tr);
  });

  tbody.appendChild(fragment);
}

/** Returns the transaction amount (debit or credit) for sorting purposes */
function getAmount(t) {
  return (t.debit ?? 0) + (t.credit ?? 0);
}

// ════════════════════════════════════════════════════════════
// 9. ADD TRANSACTION FORM
// ════════════════════════════════════════════════════════════

function attachFormListener() {
  const form = document.getElementById("addTransactionForm");
  const msgEl = document.getElementById("formMsg");

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Read values
    const date = document.getElementById("fDate").value;
    const description = document
      .getElementById("fDesc")
      .value.trim()
      .toUpperCase();
    const category = document.getElementById("fCategory").value;
    const channel =
      document.getElementById("fChannel").value || "Online Transfer";
    const type = document.getElementById("fType").value;
    const amount = parseFloat(document.getElementById("fAmount").value);

    // Validation
    if (
      !date ||
      !description ||
      !category ||
      !type ||
      isNaN(amount) ||
      amount <= 0
    ) {
      showFormMsg(
        msgEl,
        "Please fill in all required fields with valid values.",
        "error",
      );
      return;
    }

    // Build new transaction object
    const lastTxn = DATA.transactions[DATA.transactions.length - 1];
    const lastBal = lastTxn
      ? lastTxn.balance
      : DATA.account.opening_balance || 0;
    const newBal = type === "credit" ? lastBal + amount : lastBal - amount;
    const newId = generateTxnId();

    /** @type {object} */
    const newTxn = {
      transaction_id: newId,
      date,
      description,
      category,
      channel,
      debit: type === "debit" ? amount : null,
      credit: type === "credit" ? amount : null,
      balance: parseFloat(newBal.toFixed(2)),
      reference_no:
        "REF" + Math.floor(Math.random() * 9_000_000_000 + 1_000_000_000),
    };

    // Add to data array (insert in date order)
    DATA.transactions.push(newTxn);
    DATA.transactions.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Update account summary totals
    if (type === "credit") {
      DATA.account.total_credits = parseFloat(
        ((DATA.account.total_credits || 0) + amount).toFixed(2),
      );
      DATA.account.closing_balance = newTxn.balance;
    } else {
      DATA.account.total_debits = parseFloat(
        ((DATA.account.total_debits || 0) + amount).toFixed(2),
      );
      DATA.account.closing_balance = newTxn.balance;
    }
    DATA.account.transaction_count = (DATA.account.transaction_count || 0) + 1;

    // Refresh all sections
    renderKPIs();
    redrawCharts();
    populateCategoryDropdowns();
    renderTable();

    // Reset form & show success
    form.reset();
    showFormMsg(msgEl, `Transaction ${newId} added successfully!`, "success");
  });
}

/**
 * Generates a new transaction ID by incrementing the highest existing numeric ID.
 * @returns {string}
 */
function generateTxnId() {
  const maxNum = DATA.transactions.reduce((max, t) => {
    const num = parseInt(t.transaction_id.replace(/\D/g, ""), 10);
    return isNaN(num) ? max : Math.max(max, num);
  }, 0);
  return "TXN" + String(maxNum + 1).padStart(5, "0");
}

/**
 * Shows a feedback message in the form.
 * @param {HTMLElement} el
 * @param {string} msg
 * @param {'success'|'error'} type
 */
function showFormMsg(el, msg, type) {
  el.textContent = msg;
  el.className =
    "text-sm font-medium " +
    (type === "success"
      ? "text-green-600 dark:text-green-400"
      : "text-red-600 dark:text-red-400");
  el.classList.remove("hidden");
  // Auto-hide after 4 seconds
  setTimeout(() => el.classList.add("hidden"), 4000);
}

// ════════════════════════════════════════════════════════════
// 10. UTILITY HELPERS
// ════════════════════════════════════════════════════════════

/**
 * Formats a number as USD currency.
 * @param {number} n
 * @returns {string}
 */
function fmt(n) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(n);
}

/**
 * Formats a date string "YYYY-MM-DD" to "DD MMM YYYY".
 * @param {string} dateStr
 * @returns {string}
 */
function fmtDate(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formats a date string for chart axis labels (e.g. "01 Jul").
 * @param {string} dateStr
 * @returns {string}
 */
function fmtDateShort(dateStr) {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
  });
}

/**
 * Escapes HTML special characters to prevent XSS when inserting user-generated text.
 * @param {string} str
 * @returns {string}
 */
function escHtml(str) {
  const div = document.createElement("div");
  div.textContent = str || "";
  return div.innerHTML;
}
