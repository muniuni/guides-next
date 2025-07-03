/**
 * Strips Markdown formatting from text
 */
export const stripMarkdown = (text: string): string => {
  return text
    // Remove headers
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bold/italic
    .replace(/\*\*(.*?)\*\*/g, '$1')
    .replace(/\*(.*?)\*/g, '$1')
    .replace(/__(.*?)__/g, '$1')
    .replace(/_(.*?)_/g, '$1')
    // Remove links
    .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
    // Remove code blocks
    .replace(/```[\s\S]*?```/g, '')
    .replace(/`([^`]*)`/g, '$1')
    // Remove line breaks and extra spaces
    .replace(/\n/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
};

/**
 * Truncates text to a specified maximum length and adds ellipsis if needed
 * Also strips Markdown formatting before truncating
 */
export const truncate = (text: string, max: number): string => {
  const cleanText = stripMarkdown(text);
  return cleanText.length > max ? cleanText.slice(0, max) + '...' : cleanText;
};

/**
 * Formats a date string into a readable date/time format
 */
export const formatDate = (dateStr: string): string => {
  const d = new Date(dateStr);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  const hh = String(d.getHours()).padStart(2, '0');
  const mi = String(d.getMinutes()).padStart(2, '0');
  return `${yyyy}/${mm}/${dd} ${hh}:${mi}`;
};


/**
 * Client-safe version that returns a human-readable relative time string
 * Returns fallback during SSR to prevent hydration issues
 */
export const safeTimeAgo = (
  dateStr: string,
  translations?: {
    daysAgo: string;
    hoursAgo: string;
    minutesAgo: string;
    recently: string;
  }
): string => {
  if (typeof window === 'undefined') {
    // During SSR, return a safe fallback
    return translations?.recently || 'recently';
  }
  
  const now = Date.now();
  const diff = now - new Date(dateStr).getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) {
    return translations ? `${days} ${translations.daysAgo}` : `${days} days ago`;
  } else if (hours > 0) {
    return translations ? `${hours} ${translations.hoursAgo}` : `${hours} hours ago`;
  } else {
    return translations ? `${minutes} ${translations.minutesAgo}` : `${minutes} minutes ago`;
  }
};
