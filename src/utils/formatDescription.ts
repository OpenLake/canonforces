// src/utils/formatDescription.js

export function formatDescription(text: string) {
  if (!text) return "";
  return text.replace(/`([^`]+)`/g, ' $1 ');
}
