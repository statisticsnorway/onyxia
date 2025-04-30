// Can be transpiled to JavaScript with:
// npx tsc --module esnext --target es2017 --noEmitOnError false --isolatedModules false myServices-decorateServiceCards.ts
import type { Onyxia } from "../../src/pluginSystem";

window.addEventListener("onyxiaready", () => {
  const onyxia: Onyxia = (window as any).onyxia;
  console.log("Started services-decorateServiceCards plugin");

  function decorateServiceCardsWithGroup() {

    // only run on the /myServices page
    if (onyxia.route === null || onyxia.route.name !== "myServices") return;

    if (!onyxia.coreAdapters?.onyxiaApi) {
      console.warn("Onyxia API not ready yet—retrying in 100ms...");
      setTimeout(decorateServiceCardsWithGroup, 100);
      return;
    }

    onyxia.coreAdapters.onyxiaApi.listHelmReleases().then((releases) => {
      releases.forEach((release) => {
        const group = release.values["dapla.group"];
        const serviceName = release.helmReleaseName;
        const serviceHref = `/my-service/${serviceName}`;

        // find the status container for this service card
        const statusAnchor = document.querySelector(`[href$="${serviceHref}"]`);
        const statusContainer = statusAnchor
          ?.parentElement
          ?.parentElement
          ?.querySelector('[class$="timeAndStatusContainer"]') as HTMLElement | null;

        if (!statusContainer) {
          console.warn(`Could not find timeAndStatusContainer for service: ${serviceName}`);
          return;
        }

        // if we already injected a group label, skip
        if (statusContainer.nextElementSibling?.classList.contains("dapla-group-label")) {
          return;
        }

        // clone the container, update it, and inject after the original
        const groupEl = statusContainer.cloneNode(true) as HTMLElement;
        groupEl.classList.add("dapla-group-label");
        groupEl.querySelector("p")!.innerText = "Group";
        const h6 = groupEl.querySelector("h6");
        if (h6) {
          h6.innerText = group;
        } else {
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
