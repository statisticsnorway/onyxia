// Can be transpiled to JavaScript with the following command:
// node -e "require('child_process').exec('npx tsc --module commonjs --esModuleInterop false --noEmitOnError false --isolatedModules my-plugin.ts', ()=>{})"
import type { Onyxia } from "../../src/pluginSystem";

const updatePrice = () => {
    if (document.getElementById("estimated-cost") == undefined) {
        document
            .querySelector("[data-title='Ressurser'] .MuiAccordionDetails-root")
            .insertAdjacentHTML(
                "afterbegin",
                '<div style="margin-top: 1em;">Estimated price: <span id="estimated-cost">xx</span> per hour</div>'
            );
    }

    const onyxia: Onyxia = (window as any).onyxia;
    const resources = onyxia.core.states.launcher.getMain().helmValues.resources;
    const cpu = resources.cpu.replace("m", "");
    const memory = resources.memory.replace("Gi", "");

    // Prices fetched 5. feb 2025: https://cloud.google.com/compute/vm-instance-pricing?hl=nb
    const cpuCostPerCorePerHourEuro = 0.034802;
    const memoryCostPerGiPerHourEuro = 0.004664;

    const estimatedCost =
        (cpu / 1000) * cpuCostPerCorePerHourEuro + memory * memoryCostPerGiPerHourEuro;
    document.getElementById("estimated-cost").innerText = new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "EUR"
    }).format(estimatedCost);
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
