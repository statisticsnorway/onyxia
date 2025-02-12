// Can be transpiled to JavaScript with the following command:
// node -e "require('child_process').exec('npx tsc --module commonjs --esModuleInterop false --noEmitOnError false --isolatedModules my-plugin.ts', ()=>{})"
import type { Onyxia } from "../../src/pluginSystem";

const updatePrice = () => {
    if (document.getElementById("estimated-cost") == undefined) {
        document
            .querySelector("[data-title='Ressurser'] .MuiAccordionDetails-root")
            .insertAdjacentHTML(
                "afterbegin",
                '<div style="margin-top: 1em;">Estimert pris per arbeidsdag (8 timer): <span id="estimated-cost">_</span></div>'
            );
    }

    const onyxia: Onyxia = (window as any).onyxia;
    const resources = onyxia.core.states.launcher.getMain().helmValues.resources;
    const cpu = resources.cpu.replace("m", "");
    const memory = resources.memory.replace("Gi", "");

    // Prices fetched 5. feb 2025: https://cloud.google.com/compute/vm-instance-pricing?hl=nb
    const cpuCostPerCorePerHour = 0.034802 * 11.7;
    const memoryCostPerGiPerHour = 0.004664 * 11.7;

    const estimatedCostPerHour =
        (cpu / 1000) * cpuCostPerCorePerHour + memory * memoryCostPerGiPerHour;
    const estimatedCostPerWorkDay = estimatedCostPerHour * 8;

    document.getElementById("estimated-cost").innerText = new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK"
    }).format(estimatedCostPerWorkDay);
};

window.addEventListener("onyxiaready", () => {
    const onyxia: Onyxia = (window as any).onyxia;

    onyxia.addEventListener(eventName => {
        switch (eventName) {
            case "route params changed":
                console.log(`Route params changed: `, onyxia.route.params);
                if (onyxia.route.name === "launcher") {
                    updatePrice();
                }
                break;
            default:
                break;
        }
    });

    console.log("Onyxia Global API ready", onyxia);
});
