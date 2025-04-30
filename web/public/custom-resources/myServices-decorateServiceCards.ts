// Can be transpiled to JavaScript with the following command:
// node -e "require('child_process').exec('npx tsc --module commonjs --esModuleInterop false --noEmitOnError false --isolatedModules myServices-decorateServiceCards.ts', ()=>{})"
import type { Onyxia } from "../../src/pluginSystem";

window.addEventListener("onyxiaready", () => {
    const onyxia: Onyxia = (window as any).onyxia;
  
    async function decorateServiceCards(root?: ParentNode) {
      const releases = await onyxia.coreAdapters.onyxiaApi.listHelmReleases();
      (root
        ? Array.from(root.querySelectorAll<HTMLAnchorElement>(`[href^="/my-service/"]`))
        : Array.from(document.querySelectorAll<HTMLAnchorElement>(`[href^="/my-service/"]`))
      ).forEach(a => {
        const name = a.getAttribute("href")!.replace("/my-service/", "");
        const rel = releases.find(r => r.helmReleaseName === name);
        if (!rel) return;
        const group = rel.values["dapla.group"];
        const card = a.closest(".serviceCard") as HTMLElement;
        if (!card || card.dataset.groupDecorated === "true") return;
        const status = card.querySelector('[class$="timeAndStatusContainer"]')!;
        const badge = status.cloneNode(true) as HTMLElement;
        badge.querySelector("p")!.textContent = "Group";
        badge.querySelector("h6")!.textContent = group;
        status.insertAdjacentElement("afterend", badge);
        card.dataset.groupDecorated = "true";
      });
    }

    onyxia.addEventListener(eventName => {
      if (eventName === "route changed" && onyxia.route?.name === "myServices") {
        decorateServiceCards();
      }
    });
  
    const servicesContainer = document.querySelector(".servicesContainer");
    if (servicesContainer) {
      const mo = new MutationObserver(muts => {
        muts.forEach(m => {
          m.addedNodes.forEach(n => {
            if (
              n instanceof HTMLElement &&
              n.querySelector<HTMLAnchorElement>(`[href^="/my-service/"]`)
            ) {
              decorateServiceCards(n);
            }
          });
        });
      });
      mo.observe(servicesContainer, { childList: true, subtree: true });
    }
  
    console.log("Started services-displayGroup plugin");
  });
  