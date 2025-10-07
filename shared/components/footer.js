// Footer Component
(function () {
  const FooterComponent = {
    render(location, config) {
      const root = document.getElementById("footer-root");
      if (!root) return;

      const locationName =
        location === "st-pete" ? "St. Petersburg" : "Sarasota";
      const address =
        location === "st-pete"
          ? "1701 1st Ave S, St. Petersburg, FL 33712"
          : "1250 Fruitville Rd, Sarasota, FL 34236";
      const phone =
        location === "st-pete" ? "(727) 329-5297" : "(941) 444-3647";
      const email =
        location === "st-pete" ? "hello@dogbarstpete.com" : "hello@dbsrq.com";

      root.innerHTML = `
        <footer class="bg-gradient-to-r from-blue-500 via-cyan-500 to-blue-600 text-white py-12">
          <div class="container mx-auto px-4">
            <div class="grid md:grid-cols-4 gap-8">
              <div>
                <h3 class="text-xl font-bold mb-4">The Dog Bar ${locationName}</h3>
                <p class="text-white/90 text-sm">
                  Florida's Premier Dog Park & Bar
                </p>
              </div>
              <div>
                <h4 class="font-bold mb-4">Contact</h4>
                <p class="text-white/90 text-sm mb-2">${address}</p>
                <p class="text-white/90 text-sm mb-2">${phone}</p>
                <p class="text-white/90 text-sm">${email}</p>
              </div>
              <div>
                <h4 class="font-bold mb-4">Hours</h4>
                <p class="text-white/90 text-sm">Mon-Thu: 4PM - 11PM</p>
                <p class="text-white/90 text-sm">Fri: 4PM - 12AM</p>
                <p class="text-white/90 text-sm">Sat: 12PM - 12AM</p>
                <p class="text-white/90 text-sm">Sun: 12PM - 10PM</p>
              </div>
              <div>
                <h4 class="font-bold mb-4">Follow Us</h4>
                <div class="flex space-x-4">
                  <a href="#" class="hover:text-cyan-300 transition-colors">Facebook</a>
                  <a href="#" class="hover:text-cyan-300 transition-colors">Instagram</a>
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
            <p class="text-gray-600">Mon-Thu: 4PM - 11PM</p>
            <p class="text-gray-600">Fri: 4PM - 12AM</p>
            <p class="text-gray-600">Sat: 12PM - 12AM</p>
            <p class="text-gray-600">Sun: 12PM - 10PM</p>
          </div>
        `;
      }
    },
  };

  // Register component
  window.DogBarComponents.Footer = FooterComponent;
})();
