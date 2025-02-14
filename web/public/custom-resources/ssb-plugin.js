var updatePrice = function () {
    if (document.querySelector("[data-title='Ressurser'] .MuiAccordionDetails-root") == undefined) {
        return;
    }
    if (document.getElementById("estimated-cost") == undefined) {
        document
            .querySelector("[data-title='Ressurser'] .MuiAccordionDetails-root")
            .insertAdjacentHTML("afterbegin", '<div style="margin-top: 1em;">Estimert pris per arbeidsdag (8 timer): <span id="estimated-cost">_</span></div>');
    }
    var onyxia = window.onyxia;
    var resources = onyxia.core.states.launcher.getMain().helmValues.resources;
    var cpu = resources.cpu.replace("m", "");
    var memory = resources.memory.replace("Gi", "");
    // Prices fetched 5. feb 2025: https://cloud.google.com/compute/vm-instance-pricing?hl=nb
    var cpuCostPerCorePerHour = 0.034802 * 11.7;
    var memoryCostPerGiPerHour = 0.004664 * 11.7;
    var estimatedCostPerHour = (cpu / 1000) * cpuCostPerCorePerHour + memory * memoryCostPerGiPerHour;
    var estimatedCostPerWorkDay = estimatedCostPerHour * 8;
    document.getElementById("estimated-cost").innerText = new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "NOK"
    }).format(estimatedCostPerWorkDay);
};
window.addEventListener("onyxiaready", function () {
    var onyxia = window.onyxia;
    onyxia.addEventListener(function (eventName) {
        switch (eventName) {
            case "route params changed":
                console.log("Route params changed: ", onyxia.route.params);
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
