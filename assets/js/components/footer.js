// Footer Component
(function () {
  const FooterComponent = {
    render(location, config) {
      const root = document.getElementById("footer-root");
      if (!root) return;

      const locationName =
        location === "st-pete" ? "St. Petersburg" : "Sarasota";

      // Use database values only (no fallbacks)
      const address = config?.address || "";
      const phone = config?.phone || "";
      const email = config?.email || "";
      const hours = config?.hours || {};

      const socialAccounts = Array.isArray(config?.social?.accounts)
        ? config.social.accounts
        : [];

      // Use globally available social icons
      const socialIcons = window.SocialIcons || {};

      const filteredSocial = socialAccounts.filter(
        (a) => a && a.platform && a.url
      );

      const assetsBase =
        typeof window.DogBarApp?.getAssetsBasePath === "function"
          ? window.DogBarApp.getAssetsBasePath()
          : window.location.pathname.includes("/pages/")
          ? "../assets"
          : "assets";

      root.innerHTML = `
        <footer class="bg-gradient-to-r from-emerald-500 via-green-500 to-emerald-600 text-white py-12">
          <div class="container mx-auto px-4">
            <div class="grid md:grid-cols-4 gap-8">
              <div class="flex flex-col gap-4">
                <img
                  src="${assetsBase}/media/dog_bar.png"
                  alt="The Dog Bar ${locationName}"
                  class="w-40 h-auto drop-shadow-lg"
                />
              </div>
              <div>
                <h4 class="font-bold mb-4">Contact</h4>
                <p class="text-white/90 text-sm mb-2">${address}</p>
                <p class="text-white/90 text-sm mb-2">${phone}</p>
                <p class="text-white/90 text-sm">${email}</p>
              </div>
              <div>
                <h4 class="font-bold mb-4">Hours</h4>
                <p class="text-white/90 text-sm">Mon: ${hours?.monday || ""}</p>
                <p class="text-white/90 text-sm">Tue: ${
                  hours?.tuesday || ""
                }</p>
                <p class="text-white/90 text-sm">Wed: ${
                  hours?.wednesday || ""
                }</p>
                <p class="text-white/90 text-sm">Thu: ${
                  hours?.thursday || ""
                }</p>
                <p class="text-white/90 text-sm">Fri: ${hours?.friday || ""}</p>
                <p class="text-white/90 text-sm">Sat: ${
                  hours?.saturday || ""
                }</p>
                <p class="text-white/90 text-sm">Sun: ${hours?.sunday || ""}</p>
              </div>
              <div>
                <h4 class="font-bold mb-4">Follow Us</h4>
                <div class="flex flex-wrap gap-4">
                  ${
                    filteredSocial.length
                      ? filteredSocial
                          .map(
                            (s) => `
                      <a href="${
                        s.url
                      }" target="_blank" rel="noopener" class="hover:text-cyan-300 hover:scale-110 transition-all duration-200" aria-label="${
                              s.platform
                            }">
                        ${
                          socialIcons[s.platform] ||
                          '<svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24"><path d="M3.9 12c0-1.71 1.39-3.1 3.1-3.1h4V7H7c-2.76 0-5 2.24-5 5s2.24 5 5 5h4v-1.9H7c-1.71 0-3.1-1.39-3.1-3.1zM8 13h8v-2H8v2zm9-6h-4v1.9h4c1.71 0 3.1 1.39 3.1 3.1s-1.39 3.1-3.1 3.1h-4V17h4c2.76 0 5-2.24 5-5s-2.24-5-5-5z"/></svg>'
                        }
                      </a>`
                          )
                          .join("")
                      : '<span class="text-white/70 text-sm">No social accounts yet</span>'
                  }
                </div>
              </div>
            </div>
            <div class="border-t border-white/20 mt-8 pt-8 text-center text-white/80 text-sm">
              <p>&copy; 2025 The Dog Bar. All rights reserved.</p>
            </div>
          </div>
        </footer>
      `;

      // Update contact info in contact section
      const contactInfo = document.getElementById("contact-info");
      if (contactInfo) {
        contactInfo.innerHTML = `
          <p class="text-gray-600"><strong>Address:</strong><br/>${address}</p>
          <p class="text-gray-600"><strong>Phone:</strong><br/>${phone}</p>
          <p class="text-gray-600"><strong>Email:</strong><br/>${email}</p>
          <div class="mt-4">
            <p class="text-gray-600"><strong>Hours:</strong></p>
            <p class="text-gray-600">Mon: ${hours?.monday || ""}</p>
            <p class="text-gray-600">Tue: ${hours?.tuesday || ""}</p>
            <p class="text-gray-600">Wed: ${hours?.wednesday || ""}</p>
            <p class="text-gray-600">Thu: ${hours?.thursday || ""}</p>
            <p class="text-gray-600">Fri: ${hours?.friday || ""}</p>
            <p class="text-gray-600">Sat: ${hours?.saturday || ""}</p>
            <p class="text-gray-600">Sun: ${hours?.sunday || ""}</p>
          </div>
        `;
      }
    },
  };

  // Register component
  window.DogBarComponents.Footer = FooterComponent;
})();
