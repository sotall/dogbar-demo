// Header Component
(function () {
  const HeaderComponent = {
    // Helper function to determine correct paths based on current page
    getPaths() {
      const currentPath = window.location.pathname;
      const isInPagesDir = currentPath.includes("/pages/");

      if (isInPagesDir) {
        return {
          home: "../site.html",
          calendar: "calendar.html",
          menu: "menu.html",
          partyBooking: "party-booking.html",
          contactUs: "contact-us.html",
          logo: "../assets/media/logo.png?v=2",
        };
      } else {
        return {
          home: "site.html",
          calendar: "pages/calendar.html",
          menu: "pages/menu.html",
          partyBooking: "pages/party-booking.html",
          contactUs: "pages/contact-us.html",
          logo: "assets/media/logo.png?v=2",
        };
      }
    },

    render(location, config) {
      console.log("🎨 Header render called with location:", location);
      const root = document.getElementById("header-root");
      console.log("🔍 Header root element:", root);
      if (!root) {
        console.warn("❌ Header root element not found!");
        return;
      }

      // Skip re-rendering if header already exists and location hasn't changed
      if (root.innerHTML && root.dataset.location === location) {
        console.log("🔄 Header already rendered for location:", location);
        return;
      }

      const locationName = location === "st-pete" ? "St. Pete" : "Sarasota";
      const otherLocation = location === "st-pete" ? "sarasota" : "st-pete";
      const otherLocationName =
        location === "st-pete" ? "Sarasota" : "St. Petersburg";
      const otherLocationUrl =
        location === "st-pete"
          ? "https://dbsrq.com"
          : "https://dogbarstpete.com";

      const paths = this.getPaths();

      root.innerHTML = `
        <header class="absolute top-0 left-0 right-0 z-50 overflow-hidden">
          <div class="container mx-auto relative">
             <div class="flex items-center py-3">
               <!-- Logo (locked to left) -->
               <a href="${paths.home}?location=${location}" class="flex items-center hover:opacity-90 transition-opacity pl-4">
                 <img
                   src="${paths.logo}"
                   alt="Dog Bar Logo"
                   class="h-12 w-auto drop-shadow transition-transform duration-150 ease-in-out active:scale-95 hover:scale-105"
                 />
               </a>

               <!-- Desktop Navigation (centered) -->
               <nav class="hidden lg:flex items-center flex-1 justify-center">
                 <div class="relative rounded-lg py-2 flex items-center space-x-6 bg-white/20 backdrop-blur-md" style="padding-left: 100px; padding-right: 100px;">
                   <a
                     href="${paths.home}?location=${location}"
                     class="text-white/90 hover:text-white transition-all font-medium active:scale-95 hover:scale-105"
                   >
                     Home
                   </a>
                   <div class="w-px h-4 bg-white/30"></div>
                   <a
                     href="${paths.calendar}?location=${location}"
                     class="text-white/90 hover:text-white transition-all font-medium active:scale-95 hover:scale-105"
                   >
                     Events
                   </a>
                   <div class="w-px h-4 bg-white/30"></div>
                   <a
                     href="${paths.menu}?location=${location}"
                     class="text-white/90 hover:text-white transition-all font-medium active:scale-95 hover:scale-105"
                   >
                     Menu
                   </a>
                   <div class="w-px h-4 bg-white/30"></div>
                   <a
                     href="${paths.partyBooking}?location=${location}"
                     class="text-white/90 hover:text-white transition-all font-medium active:scale-95 hover:scale-105"
                   >
                     Parties
                   </a>
                   <div class="w-px h-4 bg-white/30"></div>
                   <a
                     href="${paths.contactUs}?location=${location}"
                     class="text-white/90 hover:text-white transition-all font-medium active:scale-95 hover:scale-105"
                   >
                     Contact
                   </a>
                 </div>
               </nav>

               <!-- Location Link (locked to right, hidden on mobile) -->
               <a
                 href="${otherLocationUrl}"
                 class="hidden lg:flex px-4 py-2 text-white/90 hover:text-white rounded-lg transition-all font-medium backdrop-blur-sm border border-white/20 hover:bg-white/10 items-center space-x-2 pr-4"
               >
                 <span>📍</span>
                 <span>${otherLocationName}</span>
               </a>

               <!-- Mobile Menu Button (always on the right) -->
               <button
                 onclick="toggleMobileMenu()"
                 class="lg:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors ml-auto"
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
             <!-- Permanent thin line across screen -->
             <div class="w-full h-px bg-white/20 border-t border-white/20"></div>

            <!-- Mobile Menu -->
            <div id="mobile-menu" class="hidden lg:hidden pb-4 space-y-2 pt-2 transition-all duration-300 ease-in-out">
              <div class="bg-white/20 backdrop-blur-md rounded-lg p-4 space-y-2 ml-auto" style="width: calc(50% - 40px);">
                <a
                  href="${paths.home}?location=${location}"
                  class="block text-white/95 hover:text-white px-4 py-3 rounded-lg transition-all font-medium text-left active:scale-95 hover:scale-105"
                >
                  Home
                </a>
                <a
                  href="${paths.calendar}?location=${location}"
                  class="block text-white/95 hover:text-white px-4 py-3 rounded-lg transition-all font-medium text-left active:scale-95 hover:scale-105"
                >
                  Events
                </a>
                <a
                  href="${paths.menu}?location=${location}"
                  class="block text-white/95 hover:text-white px-4 py-3 rounded-lg transition-all font-medium text-left active:scale-95 hover:scale-105"
                >
                  Menu
                </a>
                <a
                  href="${paths.partyBooking}?location=${location}"
                  class="block text-white/95 hover:text-white px-4 py-3 rounded-lg transition-all font-medium text-left active:scale-95 hover:scale-105"
                >
                  Parties
                </a>
                 <a
                   href="${paths.contactUs}?location=${location}"
                   class="block text-white/95 hover:text-white px-4 py-3 rounded-lg transition-all font-medium text-left active:scale-95 hover:scale-105"
                 >
                   Contact
                 </a>
                 
                 <!-- Other Location Link (Mobile) -->
                 <a
                   href="${otherLocationUrl}"
                   class="block text-white/95 hover:text-white px-4 py-3 rounded-lg transition-all font-medium text-left active:scale-95 hover:scale-105 border-t border-white/20 mt-2 pt-4"
                 >
                   <div class="flex items-center space-x-2">
                     <span class="text-lg">📍</span>
                     <span>Visit ${otherLocationName}</span>
                   </div>
                 </a>
              </div>
              </div>
              </div>
            </div>
          </div>
        </header>
      `;

      // Store location for future checks
      root.dataset.location = location;
    },

    // Initialize mobile menu functionality
    initMobileMenu() {
      // Define the toggle function globally if not already defined
      if (typeof window.toggleMobileMenu === "undefined") {
        window.toggleMobileMenu = function () {
          const mobileMenu = document.getElementById("mobile-menu");
          if (mobileMenu) {
            if (mobileMenu.classList.contains("hidden")) {
              // Show menu with smooth transition
              mobileMenu.classList.remove("hidden");
              mobileMenu.style.maxHeight = "0px";
              mobileMenu.style.opacity = "0";
              requestAnimationFrame(() => {
                mobileMenu.style.maxHeight = mobileMenu.scrollHeight + "px";
                mobileMenu.style.opacity = "1";
              });
            } else {
              // Hide menu with smooth transition
              mobileMenu.style.maxHeight = "0px";
              mobileMenu.style.opacity = "0";
              setTimeout(() => {
                mobileMenu.classList.add("hidden");
              }, 300);
            }
          }
        };
      }

      // Close mobile menu when navigation links are clicked
      this.closeMobileMenuOnNavigation();
    },

    closeMobileMenuOnNavigation() {
      // Add click handlers to all navigation links to close mobile menu
      const navLinks = document.querySelectorAll(
        'a[href*="?location="], a[href*=".html"]'
      );
      navLinks.forEach((link) => {
        link.addEventListener("click", () => {
          const mobileMenu = document.getElementById("mobile-menu");
          if (mobileMenu && !mobileMenu.classList.contains("hidden")) {
            // Smooth close transition
            mobileMenu.style.maxHeight = "0px";
            mobileMenu.style.opacity = "0";
            setTimeout(() => {
              mobileMenu.classList.add("hidden");
            }, 150); // Faster close for navigation
          }
        });
      });
    },

    // Enhanced render method that also initializes mobile menu
    renderWithInit(location, config) {
      this.render(location, config);

      // Only initialize mobile menu if not already initialized
      if (!window.mobileMenuInitialized) {
        this.initMobileMenu();
        window.mobileMenuInitialized = true;
      }
    },
  };

  // Register component
  window.DogBarComponents.Header = HeaderComponent;
})();
