// utils/formatDescription.ts

/**
 * Formats problem description by converting markdown-style formatting to HTML
 * Handles **bold** text, backticks for code, and preserves line breaks
 * 
 * @param description - Raw problem description text
 * @returns Formatted HTML string
 */
export function formatDescription(description: string): string {
  if (!description) return "";

  let formatted = description;

  // Convert **text** to <strong>text</strong> for bold
  // This regex matches **text** but avoids matching *** or ****
  formatted = formatted.replace(/\*\*([^*]+?)\*\*/g, '<strong>$1</strong>');

  // Convert `code` to <code>code</code> for inline code
  formatted = formatted.replace(/`([^`]+?)`/g, '<code class="inline-code">$1</code>');

  // Convert newlines to <br> tags for proper line breaks
  formatted = formatted.replace(/\n/g, '<br>');

  // Handle bullet points if they exist (- item or * item)
  formatted = formatted.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
  
  // Wrap consecutive <li> items in <ul>
  formatted = formatted.replace(/(<li>.*<\/li>\s*)+/g, '<ul>$&</ul>');

  return formatted;
}

/**
 * Strip HTML tags from formatted text (useful for previews)
 * @param html - HTML string
 * @returns Plain text
 */
export function stripHtmlTags(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/**
 * Truncate text to a specific length
 * @param text - Text to truncate
 * @param maxLength - Maximum length
 * @returns Truncated text with ellipsis
 */
export function truncateText(text: string, maxLength: number = 200): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + '...';
}