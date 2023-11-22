function getValues() {
    const messageValue = document.getElementById('message').value;
    const polynomialValue = document.getElementById('polynomial').value;

    return {
        message: messageValue,
        polynomial: polynomialValue
    };
}

function isBinary(message) {
    return /^[01]+$/.test(message); // Regex to check if the string contains only 0s and 1s
}

function isValidPolynomial(polynomial) {
    // Regular expression to match the polynomial format: x^k + x^(k-1) + ... + 1
    return /^x\^\d+(\s*\+\s*x\^\d+)*(\s*\+\s*1)?$/i.test(polynomial);
}

function convertToBinary(polynomial) {
    const regex = /x\^(\d+)/gi; // Regex to extract exponents of x
    const matches = [];
    let match;

    while ((match = regex.exec(polynomial)) !== null) {
        matches.push(parseInt(match[1])); // Extract and store the exponents as integers
    }

    if (matches.length === 0) {
        return '0'; // If no x^k terms, return '0'
    }

    const maxExponent = Math.max(...matches); // Find the maximum exponent

    let binaryString = '';
    for (let i = maxExponent; i > 0; i--) {
        binaryString += matches.includes(i) ? '1' : '0'; // Check if the exponent exists in matches array
    }

    let lastLetter = polynomial.charAt(polynomial.length-1);
    if (lastLetter == 1 && polynomial.charAt(polynomial.length-2) != '^') binaryString += '1';
    else binaryString += '0';

    return binaryString;
}

document.getElementById('form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission for demonstration

    const { message, polynomial } = getValues();
    const messageLine = document.getElementById('messageValue');
    const polynomialLine = document.getElementById('polynomialValue');
    const newLine = document.getElementById('newValue');
    const errorMessage = document.getElementById('errorMessage');

    if (!isBinary(message)) {
        errorMessage.textContent = 'Message not in binary format.';
        return; // Stop further execution
    }

    if (!isValidPolynomial(polynomial)) {
        errorMessage.textContent = 'Generator not in polynomial format.';
        return; // Stop further execution
    }

    let polynomialGrade = convertToBinary(polynomial).length - 1;
    let newMessage = message;
    for(let i = 0; i<convertToBinary(polynomial).length-1; i++) newMessage += '0';

    errorMessage.textContent = ''; // Clear previous error message if it was displayed
    messageLine.textContent = `M(x) = ${message}`;
    polynomialLine.textContent = `G(x) = ${convertToBinary(polynomial)}`;
    newLine.textContent = `M(x) * x^${polynomialGrade} = ${newMessage}`;

});

document.getElementById('form').addEventListener('reset', function() {
    const errorMessage = document.getElementById('errorMessage');
    const polynomialLine = document.getElementById('polynomialValue');

    errorMessage.textContent = ''; // Clear error message when the form is reset
    messageLine.textContent = '';
    polynomialLine.textContent = ''; // Clear polynomial display when the form is reset
    newLine.textContent = '';
});