// Shared Admin Header Component
class AdminHeader {
  constructor() {
    this.currentPage = this.getCurrentPage();
    this.init();
  }

  // Get current page name for highlighting
  getCurrentPage() {
    const path = window.location.pathname;
    const page = path.split("/").pop().replace(".html", "");
    return page;
  }

  // Initialize header
  async init() {
    await this.loadHeader();
    this.setupEventListeners();
    this.highlightCurrentPage();
  }

  // Load header HTML
  async loadHeader() {
    try {
      const response = await fetch("shared/header.html");
      const html = await response.text();

      // Insert header at the beginning of body
      document.body.insertAdjacentHTML("afterbegin", html);

      // Set page title
      this.setPageTitle();

      console.log("✅ Admin header loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load admin header:", error);
    }
  }

  // Set page-specific title
  setPageTitle() {
    const titles = {
      dashboard: "Dashboard",
      events: "Events Management",
      "food-trucks": "Food Trucks",
      media: "Media Library",
      "site-settings": "Site Settings",
      config: "Site Configuration",
      users: "User Management",
      "schema-inspector": "Database Inspector",
      login: "Admin Login",
    };

    const titleElement = document.getElementById("pageTitle");
    if (titleElement) {
      titleElement.textContent = titles[this.currentPage] || "Admin Portal";
    }
  }

  // Setup event listeners
  setupEventListeners() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () =>
        this.attachListeners()
      );
    } else {
      this.attachListeners();
    }
  }

  // Attach event listeners
  attachListeners() {
    // Hamburger menu toggle
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeMenuBtn = document.getElementById("closeMenuBtn");

    console.log("🔍 Setting up event listeners...");
    console.log("Hamburger button:", hamburgerBtn);
    console.log("Mobile menu:", mobileMenu);

    if (hamburgerBtn && mobileMenu) {
      hamburgerBtn.addEventListener("click", () => {
        console.log("🍔 Hamburger clicked!");
        mobileMenu.classList.remove("hidden");
        document.body.style.overflow = "hidden"; // Prevent background scrolling
      });
    } else {
      console.error("❌ Missing hamburger button or mobile menu");
    }

    if (closeMenuBtn && mobileMenu) {
      closeMenuBtn.addEventListener("click", () => {
        mobileMenu.classList.add("hidden");
        document.body.style.overflow = ""; // Restore scrolling
      });
    }

    // Close menu when clicking overlay
    if (mobileMenu) {
      mobileMenu.addEventListener("click", (e) => {
        if (e.target === mobileMenu) {
          mobileMenu.classList.add("hidden");
          document.body.style.overflow = "";
        }
      });
    }

    // Logout button
    const logoutBtn = document.getElementById("logoutBtn");
    if (logoutBtn) {
      logoutBtn.addEventListener("click", async () => {
        await window.PermissionManager.logout();
      });
    }

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
      if (
        e.key === "Escape" &&
        mobileMenu &&
        !mobileMenu.classList.contains("hidden")
      ) {
        mobileMenu.classList.add("hidden");
        document.body.style.overflow = "";
      }
    });
  }

  // Highlight current page in menu
  highlightCurrentPage() {
    // Wait for menu to be loaded
    setTimeout(() => {
      const menuLinks = document.querySelectorAll("#mobileMenu a");
      menuLinks.forEach((link) => {
        const href = link.getAttribute("href");
        if (href && href.includes(this.currentPage)) {
          link.classList.add("bg-emerald-50", "text-emerald-700");
          link.classList.remove("text-gray-700");
        }
      });
    }, 100);
  }

  // Set user email
  setUserEmail(email) {
    const userEmailElements = document.querySelectorAll(
      "#userEmail, #menuUserEmail"
    );
    userEmailElements.forEach((element) => {
      if (element) element.textContent = email;
    });
  }
}

// Auto-initialize when script loads
window.AdminHeader = AdminHeader;

// Initialize header
document.addEventListener("DOMContentLoaded", () => {
  window.adminHeader = new AdminHeader();
});
