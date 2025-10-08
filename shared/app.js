// Dog Bar - Main Application Controller
// Manages component loading and location-specific content

class DogBarApp {
  constructor() {
    this.location = this.detectLocation();
    this.config = null;
    this.supabase = null;
    this.init();
  }

  detectLocation() {
    // Check URL parameter first
    const urlParams = new URLSearchParams(window.location.search);
    const locationParam = urlParams.get("location");
    if (locationParam) return locationParam;

    // Check hostname
    const hostname = window.location.hostname;
    if (hostname.includes("dbsrq") || hostname.includes("sarasota")) {
      return "sarasota";
    }
    if (
      hostname.includes("dogbarstpete") ||
      hostname.includes("st-pete") ||
      hostname.includes("stpete")
    ) {
      return "st-pete";
    }

    // Default to St. Pete
    return "st-pete";
  }

  async init() {
    try {
      // Prevent any automatic scrolling on page load
      window.scrollTo(0, 0);

      // Initialize Supabase
      this.initSupabase();

      // Load configuration from database
      await this.loadConfigFromDatabase();

      // Load and render components
      await this.loadComponents();

      // Initialize interactive features
      this.initializeFeatures();

      // Ensure we're still at the top after everything loads
      setTimeout(() => {
        window.scrollTo(0, 0);
      }, 100);

      console.log("🐕 Dog Bar App initialized for:", this.location);
    } catch (error) {
      console.error("Error initializing Dog Bar App:", error);
    }
  }

  initSupabase() {
    const supabaseUrl = "https://pkomfbezaollhvcpezaw.supabase.co";
    const supabaseKey =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrb21mYmV6YW9sbGh2Y3BlemF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjcxMTIsImV4cCI6MjA3NTQ0MzExMn0.E2__i0ieMKMYwx-bzk3rnZ9-ozQLSJxMIm3GhRKt8K0";

    this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);
  }

  async loadConfigFromDatabase() {
    try {
      const { data, error } = await this.supabase
        .from("site_content")
        .select("*")
        .eq("location", this.location)
        .single();

      if (error) {
        console.error("Error loading config from database:", error);
        // Fallback to JSON config
        await this.loadConfig();
        return;
      }

      // Transform database data to match expected format
      this.config = {
        location: data.location,
        domain: this.location === "st-pete" ? "dogbarstpete.com" : "dbsrq.com",
        title: `The Dog Bar - ${
          data.location === "st-pete" ? "St. Pete" : "Sarasota"
        }`,
        subtitle: data.hero_text,
        address: data.address,
        phone: data.phone,
        email: data.email,
        hours: data.hours,
        stats: data.stats,
        features: [
          `${data.stats.sqft} Sq Ft Play Area`,
          `${data.stats.beers} Draft Beers`,
          `${data.stats.rating} Fun & Safety`,
        ],
        cta: {
          primary: "Register Your Dog",
          secondary: "Learn More",
        },
        social: {
          instagram:
            this.location === "st-pete"
              ? "https://instagram.com/dogbarstpete"
              : "https://instagram.com/dogbarsarasota",
          facebook:
            this.location === "st-pete"
              ? "https://facebook.com/dogbarstpete"
              : "https://facebook.com/dogbarsarasota",
        },
      };

      console.log("✅ Config loaded from database:", this.config);
    } catch (error) {
      console.error("Error loading config from database:", error);
      // Fallback to JSON config
      await this.loadConfig();
    }
  }

  async loadConfig() {
    try {
      const response = await fetch(`config/${this.location}.json`);
      this.config = await response.json();
    } catch (error) {
      console.error("Error loading config:", error);
      // Fallback config
      this.config = {
        name: "The Dog Bar",
        location: this.location === "st-pete" ? "St. Petersburg" : "Sarasota",
        subtitle: "Florida's Premier Dog Park & Bar",
      };
    }
  }

  async loadComponents() {
    // Load all component scripts
    const components = [
      "header",
      "hero",
      "stats",
      "events",
      "footer",
      "location-chooser",
    ];

    for (const component of components) {
      try {
        await this.loadScript(`shared/components/${component}.js`);
      } catch (error) {
        console.warn(`Component ${component} failed to load:`, error);
      }
    }

    // Give components time to register
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Render components
    this.renderComponents();
  }

  loadScript(src) {
    return new Promise((resolve, reject) => {
      const script = document.createElement("script");
      script.src = src;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  renderComponents() {
    // Each component will have a render function
    if (window.DogBarComponents) {
      const components = window.DogBarComponents;

      if (components.Header) {
        components.Header.render(this.location, this.config);
      }

      if (components.Hero) {
        components.Hero.render(this.location, this.config);
      }

      if (components.Stats) {
        components.Stats.render(this.location, this.config);
      }

      if (components.Events) {
        components.Events.render(this.location, this.config);
      }

      if (components.Footer) {
        components.Footer.render(this.location, this.config);
      }

      if (components.LocationChooser) {
        components.LocationChooser.render(this.location);
      }
    }
  }

  initializeFeatures() {
    // Initialize video playback
    const heroVideo = document.getElementById("heroVideo");
    if (heroVideo) {
      heroVideo.playbackRate = this.location === "st-pete" ? 0.7 : 0.5;
    }

    // Show Instagram feed only for Sarasota
    const instagramFeed = document.getElementById("instagram-feed");
    if (instagramFeed && this.location === "sarasota") {
      instagramFeed.classList.remove("hidden");
    }

    // Initialize mobile menu
    window.toggleMobileMenu = () => {
      const mobileMenu = document.getElementById("mobile-menu");
      if (mobileMenu) {
        mobileMenu.classList.toggle("hidden");
      }
    };

    // Smooth scroll for anchor links (only on click, not on page load)
    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute("href"));
        if (target) {
          target.scrollIntoView({ behavior: "smooth" });
        }
      });
    });

    // Ensure page starts at top on load
    window.scrollTo(0, 0);
  }

  // Public API
  getLocation() {
    return this.location;
  }

  getConfig() {
    return this.config;
  }

  getSupabase() {
    return this.supabase;
  }
}

// Global component registry
window.DogBarComponents = {};

// Initialize app when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  window.DogBarApp = new DogBarApp();
});
