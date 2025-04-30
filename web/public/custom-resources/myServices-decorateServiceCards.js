// Can be transpiled to JavaScript with the following command:
// npx tsc --module esnext --target es2017 --noEmitOnError false --isolatedModules false myServices-decorateServiceCards.ts
window.addEventListener("onyxiaready", () => {
    const onyxia = window.onyxia;
    async function decorateServiceCards(root) {
        const releases = await onyxia.coreAdapters.onyxiaApi.listHelmReleases();
        (root
            ? Array.from(root.querySelectorAll(`[href^="/my-service/"]`))
            : Array.from(document.querySelectorAll(`[href^="/my-service/"]`))).forEach(a => {
            const name = a.getAttribute("href").replace("/my-service/", "");
            const rel = releases.find(r => r.helmReleaseName === name);
            if (!rel)
                return;
            const group = rel.values["dapla.group"];
            const card = a.closest(".serviceCard");
            if (!card || card.dataset.groupDecorated === "true")
                return;
            const status = card.querySelector('[class$="timeAndStatusContainer"]');
            const badge = status.cloneNode(true);
            badge.querySelector("p").textContent = "Group";
            badge.querySelector("h6").textContent = group;
            status.insertAdjacentElement("afterend", badge);
            card.dataset.groupDecorated = "true";
        });
    }
    onyxia.addEventListener(eventName => {
        var _a;
        if (eventName === "route changed" && ((_a = onyxia.route) === null || _a === void 0 ? void 0 : _a.name) === "myServices") {
            decorateServiceCards();
        }
    });
    const servicesContainer = document.querySelector(".servicesContainer");
    if (servicesContainer) {
        const mo = new MutationObserver(muts => {
            muts.forEach(m => {
                m.addedNodes.forEach(n => {
                    if (n instanceof HTMLElement &&
                        n.querySelector(`[href^="/my-service/"]`)) {
                        decorateServiceCards(n);
                    }
                });
            });
        });
        mo.observe(servicesContainer, { childList: true, subtree: true });
    }
    console.log("Started services-displayGroup plugin");
});