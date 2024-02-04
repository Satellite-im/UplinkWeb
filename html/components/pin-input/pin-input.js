document.addEventListener('DOMContentLoaded', () => {
    (() => {
        // Function to create a dot element, filled or empty based on argument
        const buildDot = filled => {
            const dot = document.createElement("span");
            dot.className = filled ? "dot filled" : "dot"; // Set class based on filled status
            return dot;
        };

        // Function to shuffle elements in an array
        const shuffleArray = (array) => {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]; // ES6 destructuring assignment for swapping
            }
            return array;
        };

        // Function to scramble elements within a container
        const scramblePin = (container) => {
            if (!container) {
                console.error('Container not found');
                return;
            }

            // Collect child elements into an array
            const elements = Array.from(container.children);

            // Shuffle the array of elements
            const shuffledElements = shuffleArray(elements);

            // Clear the container
            container.innerHTML = '';

            // Append the shuffled elements back to the container
            shuffledElements.forEach(element => {
                container.appendChild(element);
            });
        };

        // Convert collection of .pin-input-group elements to an array
        const pinInputs = [...document.getElementsByClassName("pin-input-group")];

        // Iterate over each pin input group element
        pinInputs.forEach(el => {
            const pinKeypad = el.querySelector(".pin-keypad");
            const pinDisplay = el.querySelector(".pin-display");
            const maxPinLength = el.dataset.pinLength;
            const shadowInput = el.querySelector(".shadow-input input");
            const pinKeys = el.querySelectorAll(".pin-key");

            // Only scramble pin keypad if it has the data-shuffle attribute
            if (pinKeypad && pinKeypad.getAttribute("data-shuffle") == "true") {
                scramblePin(pinKeypad); // Pass the specific pinKeypad element
            }

            shadowInput.maxLength = maxPinLength;
            pinDisplay.innerHTML = '';

            // Function to update the pin display based on the shadow input's value
            const updatePinDisplay = () => {
                const pinLength = shadowInput.value.length;
                const emptyDots = maxPinLength - pinLength;
                pinDisplay.innerHTML = '';

                // Create and append filled dots based on pinLength
                Array.from({length: pinLength}, () => buildDot(true)).forEach(dot => pinDisplay.appendChild(dot));
                // Create and append empty dots based on remaining dots left
                Array.from({length: emptyDots}, () => buildDot(false)).forEach(dot => pinDisplay.appendChild(dot));
            };

            // Add event listener for each pin key button
            pinKeys.forEach(key => {
                key.addEventListener('click', () => {
                    const digit = key.dataset.digit; // Get digit from data attribute

                    // Only add digit if we haven't reached the maximum length
                    if (shadowInput.value.length < maxPinLength) {
                        shadowInput.value += digit; // Append digit to shadowInput value
                        updatePinDisplay(); // Update visual pin display
                    }
                });
            });

            // Add input event listener to the shadow input
            shadowInput.addEventListener("input", () => {
                // Prevent overflow of the input's value
                if (shadowInput.value.length > maxPinLength) {
                    shadowInput.value = shadowInput.value.slice(0, maxPinLength);
                }
                updatePinDisplay(); // Update visual pin display based on input
            });

            updatePinDisplay(); // Initial call to set the pin display on page load
        });
    })();
});