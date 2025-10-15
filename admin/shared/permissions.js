// Simplified Permission System using is_admin_user() function
import { ACTIONS, ROLES, roleRank } from "./actions-registry.js";

class PermissionManager {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
    this.roleChecked = false;
    this.supabase = null;
    this.permissionsMatrix = null; // { role: { actionKey: boolean } }
    this.matrixLoadedAt = 0;
  }

  // Check if session is valid and not expired
  async checkSession() {
    try {
      if (!this.supabase) {
        return false;
      }

      const {
        data: { session },
        error,
      } = await this.supabase.auth.getSession();

      if (!session || error) {
        console.log("❌ No valid session found");
        this.clearSession();
        return false;
      }

      // Check if token is expired
      const expiresAt = session.expires_at * 1000;
      if (Date.now() >= expiresAt) {
        console.log("❌ Session expired");
        this.clearSession();
        return false;
      }

      console.log("✅ Session valid");
      return true;
    } catch (error) {
      console.error("❌ Session check error:", error);
      this.clearSession();
      return false;
    }
  }

  // Clear session data
  clearSession() {
    // Clear Supabase tokens
    Object.keys(localStorage).forEach((key) => {
      if (
        key.startsWith("supabase.auth.token") ||
        key.startsWith("sb-") ||
        key.startsWith("admin_") ||
        key.startsWith("login_")
      ) {
        localStorage.removeItem(key);
      }
    });

    // Save return URL before clearing
    const currentPath = window.location.pathname;
    if (!currentPath.includes("login.html")) {
      sessionStorage.setItem("returnUrl", currentPath);
    }

    sessionStorage.removeItem("admin_session");
    sessionStorage.removeItem("admin_user");

    this.resetRoleCache();
    this.currentUser = null;
  }

  // Initialize permissions for current user
  async initialize() {
    try {
      this.supabase = window.supabase.createClient(
        "https://pkomfbezaollhvcpezaw.supabase.co",
        "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBrb21mYmV6YW9sbGh2Y3BlemF3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk4NjcxMTIsImV4cCI6MjA3NTQ0MzExMn0.E2__i0ieMKMYwx-bzk3rnZ9-ozQLSJxMIm3GhRKt8K0",
        {
          auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true,
          },
        }
      );

      // Check session validity first
      const hasValidSession = await this.checkSession();
      if (!hasValidSession) {
        const returnUrl = sessionStorage.getItem("returnUrl");
        if (returnUrl) {
          window.location.href = "login.html?expired=true";
        } else {
          window.location.href = "login.html";
        }
        return false;
      }

      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();
      if (error || !user) {
        throw new Error("Authentication failed");
      }

      this.currentUser = user;

      // Use the is_admin_user() function to check admin status
      const { data: isAdmin, error: roleError } = await this.supabase.rpc(
        "is_admin_user"
      );

      if (roleError || !isAdmin) {
        console.error("Admin check failed:", roleError);
        throw new Error("You do not have admin access");
      }

      // Get the actual role from admin_users table for UI purposes (query by id to satisfy RLS self-select policy)
      const { data: userData, error: userError } = await this.supabase
        .from("admin_users")
        .select("role")
        .eq("id", user.id)
        .single();

      if (userError || !userData) {
        console.error("Could not fetch user role:", userError);
        throw new Error("Unable to verify admin access");
      }

      this.userRole = userData.role;
      this.roleChecked = true;

      // Preload matrix so legacy hasPermission shim can work quickly
      await this.loadMatrix(true);

      console.log(`✅ User authenticated: ${user.email} (${this.userRole})`);
      return true;
    } catch (error) {
      console.error("❌ Permission initialization failed:", error);
      return false;
    }
  }

  // Check if user is admin
  async checkAuth() {
    try {
      const {
        data: { user },
        error,
      } = await this.supabase.auth.getUser();

      if (error || !user) {
        window.location.href = "/admin/login.html";
        return false;
      }

      // Test if user is admin using the database function
      const { data: isAdmin, error: roleError } = await this.supabase.rpc(
        "is_admin_user"
      );

      if (roleError || !isAdmin) {
        console.error("Admin check failed:", roleError);
        alert("You do not have admin access");
        await this.supabase.auth.signOut();
        window.location.href = "/admin/login.html";
        return false;
      }

      this.roleChecked = true;
      return true;
    } catch (error) {
      console.error("Auth check error:", error);
      window.location.href = "/admin/login.html";
      return false;
    }
  }

  // Get user role
  getRole() {
    return this.userRole;
  }

  // Get current user
  getCurrentUser() {
    return this.currentUser;
  }

  // Check if user is super admin
  isSuperAdmin() {
    return this.userRole === "super_admin";
  }

  // Check if user is admin or super admin
  isAdmin() {
    return ["admin", "super_admin"].includes(this.userRole);
  }

  // Load role_permissions matrix from DB (cached for 60s)
  async loadMatrix(force = false) {
    if (
      this.permissionsMatrix &&
      !force &&
      Date.now() - this.matrixLoadedAt < 60000
    ) {
      return this.permissionsMatrix;
    }
    try {
      const { data, error } = await this.supabase
        .from("role_permissions")
        .select("role, action_key, allowed");
      if (error) throw error;
      const matrix = {};
      for (const role of ROLES) matrix[role] = {};
      (data || []).forEach((row) => {
        if (!matrix[row.role]) matrix[row.role] = {};
        matrix[row.role][row.action_key] = row.allowed === true;
      });
      this.permissionsMatrix = matrix;
      this.matrixLoadedAt = Date.now();
      return matrix;
    } catch (e) {
      console.warn("Failed to load role_permissions matrix:", e);
      this.permissionsMatrix = this.permissionsMatrix || {};
      return this.permissionsMatrix;
    }
  }

  // Check if user has a specific action permission (ACTIONS keys)
  async can(actionKey) {
    if (!this.roleChecked) return false;
    if (this.isSuperAdmin()) return true;
    const matrix = await this.loadMatrix();
    return Boolean(matrix?.[this.userRole]?.[actionKey]);
  }

  // Backward-compatible shim for existing pages using hasPermission('manage_settings', etc.)
  // Maps legacy keys to the new action keys. Returns boolean, using cached matrix.
  hasPermission(legacyKey) {
    const map = {
      // Page access should check VIEW permissions
      manage_events: "events.view",
      manage_users: "users.view",
      manage_media: "media.view",
      manage_settings: "site_settings.view",
      view_logs: "logs.view",
      manage_food_trucks: "food_trucks.view",
    };
    const actionKey = map[legacyKey] || legacyKey;
    if (!this.roleChecked) return false;
    if (this.isSuperAdmin()) return true;
    const m = this.permissionsMatrix || {};
    return Boolean(m?.[this.userRole]?.[actionKey]);
  }

  // Helper for checking write permissions (create/edit/delete)
  async canEdit(section) {
    const editActions = {
      events: "events.edit",
      users: "users.edit",
      media: "media.upload",
      settings: "site_settings.edit",
      food_trucks: "food_trucks.edit",
    };
    return await this.can(editActions[section]);
  }

  // Restrict a <select> of roles to not exceed current user's rank
  restrictRoleOptions(selectEl) {
    const myRank = roleRank(this.userRole);
    Array.from(selectEl.options).forEach((opt) => {
      const allowed = roleRank(opt.value) <= myRank;
      opt.disabled = !allowed;
    });
  }

  // Reset role cache (call when user logs out or changes)
  resetRoleCache() {
    this.userRole = null;
    this.roleChecked = false;
  }

  // Logout method
  async logout() {
    try {
      // Sign out from Supabase (clears auth tokens from storage)
      await this.supabase.auth.signOut();

      // Clear any cached role data
      this.resetRoleCache();
      this.currentUser = null;

      // Clear all localStorage items related to Supabase
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith("supabase.")) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach((key) => localStorage.removeItem(key));

      // Clear sessionStorage as well
      sessionStorage.clear();

      console.log("✅ Logged out successfully");

      // Redirect to login
      window.location.href = "login.html";
    } catch (error) {
      console.error("❌ Logout error:", error);
      // Force logout anyway
      localStorage.clear();
      sessionStorage.clear();
      window.location.href = "login.html";
    }
  }
}

// Global permission manager instance
window.PermissionManager = new PermissionManager();

// Auto-initialize permissions when script loads
document.addEventListener("DOMContentLoaded", async function () {
  const initialized = await window.PermissionManager.initialize();
  if (!initialized) {
    window.location.href = "login.html";
  }
});
