/**
 * User Profile State Management
 * Handles profile persistence, formatting initials, and sidebar UI updates
 */

import { getStorageItem, setStorageItem } from '../utils/storage.js';

export const DEFAULT_USER_PROFILE = {
  name: "Consumer Advocate",
  shortName: "Advocate",
  initials: "CA",
  address: "",
  city: "",
  state: "NY",
  zip: "",
  phone: "",
  isConfigured: false
};

export function loadUserProfileFromStorage(storageSlot) {
  const raw = getStorageItem(storageSlot) || getStorageItem("settlemint_user_profile_v1");
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (_e) {
      // Fallback to default user profile
    }
  }
  return { ...DEFAULT_USER_PROFILE };
}

export function formatUserProfile(profileData) {
  const parts = (profileData.name || "").trim().split(/\s+/);
  let initials = "CA";
  let shortName = "Advocate";
  if (parts.length === 1 && parts[0]) {
    initials = parts[0].slice(0, 2).toUpperCase();
    shortName = parts[0];
  } else if (parts.length >= 2) {
    initials = (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    shortName = parts[0];
  }
  return {
    name: profileData.name?.trim() || "Consumer Advocate",
    shortName,
    initials,
    address: (profileData.address || "").trim(),
    city: (profileData.city || "").trim(),
    state: profileData.state || "NY",
    zip: (profileData.zip || "").trim(),
    phone: (profileData.phone || "").trim(),
    isConfigured: true
  };
}

export function saveUserProfileToStorage(storageSlot, profileData) {
  const formatted = formatUserProfile(profileData);
  setStorageItem(storageSlot, JSON.stringify(formatted));
  return formatted;
}

export function updateSidebarProfileUI(user) {
  if (typeof document === 'undefined') return;
  const avatar = document.getElementById("sidebarUserInitials") || document.getElementById("userAvatarInitials");
  const nameEl = document.getElementById("sidebarUserName");
  const roleEl = document.getElementById("sidebarUserJurisdiction") || document.getElementById("sidebarUserRole");
  if (avatar) avatar.textContent = user?.initials || "CA";
  if (nameEl) nameEl.textContent = user?.shortName || "Advocate";
  if (roleEl) roleEl.textContent = user?.isConfigured ? `${user.state} Resident` : "Setup Profile";
}
