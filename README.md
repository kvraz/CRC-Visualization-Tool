# CRC Visualization Tool

The **CRC Visualization Tool** is designed to help you understand and visualize how the Cyclic Redundancy Check (CRC) works.

## Features

- **Input Requirements**:
  - A message that you want to transmit.
  - A generator polynomial used for dividing the message.

## How It Works

1. **Binary Conversion**: The generator polynomial is converted into a binary format.
2. **Message Extension**: The original message is extended based on the degree of the polynomial.
3. **Bitwise XOR Operation**: Successive bitwise XOR operations are performed between the expanded message and the polynomial to determine the division remainder.
4. **Final Bit Sequence**: The remainder is appended to the original message to create the final bit sequence that will be transmitted.

## Additional Feature

Once you have the generator polynomial and the calculated message, you can test custom messages to see if the generator detects any altered bits. This process mirrors the main calculation:

- If the polynomial effectively detects errors, the remainder from dividing the corrupted message by the polynomial will not be zero.
- Conversely, a zero remainder indicates that the polynomial failed to detect the altered bits, which is a concern. It's also important to note that a zero remainder does not guarantee that the two messages are identical.

### Visual Feedback

During both the message calculation and testing phases, each XOR operation is visually represented:
- **Red** for bits from the remainder.
- **Green** for bits from the original message added to the remainder.

## Note

As this tool is in its initial stages of development, you may encounter bugs. Your feedback and contributions are welcome!

Feel free to explore and learn more about CRC through this interactive tool!
