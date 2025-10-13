// Stats Component
(function () {
  const StatsComponent = {
    render(location, config) {
      const root = document.getElementById("stats-root");
      if (!root) return;

      const itemsFromConfig = Array.isArray(config?.stats?.items)
        ? config.stats.items
        : null;

      if (itemsFromConfig && itemsFromConfig.length) {
        const itemsToRender = itemsFromConfig;

        const itemsHtml = itemsToRender
          .map(
            (it, idx) => `
              <div class="animate-fade-in-up" style="animation-delay: ${
                (idx + 1) * 0.1
              }s">
                <div class="text-4xl font-bold mb-2 drop-shadow-md">${
                  it.main ?? ""
                }</div>
                <div class="text-white/90 font-medium">${
                  it.sub ?? ""
                }</div>
              </div>`
          )
          .join("");

        root.innerHTML = `
          <section class="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 py-8 relative overflow-hidden">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1),transparent_60%)]"></div>
            <div class="container mx-auto px-4 relative">
              <div class="grid gap-8 text-center text-white place-items-center" style="grid-template-columns: repeat(${itemsToRender.length}, minmax(0, 1fr));">
                ${itemsHtml}
              </div>
            </div>
          </section>
        `;
        return;
      }

      // Fallback to legacy behavior if no dynamic items
      const legacy = config?.stats || {};
      const statTexts =
        location === "st-pete"
          ? {
              sqft: { main: legacy.sqft || "4,500", sub: "Sq Ft Play Area" },
              beers: { main: legacy.beers || "31+", sub: "Draft Beers" },
              rating: { main: legacy.rating || "100%", sub: "Fun & Safety" },
            }
          : {
              sqft: { main: legacy.sqft || "6,500", sub: "Sq Ft Play Area" },
              beers: { main: legacy.beers || "31+", sub: "Draft Beers" },
              rating: { main: legacy.rating || "100%", sub: "Fun & Safety" },
            };

      // Build legacy items from static values if db items missing
      const itemsToRender = [
        { main: statTexts.sqft.main, sub: statTexts.sqft.sub },
        { main: statTexts.beers.main, sub: statTexts.beers.sub },
        { main: statTexts.rating.main, sub: statTexts.rating.sub },
      ];

      const itemsHtml = itemsToRender
        .map(
          (it, idx) => `
            <div class="animate-fade-in-up" style="animation-delay: ${
              (idx + 1) * 0.1
            }s">
              <div class="text-4xl font-bold mb-2 drop-shadow-md">${
                it.main ?? ""
              }</div>
              <div class="text-white/90 font-medium">${it.sub ?? ""}</div>
            </div>`
        )
        .join("");

      root.innerHTML = `
        <section class="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 py-8 relative overflow-hidden">
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1),transparent_60%)]"></div>
          <div class="container mx-auto px-4 relative">
            <div class="grid gap-8 text-center text-white place-items-center" style="grid-template-columns: repeat(${itemsToRender.length}, minmax(0, 1fr));">
              ${itemsHtml}
            </div>
          </div>
        </section>
      `;
    },
  };

  window.DogBarComponents.Stats = StatsComponent;
})();
