// ==========================================================
// SPENDMAP - script.js (LOGIC)
// JavaScript = electricity and plumbing (what makes it WORK).
// Four tools used everywhere in this file:
//   document.getElementById("id")     -> find an element
//   element.value                     -> read what the user typed
//   element.textContent / .innerHTML  -> show text on screen (replaces print)
//   element.addEventListener("click", fn) -> run fn when clicked
// Parts are in this order: 1, 2, 3, 4, 5, 5B, 6 (Part 6 MUST be last).
// ==========================================================


// ==========================================================
// PART 1 | ASSIGN: | DATA AND HELPER FUNCTIONS
// PURPOSE: The system's memory and the shared tools every
// other part uses. (Python: variables in main(), plus
// get_valid_number() and check_limit_warning())
// Note: data resets when the page is refreshed, same as Python.
// ==========================================================

// ----- System data (Python: monthly_budget, expense_amounts, ...) -----
let monthlyBudget = 0;
let dailySpendingLimit = 0;

// Five lists kept "in sync": the SAME position (index) = ONE expense
let expenseAmounts = [];
let expenseCategories = [];
let expenseDescriptions = [];
let expenseSources = [];
let expenseDates = [];   // each date saved as "YYYY-MM-DD" (local time)

// Bank and e-wallet accounts (same position = same account)
let walletNames = ["Cash", "GCash", "Maya", "BPI", "BDO"];
let walletBalances = [0, 0, 0, 0, 0];

// Colors used for categories in the donut chart and the chips
const CATEGORY_COLORS = ["#14b8a6", "#6366f1", "#f59e0b", "#f43f5e", "#06b6d4", "#8b5cf6", "#84cc16", "#ec4899"];
const categoryColorMap = {};   // category name -> its color (stays the same all session)


// formatPHP(amount)
// WHAT: Turns a number into money text. 1500 -> "PHP 1500.00"
// HOW:  toFixed(2) keeps 2 decimals (Python: f"{x:.2f}")
// PURPOSE: Every peso amount on screen looks consistent.
function formatPHP(amount) {
  return "PHP " + Number(amount).toFixed(2);
}


// formatShort(amount)
// WHAT: Short money text without decimals. 38176.4 -> "PHP 38,176"
// PURPOSE: Fits inside the small donut chart.
function formatShort(amount) {
  return "PHP " + Math.round(Number(amount)).toLocaleString("en-US");
}


// sumArray(list)
// WHAT: Adds all numbers in a list (Python: sum(list)).
// HOW:  Loop through the list, keep a running total.
// PURPOSE: Total spent and total wallet balance.
function sumArray(list) {
  let total = 0;
  for (let i = 0; i < list.length; i++) {
    total += Number(list[i]);
  }
  return total;
}


// dateToString(d)
// WHAT: Turns a date into text like "2026-11-24".
// HOW:  padStart(2, "0") makes 5 become "05".
// PURPOSE: Every expense is stamped with the day it was added.
function dateToString(d) {
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return d.getFullYear() + "-" + m + "-" + day;
}


// todayString()
// WHAT: Today's date as text, like "2026-11-24".
function todayString() {
  return dateToString(new Date());
}


// spentOnDate(dateText)
// WHAT: Adds up the expenses recorded on ONE day.
// PURPOSE: Used by spentToday() and by the 7-day chart.
function spentOnDate(dateText) {
  let total = 0;
  for (let i = 0; i < expenseAmounts.length; i++) {
    if (expenseDates[i] === dateText) total += expenseAmounts[i];
  }
  return total;
}


// spentToday()
// WHAT: Adds up only the expenses recorded TODAY.
// PURPOSE: The DAILY limit must be compared with today's
//          spending, not with everything ever spent.
function spentToday() {
  return spentOnDate(todayString());
}


// spentThisMonth()
// WHAT: Adds up only the expenses recorded THIS MONTH.
// HOW:  slice(0, 7) keeps "YYYY-MM" from the date text.
// PURPOSE: The MONTHLY budget is compared with this month only.
function spentThisMonth() {
  const month = todayString().slice(0, 7);
  let total = 0;
  for (let i = 0; i < expenseAmounts.length; i++) {
    if (expenseDates[i].slice(0, 7) === month) total += expenseAmounts[i];
  }
  return total;
}


// categoryColor(name)
// WHAT: Gives each category its own color (same one every time).
// HOW:  First time we see a category, take the next color from
//       CATEGORY_COLORS and remember it in categoryColorMap.
// PURPOSE: The donut, legend and chips match each other.
function categoryColor(name) {
  if (!categoryColorMap[name]) {
    const n = Object.keys(categoryColorMap).length;
    categoryColorMap[name] = CATEGORY_COLORS[n % CATEGORY_COLORS.length];
  }
  return categoryColorMap[name];
}


// getValidNumber(inputId)
// WHAT: Reads a number box. Returns the number, or null if the
//       box is empty, not a number, or negative.
// HOW:  .trim() removes spaces; Number() converts text to a
//       number; isNaN() checks "is Not a Number".
// PURPOSE: Protects the system from bad input (Python:
//          get_valid_number loop). Callers check: if (x === null)
function getValidNumber(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return null;

  const raw = input.value.trim();
  if (raw === "") return null;

  const num = Number(raw);
  if (isNaN(num) || num < 0) return null;

  return num;
}


// showMessage(elementId, text, type)
// WHAT: Puts colored text inside an element.
// HOW:  Sets the text, then sets the CSS classes so the color
//       matches. type = success, error, warning, safe, alert, note
// PURPOSE: Replaces Python print() for feedback messages.
//          An empty text hides the box (CSS :empty rule).
function showMessage(elementId, text, type) {
  const el = document.getElementById(elementId);
  if (!el) return;

  el.textContent = text;
  el.className = text ? "msg " + (type || "note") : "msg";
}


// applyProgress(fillElement, percent, hasBudget)
// WHAT: Sets the width and color of a progress bar.
// HOW:  width = percent (max 100%); orange at 80%+, red when
//       over 100% (CSS classes .warn / .danger).
// PURPOSE: One shared bar logic for the header, Overview, Summary.
function applyProgress(fillElement, percent, hasBudget) {
  if (!fillElement) return;

  fillElement.style.width = Math.min(percent, 100) + "%";
  fillElement.classList.remove("warn", "danger");

  if (hasBudget && percent > 100) {
    fillElement.classList.add("danger");
  } else if (hasBudget && percent >= 80) {
    fillElement.classList.add("warn");
  }
}


// checkLimitWarning(limit, spent, label)
// WHAT: Compares spending against a limit. Returns an object
//       { text, type } (Python returned only text).
// HOW:  limit 0 -> note | spent > limit -> alert |
//       spent >= 80% -> warning | otherwise -> safe
// PURPOSE: The "budget alert brain" used when adding expenses
//          and in the Summary report.
function checkLimitWarning(limit, spent, label) {
  if (limit <= 0) {
    return {
      text: label + ": No limit set.",
      type: "note"
    };
  }

  if (spent > limit) {
    return {
      text: "ALERT: " + label + " exceeded! (" + formatPHP(spent) + " / " + formatPHP(limit) + ")",
      type: "alert"
    };
  }

  if (spent >= limit * 0.8) {
    return {
      text: "WARNING: " + label + " is at 80% or higher (" + formatPHP(spent) + " / " + formatPHP(limit) + ")",
      type: "warning"
    };
  }

  return {
    text: "Safe: Within " + label + " (" + formatPHP(spent) + " / " + formatPHP(limit) + ")",
    type: "safe"
  };
}


// escapeHTML(text)
// WHAT: Makes user-typed text safe to place inside HTML.
// HOW:  Lets the browser convert special characters (<, >, &).
// PURPOSE: A note like "<b>hi</b>" can't break the page.
function escapeHTML(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}


// ==========================================================
// PART 2 | ASSIGN:| BUDGET SETUP PAGE
// PURPOSE: Sets the two limits the whole system compares
// spending against. (Python: menu option 1 and
// display_daily_allocation())
// ==========================================================

// displayDailyAllocation()
// WHAT: Splits the daily limit into Food 40%, Utilities 25%,
//       Entertainment 15%, Other 20% and draws it in the
//       "allocation-output" box on the Budget page.
// HOW:  Multiply the limit by each percent, build a <ul> list,
//       and place it with innerHTML.
// PURPOSE: Helps plan daily spending per category.
function displayDailyAllocation() {
  const container = document.getElementById("allocation-output");
  if (!container) return;

  if (dailySpendingLimit <= 0) {
    container.innerHTML = '<p class="muted">Set a daily spending limit to see the breakdown.</p>';
    return;
  }

  const food = dailySpendingLimit * 0.40;
  const utilities = dailySpendingLimit * 0.25;
  const entertainment = dailySpendingLimit * 0.15;
  const other = dailySpendingLimit * 0.20;

  container.innerHTML = `
    <ul class="summary-list">
      <li><span>Food (40%)</span><strong>${formatPHP(food)}</strong></li>
      <li><span>Utilities (25%)</span><strong>${formatPHP(utilities)}</strong></li>
      <li><span>Entertainment (15%)</span><strong>${formatPHP(entertainment)}</strong></li>
      <li><span>Other (20%)</span><strong>${formatPHP(other)}</strong></li>
    </ul>
  `;
}


// saveBudget()
// WHAT: Runs when "Save Budget" is clicked.
// HOW:  1) read both boxes  2) if either is null show red error
//       and stop  3) store values  4) show green success
//       5) draw the daily breakdown
// PURPOSE: Without this, limits stay PHP 0.00 and warnings
//          have nothing to compare.
function saveBudget() {
  const monthlyInput = getValidNumber("monthly-budget-input");
  const dailyInput = getValidNumber("daily-limit-input");

  if (monthlyInput === null || dailyInput === null) {
    showMessage("budget-message", "Please enter valid, non-negative numbers for both limits.", "error");
    return;
  }

  monthlyBudget = monthlyInput;
  dailySpendingLimit = dailyInput;

  showMessage(
    "budget-message",
    "Budget saved! Monthly: " + formatPHP(monthlyBudget) + " | Daily: " + formatPHP(dailySpendingLimit),
    "success"
  );

  displayDailyAllocation();
  renderHero();   // refresh the budget mini card in the header
}


// ==========================================================
// PART 3 | ASSIGN: | BANK AND E-WALLET PAGE
// PURPOSE: Records how much money the user really has in each
// account. (Python: manage_wallets())
// ==========================================================

// renderWallets()
// WHAT: Draws the left card: one row per account with its
//       balance, and the total at the bottom.
// HOW:  Loop through walletNames; build <li> rows with ${...}.
//       Then refresh the dropdown on the right card.
// PURPOSE: The screen always matches the data. Called each time
//          the Wallets tab opens (by showSection in Part 6).
function renderWallets() {
  const container = document.getElementById("wallet-list");
  if (!container) return;

  let html = "";
  for (let i = 0; i < walletNames.length; i++) {
    html += `<li><span>${escapeHTML(walletNames[i])}</span><strong>${formatPHP(walletBalances[i])}</strong></li>`;
  }
  html += `<li><strong>Total Wallet Balance</strong><strong>${formatPHP(sumArray(walletBalances))}</strong></li>`;

  container.innerHTML = html;
  fillWalletSelect();
}


// fillWalletSelect()
// WHAT: Fills the "Select an account" dropdown (right card).
// HOW:  One <option> per wallet; its value is the position
//       number (0, 1, 2...). Remembers the previous choice.
// PURPOSE: The user picks which account to update.
function fillWalletSelect() {
  const select = document.getElementById("wallet-select");
  if (!select) return;

  const previous = select.value || "0";
  let html = "";
  for (let i = 0; i < walletNames.length; i++) {
    html += `<option value="${i}">${escapeHTML(walletNames[i])}</option>`;
  }
  select.innerHTML = html;
  select.value = previous;

  updateWalletLabel();
}


// updateWalletLabel()
// WHAT: Changes the label text to the chosen account:
//       "Enter current balance for GCash: PHP"
// PURPOSE: Tells the user which account they are editing.
function updateWalletLabel() {
  const select = document.getElementById("wallet-select");
  const label = document.getElementById("wallet-balance-label");
  if (!select || !label) return;

  label.textContent = "Enter current balance for " + walletNames[Number(select.value)] + ": PHP";
}


// updateWallet()
// WHAT: Runs when "Update Balance" is clicked.
// HOW:  Read the chosen account and the new balance, validate,
//       save the new balance, redraw, then show a message.
// PURPOSE: Keeps balances correct; they are reduced later when
//          expenses are added (Part 4).
function updateWallet() {
  const select = document.getElementById("wallet-select");
  const index = Number(select.value);
  const newBalance = getValidNumber("wallet-balance-input");

  if (newBalance === null) {
    showMessage(
      "wallet-message",
      "Please enter a valid, non-negative balance for " + walletNames[index] + ".",
      "error"
    );
    return;
  }

  walletBalances[index] = newBalance;
  document.getElementById("wallet-balance-input").value = "";
  renderWallets();

  showMessage(
    "wallet-message",
    walletNames[index] + " balance updated to " + formatPHP(newBalance) + ".",
    "success"
  );
}


// ==========================================================
// PART 4 | ASSIGN: | ADD EXPENSE PAGE
// PURPOSE: The main action of the system: every peso spent is
// recorded here. (Python: add_expense_record())
// ==========================================================

// fillWalletDropdown()
// WHAT: Fills the "Wallet / Source" dropdown with every account
//       and its current balance.
// HOW:  Create an <option> for each wallet; its value is the
//       wallet's position number (0, 1, 2...). Remember the
//       previous choice so it stays selected.
// PURPOSE: Always shows up-to-date balances. Called each time
//          the Add Expense tab opens.
function fillWalletDropdown() {
  const select = document.getElementById("expense-source");
  if (!select) return;

  const previousValue = select.value;
  let html = '<option value="" disabled>Select a wallet</option>';

  for (let i = 0; i < walletNames.length; i++) {
    html += `<option value="${i}">${escapeHTML(walletNames[i])} (${formatPHP(walletBalances[i])})</option>`;
  }

  select.innerHTML = html;

  if (previousValue !== "" && Number(previousValue) < walletNames.length) {
    select.value = previousValue;
  } else {
    select.value = "";
  }
}


// addExpense()
// WHAT: Runs when "Add Expense" is clicked.
// HOW (8 steps):
//   1. Validate the amount (stop with red error if invalid)
//   2. Make sure a wallet was chosen
//   3. Read category and description (empty -> default text)
//   4. Subtract from the wallet (if not enough, set to 0 + note)
//   5. Save the expense in the five lists with push()
//   6. Show the green success message
//   7. Show daily and monthly warnings (checkLimitWarning)
//   8. Clear the form and refresh the dropdown balances
// PURPOSE: Keeps wallets accurate, gives instant safe/warning/
//          exceeded feedback, and creates the records used by
//          the Expenses list and Summary.
function addExpense() {
  // 1. Amount
  const amount = getValidNumber("expense-amount");
  if (amount === null || amount <= 0) {
    showMessage("expense-success-msg", "Please enter a valid expense amount greater than 0.", "error");
    showMessage("expense-daily-warning", "", "note");
    showMessage("expense-monthly-warning", "", "note");
    return;
  }

  // 2. Wallet
  const sourceSelect = document.getElementById("expense-source");
  if (sourceSelect.value === "") {
    showMessage("expense-success-msg", "Please select a wallet.", "error");
    showMessage("expense-daily-warning", "", "note");
    showMessage("expense-monthly-warning", "", "note");
    return;
  }
  const walletIndex = Number(sourceSelect.value);
  const sourceName = walletNames[walletIndex];

  // 3. Other fields
  const categoryInput = document.getElementById("expense-category");
  const descInput = document.getElementById("expense-note");

  const category = categoryInput.value.trim() !== ""
    ? categoryInput.value.trim()
    : "Uncategorized";

  const description = descInput.value.trim() !== ""
    ? descInput.value.trim()
    : "Uncategorized Item";

  // 4. Deduct from wallet
  let walletNote = "";
  if (walletBalances[walletIndex] >= amount) {
    walletBalances[walletIndex] -= amount;
  } else {
    walletBalances[walletIndex] = 0;
    walletNote = " (Note: " + sourceName + " balance was insufficient and set to PHP 0.00)";
  }

  // 5. Save the record (Python: append)
  expenseAmounts.push(amount);
  expenseCategories.push(category);
  expenseDescriptions.push(description);
  expenseSources.push(sourceName);
  expenseDates.push(todayString());

  // 6. Success message
  showMessage(
    "expense-success-msg",
    "Recorded " + formatPHP(amount) + " for " + description + " (" + category + ") via " + sourceName + "." + walletNote,
    "success"
  );

  // 7. Budget warnings (daily = today only, monthly = this month only)
  const dailyCheck = checkLimitWarning(dailySpendingLimit, spentToday(), "Daily Limit");
  const monthlyCheck = checkLimitWarning(monthlyBudget, spentThisMonth(), "Monthly Budget");

  showMessage("expense-daily-warning", dailyCheck.text, dailyCheck.type);
  showMessage("expense-monthly-warning", monthlyCheck.text, monthlyCheck.type);

  // 8. Clean up (the chosen wallet stays selected)
  document.getElementById("expense-amount").value = "";
  categoryInput.value = "";
  descInput.value = "";
  fillWalletDropdown();
  renderHero();   // refresh the budget mini card in the header
}


// ==========================================================
// PART 5 | ASSIGN: | EXPENSES LIST AND SUMMARY REPORT
// PURPOSE: Shows the spending history and the full report that
// combines all data. (Python: menu options 4 and 5)
// ==========================================================

// renderExpenseList()
// WHAT: Fills the Expenses table (Python menu option 4).
// HOW:  No expenses -> show "No expenses" text, hide table.
//       Otherwise hide the text, show the table, and build one
//       <tr> row per expense (newest first). escapeHTML
//       protects the note.
// PURPOSE: A clear history of what was spent, on what, and from
//          where. Called each time the Expenses tab opens.
function renderExpenseList() {
  const emptyMsg = document.getElementById("no-expenses-msg");
  const table = document.getElementById("expense-table");
  const tbody = document.getElementById("expense-table-body");
  if (!table || !tbody) return;

  if (expenseAmounts.length === 0) {
    if (emptyMsg) emptyMsg.classList.remove("hidden");
    table.classList.add("hidden");
    tbody.innerHTML = "";
    return;
  }

  if (emptyMsg) emptyMsg.classList.add("hidden");
  table.classList.remove("hidden");

  let html = "";
  for (let i = expenseAmounts.length - 1; i >= 0; i--) {
    html += `
      <tr>
        <td>${escapeHTML(expenseDates[i])}</td>
        <td>${escapeHTML(expenseSources[i])}</td>
        <td>${escapeHTML(expenseCategories[i])}</td>
        <td>${escapeHTML(expenseDescriptions[i])}</td>
        <td class="amount">-${formatPHP(expenseAmounts[i])}</td>
      </tr>
    `;
  }

  tbody.innerHTML = html;
}


// showBudgetAdvice()
// WHAT: Writes personalized advice about how to handle the
//       budget, save, and invest, based on the user's own data.
// HOW:  1) no budget set -> ask the user to set one and stop
//       2) compare spending with the budget (percent used)
//       3) look for the biggest spending category
//       4) check the daily limit against the monthly budget
//       5) save-and-invest ideas (or cost-cutting tips if there
//          is no surplus) and the emergency-fund progress
//       Every tip is added to a list, then shown ONCE with innerHTML.
// PURPOSE: Helps the user GROW money, not just track it.
//          Called by renderSummary() (Part 5).
function showBudgetAdvice() {
  const container = document.getElementById("summary-advice-box");
  if (!container) return;

  const totalWallet = sumArray(walletBalances);
  const monthSpent = spentThisMonth();

  let html = `<p><strong>Total Cash Across All Wallets:</strong> ${formatPHP(totalWallet)}</p>`;

  // 1. No budget yet -> nothing to advise on
  if (monthlyBudget <= 0) {
    html += `<p class="muted">Set a monthly budget on the Budget page to get personalized advice.</p>`;
    container.innerHTML = html;
    return;
  }

  const surplus = monthlyBudget - monthSpent;
  const percent = (monthSpent / monthlyBudget) * 100;

  // ---------- A. HOW YOU ARE DOING ----------
  const budgetTips = [];

  if (percent > 100) {
    budgetTips.push("You are over your monthly budget by " + formatPHP(Math.abs(surplus)) + ". Pause non-essential spending for the rest of the month.");
  } else if (percent >= 80) {
    budgetTips.push("You have used " + percent.toFixed(0) + "% of your budget. Only " + formatPHP(surplus) + " is left, so spend carefully until the month ends.");
  } else if (percent >= 50) {
    budgetTips.push("You have used " + percent.toFixed(0) + "% of your budget. You are on track; keep recording every expense.");
  } else {
    budgetTips.push("You have used only " + percent.toFixed(0) + "% of your budget. Great control. Consider moving the unspent money to savings.");
  }

  // Biggest spending category
  const totals = {};
  for (let i = 0; i < expenseAmounts.length; i++) {
    const cat = expenseCategories[i];
    totals[cat] = (totals[cat] || 0) + expenseAmounts[i];
  }
  let topCategory = "";
  let topAmount = 0;
  for (const cat in totals) {
    if (totals[cat] > topAmount) {
      topAmount = totals[cat];
      topCategory = cat;
    }
  }
  const totalSpent = sumArray(expenseAmounts);
  if (topCategory !== "" && totalSpent > 0) {
    const share = (topAmount / totalSpent) * 100;
    if (share >= 40) {
      budgetTips.push("\"" + escapeHTML(topCategory) + "\" takes " + share.toFixed(0) + "% of your spending (" + formatPHP(topAmount) + "). Check if you can trim it.");
    } else {
      budgetTips.push("Your biggest category is \"" + escapeHTML(topCategory) + "\" (" + formatPHP(topAmount) + "). Review it first when you want to cut costs.");
    }
  }

  // Daily limit checks
  if (dailySpendingLimit > 0) {
    if (dailySpendingLimit * 30 > monthlyBudget) {
      budgetTips.push("Your daily limit x 30 days (" + formatPHP(dailySpendingLimit * 30) + ") is more than your monthly budget. Lower the daily limit to about " + formatPHP(monthlyBudget / 30) + ".");
    }
    if (spentToday() > dailySpendingLimit) {
      budgetTips.push("You are over today's daily limit. Try to spend less tomorrow to balance it out.");
    }
  } else {
    budgetTips.push("Set a daily spending limit on the Budget page. Small daily limits make a monthly budget much easier to follow.");
  }

  html += `<p class="advice-title">Your budget</p><ul class="advice-list">`;
  budgetTips.forEach(function (tip) {
    html += `<li>${tip}</li>`;
  });
  html += `</ul>`;

  // ---------- B. SAVE AND INVEST ----------
  if (surplus > 0) {
    const goalSave = monthlyBudget * 0.20;

    html += `
      <p class="advice-title">Potential monthly savings: ${formatPHP(surplus)}</p>
      <ul class="advice-list">
        <li><strong>Pay yourself first:</strong> move money to savings right after you get income, before spending. A common guide (50/30/20) is 50% needs, 30% wants, 20% savings. For your budget, 20% is ${formatPHP(goalSave)}.</li>
        <li><strong>Build an emergency fund first:</strong> aim for 3 to 6 months of expenses (${formatPHP(monthlyBudget * 3)} to ${formatPHP(monthlyBudget * 6)}). Keep it in an easy-to-access savings account.</li>
        <li><strong>High-yield digital banks:</strong> Maya Savings, GoTyme, or SeaBank can pay daily interest. Compare current rates before choosing.</li>
        <li><strong>Pag-IBIG MP2 Savings:</strong> government-backed, with dividends that are tax-free, good for 5-year goals.</li>
        <li><strong>UITFs / Money Market Funds:</strong> low-minimum funds through BPI, BDO, or GCash GInvest. Higher-risk options like stocks or index funds are better after your emergency fund is ready.</li>
      </ul>
    `;
  } else {
    html += `
      <p class="advice-title">How to free up money</p>
      <ul class="advice-list">
        <li>Separate needs (food, rent, transport, bills) from wants (dining out, subscriptions, shopping) and cut wants first.</li>
        <li>Wait 24 hours before any non-essential purchase.</li>
        <li>Review subscriptions and cancel the ones you rarely use.</li>
        <li>Once you are within budget, start with a small savings amount (even 5% to 10%) and increase it over time.</li>
      </ul>
    `;
  }

  // ---------- C. EMERGENCY FUND PROGRESS ----------
  const fundTarget = monthlyBudget * 3;
  const fundPercent = Math.min((totalWallet / fundTarget) * 100, 100);
  html += `<p class="advice-title">Emergency fund progress</p>`;
  if (totalWallet >= fundTarget) {
    html += `<p>Your wallets hold ${formatPHP(totalWallet)}, which already covers 3 months of your budget (${formatPHP(fundTarget)}). Consider investing the extra.</p>`;
  } else {
    html += `<p>Your wallets hold ${formatPHP(totalWallet)}, which is ${fundPercent.toFixed(0)}% of a 3-month emergency fund (${formatPHP(fundTarget)}).</p>`;
  }

  html += `<p class="advice-note">These are general tips, not professional financial advice. Interest rates and products change, so check current details before you invest.</p>`;

  container.innerHTML = html;
}


// renderSummary()
// WHAT: Fills the whole Summary report (Python menu option 5).
// HOW (5 steps):
//   1. Four number cards (budget, expenses, remaining, savings)
//   2. Daily and monthly status messages (checkLimitWarning)
//   3. Progress bar: width = spent / budget (max 100%);
//      orange at 80%+, red when exceeded
//   4. Expenses grouped by category
//   5. Savings, investing and budget advice (showBudgetAdvice)
// PURPOSE: The "report card" combining data from every page.
//          Called each time the Summary tab opens.
function renderSummary() {
  const totalSpent = sumArray(expenseAmounts);
  const remaining = monthlyBudget - totalSpent;
  const savings = Math.max(remaining, 0);

  // 1. Number cards
  document.getElementById("summary-total-budget").textContent = formatPHP(monthlyBudget);
  document.getElementById("summary-total-expenses").textContent = formatPHP(totalSpent);
  document.getElementById("summary-remaining").textContent = formatPHP(remaining);
  document.getElementById("summary-total-savings").textContent = formatPHP(savings);

  // 2. Status messages
  const dailyStatus = checkLimitWarning(dailySpendingLimit, spentToday(), "Daily Limit");
  const monthlyStatus = checkLimitWarning(monthlyBudget, spentThisMonth(), "Monthly Budget");

  showMessage("summary-daily-status", dailyStatus.text, dailyStatus.type);
  showMessage("summary-monthly-status", monthlyStatus.text, monthlyStatus.type);

  // 3. Progress bar
  const progressFill = document.getElementById("budget-progress-fill");
  const progressText = document.getElementById("budget-progress-text");

  let percent = 0;
  if (monthlyBudget > 0) {
    percent = (spentThisMonth() / monthlyBudget) * 100;
  }

  applyProgress(progressFill, percent, monthlyBudget > 0);

  progressText.textContent = monthlyBudget > 0
    ? percent.toFixed(1) + "% of monthly budget used"
    : "No monthly budget set";

  // 4. Expenses by category
  const totals = {};
  for (let i = 0; i < expenseAmounts.length; i++) {
    const cat = expenseCategories[i];
    totals[cat] = (totals[cat] || 0) + expenseAmounts[i];
  }

  let html = "";
  for (const cat in totals) {
    html += `<li><span>${escapeHTML(cat)}</span><strong>${formatPHP(totals[cat])}</strong></li>`;
  }

  document.getElementById("summary-category-list").innerHTML =
    html || '<li><span class="muted">No expenses yet.</span></li>';

  // 5. Advice
  showBudgetAdvice();
}


// ==========================================================
// PART 5B | OVERVIEW DASHBOARD (NEW)
// PURPOSE: The home page: balance, 7-day chart, category
// donut, and the last 5 transactions. Also the header's
// budget mini card.
// ==========================================================

// renderHero()
// WHAT: Fills the header: today's date and the monthly budget
//       mini card (text + progress bar).
// PURPOSE: Always visible, so it is refreshed on every tab
//          change and after saving a budget / adding an expense.
function renderHero() {
  const dateEl = document.getElementById("hero-date");
  if (dateEl) {
    dateEl.textContent = new Date().toLocaleDateString("en-US", {
      weekday: "long", month: "long", day: "numeric", year: "numeric"
    });
  }

  const monthSpent = spentThisMonth();
  const text = document.getElementById("hero-budget-text");
  const foot = document.getElementById("hero-budget-foot");
  const fill = document.getElementById("hero-budget-fill");

  if (monthlyBudget > 0) {
    const percent = (monthSpent / monthlyBudget) * 100;
    text.textContent = formatPHP(monthSpent) + " of " + formatPHP(monthlyBudget);
    foot.textContent = percent.toFixed(0) + "% used | " + formatPHP(Math.max(monthlyBudget - monthSpent, 0)) + " left";
    applyProgress(fill, percent, true);
  } else {
    text.textContent = "No monthly budget set";
    foot.textContent = "Set one on the Budget page";
    applyProgress(fill, 0, false);
  }
}


// getQuickTip()
// WHAT: One short sentence for the Tip box on the Overview.
// HOW:  Looks at how much of the budget is used.
// PURPOSE: A quick nudge. The full advice is on the Summary page.
function getQuickTip() {
  if (monthlyBudget <= 0) {
    return "Set a monthly budget on the Budget page to unlock smart tips.";
  }

  const percent = (spentThisMonth() / monthlyBudget) * 100;

  if (percent > 100) return "You are over budget this month. Pause non-essential spending.";
  if (percent >= 80) return "You have used " + percent.toFixed(0) + "% of your budget. Spend carefully for the rest of the month.";
  if (percent >= 50) return "You are on track. Keep recording every expense.";
  return "Great control so far. Move any unspent money to savings. See the Summary page for ideas.";
}


// renderWeekChart()
// WHAT: Draws 7 bars: how much was spent on each of the last 7 days.
// HOW:  For each day (6 days ago ... today) add up the spending,
//       scale every bar against the biggest value (or the daily
//       limit), and build the bars with innerHTML.
//       Red bar = went over the daily limit. A dashed line
//       marks the daily limit.
// PURPOSE: Shows spending habits at a glance.
function renderWeekChart() {
  const box = document.getElementById("ov-week-chart");
  if (!box) return;

  const days = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      total: spentOnDate(dateToString(d)),
      isToday: i === 0
    });
  }

  let max = dailySpendingLimit;
  days.forEach(function (day) {
    if (day.total > max) max = day.total;
  });
  if (max <= 0) max = 1;

  let bars = "";
  let labels = "";
  let weekTotal = 0;

  days.forEach(function (day) {
    weekTotal += day.total;
    const height = (day.total / max) * 100;

    let cls = "bar";
    if (dailySpendingLimit > 0 && day.total > dailySpendingLimit) {
      cls += " over";
    } else if (day.isToday) {
      cls += " today";
    }

    bars += `<div class="bar-slot"><div class="${cls}" style="height:${height}%" title="${day.label}: ${formatPHP(day.total)}"></div></div>`;
    labels += `<span>${day.label}</span>`;
  });

  let limitLine = "";
  if (dailySpendingLimit > 0) {
    limitLine = `<div class="limit-line" style="bottom:${(dailySpendingLimit / max) * 100}%"><span>Limit</span></div>`;
  }

  box.innerHTML = `
    <div class="chart-area">${limitLine}${bars}</div>
    <div class="chart-labels">${labels}</div>
    <p class="chart-total">Total this week: <strong>${formatPHP(weekTotal)}</strong></p>
  `;
}


// renderDonut()
// WHAT: Draws the category donut (SVG) and its legend.
// HOW:  1) add up this month's spending per category
//       2) keep the top 5, group the rest as "Others"
//       3) each category becomes one colored ring segment:
//          its length = share of the total x ring length
//          (stroke-dasharray), moved along the ring with
//          stroke-dashoffset
// PURPOSE: Shows WHERE the money goes.
function renderDonut() {
  const donut = document.getElementById("ov-donut");
  const legend = document.getElementById("ov-legend");
  if (!donut || !legend) return;

  const month = todayString().slice(0, 7);
  const totals = {};
  let total = 0;

  for (let i = 0; i < expenseAmounts.length; i++) {
    if (expenseDates[i].slice(0, 7) !== month) continue;
    const cat = expenseCategories[i];
    totals[cat] = (totals[cat] || 0) + expenseAmounts[i];
    total += expenseAmounts[i];
  }

  // Sort categories from biggest to smallest
  const entries = Object.keys(totals)
    .map(function (cat) {
      return { name: cat, amount: totals[cat], color: categoryColor(cat) };
    })
    .sort(function (a, b) { return b.amount - a.amount; });

  // Keep the top 5, group the rest as "Others"
  let shown = entries.slice(0, 5);
  if (entries.length > 5) {
    let othersAmount = 0;
    entries.slice(5).forEach(function (e) { othersAmount += e.amount; });
    shown.push({ name: "Others", amount: othersAmount, color: "#94a3b8" });
  }

  const R = 46;                       // ring radius
  const C = 2 * Math.PI * R;          // ring length
  let segments = "";
  let offset = 0;

  if (total > 0) {
    shown.forEach(function (e) {
      const len = (e.amount / total) * C;
      segments += `<circle cx="60" cy="60" r="${R}" fill="none" stroke="${e.color}" stroke-width="14" stroke-dasharray="${len} ${C - len}" stroke-dashoffset="${-offset}"></circle>`;
      offset += len;
    });
  }

  donut.innerHTML = `
    <svg class="donut-svg" viewBox="0 0 120 120" role="img" aria-label="Spending by category">
      <circle cx="60" cy="60" r="${R}" fill="none" stroke="#e2e8f0" stroke-width="14"></circle>
      <g transform="rotate(-90 60 60)">${segments}</g>
      <text x="60" y="56" text-anchor="middle" class="donut-label">${total > 0 ? "Spent" : "No data"}</text>
      <text x="60" y="70" text-anchor="middle" class="donut-total">${total > 0 ? formatShort(total) : "PHP 0"}</text>
    </svg>
  `;

  if (total === 0) {
    legend.innerHTML = '<li><span class="muted">No expenses this month yet.</span></li>';
    return;
  }

  let legendHtml = "";
  shown.forEach(function (e) {
    const pct = (e.amount / total) * 100;
    legendHtml += `
      <li>
        <i style="background:${e.color}"></i>
        <span class="l-name">${escapeHTML(e.name)}</span>
        <span class="l-pct">${pct.toFixed(0)}%</span>
        <span class="l-amt">${formatPHP(e.amount)}</span>
      </li>
    `;
  });
  legend.innerHTML = legendHtml;
}


// renderRecent()
// WHAT: Fills the "Recent Transactions" table with the last 5
//       expenses (newest first).
// PURPOSE: A quick look at the latest spending.
function renderRecent() {
  const emptyMsg = document.getElementById("ov-no-recent");
  const table = document.getElementById("ov-recent-table");
  const tbody = document.getElementById("ov-recent-body");
  if (!table || !tbody) return;

  if (expenseAmounts.length === 0) {
    if (emptyMsg) emptyMsg.classList.remove("hidden");
    table.classList.add("hidden");
    tbody.innerHTML = "";
    return;
  }

  if (emptyMsg) emptyMsg.classList.add("hidden");
  table.classList.remove("hidden");

  let html = "";
  const stop = Math.max(expenseAmounts.length - 5, 0);
  for (let i = expenseAmounts.length - 1; i >= stop; i--) {
    html += `
      <tr>
        <td>${escapeHTML(expenseDates[i])}</td>
        <td><span class="chip"><i style="background:${categoryColor(expenseCategories[i])}"></i>${escapeHTML(expenseCategories[i])}</span></td>
        <td>${escapeHTML(expenseSources[i])}</td>
        <td>${escapeHTML(expenseDescriptions[i])}</td>
        <td class="amount">-${formatPHP(expenseAmounts[i])}</td>
      </tr>
    `;
  }
  tbody.innerHTML = html;
}


// renderOverview()
// WHAT: Fills the whole Overview page.
// HOW:  Balance card (total wallets, budget bar, spent bar, tip),
//       then the 7-day chart, the donut, and recent transactions.
// PURPOSE: The first thing the user sees. Called each time the
//          Overview tab opens.
function renderOverview() {
  const monthSpent = spentThisMonth();
  const hasBudget = monthlyBudget > 0;
  const percent = hasBudget ? (monthSpent / monthlyBudget) * 100 : 0;

  document.getElementById("ov-balance").textContent = formatPHP(sumArray(walletBalances));
  document.getElementById("ov-budget-amount").textContent = formatPHP(monthlyBudget);
  document.getElementById("ov-spent-amount").textContent = formatPHP(monthSpent);

  // Budget bar is always full (it is the 100% reference)
  document.getElementById("ov-budget-fill").style.width = hasBudget ? "100%" : "0%";
  applyProgress(document.getElementById("ov-spent-fill"), percent, hasBudget);

  document.getElementById("ov-tip").textContent = getQuickTip();

  renderWeekChart();
  renderDonut();
  renderRecent();
}


// ==========================================================
// PART 6 | MEMBER 3 | TAB SWITCHING AND START-UP (KEEP LAST!)
// PURPOSE: Replaces the Python while-loop and menu. Makes the
// tabs and buttons work and refreshes each page's data when
// opened.
// ==========================================================

// All tab buttons (a list). Includes the shortcut and "View all" buttons.
const navButtons = document.querySelectorAll(".nav-btn");

// showSection(sectionId)
// WHAT: Shows ONE page and hides the others.
// HOW:  1) remove "active" from every page and tab button
//       2) add "active" to the chosen page and its header tab
//          (CSS Part C does the actual show/hide)
//       3) call that page's render function so data is fresh
// PURPOSE: Navigation for the whole app.
function showSection(sectionId) {
  document.querySelectorAll(".page").forEach(function (page) {
    page.classList.remove("active");
  });
  navButtons.forEach(function (button) {
    button.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");

  // Highlight the header tab only (not the shortcut / "View all" buttons)
  const tab = document.querySelector('.tabs .nav-btn[data-section="' + sectionId + '"]');
  if (tab) tab.classList.add("active");

  // Hide the shortcut button while on the Add Expense page
  document.body.classList.toggle("on-expense", sectionId === "expense-section");

  renderHero();

  if (sectionId === "overview-section") {
    renderOverview();
  } else if (sectionId === "budget-section") {
    displayDailyAllocation();
  } else if (sectionId === "wallet-section") {
    renderWallets();
  } else if (sectionId === "expense-section") {
    fillWalletDropdown();
  } else if (sectionId === "list-section") {
    renderExpenseList();
  } else if (sectionId === "summary-section") {
    renderSummary();
  }
}

// When a tab button is clicked, show the section named in its data-section
navButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    showSection(button.dataset.section);
  });
});

// ----- Connect every button to its function -----

// Budget page: Save Budget button
document.getElementById("save-budget-btn").addEventListener("click", saveBudget);

// Wallets page: dropdown changes the label, button updates the balance
document.getElementById("wallet-select").addEventListener("change", updateWalletLabel);
document.getElementById("update-wallet-btn").addEventListener("click", updateWallet);

// Add Expense page: event.preventDefault() stops the browser from
// reloading the page (a reload would erase all the data).
document.getElementById("expense-form").addEventListener("submit", function (event) {
  event.preventDefault();
  try {
    addExpense();
  } catch (err) {
    console.error("addExpense failed:", err);
    showMessage("expense-success-msg", "Something went wrong: " + err.message, "error");
  }
  return false;
});

// Start on the Overview tab
showSection("overview-section");