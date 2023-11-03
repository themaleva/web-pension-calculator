document.getElementById("calculate-btn").addEventListener("click", function() {
    // Constants
    const MAX_CONTRIBUTIONS = 60000;
    const INCOME_THRESHOLD_40_PCT = 50270;
    const TAX_TRAP_THRESHOLD = 100000;

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
        row.insertCell(1).innerText = `£${currentSalary.toFixed(2)}`;
        row.insertCell(2).innerText = `£${employeeContributionVal.toFixed(2)}`;
        row.insertCell(3).innerText = `£${employerContributionVal.toFixed(2)}`;
        row.insertCell(4).innerText = `£${totalContributions.toFixed(2)}`;
        row.insertCell(5).innerText = `£${currentPensionPot.toFixed(2)}`;
        row.insertCell(6).innerText = `£${twoPercentGrowth.toFixed(2)}`;
        row.insertCell(7).innerText = `£${fourPercentGrowth.toFixed(2)}`;
        row.insertCell(8).innerText = `£${sixPercentGrowth.toFixed(2)}`;

        // Add data to the arrays for the chart
        labels.push(age);
        currentPensionData.push(currentPensionPot);
        twoPercentGrowthData.push(twoPercentGrowth);
        fourPercentGrowthData.push(fourPercentGrowth);
        sixPercentGrowthData.push(sixPercentGrowth);
    }
});


function drawChart() {
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
      type: 'line',
      data: {
        labels: labels,
        datasets: [{
          label: 'Current Pension Pot',
          data: currentPensionData,
          borderColor: 'rgba(255, 99, 132, 1)',
          borderWidth: 1
        }, {
          label: '2% Growth',
          data: twoPercentGrowthData,
          borderColor: 'rgba(54, 162, 235, 1)',
          borderWidth: 1
        }, {
          label: '4% Growth',
          data: fourPercentGrowthData,
          borderColor: 'rgba(75, 192, 192, 1)',
          borderWidth: 1
        }, {
          label: '6% Growth',
          data: sixPercentGrowthData,
          borderColor: 'rgba(153, 102, 255, 1)',
          borderWidth: 1
        }]
      },
      options: {
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }