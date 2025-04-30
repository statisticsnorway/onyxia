window.addEventListener("onyxiaready", function () {
    const onyxia = window.onyxia;
    // Function to decorate the service cards with the group information the service started with.
    function decorateServiceCardsWithGroup() {
        if (onyxia.route === null || onyxia.route.name !== "myServices")
            return;
        if (!onyxia.coreAdapters || !onyxia.coreAdapters.onyxiaApi) {
            console.warn("Onyxia API not ready yet—retrying...");
            setTimeout(decorateServiceCardsWithGroup, 1000);
            return;
        }
        onyxia.coreAdapters.onyxiaApi.listHelmReleases().then((ss) => {
            ss.forEach((s) => {
                let group = s.values["dapla.group"];
                let serviceName = s.helmReleaseName;
                let serviceHref = `/my-service/${serviceName}`;
                let statusElement = document.querySelector(`[href$="${serviceHref}"]`);
                if (!statusElement || !statusElement.parentElement || !statusElement.parentElement.parentElement) {
                    console.warn(`Could not find status element for service: ${serviceName}`);
                    return;
                }
                let status = statusElement.parentElement.parentElement.querySelector('[class$="timeAndStatusContainer"]');
                if (!status) {
                    console.warn(`Could not find timeAndStatusContainer for service: ${serviceName}`);
                    return;
                }
                let groupElement = status.cloneNode(true);
                groupElement.querySelector("p").innerText = "Group";
                const h6Element = groupElement.querySelector("h6");
                if (h6Element) {
                    h6Element.innerText = group;
                }
                else {
                    console.warn("Could not find 'h6' element in groupElement");
                }
                status.insertAdjacentElement("afterend", groupElement);
            });
        });
    }
    decorateServiceCardsWithGroup();
    console.log("Started services-decorateServiceCards plugin");
});
