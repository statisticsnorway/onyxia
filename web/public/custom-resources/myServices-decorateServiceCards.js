window.addEventListener("onyxiaready", () => {
    const onyxia = window.onyxia;
    console.log("Started services-decorateServiceCards plugin");
    function decorateServiceCardsWithGroup() {
        var _a;
        // only run on the /myServices page
        if (onyxia.route === null || onyxia.route.name !== "myServices")
            return;
        if (!((_a = onyxia.coreAdapters) === null || _a === void 0 ? void 0 : _a.onyxiaApi)) {
            console.warn("Onyxia API not ready yet—retrying in 100ms...");
            setTimeout(decorateServiceCardsWithGroup, 100);
            return;
        }
        onyxia.coreAdapters.onyxiaApi.listHelmReleases().then((releases) => {
            releases.forEach((release) => {
                var _a;
                const group = release.values["dapla.group"];
                const serviceName = release.helmReleaseName;
                const serviceHref = `/my-service/${serviceName}`;
                // find the status container for this service card
                const maxRetries = 10;
                let retryCount = 0;
                function findStatusContainer() {
                    var _a, _b;
                    const statusAnchor = document.querySelector(`[href$="${serviceHref}"]`);
                    const statusContainer = (_b = (_a = statusAnchor === null || statusAnchor === void 0 ? void 0 : statusAnchor.parentElement) === null || _a === void 0 ? void 0 : _a.parentElement) === null || _b === void 0 ? void 0 : _b.querySelector('[class$="timeAndStatusContainer"]');
                    if (!statusContainer) {
                        if (retryCount < maxRetries) {
                            retryCount++;
                            console.warn(`Could not find timeAndStatusContainer for service: ${serviceName}. Retrying (${retryCount}/${maxRetries}) in 100ms...`);
                            setTimeout(findStatusContainer, 100);
                        }
                        else {
                            console.error(`Max retries reached. Could not find timeAndStatusContainer for service: ${serviceName}`);
                        }
                        return null;
                    }
                    return statusContainer;
                }
                const statusContainer = findStatusContainer();
                if (!statusContainer) {
                    return;
                }
                // if we already injected a group label, skip
                if ((_a = statusContainer.nextElementSibling) === null || _a === void 0 ? void 0 : _a.classList.contains("dapla-group-label")) {
                    return;
                }
                // clone the container, update it, and inject after the original
                const groupEl = statusContainer.cloneNode(true);
                groupEl.classList.add("dapla-group-label");
                groupEl.querySelector("p").innerText = "Group";
                const h6 = groupEl.querySelector("h6");
                if (h6) {
                    h6.innerText = group;
                }
                else {
                    console.warn("Could not find <h6> in cloned group element");
                }
                statusContainer.insertAdjacentElement("afterend", groupEl);
            });
        });
    }
    // run once on load
    decorateServiceCardsWithGroup();
    // run again on route change
    onyxia.addEventListener((eventName) => {
        if (eventName === "route changed" || eventName === "route params changed") {
            console.log(`Event: ${eventName}, route:`, onyxia.route);
            decorateServiceCardsWithGroup();
        }
    });
});