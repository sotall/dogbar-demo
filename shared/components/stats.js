// Stats Component
(function () {
  const StatsComponent = {
    render(location, config) {
      const root = document.getElementById("stats-root");
      if (!root) return;

      // Get stats from config or use defaults
      const stats = config.stats || {
        sqft: "4,500",
        beers: "31+",
        rating: "4.8",
      };

      // Different text for St. Pete vs Sarasota
      const statTexts =
        location === "st-pete"
          ? {
              sqft: { main: "4,500", sub: "Sq Ft Play Area" },
              beers: { main: "31+", sub: "Draft Beers" },
              rating: { main: "100%", sub: "Fun & Safety" },
            }
          : {
              sqft: { main: "6,500", sub: "Sq Ft Play Area" },
              beers: { main: "31+", sub: "Draft Beers" },
              rating: { main: "100%", sub: "Fun & Safety" },
            };

      // Both locations now have 4 columns
      const gridCols = "grid-cols-4";

      root.innerHTML = `
        <section class="bg-gradient-to-r from-emerald-600 via-green-500 to-teal-500 py-8 relative overflow-hidden">
          <!-- Subtle pattern overlay -->
          <div class="absolute inset-0 bg-[radial-gradient(circle_at_30%_70%,rgba(255,255,255,0.1),transparent_60%)]"></div>
          <div class="container mx-auto px-4 relative">
            <div class="grid ${gridCols} gap-8 text-center text-white">
              ${
                location === "st-pete"
                  ? `
              <div class="animate-fade-in-up">
                <div class="text-4xl font-bold mb-2 drop-shadow-md">St. Pete's</div>
                <div class="text-white/90 font-medium">Original Dog Bar</div>
              </div>
              `
                  : location === "sarasota"
                  ? `
              <div class="animate-fade-in-up">
                <div class="text-4xl font-bold mb-2 drop-shadow-md">New!</div>
                <div class="text-white/90 font-medium">Sarasota Location</div>
              </div>
              `
                  : ""
              }
              <div class="animate-fade-in-up" style="animation-delay: 0.1s">
                <div class="text-4xl font-bold mb-2 drop-shadow-md">${
                  statTexts.sqft.main
                }</div>
                <div class="text-white/90 font-medium">${
                  statTexts.sqft.sub
                }</div>
              </div>
              <div class="animate-fade-in-up" style="animation-delay: 0.2s">
                <div class="text-4xl font-bold mb-2 drop-shadow-md">${
                  statTexts.beers.main
                }</div>
                <div class="text-white/90 font-medium">${
                  statTexts.beers.sub
                }</div>
              </div>
              <div class="animate-fade-in-up" style="animation-delay: 0.3s">
                <div class="text-4xl font-bold mb-2 drop-shadow-md flex items-center justify-center">
                  ${statTexts.rating.main}
                </div>
                <div class="text-white/90 font-medium">${
                  statTexts.rating.sub
                }</div>
              </div>
            </div>
          </div>
        </section>
      `;
    },
  };

  // Register component
  window.DogBarComponents.Stats = StatsComponent;
})();
