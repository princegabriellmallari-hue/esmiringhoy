// ==========================================================
// PERSONAL BUDGET TRACKER - script.js (LOGIC)
// JavaScript = electricity and plumbing (what makes it WORK).
// Four tools used everywhere in this file:
//   document.getElementById("id")     -> find an element
//   element.value                     -> read what the user typed
//   element.textContent / .innerHTML  -> show text on screen (replaces print)
//   element.addEventListener("click", fn) -> run fn when clicked
// Parts are in this order: 1, 2, 3, 4, 5, 6 (Part 6 MUST be last).
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

// Four lists kept "in sync": the SAME position (index) = ONE expense
let expenseAmounts = [];
let expenseCategories = [];
let expenseDescriptions = [];
let expenseSources = [];

// Bank and e-wallet accounts (same position = same account)
let walletNames = ["Cash", "GCash", "Maya", "BPI", "BDO"];
let walletBalances = [0, 0, 0, 0, 0];


// formatPHP(amount)
// WHAT: Turns a number into money text. 1500 -> "PHP 1500.00"
// HOW:  toFixed(2) keeps 2 decimals (Python: f"{x:.2f}")
// PURPOSE: Every peso amount on screen looks consistent.



// sumArray(list)
// WHAT: Adds all numbers in a list (Python: sum(list)).
// HOW:  Loop through the list, keep a running total.
// PURPOSE: Total spent and total wallet balance.



// getValidNumber(inputId)
// WHAT: Reads a number box. Returns the number, or null if the
//       box is empty, not a number, or negative.
// HOW:  .trim() removes spaces; Number() converts text to a
//       number; isNaN() checks "is Not a Number".
// PURPOSE: Protects the system from bad input (Python:
//          get_valid_number loop). Callers check: if (x === null)


// showMessage(elementId, text, type)
// WHAT: Puts colored text inside an element.
// HOW:  Sets the text, then sets the CSS classes so the color
//       matches. type = success, error, warning, safe, alert, note
// PURPOSE: Replaces Python print() for feedback messages.
//          An empty text hides the box (CSS :empty rule).


// checkLimitWarning(limit, spent, label)
// WHAT: Compares spending against a limit. Returns an object
//       { text, type } (Python returned only text).
// HOW:  limit 0 -> note | spent > limit -> alert |
//       spent >= 80% -> warning | otherwise -> safe
// PURPOSE: The "budget alert brain" used when adding expenses
//          and in the Summary report.



// escapeHTML(text)
// WHAT: Makes user-typed text safe to place inside HTML.
// HOW:  Lets the browser convert special characters (<, >, &).
// PURPOSE: A note like "<b>hi</b>" can't break the page.


// ==========================================================
// PART 2 | ASSIGN:| BUDGET SETUP PAGE
// PURPOSE: Sets the two limits the whole system compares
// spending against. (Python: menu option 1 and
// display_daily_allocation())
// ==========================================================

// displayDailyAllocation(targetId)
// WHAT: Splits the daily limit into Food 40%, Utilities 25%,
//       Entertainment 15%, Other 20% and draws it in ANY
//       element you name (targetId).
// HOW:  Multiply the limit by each percent, build a <ul> list,
//       and place it with innerHTML.
// PURPOSE: Helps plan daily spending per category. Reused by
//          the Summary page (Part 5).


// saveBudget()
// WHAT: Runs when "Save Budget" is clicked.
// HOW:  1) read both boxes  2) if either is null show red error
//       and stop  3) store values  4) show green success
//       5) draw the daily breakdown
// PURPOSE: Without this, limits stay PHP 0.00 and warnings
//          have nothing to compare.


// Connect the button to the function



// ==========================================================
// PART 3 | ASSIGN: | BANK AND E-WALLET PAGE
// PURPOSE: Records how much money the user really has in each
// account. (Python: manage_wallets())
// ==========================================================

// renderWallets()
// WHAT: Draws one row per account: name, balance, input box,
//       Update button, and the total at the bottom.
// HOW:  Loop through walletNames; build HTML with ${...}.
//       Each input gets a unique id: wallet-input-0, -1, ...
// PURPOSE: The screen always matches the data. Called each time
//          the Wallets tab opens (by showSection in Part 6).



// updateWallet(index)
// WHAT: Runs when an Update button is clicked. index = which
//       account (0 = Cash, 1 = GCash, ...).
// HOW:  Read that account's box, validate, save the new balance,
//       redraw, then show a success message.
// PURPOSE: Keeps balances correct; they are reduced later when
//          expenses are added (Part 4).


// ==========================================================
// PART 4 | ASSIGN: | ADD EXPENSE PAGE
// PURPOSE: The main action of the system: every peso spent is
// recorded here. (Python: add_expense_record())
// ==========================================================

// fillWalletDropdown()
// WHAT: Fills the "Payment Source" dropdown with every account
//       and its current balance.
// HOW:  Create an <option> for each wallet; its value is the
//       wallet's position number (0, 1, 2...). Remember the
//       previous choice so it stays selected.
// PURPOSE: Always shows up-to-date balances. Called each time
//          the Add Expense tab opens.



// addExpense()
// WHAT: Runs when "Add Expense" is clicked.
// HOW (7 steps):
//   1. Validate the amount (stop with red error if invalid)
//   2. Read category, wallet, description (empty -> "Uncategorized Item")
//   3. Subtract from the wallet (if not enough, set to 0 + note)
//   4. Save the expense in the four lists with push()
//   5. Show the green success message
//   6. Show daily and monthly warnings (checkLimitWarning)
//   7. Clear the form and refresh the dropdown balances
// PURPOSE: Keeps wallets accurate, gives instant safe/warning/
//          exceeded feedback, and creates the records used by
//          the Expenses list and Summary.

  // 1. Amount


  // 2. Other fields


  // 3. Deduct from wallet


  // 4. Save the record (Python: append)


  // 5. Success message


  // 6. Budget warnings (an empty text hides the box)


  // 7. Clean up





// ==========================================================
// PART 5 | ASSIGN: | EXPENSES LIST AND SUMMARY REPORT
// PURPOSE: Shows the spending history and the full report that
// combines all data. (Python: menu options 4 and 5, and
// show_savings_and_investing())
// ==========================================================

// renderExpenseList()
// WHAT: Fills the Expenses table (Python menu option 4).
// HOW:  No expenses -> show "No transactions" text, hide table.
//       Otherwise hide the text, show the table, and build one
//       <tr> row per expense. escapeHTML protects the note.
// PURPOSE: A clear history of what was spent, on what, and from
//          where. Called each time the Expenses tab opens.



// showSavingsAndInvesting(totalSpent, totalWalletBalance)
// WHAT: Shows how much could be saved (budget - spent) with local
//       saving/investing ideas, plus total cash in all accounts.
// HOW:  Budget set and surplus > 0 -> amount + 3 options
//       Budget set and no surplus  -> tip to trim expenses
//       No budget                  -> ask to set a budget
//       Build the HTML text in "html", then show it once.
// PURPOSE: Helps the user GROW money, not just track it.



// renderSummary()
// WHAT: Fills the whole Summary report (Python menu option 5).
// HOW (6 steps):
//   1. Three number boxes (budget, daily limit, total spent)
//   2. Daily and monthly status messages (checkLimitWarning)
//   3. Progress bar: width = spent / budget (max 100%);
//      orange at 80%+, red when exceeded
//   4. Daily breakdown (reuses displayDailyAllocation)
//   5. Wallet list
//   6. Savings and investing section
// PURPOSE: The "report card" combining data from every page.
//          Called each time the Summary tab opens.


  // 1. Number boxes


  // 2. Status messages


  // 3. Progress bar

  // 4. Daily breakdown


  // 5. Wallet list


  // 6. Savings


// ==========================================================
// PART 6 | MEMBER 3 | TAB SWITCHING AND START-UP (KEEP LAST!)
// PURPOSE: Replaces the Python while-loop and menu. Makes the
// tabs work and refreshes each page's data when opened.
// ==========================================================

// All 5 tab buttons (a list)
const navButtons = document.querySelectorAll(".nav-btn");

// showSection(sectionId)
// WHAT: Shows ONE page and hides the others.
// HOW:  1) remove "active" from every page and tab button
//       2) add "active" to the chosen page and its button
//          (CSS Part C does the actual show/hide)
//       3) call that page's render function so data is fresh
// PURPOSE: Navigation for the whole app.
function showSection(sectionId) {
  const pages = document.querySelectorAll(".page");
  pages.forEach(function (page) {
    page.classList.remove("active");
  });
  navButtons.forEach(function (button) {
    button.classList.remove("active");
  });

  document.getElementById(sectionId).classList.add("active");
  document
    .querySelector('.nav-btn[data-section="' + sectionId + '"]')
    .classList.add("active");

  if (sectionId === "wallet-section") {
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

// Start on the Budget tab
showSection("budget-section");

/* ---- 1.3 Saved data: S is our "database" in memory, and save() writes it to the browser ---- */
let S = read(KEY, null) || seed();   // S = everything we save: items, orders, msgs and counters. Load it from the browser, or make the starting menu with seed() the first time
S.items.forEach(i => { if (i.img) i.img = i.img.startsWith('data:') ? '' : i.img.split('/').pop(); });   // clean-up for old saved data: an old version saved a whole path or photo here, now we only keep the file name
let cart = [], tt;   // cart = the lines in My Order, each {id, size, add:[add-on numbers], qty}. tt = timer id for the toast

/* TASK: Make the starting menu (all the items from the Newland's menu PDF) with stock.
   HOW: Loop over MENU (above). For each item make an object {id, cat, name, p (prices), stock: 20, img: ''} and put it in the items list. Each item gets its own id.
   IN THE SYSTEM: runs the first time a browser opens the website (nothing saved yet) and when the staff press "Reset all data" in Manage. */
function seed() {
  let id = 1; const items = [];
  for (const c in MENU) MENU[c].forEach(([name, ...p]) => items.push({id: id++, cat: c, name, p, stock: 20, img: ''}));
  return {items, orders: [], msgs: [], nextId: id, nextOrder: 1};
}
// TASK: Write S (all our data) to the browser. Used by commit() and by the Contact form. If it fails (storage full), tell the user.
function save() { if (!write(KEY, S)) toast('Could not save. The browser storage may be full.'); }