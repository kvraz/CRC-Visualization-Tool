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

function addGaps(str) {
    return str.split('').join(' ');
}

function addGapsWithRed(temp, zerocount) {
    let result = '';
    for (let i = 0; i < temp.length; i++) {
        if (i < zerocount) {
            // Wrap characters before zerocount in red spans with gaps
            result += `<span style="color: red;">${temp.charAt(i)}</span>`;
        } else {
            result += `<span>${temp.charAt(i)}</span>`;
        }
    }
    return result;
}

function addGapsWithGreen(temp, zerocount) {
    let result = '';
    for (let i = 0; i < temp.length; i++) {
        if (i >= temp.length - zerocount) {
            // Wrap last zerocount characters in lime green spans with gaps
            result += `<span style="color: limegreen;">${temp.charAt(i)}</span>`;
        } else {
            result += `<span>${temp.charAt(i)}</span>`;
        }
    }
    return result;
}


function calculateRemainder(message, polynomial){
    const remainderContainer = document.getElementById('remainderContainer');
    

    let temp = '';
    for(let i=0; i<polynomial.length; i++) temp += message.charAt(i);   //Assigning part of the message with length equal to the polynomial to the temp

    let result = bitwiseXOR(temp, polynomial);  //Getting the result of the xor between the first part of the message and the polynomial
    
    let zerocount = 0;

    let messagePointer = polynomial.length;

    let index = 0;
    while(result.charAt(index) != 1){       //Counting how many zeros there are at the beggining of the polynomial
        zerocount++;
        index++;
    }

    let stepcount = 1;
    remainderContainer.innerHTML += `<h3>Step ${stepcount}:</h3>`;
    remainderContainer.innerHTML += `${ temp}<br>`;
    remainderContainer.innerHTML += `${ polynomial}<br><hr style="width: ${polynomial.length * 15}px;  float: left;"><br>`;
    remainderContainer.innerHTML += `${ addGapsWithRed(result, zerocount)}<br>`;

    let tempcounter = 0;
   
   
    //while(polynomial.length + zerocount < message.length){
    while(messagePointer < message.length){
        stepcount++;    //Calculating how many steps it takes for the algorithm to be completed
        tempzeroc = zerocount;

        temp = result;      //Clearing the previous part of the message
        for(let i=0; i<zerocount; i++) temp += message.charAt(messagePointer+ i); 
        messagePointer += zerocount;
        zerocount = 0;

   
        temp = temp.replace(/^0+/, '');
        
        if(temp.length < polynomial.length) {
            remainderContainer.innerHTML += `<br><h3>End of devision:</h3>`;
            remainderContainer.innerHTML += `R(x) = ${addGaps(temp)}<br><br>`;
            return temp;
        }

        result = bitwiseXOR(temp, polynomial);

        index = 0;
        while(result.charAt(index) != 1){       
            zerocount++;
            index++;
        }

        remainderContainer.innerHTML += `<h3>Step ${stepcount}:</h3>`;
        remainderContainer.innerHTML += `${ addGapsWithGreen(temp, tempzeroc)}<br>`;
        remainderContainer.innerHTML += `${ polynomial}<br><hr style="width: ${polynomial.length * 15}px;  float: left;"><br>`;
        remainderContainer.innerHTML += `${ addGapsWithRed(result, zerocount)}<br>`;

        tempcounter++;
    }

}

function addBinaryStrings(str1, str2) {
    let carry = 0;
    let result = '';

    // Ensure both strings have the same length by padding with leading zeros
    const maxLength = Math.max(str1.length, str2.length);
    const paddedStr1 = str1.padStart(maxLength, '0');
    const paddedStr2 = str2.padStart(maxLength, '0');

    // Iterate through the strings from right to left (LSB to MSB)
    for (let i = maxLength - 1; i >= 0; i--) {
        const bit1 = parseInt(paddedStr1[i]);
        const bit2 = parseInt(paddedStr2[i]);

        // Calculate the sum of bits and carry
        const sum = bit1 + bit2 + carry;

        // Determine the current bit in the result
        result = (sum % 2) + result;

        // Update the carry for the next iteration
        carry = Math.floor(sum / 2);
    }

    // Add the final carry if it exists
    if (carry > 0) {
        result = carry + result;
    }

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
    messageLine.textContent = `M(x) = ${addGaps(message)}`;
    polynomialLine.textContent = `G(x) = ${addGaps(convertToBinary(polynomial))}`;
    newLine.textContent = `M(x) * x^${polynomialGrade} = ${addGaps(newMessage)} `;

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
    const operationsContainer = document.getElementById('operationsContainer');
    const remainderContainer = document.getElementById('remainderContainer');
    const defaultValues = document.getElementById('defaultValues');
    const messageContainer = document.getElementById('messageContainer');
    const transmitContainer = document.getElementById('transmitContainer');
    

    let binaryPolynomial = convertToBinary(polynomial)
    let polynomialDegree = convertToBinary(polynomial).length - 1;
    let newMessage = message;
    for (let i = 0; i < convertToBinary(polynomial).length - 1; i++) {
        newMessage += '0';
    }

    

    // Display the newMessage and the polynomial in the remainder container
    defaultValues.innerHTML = '<h2>Reviewing Division Process</h2><br>';
    defaultValues.innerHTML += `M(x) * x^${polynomialDegree} = ${addGaps(newMessage)}<br>G(x) = ${addGaps(convertToBinary(polynomial))}<br> `;
    defaultValues.style.border = '2px solid #333';
    defaultValues.style.borderTopLeftRadius = '15px';
    defaultValues. style.borderTopRightRadius = '15px';
    
    let remainder = calculateRemainder(newMessage, binaryPolynomial);


    transmitContainer.style.border = '2px solid #333';
    transmitContainer.style.backgroundColor = '#333';
    transmitContainer.style.borderBottomLeftRadius = '15px';
    transmitContainer. style.borderBottomRightRadius = '15px';
    transmitContainer.style.color = '#ddd';

    transmitContainer.innerHTML += `T(x) = M(x) * x^${polynomialDegree} + R(x) = <br>
    ${addGaps(newMessage)} + ${addGaps(remainder)} = <br><br>
    <span style="color: limegreen">${addGaps(addBinaryStrings(newMessage, remainder))}</span><br><div id = "note">(This message will be sent from the Transmitter to the Receiver.)</div>
    `;

    remainderContainer.style.border = "2px solid #333";


});