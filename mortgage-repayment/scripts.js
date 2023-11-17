document.getElementById("calculate-btn").addEventListener("click", function() {
    // Read inputs from the form
    var balance = parseFloat(document.getElementById('mortgage-balance').value);
    var term = parseInt(document.getElementById('mortgage-term').value);
    var interestRate = parseFloat(document.getElementById('interest-rate').value) / 100;
    var monthlyPayment = parseFloat(document.getElementById('monthly-payment').value);
    var oneOffOverpayment = parseFloat(document.getElementById('one-off-overpayment').value) || 0;
    var monthlyOverpayment = parseFloat(document.getElementById('monthly-overpayment').value) || 0;
    var mortgageType = document.querySelector('input[name="mortgage-type"]:checked').value;

    // Calculate monthly mortgage payment if not provided
    if (!monthlyPayment) {
        monthlyPayment = calculateMonthlyMortgagePayment(balance, interestRate, term);
    }

    // Calculate the remaining balance over time
    var results = calculateMortgage(balance, term, interestRate, monthlyPayment, oneOffOverpayment, monthlyOverpayment, mortgageType);

    // Display the results
    displayResults(results);
});

function calculateMonthlyMortgagePayment(principal, annualInterestRate, years) {
    var monthlyInterestRate = annualInterestRate / 12;
    var numberOfPayments = years * 12;

    var monthlyPayment = principal * (monthlyInterestRate * Math.pow(1 + monthlyInterestRate, numberOfPayments)) / (Math.pow(1 + monthlyInterestRate, numberOfPayments) - 1);

    return monthlyPayment;
}

function calculateMortgage(balance, term, interestRate, monthlyPayment, oneOffOverpayment, monthlyOverpayment, mortgageType) {
    var results = [];
    var monthlyInterestRate = interestRate / 12;

    var balanceWithOverpayment = balance - oneOffOverpayment;
    var balanceWithoutOverpayment = balance;
    
    // Add Year 0 to the results
    results.push({
        year: 0,
        balanceWithOverpayment: balance,
        balanceWithoutOverpayment: balance
    });

    for (var month = 1; month <= term * 12; month++) {
        var interestThisMonth = balanceWithOverpayment * monthlyInterestRate;

        if (mortgageType === "Repayment") {
            balanceWithOverpayment -= (monthlyPayment + monthlyOverpayment - interestThisMonth);
            balanceWithoutOverpayment -= (monthlyPayment - balanceWithoutOverpayment * monthlyInterestRate);
        } else { // Interest Only
            balanceWithOverpayment -= monthlyOverpayment;
            // For interest-only mortgages, the monthly payment only covers interest
            balanceWithoutOverpayment -= 0; // No reduction in principal
        }

        // Avoid negative balances
        balanceWithOverpayment = Math.max(0, balanceWithOverpayment);
        balanceWithoutOverpayment = Math.max(0, balanceWithoutOverpayment);

        if (month % 12 === 0) { // Store annually
            results.push({
                year: month / 12,
                balanceWithOverpayment: balanceWithOverpayment,
                balanceWithoutOverpayment: balanceWithoutOverpayment
            });
        }

        // Break if both balances are cleared
        if (balanceWithOverpayment <= 0 && balanceWithoutOverpayment <= 0) {
            break;
        }
    }

    return results;
}

function displayResults(results) {
    var resultsContainer = document.getElementById('results-container');
    var table = '<table><tr><th>Year</th><th>Without Overpayments (£)</th><th>With Overpayments (£)</th></tr>';

    results.forEach(function(result) {
        var formattedBalanceWithout = Math.round(result.balanceWithoutOverpayment).toLocaleString();
        var formattedBalanceWith = Math.round(result.balanceWithOverpayment).toLocaleString();

        table += '<tr><td>' + result.year + '</td><td>£' + formattedBalanceWithout + '</td><td>£' + formattedBalanceWith + '</td></tr>';
    });

    table += '</table>';
    resultsContainer.innerHTML = table;
    resultsContainer.style.display = 'block';
}
