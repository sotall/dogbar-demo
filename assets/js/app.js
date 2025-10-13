// Dog Bar - Main Application Controller
// Manages component loading and location-specific content

class DogBarApp {
  constructor() {
    this.location = this.detectLocation();
    this.config = null;
    this.supabase = null;
    this.headerRendered = false;
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
      console.log("🚀 Starting Dog Bar App initialization...");
      // Prevent any automatic scrolling on page load
      window.scrollTo(0, 0);

      // Initialize Supabase
      console.log("🔧 Initializing Supabase...");
      this.initSupabase();

      // Load configuration from database
      console.log("📊 Loading config from database...");
      await this.loadConfigFromDatabase();

      // Load and render components
      console.log("📦 Loading components...");
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
    // Get credentials from environment variables (injected by Vite at build time)
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
    const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !supabaseKey) {
      console.error(
        "❌ Supabase credentials not found in environment variables"
      );
      return;
    }

    this.supabase = window.supabase.createClient(supabaseUrl, supabaseKey);

    // Make Supabase client globally available for components
    window.supabaseClient = this.supabase;
  }

  async loadConfigFromDatabase() {
    try {
      console.log(
        "🔍 Loading config from database for location:",
        this.location
      );

      const { data, error } = await this.supabase
        .from("site_content")
        .select("*")
        .eq("location", this.location)
        .limit(1);

      if (error) {
        console.error("❌ Error loading config from database:", error);
        // No fallback to JSON. Keep minimal config and proceed.
        this.config = { location: this.location };
        return;
      }

      if (!data || data.length === 0) {
        console.warn("⚠️ No site content found for location:", this.location);
        // No fallback to JSON. Keep minimal config and proceed.
        this.config = { location: this.location };
        return;
      }

      // Get the first row (in case there are duplicates)
      const siteData = data[0];

      // Transform database data to match expected format
      this.config = {
        location: siteData.location,
        domain: this.location === "st-pete" ? "dogbarstpete.com" : "dbsrq.com",
        title: `The Dog Bar - ${
          siteData.location === "st-pete" ? "St. Pete" : "Sarasota"
        }`,
        subtitle: siteData.hero_text,
        address: siteData.address,
        phone: siteData.phone,
        email: siteData.email,
        hours: siteData.hours,
        stats: siteData.stats,
        features: [
          `${siteData?.stats?.sqft ?? ""} Sq Ft Play Area`,
          `${siteData?.stats?.beers ?? ""} Draft Beers`,
          `${siteData?.stats?.rating ?? ""} Fun & Safety`,
        ],
        cta: {
          primary: "Register Your Dog",
          secondary: "Learn More",
        },
        social: {
          accounts: siteData?.social?.accounts || [],
          newsletter: siteData?.social?.newsletter || "",
        },
      };

      console.log("✅ Config loaded from database:", this.config);
      console.log("📊 Stats items count:", siteData?.stats?.items?.length || 0);
      console.log("📊 Stats items:", siteData?.stats?.items);
    } catch (error) {
      console.error("Error loading config from database:", error);
      // No fallback to JSON. Keep minimal config and proceed.
      this.config = { location: this.location };
    }
  }

  async loadConfig() {
    try {
      console.log("🔄 Loading fallback JSON config for:", this.location);
      const response = await fetch(`config/${this.location}.json`);
      this.config = await response.json();
      console.log("✅ Fallback config loaded:", this.config);
    } catch (error) {
      console.error("❌ Error loading fallback config:", error);
      // No fallback - site should only use database data
      this.config = {
        location: this.location,
      };
      console.warn("⚠️ No config available - site will be missing data!");
    }
  }

  async loadComponents() {
    console.log("📦 loadComponents() called");
    console.log("📦 Loading components...");

    const assetsBase = this.getAssetsBasePath();

    // Load and render header FIRST to avoid header flash on navigation
    try {
      console.log("📦 Loading header component early...");
      await this.loadScript(`${assetsBase}/js/components/header.js`);
      if (window.DogBarComponents?.Header) {
        console.log("✅ Rendering Header early");
        window.DogBarComponents.Header.renderWithInit(
          this.location,
          this.config
        );
        this.headerRendered = true;
      }
    } catch (e) {
      console.warn("❌ Early header load failed:", e);
    }

    // Load social icon data (kept separate from footer for cleanliness)
    const socialScripts = [
      "facebook",
      "instagram",
      "twitter",
      "tiktok",
      "youtube",
      "linkedin",
      "snapchat",
    ];

    for (const s of socialScripts) {
      try {
        await this.loadScript(`${assetsBase}/js/social/${s}.js`);
      } catch (e) {
        console.warn(`❌ Social icon ${s} failed to load:`, e);
      }
    }

    // Load remaining component scripts (header already loaded)
    const components = [
      "hero",
      "stats",
      "events",
      "footer",
      "location-chooser",
      "contact",
    ];

    for (const component of components) {
      try {
        console.log(`📦 Loading ${component} component...`);
        await this.loadScript(`${assetsBase}/js/components/${component}.js`);
        console.log(`✅ ${component} component loaded`);
      } catch (error) {
        console.warn(`❌ Component ${component} failed to load:`, error);
      }
    }

    // Give components time to register
    console.log("⏳ Waiting for components to register...");
    await new Promise((resolve) => setTimeout(resolve, 200));

    // Render components
    console.log("🔍 About to render components...");
    this.renderComponents();
  }

  // Helper method to get correct base path for assets
  getAssetsBasePath() {
    const currentPath = window.location.pathname;
    const isInPagesDir = currentPath.includes("/pages/");
    return isInPagesDir ? "../assets" : "assets";
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
    console.log("🎨 Starting component rendering...");
    console.log("📍 Current location:", this.location);
    console.log("⚙️ Current config:", this.config);
    console.log("Available components:", window.DogBarComponents);

    // Each component will have a render function
    if (window.DogBarComponents) {
      const components = window.DogBarComponents;

      if (components.Header) {
        console.log("✅ Rendering Header component");
        components.Header.renderWithInit(this.location, this.config);
      } else {
        console.warn("❌ Header component not found");
      }

      if (components.Hero) {
        console.log("✅ Rendering Hero component");
        components.Hero.render(this.location, this.config);
      } else {
        console.warn("❌ Hero component not found");
      }

      if (components.Stats) {
        console.log("✅ Rendering Stats component");
        components.Stats.render(this.location, this.config);
      } else {
        console.warn("❌ Stats component not found");
      }

      if (components.Events) {
        console.log("✅ Rendering Events component");
        components.Events.render(this.location, this.config);
      } else {
        console.warn("❌ Events component not found");
      }

      if (components.Footer) {
        console.log("✅ Rendering Footer component");
        components.Footer.render(this.location, this.config);
      } else {
        console.warn("❌ Footer component not found");
      }

      if (components.LocationChooser) {
        console.log("✅ Rendering LocationChooser component");
        components.LocationChooser.render(this.location);
      } else {
        console.warn("❌ LocationChooser component not found");
      }

      if (components.Contact) {
        console.log("✅ Initializing Contact component");
        components.Contact.init(this.location);
      } else {
        console.warn("❌ Contact component not found");
      }
    } else {
      console.error("❌ DogBarComponents not available!");
    }
  }

  initializeFeatures() {
    // Video initialization removed - now using gradient backgrounds

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

// Initialize app immediately when script loads
console.log("🚀 App script loaded, initializing Dog Bar App...");

// Wait for both DOM and Supabase to be available
function waitForBothAndInit() {
  if (document.readyState === "loading") {
    console.log("⏳ Waiting for DOM to be ready...");
    setTimeout(waitForBothAndInit, 100);
    return;
  }

  if (!window.supabase) {
    console.log("⏳ Waiting for Supabase to be available...");
    setTimeout(waitForBothAndInit, 100);
    return;
  }

  console.log("✅ Both DOM and Supabase ready, initializing app...");
  window.DogBarApp = new DogBarApp();
}

waitForBothAndInit();
