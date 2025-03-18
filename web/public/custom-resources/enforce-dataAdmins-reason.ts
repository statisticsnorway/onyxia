import type { Onyxia } from "../../src/pluginSystem";

// Extend HTMLElement to include custom properties
interface ErrorEnforcedHTMLElement extends HTMLElement {
  _shouldEnforceError?: boolean;
  _muiErrorObserver?: MutationObserver;
}

interface LauncherState {
  isReady: boolean;
  helmValues?: {
    dapla?: {
      group?: string;
    };
  };
}

window.addEventListener("onyxiaready", () => {
  const onyxia: Onyxia = (window as any).onyxia;

  // Helper to set the state of a button.
  function setLaunchButtonState(
    button: HTMLButtonElement,
    enabled: boolean
  ): void {
    button.disabled = !enabled;
    button.style.opacity = enabled ? "1" : "0.5";
    button.style.pointerEvents = enabled ? "auto" : "none";
  }

  // Helper to create a MutationObserver that enforces the error class on the parent element.
  // It only adds the class if the parent's _shouldEnforceError flag is true.
  function enforceErrorClass(
    parentElement: ErrorEnforcedHTMLElement
  ): MutationObserver {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.attributeName === "class" &&
          parentElement._shouldEnforceError &&
          !parentElement.classList.contains("Mui-error")
        ) {
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
  function addErrorStyle(input: HTMLInputElement): void {
    const parent = input.parentElement as ErrorEnforcedHTMLElement;
    parent.classList.add("Mui-error");
    input.style.border = "1px solid red";
    parent.style.transition = "none";

    // Check if an error message element exists already.
    let errorMessage = parent.querySelector(
      ".error-message"
    ) as HTMLDivElement | null;
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
  function removeErrorStyle(input: HTMLInputElement): void {
    const parent = input.parentElement as ErrorEnforcedHTMLElement;
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
    let errorMessage = parent.querySelector(".error-message");
    if (errorMessage) {
      errorMessage.remove();
    }
  }

  // Show or hide the Kildedata dialog based on user role.
  function toggleKildedataDialog(isDataAdmin: boolean): void {
    const fieldsets = document.querySelectorAll("fieldset[class$='-FormFieldGroupComponent-group']");
    const kildedataDialog = Array.from(fieldsets).find(fs => {
      const heading = fs.querySelector("h6");
      return heading && heading.textContent?.trim() === "Kildedata";
    });
    if (kildedataDialog) {
      (kildedataDialog as HTMLFieldSetElement).hidden = !isDataAdmin;
    }
  }

  // Find the input element for the reason in data-admin form.
  function getDataAdminReasonInput(): HTMLInputElement | null {
    const formGroups = document.querySelectorAll(
      '[class$="FormFieldGroupComponent-root"]'
    );
    const targetGroup = Array.from(formGroups).find((group) => {
      const label = group.querySelector("label");
      return label && label.textContent?.trim() === "Begrunnelse";
    });
    return targetGroup ? targetGroup.querySelector("input") : null;
  }

  // Main update function for the launch button state and error handling.
  function updateLaunchButton(): void {
    if (onyxia.route?.name !== "launcher") return;

    let attempts = 0;
    const maxAttempts = 10;

    function tryGetLauncherState(): void {
      const launcherState: LauncherState | undefined =
        onyxia.core.states.launcher.getMain?.();
      if (launcherState?.isReady || attempts >= maxAttempts) {
        if (!launcherState?.isReady) return;
        // Determine if the user is a data admin.
        const group = launcherState.helmValues?.dapla?.group;
        const isDataAdmin =
          typeof group === "string" && group.endsWith("-data-admins");

        // Toggle the visibility of the Kildedata dialog accordingly.
        toggleKildedataDialog(isDataAdmin);

        // Find the launch button.
        const launchButton = document.querySelector(
          "button[class$='-launchButton']"
        ) as HTMLButtonElement | null;
        if (!launchButton) return;

        // For non-data-admin users, remove error styling.
        if (!isDataAdmin) {
          const reasonInput = getDataAdminReasonInput();
          if (reasonInput) {
            removeErrorStyle(reasonInput);
          }
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
      } else {
        attempts++;
        setTimeout(tryGetLauncherState, 200); // Retry after 200ms
      }
    }

    tryGetLauncherState();
  }

  // Listen for route change events and update the button and validation as needed.
  onyxia.addEventListener((eventName: string) => {
    if (!["route params changed", "route changed"].includes(eventName)) return;
    updateLaunchButton();
  });

  console.log("Enforce dataAdmins reason activated");
});
