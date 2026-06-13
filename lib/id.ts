export function generateId() {
    return "SC-" + Math.random().toString(36).substring(2, 10).toUpperCase();
  }