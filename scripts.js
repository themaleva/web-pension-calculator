const MAX_CONTRIBUTIONS = 60000;
const INCOME_THRESHOLD_40_PCT = 50270;
const TAX_TRAP_THRESHOLD = 100000;
const MAX_TAX_FREE = 268275;


document.getElementById("calculate-btn").addEventListener("click", function() {
    calculatePensionProjections();
    addRowClickEvents();
});

function calculatePensionProjections() {
    // Get & Validate inputs from the form

    var currentAge = parseInt(document.getElementById('current-age').value);
    if(currentAge < 16 || currentAge > 100) {
      alert("Your age should be between 16-100");
      return;
    }

    var retirementAge = parseInt(document.getElementById('retirement-age').value);
    if(retirementAge < currentAge || retirementAge > 100) {
      alert("Your retirement age should be after your current age and not more than 100");
      return;
    }

    var currentSalary = parseFloat(document.getElementById('current-salary').value);
    if(currentSalary < 0) {
      alert("You can't have a negative salary!");
      return;
    } else if (currentSalary > 10000000) {
      alert("Salary above £10mil... really?!");
      return;
    }

    var employeeContributionPct = parseFloat(document.getElementById('employee-contribution').value) / 100;
    if (isNaN(employeeContributionPct)) {
      employeeContributionPct = 0;
    } else if(employeeContributionPct < 0 || employeeContributionPct > 1) {
      alert("Employee Contribution % must be between 0-100.");
      return; 
    }

    var employerContributionPct = parseFloat(document.getElementById('employer-contribution').value) / 100;
    if(isNaN(employerContributionPct)) {
      employerContributionPct = 0;
    } else if(employerContributionPct < 0 || employerContributionPct > 1) {
      alert("Employer Contribution % must be between 0-100.");
      return; 
    }

    var currentPensionPot = parseFloat(document.getElementById('current-pension-pot').value);
    if(currentPensionPot < 0) {
      alert("You can't have a negative pension pot!");
      return;
    } else if (currentPensionPot > 50000000) {
      alert("Pension pot above £50mil... really?!");
      return;
    }

    var salaryGrowth = parseFloat(document.getElementById('salary-growth').value) / 100;
    if(isNaN(salaryGrowth)) {
      salaryGrowth = 0;
    } else if(salaryGrowth > 1) {
      alert("Your salary growth is highly unlikely to more than double every year!");
      return;
    }

    var annualBonus = parseFloat(document.getElementById('annual-bonus').value);
    if(isNaN(annualBonus)) {
      annualBonus = 0;
    }

    var bonusContributionPct = parseFloat(document.getElementById('bonus-contribution').value) / 100;
    if(isNaN(bonusContributionPct)) {
      bonusContributionPct = 0;
    } else if (bonusContributionPct < 0 || bonusContributionPct > 1) {
      alert("Bonus Contribution % must be between 0-100.");
      return;
    }

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

    // Calculation logic
    for (var age = currentAge; age <= retirementAge; age++) {

        if (age != currentAge) {
            currentSalary *= (1 + salaryGrowth);
        }

        var employeeContributionVal = currentSalary * employeeContributionPct;
        var employerContributionVal = currentSalary * employerContributionPct;
        
        // Calculate the bonus contribution
        var bonusContributionVal = annualBonus * bonusContributionPct;
        employeeContributionVal += bonusContributionVal;

        // Adjusting employee contribution if the "Avoid 40% Tax" is checked
        if (avoid40Tax && (currentSalary + annualBonus - employeeContributionVal) > INCOME_THRESHOLD_40_PCT) {
          employeeContributionVal = (currentSalary + annualBonus) - INCOME_THRESHOLD_40_PCT;
        }

        // Adjusting employee contribution if the "Avoid £100k tax trap" is checked
        if (avoid100kTaxTrap && (currentSalary + annualBonus - employeeContributionVal) > TAX_TRAP_THRESHOLD) {
          employeeContributionVal = (currentSalary + annualBonus) - TAX_TRAP_THRESHOLD;
        }

        // Recalculate total contributions after potential tax adjustments
        var totalContributions = employeeContributionVal + employerContributionVal;

        // Ensure total contributions do not exceed the maximum limit
        if (totalContributions > MAX_CONTRIBUTIONS) {
          // If total contributions exceed the limit, adjust the employee's contribution
          employeeContributionVal = MAX_CONTRIBUTIONS - employerContributionVal;
          // Set total contributions to the max allowed
          totalContributions = MAX_CONTRIBUTIONS;
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
}

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
    clearCalculationsTable();
    modal.style.display = "none";
  };
}

// Close modal if user clicks outside of it
window.onclick = function(event) {
  const modal = document.getElementById('myModal');
  if (event.target === modal) {
    modal.style.display = "none";
    clearCalculationsTable();
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

// Function to clear the fields in the calculations table
function clearCalculationsTable() {
    // Clear Tax Free Lump Sum fields
    document.getElementById('taxFreeLumpSum2').textContent = '';
    document.getElementById('taxFreeLumpSum4').textContent = '';
    document.getElementById('taxFreeLumpSum6').textContent = '';

    // Clear Annual Drawdown fields
    document.getElementById('annualDrawdown2').textContent = '';
    document.getElementById('annualDrawdown4').textContent = '';
    document.getElementById('annualDrawdown6').textContent = '';

    // Hide the calculations table container
    document.getElementById('calculationsTable').style.display = 'none';
};
