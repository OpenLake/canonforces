// src/utils/formatDescription.js

export function formatDescription(text) {
  if (!text) return "";
  return text.replace(/`([^`]+)`/g, '<code>$1</code>');
}
