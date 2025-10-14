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
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
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
