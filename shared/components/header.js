// Header Component
(function () {
  const HeaderComponent = {
    render(location, config) {
      const root = document.getElementById("header-root");
      if (!root) return;

      const locationName = location === "st-pete" ? "St. Pete" : "Sarasota";
      const otherLocation = location === "st-pete" ? "sarasota" : "st-pete";
      const otherLocationName =
        location === "st-pete" ? "Sarasota" : "St. Petersburg";
      const otherLocationUrl =
        location === "st-pete"
          ? "https://dbsrq.com"
          : "https://dogbarstpete.com";

      root.innerHTML = `
        <header class="bg-gradient-to-r from-blue-600 via-cyan-500 to-blue-500 sticky top-0 z-50 relative overflow-hidden shadow-2xl">
          <!-- subtle patterns and accent lines -->
          <div class="absolute inset-0 pointer-events-none">
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(255,255,255,0.08),transparent_55%)]"></div>
            <div class="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.05),transparent_55%)]"></div>
            <div class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
            <div class="absolute bottom-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent"></div>
          </div>

          <div class="container mx-auto px-4 relative">
            <div class="flex justify-between items-center py-3">
              <!-- Logo & Brand (clickable home link) -->
              <a href="site.html?location=${location}" class="flex items-center space-x-3 hover:opacity-90 transition-opacity">
                <img
                  src="uploads/2019/12/logo.png"
                  alt="Dog Bar Logo"
                  class="h-12 w-auto drop-shadow"
                />
                <div class="hidden sm:block">
                  <h1 class="text-xl font-bold text-white drop-shadow-md">
                    The Dog Bar <span class="text-white/90">${locationName}</span>
                  </h1>
                  <p class="text-xs text-white/80">
                    Florida's Premier Dog Park & Bar
                  </p>
                </div>
              </a>

              <!-- Desktop Navigation -->
              <nav class="hidden lg:flex items-center space-x-1">
                <a
                  href="site.html?location=${location}"
                  class="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium backdrop-blur-sm"
                >
                  Home
                </a>
                <a
                  href="calendar.html?location=${location}"
                  class="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium backdrop-blur-sm"
                >
                  Events
                </a>
                <a
                  href="food-menu.html?location=${location}"
                  class="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium backdrop-blur-sm"
                >
                  Food
                </a>
                <a
                  href="drinks-menu-${location}.html"
                  class="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium backdrop-blur-sm"
                >
                  Drinks
                </a>
                <a
                  href="party-booking.html?location=${location}"
                  class="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium backdrop-blur-sm"
                >
                  Parties
                </a>
                <a
                  href="site.html?location=${location}#contact"
                  class="px-4 py-2 text-white/90 hover:text-white hover:bg-white/10 rounded-lg transition-all font-medium backdrop-blur-sm"
                >
                  Contact
                </a>

                <!-- Location Switcher -->
                <div class="ml-2 pl-2 border-l border-white/20">
                  <a
                    href="${otherLocationUrl}"
                    class="px-4 py-2 text-white/90 hover:text-white rounded-lg transition-all font-medium backdrop-blur-sm border border-white/20 hover:bg-white/10 flex items-center space-x-2"
                  >
                    <span>📍</span>
                    <span>${otherLocationName}</span>
                  </a>
                </div>

              </nav>

              <!-- Mobile Menu Button -->
              <button
                onclick="toggleMobileMenu()"
                class="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              >
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            </div>

            <!-- Mobile Menu -->
            <div id="mobile-menu" class="hidden lg:hidden pb-4 space-y-2 border-t border-white/20 pt-2">
              <a
                href="site.html?location=${location}"
                class="block text-white/95 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all font-medium"
              >
                Home
              </a>
              <a
                href="calendar.html?location=${location}"
                class="block text-white/95 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all font-medium"
              >
                Events
              </a>
              <a
                href="food-menu.html?location=${location}"
                class="block text-white/95 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all font-medium"
              >
                Food
              </a>
              <a
                href="drinks-menu-${location}.html"
                class="block text-white/95 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all font-medium"
              >
                Drinks
              </a>
              <a
                href="site.html?location=${location}#parties"
                class="block text-white/95 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all font-medium"
              >
                Parties
              </a>
              <a
                href="site.html?location=${location}#contact"
                class="block text-white/95 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all font-medium"
              >
                Contact
              </a>
              <a
                href="${otherLocationUrl}"
                class="block text-white/95 hover:text-white px-3 py-2 rounded-lg hover:bg-white/10 backdrop-blur-sm transition-all font-medium"
              >
                📍 Visit ${otherLocationName}
              </a>
            </div>
          </div>
        </header>
      `;
    },
  };

  // Register component
  window.DogBarComponents.Header = HeaderComponent;
})();
