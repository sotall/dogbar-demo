// Theme Manager for Admin Portal
// Handles dark/light mode toggle with persistent state

class ThemeManager {
  constructor() {
    this.currentTheme = localStorage.getItem("admin-theme") || "light";
    this.init();
  }

  init() {
    this.applyTheme(this.currentTheme);
  }

  applyTheme(theme) {
    const isDark = theme === "dark";
    document.documentElement.classList.toggle("dark", isDark);

    const applyToBody = () => {
      if (!document.body) return;
      document.body.classList.toggle("dark", isDark);
      document.body.dataset.theme = isDark ? "dark" : "light";
    };

    if (document.body) {
      applyToBody();
    } else {
      document.addEventListener("DOMContentLoaded", applyToBody, {
        once: true,
      });
    }

    this.currentTheme = theme;
    localStorage.setItem("admin-theme", theme);
    this.notifyChange();
  }

  toggle() {
    const newTheme = this.currentTheme === "light" ? "dark" : "light";
    this.applyTheme(newTheme);
  }

  notifyChange() {
    window.dispatchEvent(
      new CustomEvent("themechange", {
        detail: { theme: this.currentTheme },
      })
    );
  }

  getCurrentTheme() {
    return this.currentTheme;
  }
}

// Initialize and expose globally
window.ThemeManager = new ThemeManager();
