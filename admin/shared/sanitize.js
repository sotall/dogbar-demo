// Input sanitization utility
class InputSanitizer {
  static sanitizeHTML(str) {
    const div = document.createElement("div");
    div.textContent = str;
    return div.innerHTML;
  }

  static sanitizeEmail(email) {
    return email.toLowerCase().trim();
  }

  static validateEmail(email) {
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return regex.test(email);
  }

  static sanitizeString(str, maxLength = 255) {
    return str.trim().substring(0, maxLength);
  }

  static sanitizeNumber(num, min = 0, max = 999999) {
    const parsed = parseInt(num);
    if (isNaN(parsed)) return min;
    return Math.max(min, Math.min(max, parsed));
  }

  static sanitizeURL(url) {
    try {
      const urlObj = new URL(url);
      return urlObj.toString();
    } catch {
      return "";
    }
  }

  static sanitizeJSON(str) {
    try {
      const parsed = JSON.parse(str);
      return JSON.stringify(parsed);
    } catch {
      return "{}";
    }
  }
}

window.InputSanitizer = InputSanitizer;
