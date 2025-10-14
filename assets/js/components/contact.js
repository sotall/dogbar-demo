// Contact Component
window.DogBarComponents = window.DogBarComponents || {};

const ContactComponent = {
  async loadContactInfo(location) {
    try {
      const appInstance = window.DogBarApp;
      const appConfig = appInstance?.getConfig?.();
      const appLocation = appInstance?.getLocation?.();

      if (appConfig && appConfig.address) {
        if (!location || location === appLocation) {
          this.applyContactData(appConfig);
          return;
        }
      }

      // Fallback: fetch directly from Supabase if app config isn't available yet
      const { data, error } = await window.supabaseClient
        .from("site_content")
        .select("address, phone, email, hours")
        .eq("location", location)
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error("Error loading contact info:", error);
        return;
      }

      if (!data) {
        console.warn("No contact info found for location:", location);
        return;
      }

      this.applyContactData(data);
    } catch (error) {
      console.error("Error loading contact info:", error);
    }
  },

  applyContactData(data = {}) {
    const { address, phone, email, hours } = data;

    const addressEl = document.getElementById("contact-address");
    const phoneEl = document.getElementById("contact-phone");
    const emailEl = document.getElementById("contact-email");
    const hoursEl = document.getElementById("contact-hours");

    if (addressEl) addressEl.textContent = address || "Address not available";
    if (phoneEl) phoneEl.textContent = phone || "Phone not available";
    if (emailEl) emailEl.textContent = email || "Email not available";

    if (hoursEl && hours) {
      hoursEl.innerHTML = `
          <p><strong>Monday:</strong> ${hours.monday || "Closed"}</p>
          <p><strong>Tuesday:</strong> ${hours.tuesday || "Closed"}</p>
          <p><strong>Wednesday:</strong> ${hours.wednesday || "Closed"}</p>
          <p><strong>Thursday:</strong> ${hours.thursday || "Closed"}</p>
          <p><strong>Friday:</strong> ${hours.friday || "Closed"}</p>
          <p><strong>Saturday:</strong> ${hours.saturday || "Closed"}</p>
          <p><strong>Sunday:</strong> ${hours.sunday || "Closed"}</p>
        `;
    }

    this.updateMap(address);
  },

  updateMap(address) {
    const mapContainer = document.getElementById("map-container");
    if (!mapContainer) return;

    if (!address) {
      mapContainer.innerHTML = `
          <div class="text-center text-gray-500 p-6">
            <p class="text-lg font-semibold">Map unavailable</p>
            <p class="text-sm">Address information is missing. Please check back later.</p>
          </div>
        `;
      return;
    }

    const encodedAddress = encodeURIComponent(address);
    mapContainer.innerHTML = `
        <div class="w-full h-full flex flex-col">
          <iframe
            title="Dog Bar location map"
            class="w-full h-full"
            style="border:0;"
            loading="lazy"
            referrerpolicy="no-referrer-when-downgrade"
            src="https://www.google.com/maps?q=${encodedAddress}&output=embed"
            allowfullscreen>
          </iframe>
          <div class="bg-gray-900/80 text-white text-center text-sm py-2">
            <a
              href="https://maps.google.com/?q=${encodedAddress}"
              target="_blank"
              rel="noopener noreferrer"
              class="underline font-medium"
            >
              Open on Google Maps
            </a>
          </div>
        </div>
      `;
  },

  setupContactForm() {
    const form = document.getElementById("contact-form");
    const successMessage = document.getElementById("form-success");

    if (!form) return;

    form.addEventListener("submit", async (e) => {
      e.preventDefault();

      // Get form data
      const formData = new FormData(form);
      const data = {
        firstName: formData.get("firstName"),
        lastName: formData.get("lastName"),
        email: formData.get("email"),
        phone: formData.get("phone"),
        subject: formData.get("subject"),
        message: formData.get("message"),
        newsletter: formData.get("newsletter") === "on",
        timestamp: new Date().toISOString(),
        location:
          new URLSearchParams(window.location.search).get("location") ||
          "unknown",
      };

      try {
        // Submit to database (you'd need to create a contact_messages table)
        const { error } = await window.supabaseClient
          .from("contact_messages")
          .insert([data]);

        if (error) {
          console.error("Error submitting contact form:", error);
          alert(
            "Sorry, there was an error sending your message. Please try again."
          );
          return;
        }

        // Show success message
        form.style.display = "none";
        successMessage.classList.remove("hidden");

        // Scroll to success message
        successMessage.scrollIntoView({ behavior: "smooth" });
      } catch (error) {
        console.error("Error submitting contact form:", error);
        alert(
          "Sorry, there was an error sending your message. Please try again."
        );
      }
    });
  },

  init(location) {
    this.loadContactInfo(location);
    this.setupContactForm();
  },
};

// Register component
window.DogBarComponents.Contact = ContactComponent;
