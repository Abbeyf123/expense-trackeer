document.addEventListener("DOMContentLoaded", function () {
  const companyNameElement = document.getElementById("company-name");
  const remainingBudgetElement = document.getElementById("remaining-budget");
  const budgetInput = document.getElementById("budget-input");
  const addBudgetButton = document.getElementById("add-budget-btn");
  const amountSpentInput = document.getElementById("amount-spent");
  const dateInput = document.getElementById("date");
  const descriptionInput = document.getElementById("description");
  const addExpenseButton = document.getElementById("add-expense-btn");
  const clearExpensesButton = document.getElementById("clear-expenses-btn");
  const showGraphButton = document.getElementById("show-graph-btn");
  const deleteExpenseButton = document.getElementById("delete-expense-btn");
  const expenseTableBody = document.querySelector("#expense-table tbody");
  const totalAmountSpentElement = document.getElementById("total-amount-spent");
  const chartContainer = document.getElementById("chart-container");
  const addToBudgetInput = document.getElementById("add-to-budget");
  const addToBudgetButton = document.getElementById("add-to-budget-btn");
  const previousExpensesButton = document.getElementById("previous-expenses-btn");
  const previousExpenseTableBody = document.getElementById("previous-expense-table");
  const showAddToBudget = document.getElementById('add-to-budget-container')
  const tableData = document.getElementById('table-data')
  const table = document.getElementById('table')

  let budget = 0;
  let expenses = [];
  let previousExpenses = [];
  let showingPreviousExpenses = false;
   
   // Check if budget has been added (you can replace this condition with your logic)
   
   budgetInput.disabled = false
   // Change this to true if budget has been added

   // Get the "Add Budget" button element
 
   // Set the disabled state of the button based on the budgetAdded flag
   

  // Initialize budget from local storage if available
  if (localStorage.getItem("budget")) {
      budget = parseFloat(localStorage.getItem("budget"));
      remainingBudgetElement.textContent = ` $${budget.toFixed(2)}`;
      budgetInput.value = budget.toFixed(2);
      enableExpenseInputs();
  }

  tableData.addEventListener("click", function () {
    table.classList.toggle('hidden')
  })

  addBudgetButton.addEventListener("click", function () {
   
      const inputBudget = parseFloat(budgetInput.value);
      if (isNaN(inputBudget) || inputBudget <= 0) {
          alert("Please enter a valid budget amount.");
          return;
      }
      enableExpenseInputs()
      budget = inputBudget;
      remainingBudgetElement.textContent = `$${budget.toFixed(2)}`;
      budgetInput.disabled = true;
      addBudgetButton.disabled = true;
      enableExpenseInputs();
      localStorage.setItem("budget", budget.toFixed(2));
      showAddToBudget.classList.remove('hidden')
  });

  addToBudgetButton.addEventListener("click", function () {
    const additionalBudget = parseFloat(addToBudgetInput.value);
    if (isNaN(additionalBudget) || additionalBudget <= 0) {
        alert("Please enter a valid amount to add to the budget.");
        return;
    }
    budget += additionalBudget;
    budgetInput.value = budget.toFixed(2)
    remainingBudgetElement.textContent = `$${(budget -  calculateTotalAmountSpent()).toFixed(2)}`;
    localStorage.setItem("budget", budget.toFixed(2));
    addToBudgetInput.value = "";
    budgetInput.disabled = true;
    addBudgetButton.disabled = false;
    
    
    
});

  function enableExpenseInputs() {
      amountSpentInput.disabled = false;
      dateInput.disabled = false;
      descriptionInput.disabled = false;
      addExpenseButton.disabled = false;
  }

  addExpenseButton.addEventListener("click", function () {
      const amountSpent = parseFloat(amountSpentInput.value);
      const date = dateInput.value;
      const description = descriptionInput.value;

      if (isNaN(amountSpent) || amountSpent <= 0 || !date || !description) {
          alert("Please fill in all input fields.");
          return;
      }

      if (amountSpent > budget - calculateTotalAmountSpent()) {
          alert(`You cannot add this expense as remaining budget is $${(budget - calculateTotalAmountSpent()).toFixed(2)}`);
          return;
      }

      const expense = {
          date: date,
          amount: amountSpent,
          description: description
      };

      expenses.push(expense);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      renderExpenses();
      renderGraph();
      alert('Added')
    //   amountSpentInput.value = '';
    //   dateInput.value = '';
    //   descriptionInput.value = '';
  });

  clearExpensesButton.addEventListener("click", function () {
    previousExpenses = [...expenses];
    localStorage.setItem("previousExpenses", JSON.stringify(previousExpenses));
    localStorage.removeItem("expenses");

      expenses = [];
      renderExpenses();
      renderGraph();
      amountSpentInput.value = '';
      dateInput.value = '';
      descriptionInput.value = '';
      budgetInput.disabled = false;
      budgetInput.value = ''
      localStorage.removeItem("budget");
      remainingBudget = 0;
      remainingBudgetElement.textContent = ''
      console.log(remainingBudgetElement.textContent)
      showAddToBudget.classList.add('hidden')
     
    //   }else{
    //     if (localStorage.getItem("budget")) {
    //         budget = parseFloat(localStorage.getItem("budget"));
    //         remainingBudgetElement.textContent = ` $${budget.toFixed(2)}`;
    //         budgetInput.value = budget.toFixed(2);
    //         enableExpenseInputs();
    //     }
    //   }

      
      
  });

  showGraphButton.addEventListener("click", function () {
      if (chartContainer.classList.contains("hidden")) {
          renderGraph();
          chartContainer.classList.remove("hidden");
          showGraphButton.textContent = "Hide Graph";
      } else {
          chartContainer.classList.add("hidden");
          showGraphButton.textContent = "Show Graph";
      }
  });

  deleteExpenseButton.addEventListener("click", function () {
      const serialNumber = prompt("Enter the serial number of the expense to delete:");
      if (!serialNumber || isNaN(serialNumber)) {
          alert("Please enter a valid serial number.");
          return;
      }

      const index = parseInt(serialNumber) - 1;

      if (index < 0 || index >= expenses.length) {
          alert("Expense with the specified serial number does not exist.");
          return;
      }

      expenses.splice(index, 1);
      localStorage.setItem("expenses", JSON.stringify(expenses));
      renderExpenses();
      renderGraph();
  });

  previousExpensesButton.addEventListener("click", function () {
    showingPreviousExpenses = !showingPreviousExpenses;
    if (showingPreviousExpenses) {
        if (localStorage.getItem("previousExpenses")) {
            previousExpenses = JSON.parse(localStorage.getItem("previousExpenses"));
            renderPreviousExpenses();
        } else {
            alert("No previous expenses available.");
        }
        previousExpenseTableBody.parentElement.classList.remove("hidden");
        previousExpensesButton.textContent = "Hide Previous Expenses";
    } else {
        previousExpenseTableBody.parentElement.classList.add("hidden");
        previousExpensesButton.textContent = "Show Previous Expenses";
    }
});

  function renderExpenses() {
      expenseTableBody.innerHTML = "";
      expenses.forEach((expense, index) => {
          let row = document.createElement("tr");
          // Apply alternating background colors and text alignment
        // if (index % 2 === 0) {
        //     row.classList.add("bg-gray-500");
        // } else {
        //     row.classList.add("bg-red-200");
        // }

        row.className = "even:bg-slate-300 odd:bg-white"

        row.innerHTML = `
            <td class="px-4 py-2 text-center whitespace-nowrap">${index + 1}</td>
            <td class="px-4 py-2 text-center whitespace-nowrap">${expense.date}</td>
            <td class="px-4 py-2 text-center text-green-500 whitespace-nowrap">$${expense.amount.toFixed(2)}</td>
            <td class="px-4 py-2 text-center whitespace-nowrap">${expense.description}</td>
        `;
        expenseTableBody.appendChild(row);
      });
      totalAmountSpentElement.textContent = `$${calculateTotalAmountSpent().toFixed(2)}`;
      const remainingBudget = budget - calculateTotalAmountSpent();
      remainingBudgetElement.textContent = `$${remainingBudget.toFixed(2)}`;
  }

  function renderPreviousExpenses() {
    previousExpenseTableBody.innerHTML = "";
    previousExpenses.forEach((expense, index) => {
        const row = document.createElement("tr");

        // Apply Tailwind CSS classes for alternating row colors
        row.className = index % 2 === 0 ? "bg-white" : "bg-gray-50";

        row.innerHTML = `
            <td class="px-4 py-2 text-center">${index + 1}</td>
            <td class="px-4 py-2 text-center">${expense.date}</td>
            <td class="px-4 py-2 text-center">$${expense.amount.toFixed(2)}</td>
            <td class="px-4 py-2 text-center">${expense.description}</td>
        `;
        previousExpenseTableBody.appendChild(row);
    });

    if (previousExpenses.length > 0) {
        previousExpenseTableBody.parentElement.classList.remove("hidden");
        previousExpensesButton.textContent = "Hide Previous Expenses";
    } else {
        previousExpenseTableBody.parentElement.classList.add("hidden");
        previousExpensesButton.textContent = "Show Previous Expenses";
    }

    const totalPreviousExpenses = previousExpenses.reduce((total, expense) => total + expense.amount, 0);
    document.getElementById("total-previous-expenses").textContent = `$${totalPreviousExpenses.toFixed(2)}`;
}

  function calculateTotalAmountSpent() {
      return expenses.reduce((total, expense) => total + expense.amount, 0);
  }

  function renderGraph() {
    const existingChart = Chart.getChart("expense-chart");
    if (existingChart) {
        existingChart.destroy();
    }

    const dates = expenses.map(expense => expense.date);
    const amounts = expenses.map(expense => expense.amount);

    // Define an array of specific colors
    const colors = ["#9C27B0"];

    const ctx = document.getElementById("expense-chart").getContext("2d");
    new Chart(ctx, {
        type: "bar",
        data: {
            labels: dates,
            datasets: [{
                label: "Amount Spent",
                data: amounts,
                backgroundColor: colors,
                borderColor: "rgba(54, 162, 235, 1)", // Border color for bars
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                yAxes: [{
                    ticks: {
                        beginAtZero: true
                    }
                }]
            }
        }
    });
}

  // Initialize from localStorage
  if (localStorage.getItem("expenses")) {
      expenses = JSON.parse(localStorage.getItem("expenses"));
      renderExpenses();
  }
   
});
