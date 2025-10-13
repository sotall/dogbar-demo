import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  // Multi-page app configuration
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, "index.html"),
        site: resolve(__dirname, "site.html"),
        // Admin pages
        adminIndex: resolve(__dirname, "admin/index.html"),
        adminLogin: resolve(__dirname, "admin/login.html"),
        adminDashboard: resolve(__dirname, "admin/dashboard.html"),
        adminEvents: resolve(__dirname, "admin/events.html"),
        adminFoodTrucks: resolve(__dirname, "admin/food-trucks.html"),
        adminMedia: resolve(__dirname, "admin/media.html"),
        adminSiteSettings: resolve(__dirname, "admin/site-settings.html"),
        adminUsers: resolve(__dirname, "admin/users.html"),
        adminLogs: resolve(__dirname, "admin/logs.html"),
        adminSchemaInspector: resolve(__dirname, "admin/schema-inspector.html"),
        // Additional pages
        calendar: resolve(__dirname, "pages/calendar.html"),
        contactUs: resolve(__dirname, "pages/contact-us.html"),
        menu: resolve(__dirname, "pages/menu.html"),
        partyBooking: resolve(__dirname, "pages/party-booking.html"),
        debug: resolve(__dirname, "pages/debug.html"),
      },
    },
    // Use esbuild minification (faster and included by default)
    minify: "esbuild",
    // Source maps for debugging
    sourcemap: false, // Disable for production to reduce bundle size
  },
  // Environment variables - only VITE_ prefixed vars are exposed to client
  define: {
    "process.env": {},
  },
});
