const MAX_CONTRIBUTIONS = 60000;
const INCOME_THRESHOLD_40_PCT = 50270;
const TAX_TRAP_THRESHOLD = 100000;
const MAX_TAX_FREE = 268275;


document.getElementById("calculate-btn").addEventListener("click", function() {
    // Variables to hold data for the chart
    var labels = [];
    var currentPensionData = [];
    var twoPercentGrowthData = [];
    var fourPercentGrowthData = [];
    var sixPercentGrowthData = [];

    // Inputs from the form
    var currentAge = parseInt(document.getElementById('current-age').value);
    var retirementAge = parseInt(document.getElementById('retirement-age').value);
    var currentSalary = parseFloat(document.getElementById('current-salary').value);
    var salaryGrowth = parseFloat(document.getElementById('salary-growth').value) / 100;
    var employeeContributionPct = parseFloat(document.getElementById('employee-contribution').value) / 100;
    var employerContributionPct = parseFloat(document.getElementById('employer-contribution').value) / 100;
    var currentPensionPot = parseFloat(document.getElementById('current-pension-pot').value);

    var avoid40Tax = document.getElementById('avoid-40-tax').checked;
    var avoid100kTaxTrap = document.getElementById('avoid-100k-tax-trap').checked;

    var twoPercentGrowth = 0;
    var fourPercentGrowth = 0;
    var sixPercentGrowth = 0;

    // Clear previous results
    var resultsBody = document.getElementById('results-table-body');
    resultsBody.innerHTML = '';

    // Display the table
    document.getElementById('results-table').style.display = 'table';

    // Check if both checkboxes are selected
    if (avoid40Tax && avoid100kTaxTrap) {
        alert("Please select only one option between 'Avoid 40% Tax' and 'Avoid £100k tax trap'.");
        return;
    }

    // Reset data arrays
    labels = [];
    currentPensionData = [];
    twoPercentGrowthData = [];
    fourPercentGrowthData = [];
    sixPercentGrowthData = [];

    // Calculation logic
    for (var age = currentAge; age <= retirementAge; age++) {

        if (age != currentAge) {
            currentSalary *= (1 + salaryGrowth);
        }

        var employeeContributionVal = currentSalary * employeeContributionPct;
        var employerContributionVal = currentSalary * employerContributionPct;

        // Adjusting employee contribution if the "Avoid 40% Tax" is checked
        if (avoid40Tax && (currentSalary - employeeContributionVal) > INCOME_THRESHOLD_40_PCT) {
            employeeContributionVal = currentSalary - INCOME_THRESHOLD_40_PCT;
        }

        // Adjusting employee contribution if the "Avoid £100k tax trap" is checked
        if (avoid100kTaxTrap && (currentSalary - employeeContributionVal) > TAX_TRAP_THRESHOLD) {
            employeeContributionVal = currentSalary - TAX_TRAP_THRESHOLD;
        }

        var totalContributions = employeeContributionVal + employerContributionVal;

        // Check if total contributions exceed MAX_CONTRIBUTIONS
        if (totalContributions > MAX_CONTRIBUTIONS) {
            totalContributions = MAX_CONTRIBUTIONS;
            employeeContributionVal = MAX_CONTRIBUTIONS - employerContributionVal;
        }

        if (age != currentAge) {
            twoPercentGrowth = twoPercentGrowth* 1.02 + totalContributions;
            fourPercentGrowth = fourPercentGrowth * 1.04 + totalContributions;
            sixPercentGrowth = sixPercentGrowth * 1.06 + totalContributions;
        } else {
            twoPercentGrowth = currentPensionPot * 1.02 + totalContributions;
            fourPercentGrowth = currentPensionPot * 1.04 + totalContributions;
            sixPercentGrowth = currentPensionPot * 1.06 + totalContributions;
        }
        

        // Update pension pot for next year
        currentPensionPot += totalContributions;

        // Add rows to the results table
        var row = resultsBody.insertRow();
        row.insertCell(0).innerText = age;
        row.insertCell(1).innerText = `£${currentSalary.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(2).innerText = `£${employeeContributionVal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(3).innerText = `£${employerContributionVal.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(4).innerText = `£${totalContributions.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(5).innerText = `£${currentPensionPot.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(6).innerText = `£${twoPercentGrowth.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(7).innerText = `£${fourPercentGrowth.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
        row.insertCell(8).innerText = `£${sixPercentGrowth.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

    }
    addRowClickEvents();
});

// Add event listeners to rows
function addRowClickEvents() {
  const table = document.getElementById('results-table');
  const rows = table.getElementsByTagName('tr');
  for (let i = 1; i < rows.length; i++) { // Start from 1 to skip the header
    rows[i].addEventListener('click', function() {
      populateAndShowModal(this);
    });
  }
}

// Function to populate the modal and show it
function populateAndShowModal(row) {
  // Extract the growth values from the row
  const twoPercentGrowth = row.cells[row.cells.length - 3].innerText;
  const fourPercentGrowth = row.cells[row.cells.length - 2].innerText;
  const sixPercentGrowth = row.cells[row.cells.length - 1].innerText;

  // Populate the modal table
  const modalTableBody = document.getElementById('modal-table').querySelector('tbody');
  modalTableBody.innerHTML = `
    <tr>
      <td id="growthValue2">${twoPercentGrowth}</td>
      <td id="growthValue4">${fourPercentGrowth}</td>
      <td id="growthValue6">${sixPercentGrowth}</td>
    </tr>
  `;

  // Show the modal
  const modal = document.getElementById('myModal');
  modal.style.display = "block";

  // When the user clicks on <span> (x), close the modal
  modal.querySelector('.close').onclick = function() {
    modal.style.display = "none";
  };
}

// Close modal if user clicks outside of it
window.onclick = function(event) {
  const modal = document.getElementById('myModal');
  if (event.target === modal) {
    modal.style.display = "none";
  }
}

function parseCurrencyToNumber(currencyStr) {
  return parseFloat(currencyStr.replace(/[^0-9.-]+/g, "")) || 0;
}

document.getElementById('see-pension-income').addEventListener('click', function() {
  // Get the growth values from the table in the modal
  const growthValues = {
    '2': parseCurrencyToNumber(document.getElementById('growthValue2').textContent),
    '4': parseCurrencyToNumber(document.getElementById('growthValue4').textContent),
    '6': parseCurrencyToNumber(document.getElementById('growthValue6').textContent)
  };

  const drawdownInput = document.getElementById('drawdown').value;
  const drawdown_percentage = drawdownInput ? parseCurrencyToNumber(drawdownInput) / 100 : 0;
  const taxFreeCheckbox = document.getElementById('tax-free').checked;

  // Perform calculations for each growth value
  Object.keys(growthValues).forEach(growth => {
    const original_value = growthValues[growth];
    let tax_free_lump_sum = taxFreeCheckbox ? Math.min(original_value * 0.25, MAX_TAX_FREE) : 0;
    let left_for_drawdown = original_value - tax_free_lump_sum;
    let annual_drawdown = left_for_drawdown * drawdown_percentage;

    // Populate the calculations table with results
    document.getElementById(`taxFreeLumpSum${growth}`).textContent = `£${tax_free_lump_sum.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
    document.getElementById(`annualDrawdown${growth}`).textContent = `£${annual_drawdown.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  });

  // Show the calculations table
  document.getElementById('calculationsTable').style.display = 'table';
});

