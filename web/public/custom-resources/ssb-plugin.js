var updatePrice = function () {
    if (document.getElementById("estimated-cost") == undefined) {
        document
            .querySelector("[data-title='Ressurser'] .MuiAccordionDetails-root")
            .insertAdjacentHTML("afterbegin", '<div style="margin-top: 1em;">Estimated price: <span id="estimated-cost">xx</span> per hour</div>');
    }
    var onyxia = window.onyxia;
    var resources = onyxia.core.states.launcher.getMain().helmValues.resources;
    var cpu = resources.cpu.replace("m", "");
    var memory = resources.memory.replace("Gi", "");
    // Prices fetched 5. feb 2025: https://cloud.google.com/compute/vm-instance-pricing?hl=nb
    var cpuCostPerCorePerHourEuro = 0.034802;
    var memoryCostPerGiPerHourEuro = 0.004664;
    var estimatedCost = (cpu / 1000) * cpuCostPerCorePerHourEuro + memory * memoryCostPerGiPerHourEuro;
    document.getElementById("estimated-cost").innerText = new Intl.NumberFormat("nb-NO", {
        style: "currency",
        currency: "EUR"
    }).format(estimatedCost);
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
