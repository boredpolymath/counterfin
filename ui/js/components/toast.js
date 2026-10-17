/**
 * Toast Notification UI Component
 * Renders non-intrusive notifications with auto-dismissal
 */

export function showToast(title, message, type = "info") {
  if (typeof document === 'undefined') return;
  let container = document.getElementById("toastContainer");
  if (!container) {
    container = document.createElement("div");
    container.id = "toastContainer";
    container.className = "counterfin-toast-container";
    if (document.body) {
      document.body.appendChild(container);
    }
  }

  const toast = document.createElement("div");
  toast.className = `counterfin-toast counterfin-toast-${type}`;
  const iconSvg = type === 'success'
    ? '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="20 6 9 17 4 12"></polyline></svg>'
    : '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>';

  const iconDiv = document.createElement("div");
  iconDiv.className = "counterfin-toast-icon";
  iconDiv.innerHTML = iconSvg;

  const contentDiv = document.createElement("div");
  contentDiv.className = "counterfin-toast-content";

  const titleDiv = document.createElement("div");
  titleDiv.className = "counterfin-toast-title";
  titleDiv.textContent = title || "Notice";

  const msgDiv = document.createElement("div");
  msgDiv.className = "counterfin-toast-msg";
  msgDiv.textContent = message || "";

  contentDiv.appendChild(titleDiv);
  contentDiv.appendChild(msgDiv);

  const closeBtn = document.createElement("button");
  closeBtn.type = "button";
  closeBtn.className = "counterfin-toast-close";
  closeBtn.setAttribute("aria-label", "Close notification");
  closeBtn.textContent = "✕";

  toast.appendChild(iconDiv);
  toast.appendChild(contentDiv);
  toast.appendChild(closeBtn);

  const removeToast = () => {
    toast.classList.add("toast-hiding");
    setTimeout(() => {
      if (toast.parentNode) toast.parentNode.removeChild(toast);
    }, 300);
  };

  closeBtn.addEventListener("click", removeToast);
  if (container) {
    container.appendChild(toast);
  }
  setTimeout(removeToast, 4000);
}
