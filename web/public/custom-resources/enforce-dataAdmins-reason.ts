import type { Onyxia } from "../../src/pluginSystem";

window.addEventListener("onyxiaready", () => {
    const onyxia: Onyxia = (window as any).onyxia;

    // Helper to set the state of a button
    function setLaunchButtonState(button: HTMLButtonElement, enabled: boolean): void {
        button.disabled = !enabled;
        button.style.opacity = enabled ? "1" : "0.5";
        button.style.pointerEvents = enabled ? "auto" : "none";
    }

    // Helper to add error style and a nicely styled error message underneath the input
    function addErrorStyle(input: HTMLInputElement): void {
        const parent = input.parentNode as HTMLElement;
        parent.classList.add("Mui-error");
        parent.style.transition = "none";
        input.style.border = "1px solid red";

        // Check if an error message element exists already
        let errorMessage = parent.querySelector(".error-message") as HTMLElement | null;
        if (!errorMessage) {
        errorMessage = document.createElement("div");
        errorMessage.className = "error-message";
        errorMessage.textContent = "Begrunnelse må fylles ut når du aktiverer som data-admins";

        // Styling the error message for a cleaner look
        errorMessage.style.marginTop = "4px";
        errorMessage.style.fontSize = "0.85em";
        errorMessage.style.color = "#d9534f";
        errorMessage.style.lineHeight = "1.2";

        // Append styling to the parent container to make it a flex container
        parent.style.display = "flex";
        parent.style.flexDirection = "column";
        parent.style.gap = "8px";

        // Insert the error message as the first child of the parent container to appear above the input field
        parent.insertBefore(errorMessage, parent.firstChild);
        }
    }

    // Helper to remove error style and the error message
    function removeErrorStyle(input: HTMLInputElement): void {
        const parent = input.parentNode as HTMLElement;
        parent.classList.remove("Mui-error");
        parent.style.transition = "";
        input.style.border = "";
        const errorMessage = parent.querySelector(".error-message");
        if (errorMessage) {
        errorMessage.remove();
        }
    }

    // Show or hide the Kildedata dialog based on user role
    function toggleKildedataDialog(isDataAdmin: boolean): void {
        const fieldsets = document.querySelectorAll("fieldset");
        const kildedataDialog = Array.from(fieldsets).find(fs =>
        fs.innerText.startsWith("Kildedata")
        );
        if (kildedataDialog) {
        (kildedataDialog as HTMLElement).hidden = !isDataAdmin;
        }
    }

    // Find the input element for the reason in data-admin form
    function getDataAdminReasonInput(): HTMLInputElement | null {
        const formGroups = document.querySelectorAll('[class$="FormFieldGroupComponent-root"]');
        const targetGroup = Array.from(formGroups).find(group => {
        const label = group.querySelector("label");
        return label && label.textContent && label.textContent.trim() === "Begrunnelse";
        });
        return targetGroup ? targetGroup.querySelector("input") as HTMLInputElement | null : null;
    }

    // Main update function for the launch button state and error handling
    function updateLaunchButton(): void {
        if (onyxia.route?.name !== "launcher") return;
        const launcherState = onyxia.core.states.launcher.getMain?.();
        if (!launcherState?.isReady) return;

        // Determine if the user is a data admin
        const group = launcherState.helmValues?.dapla?.group;
        const isDataAdmin: boolean = typeof group === "string" && group.endsWith("-data-admins");

        // Toggle the visibility of the Kildedata dialog accordingly
        toggleKildedataDialog(isDataAdmin);

        // Find the launch button
        const launchButton = document.querySelector("button[class$='-launchButton']") as HTMLButtonElement | null;
        if (!launchButton) return;

        // For non-data-admin users, always enable the launch button.
        if (!isDataAdmin) {
        setLaunchButtonState(launchButton, true);
        return;
        }

        // For data-admin users, check the "Begrunnelse" input.
        const reasonInput = getDataAdminReasonInput();
        if (!reasonInput) return;

        if (reasonInput.value.trim() === "") {
        addErrorStyle(reasonInput);
        setLaunchButtonState(launchButton, false);
        } else {
        removeErrorStyle(reasonInput);
        setLaunchButtonState(launchButton, true);
        }
    }

    // Attach listeners to the "Begrunnelse" field so that the error updates as the user types and on blur.
    const reasonInput = getDataAdminReasonInput();
    if (reasonInput) {
        reasonInput.addEventListener("input", updateLaunchButton);
        reasonInput.addEventListener("blur", updateLaunchButton);

        // Use MutationObserver to watch for changes to the parent element's class attribute
        const observer = new MutationObserver((mutations) => {
        mutations.forEach(mutation => {
            if (mutation.type === "attributes" && mutation.attributeName === "class") {
            // Reapply error style if the input is still empty but the error class was removed
            if (reasonInput.value.trim() === "" && !(reasonInput.parentNode as HTMLElement).classList.contains("Mui-error")) {
                addErrorStyle(reasonInput);
            }
            }
        });
        });
        observer.observe(reasonInput.parentNode as HTMLElement, { attributes: true });
    }

    // Listen for route change events and update the button and validation as needed.
    onyxia.addEventListener((eventName: string) => {
        if (!['route params changed', 'route changed'].includes(eventName)) return;
        updateLaunchButton();
    });

    console.log("Enforce dataAdmins reason activated");
});