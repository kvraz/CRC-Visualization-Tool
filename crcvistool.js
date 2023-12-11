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
            result += `<span style="color: red; padding: 2px;">${temp.charAt(i)}</span>`;
        } else {
            result += `<span style="padding: 2px;">${temp.charAt(i)}</span>`;
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

function calculateRemainder(message, polynomial, containerId){
    const container = document.getElementById(containerId);
    console.log("new calculation")
    console.log("------------------")

    let result = ''
    let temp = '';  //temp variable gets part of the message, equal with the polynomial size
    for(let i=0; i<polynomial.length; i++) temp += message.charAt(i);
    console.log("temp: "+temp)
    
    let messagePointer = temp.length;     //pointer to how many message bits have been used, initialized at the end of the polynomial
    console.log("message pointer: "+ messagePointer)

    let stepcount = 0;
   
    while(messagePointer <= message.length){
        stepcount++;    //increasing step count
        console.log("loop: "+ stepcount)
        

        result = bitwiseXOR(temp, polynomial);  //getting the next xor
        console.log("result: "+ result)

        let index = 0;
        let zerocount = 0;
        while(result.charAt(index) != 1 && index<result.length){   //calculating how many creates after the next xor
            zerocount++;
            index++;
        }

    

        console.log("zerocount: "+ zerocount)

        // if (zerocount == 0) zerocount = result.length;
        
        //Printing Data
        container.innerHTML += `<h3>Step ${stepcount}:</h3>`;
        container.innerHTML += `${addGaps(temp)}<br>`;
        //container.innerHTML += `${addGapsWithGreen(temp, tempzeroc)}<br>`;
        container.innerHTML += `${addGaps(polynomial)}<br><hr style="width: ${polynomial.length * 15}px; float: left;"><br>`;
        container.innerHTML += `${addGapsWithRed(result, zerocount)}<br>`;
        //container.innerHTML += `${addGaps(result)}<br>`;

        
        
        
        

        //copying the result into the next temp and replacing the zeros with the next #zero message bits
        temp = result;  
        temp = temp.replace(/^0+/, '');
        for(let i=0; i<zerocount; i++) temp += message.charAt(messagePointer+ i);
        console.log("temp: "+temp)

        messagePointer += zerocount;    //increasing the message pointer by #zero bits
        zerocount = 0;   //reinitializing the zero bit counter  
        console.log("message pointer: "+ messagePointer)
    } 
    
    console.log("out of the loop")
    if(temp == "") temp = '0';
    container.innerHTML += `<br><h3>End of division:</h3>`;
    container.innerHTML += `R(x) = ${addGaps(temp)}<br><br>`;
    return result;
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
    location.reload();
});

let transmitMessage; ////global value of the message to be transmitted to be check accross functions

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
    
    let remainder = calculateRemainder(newMessage, binaryPolynomial, 'remainderContainer');
    remainderContainer.style.border = "2px solid #333";

    transmitContainer.style.border = '2px solid #333';
    transmitContainer.style.backgroundColor = '#333';
    transmitContainer.style.borderBottomLeftRadius = '15px';
    transmitContainer. style.borderBottomRightRadius = '15px';
    transmitContainer.style.color = '#ddd';

    transmitMessage = addBinaryStrings(newMessage, remainder);
    transmitContainer.innerHTML += `T(x) = M(x) * x^${polynomialDegree} + R(x) = <br>
    ${addGaps(newMessage)} + ${addGaps(remainder)} = <br><br>
    <span style="color: limegreen">${addGaps(transmitMessage)}</span><br><div id = "note">(This message will be sent from the Transmitter to the Receiver.)</div>
    `;

    
    const checkContainer = document.getElementById('checkContainer');
    checkContainer.style.display = 'block';
    /*checkContainer.style.border = '2px solid #333';
    checkContainer.style.borderRadius = '15px'; */
 

});

document.getElementById('check-form').addEventListener('submit', function(event) {
    event.preventDefault(); // Prevent form submission

    const errorInsert = document.getElementById('errorInsert'); //Field for the check message input form
    const errorMessage = document.getElementById('errorMessageCheck');  //Wrong input notification field
    const { message, polynomial } = getValues();    //Get original message and polyomial
    let binaryPolynomial = convertToBinary(polynomial)  //Convert polynomial to binary format
    const inputMessage = document.getElementById('newmessage').value.trim().replace(/\s/g, '');;    //Get new message to be tested
    const resultContainer = document.getElementById('resultContainer'); //Field for the check results to be viewed


    if (!isBinary(inputMessage)) {  //Check new message for correct syntax
        errorMessage.textContent = 'Message not in binary format.';
        return; 
    }

    // If the input is in binary format clear any previous error message
    errorMessage.textContent = '';
    errorInsert.style.borderBottomLeftRadius = '0px';
    errorInsert.style.borderBottomRightRadius = '0px';

    const checkRemainder = document.getElementById('checkRemainder');   //Field for the calculations to take place
    checkRemainder.style.border = "2px solid #333";

    let newremainder = calculateRemainder(inputMessage, binaryPolynomial, 'checkRemainder');
    

    
    resultContainer.style.border = '2px solid #333';
    resultContainer.style.backgroundColor = '#333';
    resultContainer.style.borderBottomLeftRadius = '15px';
    resultContainer. style.borderBottomRightRadius = '15px';
    resultContainer.style.color = '#ddd';

    if(newremainder == '0'.repeat(newremainder.length)) newremainder = 0; else newremainder = 1;

    if((newremainder == 0) && inputMessage == transmitMessage)
        resultContainer.innerHTML = `<p>The remainder of the devision is 0 and the checked message was equal to the message the Transmitter sent. The Generator Polynomial was <span style="color: limegreen">effective.</span></p>`;
    else if((newremainder == 0) && inputMessage != transmitMessage)
        resultContainer.innerHTML = `<p>The remainder of the devision is 0 but the checked message was not equal to the message the Transmitter sent. The Generator Polynomial was not <span style="color: red">effective.</span></p>`;
    else if((newremainder != 0) && inputMessage == transmitMessage)
        resultContainer.innerHTML = `<p>The remainder of the devision is not 0 but the checked message was equal to the message the Transmitter sent. The Generator Polynomial was not <span style="color: red">effective.</span></p>`;
    else if((newremainder != 0) && inputMessage != transmitMessage)
        resultContainer.innerHTML = `<p>The remainder of the devision is not 0 and the checked message was not equal to the message the Transmitter sent. The Generator Polynomial was <span style="color: limegreen">effective.</span></p>`;
    

});

document.getElementById('clearButton').addEventListener('click', function(event) {
    event.preventDefault();

    document.getElementById('newmessage').value = '';
    document.getElementById('checkRemainder').innerHTML = '';
    document.getElementById('resultContainer').innerHTML = '';
    document.getElementById('errorMessageCheck').textContent = '';
});
