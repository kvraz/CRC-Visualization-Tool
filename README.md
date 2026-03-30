# CRC Visualization Tool

An interactive, static web app for learning how **Cyclic Redundancy Check (CRC)** works from both sides of the transmission flow:

- the **transmitter**, which appends the CRC remainder to the original message
- the **receiver**, which divides the received frame and checks whether the remainder is zero

The project stays intentionally lightweight: plain HTML, CSS, and JavaScript, with no build step and no external dependencies.

## What the app does

The tool helps you inspect the full CRC workflow:

1. Enter an initial binary message.
2. Enter a generator in either:
   - polynomial form, such as `x^4 + x + 1`
   - binary form, such as `10011`
3. Generate the padded message `M(x) * x^k`.
4. Visualize the CRC long division step by step.
5. See the final remainder and transmitted codeword.
6. Test a received frame at the receiver and observe whether the generator detects the change.

## Why this version is better

This refactor keeps the original educational idea intact, but improves the repo in several important ways:

- clearer transmitter-to-receiver workflow
- more consistent and polished UI
- responsive layout for desktop and mobile
- support for both polynomial input and binary generator input
- stronger validation and clearer error states
- modular JavaScript with separated parsing, CRC logic, rendering, and UI state
- richer visualization of each division step
- built-in receiver helpers such as:
  - reuse transmitted codeword
  - inject a one-bit error
  - instantly compare receiver output to the original transmission

## Running the project

Because the project is fully static, you can run it by simply opening:

- `crcvistool.html`

If you prefer, you can also serve the folder with any lightweight local server, but it is not required.

## Inputs and assumptions

### Initial message

- Must be binary.
- Spaces are allowed and will be ignored.

### Generator

Accepted formats:

- Polynomial notation: `x^4 + x + 1`
- Binary notation: `10011`

Generator rules:

- the highest-order term must exist
- the constant term `1` must exist
- for binary input, the first and last bit must be `1`

## Interface overview

### 1. Transmitter panel

The main form where the user enters:

- the original binary message
- the generator polynomial or generator bits

It also includes example presets for quick demos.

### 2. Encoding summary

After a valid run, the app shows:

- generator degree
- message length
- codeword length
- normalized generator polynomial
- generator bits
- original message
- padded message
- CRC remainder
- transmitted codeword

### 3. Division walkthrough

The app renders each generator alignment across the working register. For every step it shows:

- the current working state
- the aligned generator
- the register state after XOR, or after a shift-only step

This makes it easier to understand why CRC division moves the way it does.

### 4. Receiver validation

The receiver panel lets the user:

- check the transmitted codeword directly
- inject a one-bit error
- paste a custom received frame

The app then explains whether:

- the remainder is zero
- the received frame matches the transmitted codeword
- the error was detected or went undetected

## Project structure

- `crcvistool.html`
  Main application markup and workflow layout.

- `styles.css`
  Visual system, layout, step visualization styles, responsive rules, and motion.

- `crcvistool.js`
  CRC parsing, long-division logic, receiver checks, rendering, presets, and state handling.

- `PROJECT_OVERVIEW.md`
  A higher-level explanation of the app architecture and design choices.

## CRC logic used in the app

At a high level:

1. Convert the generator into binary coefficients.
2. Append `k` zeros to the message, where `k` is the generator degree.
3. Run polynomial long division in GF(2).
4. Take the final remainder.
5. Append the remainder to the original message to build the transmitted codeword.
6. At the receiver, divide the received frame by the same generator.
7. If the remainder is zero, the frame passes the CRC check.

Important note:

- A zero remainder does **not** guarantee that no error occurred.
- It only means the chosen generator did not detect that particular error pattern.

## License

No license file is included in this repository at the moment.
