// Shared Admin Navigation Component
class AdminNavigation {
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

  // Initialize navigation
  async init() {
    await this.loadNavigation();
    this.setupEventListeners();
    this.highlightCurrentPage();
  }

  // Load navigation HTML
  async loadNavigation() {
    try {
      const response = await fetch("shared/navigation.html");
      const html = await response.text();

      // Insert navigation at the beginning of body
      document.body.insertAdjacentHTML("afterbegin", html);

      // Set page title
      this.setPageTitle();

      // Apply permission-based UI after navigation loads
      await this.waitForPermissionManager();
      await this.waitForRoleReady();
      this.filterMenuByPermissions();

      console.log("✅ Admin navigation loaded successfully");
    } catch (error) {
      console.error("❌ Failed to load admin navigation:", error);
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
      // config removed (merged into Site Settings)
      users: "User Management",
      logs: "Audit Logs",
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

  // Close menu helper method
  closeMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    if (mobileMenu) {
      mobileMenu.classList.add("hidden");
      document.body.style.overflow = ""; // Restore scrolling
    }
  }

  // Static close menu function for event listeners
  static closeMenu() {
    const mobileMenu = document.getElementById("mobileMenu");
    if (mobileMenu) {
      mobileMenu.classList.add("hidden");
      document.body.style.overflow = ""; // Restore scrolling
    }
  }

  // Attach event listeners
  attachListeners() {
    // Hamburger menu toggle
    const hamburgerBtn = document.getElementById("hamburgerBtn");
    const mobileMenu = document.getElementById("mobileMenu");
    const closeMenuBtn = document.getElementById("closeMenuBtn");
    const mobileMenuOverlay = document.getElementById("mobileMenuOverlay");
    const mobileDrawer = document.getElementById("mobileDrawer");

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
        AdminNavigation.closeMenu();
      });
    }

    // Close menu when clicking outside
    if (mobileMenu) {
      // Close when clicking the overlay background (left side)
      if (mobileMenuOverlay) {
        mobileMenuOverlay.addEventListener("click", () => {
          AdminNavigation.closeMenu();
        });
      }

      // Close when clicking anywhere outside the drawer
      document.addEventListener("click", (e) => {
        const isMenuOpen = !mobileMenu.classList.contains("hidden");
        const isClickInsideDrawer =
          mobileDrawer && mobileDrawer.contains(e.target);
        const isClickOnHamburger =
          hamburgerBtn && hamburgerBtn.contains(e.target);

        if (isMenuOpen && !isClickInsideDrawer && !isClickOnHamburger) {
          AdminNavigation.closeMenu();
        }
      });
    }

    // Dark mode toggle
    const darkModeToggle = document.getElementById("darkModeToggle");
    if (darkModeToggle) {
      darkModeToggle.addEventListener("click", () => {
        if (window.ThemeManager) {
          window.ThemeManager.toggle();
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
        AdminNavigation.closeMenu();
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

  // Wait for PermissionManager to be ready
  async waitForPermissionManager() {
    let attempts = 0;
    const maxAttempts = 50; // Increased timeout for slower connections

    // First, wait for PermissionManager to exist and have currentUser set
    while (!window.PermissionManager || !window.PermissionManager.currentUser) {
      if (attempts >= maxAttempts) {
        console.warn(
          "⚠️ PermissionManager not ready after waiting, continuing anyway..."
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }

    console.log("✅ PermissionManager is ready!");

    // Update the user email
    this.updateUserEmail();
  }

  // Wait until PermissionManager has resolved role (roleChecked)
  async waitForRoleReady() {
    let attempts = 0;
    const maxAttempts = 50;
    while (!window.PermissionManager || !window.PermissionManager.roleChecked) {
      if (attempts >= maxAttempts) {
        console.warn(
          "⚠️ PermissionManager role not ready after waiting, skipping menu filter..."
        );
        return;
      }
      await new Promise((resolve) => setTimeout(resolve, 100));
      attempts++;
    }
    console.log("✅ Permission role is ready!");
  }

  // Update user email from permission manager
  updateUserEmail() {
    console.log("🔍 Updating user email...");
    console.log("🔍 PermissionManager exists:", !!window.PermissionManager);

    if (!window.PermissionManager) {
      console.warn("⚠️ PermissionManager not available");
      return;
    }

    const user = window.PermissionManager.getCurrentUser();
    console.log("🔍 Current user:", user);

    if (user && user.email) {
      this.setUserEmail(user.email);
      console.log("✅ Email updated to:", user.email);
    } else {
      console.warn("⚠️ No user email available");
    }
  }

  // Filter menu items based on user permissions
  async filterMenuByPermissions() {
    if (!window.PermissionManager) {
      console.warn("⚠️ PermissionManager not available for menu filtering");
      return;
    }

    try {
      // If super admin, show everything (no filtering)
      if (
        typeof window.PermissionManager.isSuperAdmin === "function" &&
        window.PermissionManager.isSuperAdmin()
      ) {
        console.log("👑 Super admin detected - showing all menu items");
        return;
      }

      // Ensure role is ready; if not, avoid hiding everything prematurely
      if (!window.PermissionManager.roleChecked) {
        console.warn(
          "⚠️ Role not ready during filter; skipping filtering to avoid hiding items"
        );
        return;
      }

      await window.PermissionManager.loadMatrix();

      document.querySelectorAll("[data-requires]").forEach(async (link) => {
        const action = link.dataset.requires;
        const allowed = await window.PermissionManager.can(action);
        if (!allowed) {
          link.style.display = "none";
          console.log(`🚫 Hidden menu item requiring: ${action}`);
        } else {
          console.log(`✅ Showing menu item requiring: ${action}`);
        }
      });
    } catch (error) {
      console.error("❌ Error filtering menu by permissions:", error);
    }
  }
}

// Auto-initialize when script loads
window.AdminNavigation = AdminNavigation;

// Initialize navigation
document.addEventListener("DOMContentLoaded", () => {
  window.adminNavigation = new AdminNavigation();
});
