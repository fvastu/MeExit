// Define the text to identify the element indicating the end of a call
const TARGET_TEXT = 'call_end';

// Interface to extend HTMLElement with innerText and innerHTML properties
interface HTMLElementWithText extends HTMLElement {
    innerText: string;
    innerHTML: string;
}

// Function to stop the propagation of an event
const stopEvent = (event: BeforeUnloadEvent | MouseEvent) => {
    event.preventDefault();
    event.stopPropagation();
    event.stopImmediatePropagation();
};

// Message to be displayed when asking for confirmation
const confirmationMessage = 'You are currently in a meeting. Are you sure you want to leave?';

// Function to find an element with specific text content
const getElementWithText = (targetText: string): HTMLElementWithText | null =>
    Array.from(document.querySelectorAll<HTMLElementWithText>('*')).find(
        (element) =>
            element instanceof HTMLElement && (element.innerHTML === targetText || element.innerText === targetText)
    ) || null;

// Event handler for the 'beforeunload' event
function checkBeforeUnload(event: BeforeUnloadEvent): any {
    // Check if the target element indicating the end of a call is present
    const targetElement = getElementWithText(TARGET_TEXT);
    if (!targetElement) return;

    // Display a confirmation dialog
    const userConfirmation = window.confirm(confirmationMessage);

    if (userConfirmation) {
        // Allow the default behavior if the user confirms
        event.returnValue = confirmationMessage; // Standard for most browsers
        return confirmationMessage; // For some older browsers
    } else {
        // User clicked "No" or closed the dialog, prevent the default behavior
        stopEvent(event);
        return false;
    }
}

// Create a MutationObserver instance to watch for changes in the DOM
const observer = new MutationObserver((mutationsList) => {
    for (const mutation of mutationsList) {
        if (mutation.type === 'childList') {
            // New nodes have been added, check if they are buttons
            mutation.addedNodes.forEach((node: Node) => {
                if (node instanceof HTMLElement && node.tagName.toLowerCase() === 'button') {
                    // If the button contains the target text, attach a click event listener
                    const button = node as HTMLButtonElement;
                    if (!button.innerHTML.includes(TARGET_TEXT)) return;
                    button.addEventListener('click', (event) => {
                        // Display a confirmation dialog on button click
                        const userConfirmation = window.confirm(confirmationMessage);
                        if (!userConfirmation) stopEvent(event);
                    });
                }
            });
        }
    }
});

// Start observing the target node for configured mutations
observer.observe(document, { childList: true, subtree: true });

// Attach the event listener for the 'beforeunload' event
window.addEventListener('beforeunload', checkBeforeUnload);
