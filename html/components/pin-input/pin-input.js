document.addEventListener('DOMContentLoaded', () => {
    // Function to create a dot element, filled or empty based on argument
    const buildDot = filled => `<span class="${filled ? 'dot filled' : 'dot'}"></span>`;

    // Function to shuffle elements in an array using Fisher-Yates algorithm
    const shuffleArray = array => {
        array.forEach((_, i, arr) => {
            let j = Math.floor(Math.random() * (i + 1));
            [arr[i], arr[j]] = [arr[j], arr[i]];
        });
        return array;
    };

    // Modified scramblePin function
    const scramblePin = container => {
        if (!container) {
            console.error('Container not found');
            return;
        }
        
        // Extract control buttons and digit buttons
        const pinControls = Array.from(container.querySelectorAll('.pin-control'));
        const digitButtons = Array.from(container.querySelectorAll('.pin-key')).filter(btn => !btn.classList.contains('pin-control'));
        
        // Shuffle only digit buttons
        const shuffledDigits = shuffleArray(digitButtons);
        
        // Clear the container by removing all children
        while (container.firstChild) {
            container.removeChild(container.firstChild);
        }
        
        // Re-add the buttons: shuffled digits
        shuffledDigits.forEach(btn => container.appendChild(btn));

        // Re-append control buttons at their specific positions
        if (pinControls.length > 0) {
            container.insertBefore(pinControls.find(btn => btn.dataset.control === "clear"), container.lastChild); // Insert before the last digit
            container.appendChild(pinControls.find(btn => btn.dataset.control === "submit")); // Append submit button at the end
        }
    };

    // Convert collection of .pin-input-group elements to an array and iterate over each pin input group element
    [...document.getElementsByClassName("pin-input-group")].forEach(el => {
        const [pinKeypad, pinDisplay, shadowInput] = 
            ['.pin-keypad', '.pin-display', '.shadow-input input'].map(selector => el.querySelector(selector));
        const [maxPinLength, minPinLength] = ['maxPinLength', 'minPinLength'].map(attr => el.dataset[attr]);
        const pinKeys = el.querySelectorAll(".pin-key");

        if (pinKeypad?.getAttribute("data-shuffle") === "true") scramblePin(pinKeypad);

        shadowInput.maxLength = maxPinLength;
        const updatePinDisplay = () => {
            const pinLength = shadowInput.value.length;
            const totalDots = Math.max(pinLength, minPinLength);
            pinDisplay.innerHTML = Array.from({length: totalDots}, (_, i) => buildDot(i < pinLength)).join('');
            if (pinKeypad?.getAttribute("data-shuffle") === "true") scramblePin(pinKeypad);
        };

        pinKeys.forEach(key => key.addEventListener('click', () => {
            if (shadowInput.value.length < maxPinLength) {
                shadowInput.value += key.dataset.digit;
                updatePinDisplay();
            }
        }));

        shadowInput.addEventListener("input", () => {
            shadowInput.value = shadowInput.value.slice(0, maxPinLength);
            updatePinDisplay();
        });

        updatePinDisplay();
    });
});
