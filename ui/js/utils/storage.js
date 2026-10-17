/**
 * Local Storage Utilities
 * Safe wrappers with try/catch fallback for SSR/headless testing
 */

export const getStorageItem = (k) => {
  try {
    return typeof localStorage !== 'undefined' ? localStorage.getItem(k) : null;
  } catch (_) {
    return null;
  }
};

export const setStorageItem = (k, v) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.setItem(k, v);
  } catch (_) {}
};

export const removeStorageItem = (k) => {
  try {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(k);
  } catch (_) {}
};
