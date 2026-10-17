/**
 * DOM Utility Helpers
 * Safe DOM rendering and node manipulation utilities
 */

export function setSafeViewContent(container, htmlContent) {
  if (!container) return;
  const fragment = document.createRange().createContextualFragment(htmlContent);
  container.replaceChildren(fragment);
}
