/**
 * SettleMint IPC Bridge
 * Abstraction layer for Tauri v2 IPC invocations with graceful offline browser fallback
 */

export const ipc = {
  async invoke(cmd, args = {}) {
    if (window.__TAURI__ && window.__TAURI__.core && window.__TAURI__.core.invoke) {
      try {
        return await window.__TAURI__.core.invoke(cmd, args);
      } catch (err) {
        console.error(`[IPC Error] Command '${cmd}' failed:`, err);
        throw err;
      }
    } else {
      // In-browser mock skeleton fallback
      console.debug(`[Mock IPC] Invoked '${cmd}' with payload:`, args);
      return null;
    }
  },

  async sendNotification(title, body) {
    if (window.__TAURI__ && window.__TAURI__.notification) {
      return await window.__TAURI__.notification.sendNotification({ title, body });
    } else {
      console.log(`[Notification Mock] ${title}: ${body}`);
    }
  }
};
