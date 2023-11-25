function getValues() {
    const messageValue = document.getElementById('message').value.trim().replace(/\s/g, '');;
    const polynomialValue = document.getElementById('polynomial').value.trim();

    return {
        message: messageValue,
        polynomial: polynomialValue
    };
}


function isBinary(message) {
    return /^[01\s]+$/.test(message.replace(/\s/g, '')); // Ignore spaces in the test
}

function isValidPolynomial(polynomial) {
    return /^x\s*\^\s*\d+(\s*\+\s*x\s*\^\s*\d+)*(\s*\+\s*1)?$/i.test(polynomial.replace(/\s/g, ''));
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

    let binaryPolynomial = '';
    for (let i = maxExponent; i > 0; i--) {
        binaryPolynomial += matches.includes(i) ? '1' : '0'; // Check if the exponent exists in matches array
    }

    let lastLetter = polynomial.charAt(polynomial.length-1);
    if (lastLetter == 1 && polynomial.charAt(polynomial.length-2) != '^') binaryPolynomial += '1';
    else binaryPolynomial += '0';

    return binaryPolynomial;
}

function bitwiseXOR(str1, str2) {
    const minLength = Math.min(str1.length, str2.length);
    let result = '';
    
    for (let i = 0; i < minLength; i++) {
        if (str1.charAt(i) !== str2.charAt(i)) {
            result += '1';
        } else {
            result += '0';
        }
    }

    return result;
}
function calculateRemainder(message, polynomial){
    let result = bitwiseXOR(message, polynomial);
    

    // Trim leading zeros from the result
    result = result.replace(/^0+/, '');
    for (let j = 0; j<=(polynomial.length - result.length); j++) result += message.charAt(j + polynomial.length);

    let newmessage = result;

    for(let i=result.length; i<message.length; i++) newmessage += message.charAt(i);

    console.log(newmessage); //this is the result with the rest of the message's bits. xor must be perfomed to get next remainder
    return result;

}
let calculationDone = false; // Flag to track if initial calculation has been done

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
    newLine.textContent = `M(x) * x^${polynomialGrade} = ${newMessage} `;

    calculationDone = true; // Set the flag to indicate initial calculation done
});

document.getElementById('form').addEventListener('reset', function() {
    const messageLine = document.getElementById('messageValue');
    const polynomialLine = document.getElementById('polynomialValue');
    const newLine = document.getElementById('newValue');
    const errorMessage = document.getElementById('errorMessage');

    // Clear fields message when the form is reset
    errorMessage.textContent = ''; 
    messageLine.textContent = 'M(x) =';
    polynomialLine.textContent = 'G(x) ='; 
    newLine.textContent = 'M(x) * x^k = ';
});

document.querySelector('.values-box input[type="submit"]').addEventListener('click', function(event) {
    event.preventDefault(); // Prevent form submission for demonstration
    
    if (!calculationDone) {
        // Prevent "Calculate Remainder" if initial calculation hasn't been done
        return;
    }

    const { message, polynomial } = getValues();
    const remainderContainer = document.getElementById('remainderContainer');

    let binaryPolynomial = convertToBinary(polynomial)
    let polynomialGrade = convertToBinary(polynomial).length - 1;
    let newMessage = message;
    for (let i = 0; i < convertToBinary(polynomial).length - 1; i++) {
        newMessage += '0';
    }

    // Display the newMessage and the polynomial in the remainder container
    remainderContainer.innerHTML = `
        <p>M(x) * x^${polynomialGrade} = ${newMessage}<br>
        G(x) =  ${binaryPolynomial}</p>
    `;
    
    console.log(calculateRemainder(newMessage, binaryPolynomial))
});