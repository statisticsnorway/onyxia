window.addEventListener("onyxiaready", function () {
    var onyxia = window.onyxia;
    // Helper to set the state of a button.
    function setLaunchButtonState(button, enabled) {
        button.disabled = !enabled;
        button.style.opacity = enabled ? "1" : "0.5";
        button.style.pointerEvents = enabled ? "auto" : "none";
    }
    // Helper to create a MutationObserver that enforces the error class on the parent element.
    // It only adds the class if the parent's _shouldEnforceError flag is true.
    function enforceErrorClass(parentElement) {
        var observer = new MutationObserver(function (mutations) {
            mutations.forEach(function (mutation) {
                if (mutation.attributeName === "class" &&
                    parentElement._shouldEnforceError &&
                    !parentElement.classList.contains("Mui-error")) {
                    parentElement.classList.add("Mui-error");
                }
            });
        });
        observer.observe(parentElement, {
            attributes: true,
            attributeFilter: ["class"],
        });
        return observer;
    }
    // Helper to add error style and a nicely styled error message underneath the input.
    function addErrorStyle(input) {
        var parent = input.parentElement;
        parent.classList.add("Mui-error");
        input.style.border = "1px solid red";
        parent.style.transition = "none";
        // Check if an error message element exists already.
        var errorMessage = parent.querySelector(".error-message");
        if (!errorMessage) {
            errorMessage = document.createElement("div");
            errorMessage.className = "error-message";
            errorMessage.textContent =
                "Begrunnelse må fylles ut når du aktiverer som data-admins";
            // Styling the error message.
            errorMessage.style.marginTop = "4px";
            errorMessage.style.fontSize = "0.85em";
            errorMessage.style.color = "#d9534f";
            errorMessage.style.lineHeight = "1.2";
            // Append styling to the parent container to make it a flex container.
            parent.style.display = "flex";
            parent.style.flexDirection = "column";
            parent.style.gap = "8px";
            // Insert the error message as the first child of the parent container.
            parent.insertBefore(errorMessage, parent.firstChild);
        }
        // Set a flag to enforce error and set up the MutationObserver on the parent.
        parent._shouldEnforceError = true;
        parent._muiErrorObserver = enforceErrorClass(parent);
    }
    // Helper to remove error style and the error message.
    // It also disables enforcement before disconnecting the observer.
    function removeErrorStyle(input) {
        var parent = input.parentElement;
        // Disable further enforcement.
        parent._shouldEnforceError = false;
        // Remove the observer if it exists.
        if (parent._muiErrorObserver) {
            parent._muiErrorObserver.disconnect();
            delete parent._muiErrorObserver;
        }
        input.style.border = "";
        parent.classList.remove("Mui-error");
        parent.style.transition = "";
        var errorMessage = parent.querySelector(".error-message");
        if (errorMessage) {
            errorMessage.remove();
        }
    }
    // Show or hide the Kildedata dialog based on user role.
    function toggleKildedataDialog(isDataAdmin) {
        var fieldsets = document.querySelectorAll("fieldset[class$='-FormFieldGroupComponent-group']");
        var kildedataDialog = Array.from(fieldsets).find(function (fs) {
            var _a;
            var heading = fs.querySelector("h6");
            return heading && ((_a = heading.textContent) === null || _a === void 0 ? void 0 : _a.trim()) === "Kildedata";
        });
        if (kildedataDialog) {
            kildedataDialog.hidden = !isDataAdmin;
        }
    }
    // Find the input element for the reason in data-admin form.
    function getDataAdminReasonInput() {
        var formGroups = document.querySelectorAll('[class$="FormFieldGroupComponent-root"]');
        var targetGroup = Array.from(formGroups).find(function (group) {
            var _a;
            var label = group.querySelector("label");
            return label && ((_a = label.textContent) === null || _a === void 0 ? void 0 : _a.trim()) === "Begrunnelse";
        });
        return targetGroup ? targetGroup.querySelector("input") : null;
    }
    // Main update function for the launch button state and error handling.
    function updateLaunchButton() {
        var _a;
        if (((_a = onyxia.route) === null || _a === void 0 ? void 0 : _a.name) !== "launcher")
            return;
        var attempts = 0;
        var maxAttempts = 10;
        function tryGetLauncherState() {
            var _a, _b, _c, _d;
            var launcherState;
            try {
                launcherState = (_b = (_a = onyxia.core.states.launcher).getMain) === null || _b === void 0 ? void 0 : _b.call(_a);
            }
            catch (_e) {
                return;
            }
            if ((launcherState === null || launcherState === void 0 ? void 0 : launcherState.isReady) || attempts >= maxAttempts) {
                if (!(launcherState === null || launcherState === void 0 ? void 0 : launcherState.isReady))
                    return;
                // Determine if the user is a data admin.
                var group = (_d = (_c = launcherState.helmValues) === null || _c === void 0 ? void 0 : _c.dapla) === null || _d === void 0 ? void 0 : _d.group;
                var isDataAdmin = typeof group === "string" && group.endsWith("-data-admins");
                // Toggle the visibility of the Kildedata dialog accordingly.
                toggleKildedataDialog(isDataAdmin);
                // Find the launch button.
                var launchButton = document.querySelector("button[class$='-launchButton']");
                if (!launchButton)
                    return;
                // For non-data-admin users, remove error styling.
                if (!isDataAdmin) {
                    var reasonInput_1 = getDataAdminReasonInput();
                    if (reasonInput_1) {
                        removeErrorStyle(reasonInput_1);
                    }
                    setLaunchButtonState(launchButton, true);
                    return;
                }
                // For data-admin users, check the "Begrunnelse" input.
                var reasonInput = getDataAdminReasonInput();
                if (!reasonInput)
                    return;
                if (reasonInput.value.trim() === "") {
                    addErrorStyle(reasonInput);
                    setLaunchButtonState(launchButton, false);
                }
                else {
                    removeErrorStyle(reasonInput);
                    setLaunchButtonState(launchButton, true);
                }
            }
            else {
                attempts++;
                setTimeout(tryGetLauncherState, 200); // Retry after 200ms
            }
        }
        tryGetLauncherState();
    }
    // Listen for route change events and update the button and validation as needed.
    onyxia.addEventListener(function (eventName) {
        if (!["route params changed", "route changed"].includes(eventName))
            return;
        updateLaunchButton();
    });
    console.log("Enforce dataAdmins reason activated");
});
