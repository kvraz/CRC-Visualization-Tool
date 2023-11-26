# CRC Visualization Tool

This is a Calculator Tool to visualize how the CRC (Cyclic Redundancy Check) works.

Inputs:
- The message the user want to transmit.
- A generator polynomial that will be used to devide the message

Process:
1. The polynomial is converted into a binary format.
2. The original message is extened, depending on the degree of the given polynomial.
3. Bitwise XOR is performed successively between the expanded message and the polynomial to determine the devision remainder.
4. The remainder is added on the message to determine the final bit sequence that will be transmitted.

Additional Feature:
Given the generator polynomial and the calculated message, the user can test messages of his own to see if the generator will detect the altered bits. The process is similar to the main calculation.
If the generator the user picked is effective, the remainder of the corrupted message from its devision with the polynomial will not be zero. If for some reason it is, that means that the polynomial did not manage to detect the altered bits. Vice versa, it is possible for the remainder to have zero value, but for the two messages being compared to be different. This is another indication that the specific generator polynomial is not suitable for that message.

In both message calculation and message check case every XOR phase is displayed with red colors for the bits that are from the remainder and green color for the bits that are added to the remainder from the original message.

Given the algorithm and the HTML and CCS properties are in a very initial stage, there might be bugs in the calculator.
