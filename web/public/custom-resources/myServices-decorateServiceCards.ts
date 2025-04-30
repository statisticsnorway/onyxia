// Can be transpiled to JavaScript with the following command:
// npx tsc --module esnext --target es2017 --noEmitOnError false --isolatedModules false myServices-decorateServiceCards.ts
import type { Onyxia } from "../../src/pluginSystem";

window.addEventListener("onyxiaready", function () {
    const onyxia: Onyxia = (window as any).onyxia;
    
    // Function to decorate the service cards with the group information the service started with.
    function decorateServiceCardsWithGroup() {
        if (onyxia.route === null || onyxia.route.name !== "myServices") return;
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
                let groupElement = status.cloneNode(true) as Element;
                groupElement.querySelector("p")!.innerText = "Group";
                const h6Element = groupElement.querySelector("h6");
                if (h6Element) {
                    h6Element.innerText = group;
                } else {
                    console.warn("Could not find 'h6' element in groupElement");
                }
                status.insertAdjacentElement("afterend", groupElement);
            })
        });
    }

    
    // Listen for route change events and update the button and validation as needed.
    onyxia.addEventListener(function (eventName) {
        if (!["route params changed", "route changed"].includes(eventName))
            return;
        decorateServiceCardsWithGroup();
    });
    console.log("Started services-decorateServiceCards plugin");
});
