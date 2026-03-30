const refs = {
    crcForm: document.getElementById("crcForm"),
    messageInput: document.getElementById("messageInput"),
    generatorInput: document.getElementById("generatorInput"),
    formMessage: document.getElementById("formMessage"),
    summaryContainer: document.getElementById("summaryContainer"),
    divisionSection: document.getElementById("divisionSection"),
    divisionBand: document.getElementById("divisionBand"),
    divisionSteps: document.getElementById("divisionSteps"),
    receiverSection: document.getElementById("receiverSection"),
    receiverForm: document.getElementById("receiverForm"),
    receiverInput: document.getElementById("receiverInput"),
    receiverMessage: document.getElementById("receiverMessage"),
    receiverSummary: document.getElementById("receiverSummary"),
    receiverSteps: document.getElementById("receiverSteps"),
    useCodewordButton: document.getElementById("useCodewordButton"),
    flipBitButton: document.getElementById("flipBitButton"),
    clearReceiverButton: document.getElementById("clearReceiverButton"),
    presetButtons: Array.from(document.querySelectorAll(".preset-button")),
};

const state = {
    encoded: null,
    receiverResult: null,
};

function setFormMessage(element, message, tone = "neutral") {
    element.textContent = message;
    element.classList.remove("is-error", "is-success");

    if (tone === "error") {
        element.classList.add("is-error");
    } else if (tone === "success") {
        element.classList.add("is-success");
    }
}

function normalizeBinaryInput(value) {
    return value.replace(/\s+/g, "");
}

function isBinaryString(value) {
    return /^[01]+$/.test(value);
}

function escapeHtml(value) {
    return value
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");
}

function exponentToTerm(exponent) {
    if (exponent === 0) {
        return "1";
    }

    if (exponent === 1) {
        return "x";
    }

    return `x^${exponent}`;
}

function binaryToPolynomial(binary) {
    const terms = [];

    for (let index = 0; index < binary.length; index += 1) {
        if (binary[index] === "1") {
            const exponent = binary.length - index - 1;
            terms.push(exponentToTerm(exponent));
        }
    }

    return terms.join(" + ");
}

function parseGenerator(input) {
    const sanitized = input.toLowerCase().replace(/\s+/g, "");

    if (!sanitized) {
        throw new Error("Enter a generator polynomial or binary generator.");
    }

    if (/^[01]+$/.test(sanitized)) {
        if (sanitized.length < 2) {
            throw new Error("The binary generator must contain at least 2 bits.");
        }

        if (sanitized[0] !== "1" || sanitized[sanitized.length - 1] !== "1") {
            throw new Error("A CRC generator must start and end with 1.");
        }

        return {
            binary: sanitized,
            degree: sanitized.length - 1,
            displayLabel: sanitized,
            polynomialLabel: binaryToPolynomial(sanitized),
        };
    }

    const tokens = sanitized.split("+");

    if (!tokens.length || tokens.some((token) => token === "")) {
        throw new Error("Use a valid polynomial such as x^4 + x + 1.");
    }

    const exponents = new Set();

    tokens.forEach((token) => {
        if (token === "1") {
            exponents.add(0);
            return;
        }

        if (token === "x") {
            exponents.add(1);
            return;
        }

        if (/^x\^\d+$/.test(token)) {
            exponents.add(Number(token.slice(2)));
            return;
        }

        throw new Error("Use a polynomial like x^4 + x + 1.");
    });

    const maxExponent = Math.max(...exponents);

    if (maxExponent < 1) {
        throw new Error("The generator degree must be at least 1.");
    }

    if (!exponents.has(0)) {
        throw new Error("The generator must include the constant term 1.");
    }

    const sortedExponents = [...exponents].sort((left, right) => right - left);
    let binary = "";

    for (let exponent = maxExponent; exponent >= 0; exponent -= 1) {
        binary += exponents.has(exponent) ? "1" : "0";
    }

    return {
        binary,
        degree: maxExponent,
        displayLabel: sortedExponents.map(exponentToTerm).join(" + "),
        polynomialLabel: sortedExponents.map(exponentToTerm).join(" + "),
    };
}

function computeDivisionTrace(messageBits, generatorBits) {
    const working = messageBits.split("");
    const steps = [];
    const generatorLength = generatorBits.length;

    for (
        let position = 0;
        position <= working.length - generatorLength;
        position += 1
    ) {
        const beforeState = working.join("");
        const active = beforeState[position] === "1";

        if (active) {
            for (let offset = 0; offset < generatorLength; offset += 1) {
                working[position + offset] =
                    working[position + offset] === generatorBits[offset] ? "0" : "1";
            }
        }

        steps.push({
            position,
            beforeState,
            afterState: working.join(""),
            active,
        });
    }

    const degree = generatorBits.length - 1;

    return {
        steps,
        remainder: working.slice(-degree).join(""),
    };
}

function encodeMessage(messageBits, generator) {
    const paddedMessage = `${messageBits}${"0".repeat(generator.degree)}`;
    const division = computeDivisionTrace(paddedMessage, generator.binary);
    const remainder = division.remainder.padStart(generator.degree, "0");

    return {
        messageBits,
        generator,
        paddedMessage,
        remainder,
        codeword: `${messageBits}${remainder}`,
        division,
    };
}

function evaluateReceivedMessage(receivedBits, encoded) {
    const division = computeDivisionTrace(receivedBits, encoded.generator.binary);
    const remainder = division.remainder.padStart(encoded.generator.degree, "0");
    const remainderIsZero = /^0+$/.test(remainder);
    const matchesCodeword = receivedBits === encoded.codeword;

    let tone = "neutral";
    let title = "Receiver analysis complete";
    let detail =
        "The receiver finished the division and compared the frame against the transmitted codeword.";

    if (remainderIsZero && matchesCodeword) {
        tone = "success";
        title = "No transmission error detected";
        detail =
            "The remainder is zero and the received frame matches the transmitted codeword, so the receiver accepts the message.";
    } else if (remainderIsZero && !matchesCodeword) {
        tone = "warning";
        title = "Undetected error pattern";
        detail =
            "The remainder is zero even though the received frame differs from the transmitted codeword. This is an error pattern that this generator does not catch.";
    } else if (!remainderIsZero && !matchesCodeword) {
        tone = "danger";
        title = "Transmission error detected";
        detail =
            "A non-zero remainder shows that the altered frame is inconsistent with the generator, so the receiver flags corruption.";
    } else if (!remainderIsZero && matchesCodeword) {
        tone = "danger";
        title = "Unexpected CRC mismatch";
        detail =
            "The frame matches the transmitted codeword but produced a non-zero remainder. This indicates an inconsistent state and should not occur for a valid codeword.";
    }

    return {
        receivedBits,
        remainder,
        remainderIsZero,
        matchesCodeword,
        tone,
        title,
        detail,
        division,
    };
}

function renderBitLine(bits, emphasisClass = "") {
    const bitClass = emphasisClass ? `bit-cell ${emphasisClass}` : "bit-cell";

    return `
        <div class="bitline">
            ${bits
                .split("")
                .map((bit) => `<span class="${bitClass}">${escapeHtml(bit)}</span>`)
                .join("")}
        </div>
    `;
}

function renderStateTrack(bits, start, length, highlightClass) {
    return `
        <div class="bit-track">
            ${bits
                .split("")
                .map((bit, index) => {
                    const cellClass =
                        index >= start && index < start + length
                            ? `bit-cell ${highlightClass}`
                            : "bit-cell";

                    return `<span class="${cellClass}">${escapeHtml(bit)}</span>`;
                })
                .join("")}
        </div>
    `;
}

function renderGeneratorTrack(generatorBits, position, totalLength, isActive) {
    const generatorClass = isActive ? "generator" : "generator-muted";

    return `
        <div class="bit-track">
            ${Array.from({ length: totalLength }, (_, index) => {
                if (index < position || index >= position + generatorBits.length) {
                    return '<span class="bit-cell spacer">.</span>';
                }

                return `<span class="bit-cell ${generatorClass}">${
                    generatorBits[index - position]
                }</span>`;
            }).join("")}
        </div>
    `;
}

function renderSummary(encoded) {
    refs.summaryContainer.className = "summary-shell";
    refs.summaryContainer.innerHTML = `
        <div class="metric-bar">
            <div class="metric">
                <span>Generator degree</span>
                <strong>${encoded.generator.degree}</strong>
            </div>
            <div class="metric">
                <span>Message length</span>
                <strong>${encoded.messageBits.length} bits</strong>
            </div>
            <div class="metric">
                <span>Codeword length</span>
                <strong>${encoded.codeword.length} bits</strong>
            </div>
        </div>

        <div class="detail-list">
            <div class="detail-item">
                <span>Generator polynomial</span>
                <code>${escapeHtml(encoded.generator.polynomialLabel)}</code>
            </div>
            <div class="detail-item">
                <span>Generator bits</span>
                ${renderBitLine(encoded.generator.binary)}
            </div>
            <div class="detail-item">
                <span>Initial message</span>
                ${renderBitLine(encoded.messageBits)}
            </div>
            <div class="detail-item">
                <span>Padded message M(x) · x^k</span>
                ${renderBitLine(encoded.paddedMessage)}
            </div>
            <div class="detail-item">
                <span>CRC remainder</span>
                ${renderBitLine(encoded.remainder, "remainder")}
            </div>
            <div class="detail-item">
                <span>Transmitted codeword</span>
                ${renderBitLine(encoded.codeword, "codeword")}
            </div>
        </div>
    `;
}

function renderDivisionBand(encoded) {
    refs.divisionBand.innerHTML = `
        <div class="band-item">
            <span>Generator</span>
            ${renderBitLine(encoded.generator.binary)}
        </div>
        <div class="band-item">
            <span>Remainder</span>
            ${renderBitLine(encoded.remainder, "remainder")}
        </div>
        <div class="band-item">
            <span>Codeword</span>
            ${renderBitLine(encoded.codeword)}
        </div>
    `;
}

function renderDivisionSteps(container, steps, generatorBits) {
    container.innerHTML = steps
        .map((step, index) => {
            const stepTypeLabel = step.active ? "XOR applied" : "Shift only";
            const stepNote = step.active
                ? "The aligned window starts with 1, so the generator is XORed with the working register."
                : "The aligned window starts with 0, so the generator slides to the next position without changing the register.";

            return `
                <article class="division-step ${step.active ? "is-active" : "is-passive"}">
                    <div class="step-top">
                        <div>
                            <p class="step-index">Step ${index + 1}</p>
                            <h3>Align generator at bit ${step.position + 1}</h3>
                        </div>
                        <span class="step-tag">${stepTypeLabel}</span>
                    </div>

                    <div class="bit-rows">
                        <div class="bit-row">
                            <span class="row-label">Working</span>
                            ${renderStateTrack(
                                step.beforeState,
                                step.position,
                                generatorBits.length,
                                "range"
                            )}
                        </div>

                        <div class="bit-row">
                            <span class="row-label">Generator</span>
                            ${renderGeneratorTrack(
                                generatorBits,
                                step.position,
                                step.beforeState.length,
                                step.active
                            )}
                        </div>

                        <div class="bit-row">
                            <span class="row-label">After</span>
                            ${renderStateTrack(
                                step.afterState,
                                step.position,
                                generatorBits.length,
                                step.active ? "after" : "range"
                            )}
                        </div>
                    </div>

                    <p class="step-note">${stepNote}</p>
                </article>
            `;
        })
        .join("");
}

function renderReceiverSummary(result, note = "") {
    refs.receiverSummary.className = `panel verdict-panel verdict-${result.tone}`;
    refs.receiverSummary.innerHTML = `
        <p class="verdict-kicker">Receiver verdict</p>
        <h3>${escapeHtml(result.title)}</h3>
        <p>${escapeHtml(result.detail)}</p>
        ${note ? `<p class="step-note">${escapeHtml(note)}</p>` : ""}
        <div class="verdict-facts">
            <div class="verdict-fact">
                <span>Received frame</span>
                <strong>${result.receivedBits.length} bits</strong>
            </div>
            <div class="verdict-fact">
                <span>Remainder</span>
                <strong>${escapeHtml(result.remainder)}</strong>
            </div>
            <div class="verdict-fact">
                <span>Matches transmitted codeword</span>
                <strong>${result.matchesCodeword ? "Yes" : "No"}</strong>
            </div>
        </div>
    `;
}

function resetReceiverView() {
    refs.receiverInput.value = "";
    refs.receiverSteps.innerHTML = "";
    refs.receiverSummary.className = "panel verdict-panel verdict-neutral";
    refs.receiverSummary.innerHTML = `
        <p class="verdict-kicker">Receiver verdict</p>
        <h3>Waiting for a candidate message</h3>
        <p>
            Once you run a receiver check, the remainder analysis and detection result
            will appear here.
        </p>
    `;
    setFormMessage(refs.receiverMessage, "");
    state.receiverResult = null;
}

function resetWorkspace() {
    state.encoded = null;
    resetReceiverView();

    refs.summaryContainer.className = "empty-state";
    refs.summaryContainer.innerHTML =
        "Run a calculation to see the generator bits, padded message, remainder, and final transmitted codeword.";
    refs.divisionBand.innerHTML = "";
    refs.divisionSteps.innerHTML = "";
    refs.divisionSection.classList.add("is-hidden");
    refs.receiverSection.classList.add("is-hidden");
    setFormMessage(refs.formMessage, "");
}

function runReceiverCheck(customBits = null, note = "") {
    if (!state.encoded) {
        setFormMessage(refs.receiverMessage, "Run the transmitter workflow first.", "error");
        return;
    }

    const receivedBits = normalizeBinaryInput(customBits ?? refs.receiverInput.value);

    if (!receivedBits) {
        setFormMessage(refs.receiverMessage, "Enter a received message to check.", "error");
        return;
    }

    if (!isBinaryString(receivedBits)) {
        setFormMessage(refs.receiverMessage, "The received message must be binary.", "error");
        return;
    }

    if (receivedBits.length !== state.encoded.codeword.length) {
        setFormMessage(
            refs.receiverMessage,
            `The received message must be ${state.encoded.codeword.length} bits long.`,
            "error"
        );
        return;
    }

    refs.receiverInput.value = receivedBits;

    const result = evaluateReceivedMessage(receivedBits, state.encoded);
    state.receiverResult = result;

    renderReceiverSummary(result, note);
    renderDivisionSteps(refs.receiverSteps, result.division.steps, state.encoded.generator.binary);
    setFormMessage(refs.receiverMessage, "Receiver check complete.", "success");
}

refs.crcForm.addEventListener("submit", (event) => {
    event.preventDefault();

    const messageBits = normalizeBinaryInput(refs.messageInput.value);

    if (!messageBits) {
        setFormMessage(refs.formMessage, "Enter an initial message.", "error");
        return;
    }

    if (!isBinaryString(messageBits)) {
        setFormMessage(refs.formMessage, "The initial message must be binary.", "error");
        return;
    }

    let generator;

    try {
        generator = parseGenerator(refs.generatorInput.value);
    } catch (error) {
        setFormMessage(refs.formMessage, error.message, "error");
        return;
    }

    const encoded = encodeMessage(messageBits, generator);
    state.encoded = encoded;

    renderSummary(encoded);
    renderDivisionBand(encoded);
    renderDivisionSteps(refs.divisionSteps, encoded.division.steps, encoded.generator.binary);

    refs.divisionSection.classList.remove("is-hidden");
    refs.receiverSection.classList.remove("is-hidden");
    refs.receiverInput.value = encoded.codeword;
    refs.receiverSteps.innerHTML = "";
    refs.receiverSummary.className = "panel verdict-panel verdict-neutral";
    refs.receiverSummary.innerHTML = `
        <p class="verdict-kicker">Receiver verdict</p>
        <h3>Ready to validate</h3>
        <p>
            The transmitted codeword has been loaded into the receiver input. You can
            check it as-is or inject an error first.
        </p>
    `;
    setFormMessage(refs.formMessage, "CRC encoding complete.", "success");
    setFormMessage(refs.receiverMessage, "");
});

refs.crcForm.addEventListener("reset", () => {
    window.setTimeout(() => {
        resetWorkspace();
    }, 0);
});

refs.receiverForm.addEventListener("submit", (event) => {
    event.preventDefault();
    runReceiverCheck();
});

refs.useCodewordButton.addEventListener("click", () => {
    if (!state.encoded) {
        setFormMessage(refs.receiverMessage, "Run the transmitter workflow first.", "error");
        return;
    }

    runReceiverCheck(state.encoded.codeword, "The original transmitted codeword was re-used.");
});

refs.flipBitButton.addEventListener("click", () => {
    if (!state.encoded) {
        setFormMessage(refs.receiverMessage, "Run the transmitter workflow first.", "error");
        return;
    }

    const bits = state.encoded.codeword.split("");
    const randomIndex = Math.floor(Math.random() * bits.length);
    bits[randomIndex] = bits[randomIndex] === "1" ? "0" : "1";

    runReceiverCheck(
        bits.join(""),
        `Introduced a 1-bit error at position ${randomIndex + 1}.`
    );
});

refs.clearReceiverButton.addEventListener("click", () => {
    resetReceiverView();
});

refs.presetButtons.forEach((button) => {
    button.addEventListener("click", () => {
        refs.messageInput.value = button.dataset.message ?? "";
        refs.generatorInput.value = button.dataset.generator ?? "";
        setFormMessage(refs.formMessage, "Example preset loaded.", "success");
    });
});

resetWorkspace();
