
/**
 * Extracts the YouTube video ID from various YouTube URL formats
 * @param url YouTube URL in any format
 * @returns YouTube video ID if valid, empty string otherwise
 */
export const extractYouTubeVideoId = (url: string): string => {
  if (!url) return "";
  
  // Regular expression to match YouTube video IDs from different URL formats
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  
  // Return the video ID if valid (11 characters)
  return match && match[2].length === 11 ? match[2] : "";
};

/**
 * Converts a regular YouTube URL to an embed URL
 * @param url YouTube URL or video ID
 * @returns YouTube embed URL
 */
export const getYouTubeEmbedUrl = (url: string): string => {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
};

/**
 * Generates a thumbnail URL for a YouTube video
 * @param url YouTube URL or video ID
 * @param quality Thumbnail quality (default, mqdefault, hqdefault, sddefault, maxresdefault)
 * @returns YouTube thumbnail URL
 */
export const getYouTubeThumbnailUrl = (url: string, quality: string = "hqdefault"): string => {
  const videoId = extractYouTubeVideoId(url);
  return videoId ? `https://img.youtube.com/vi/${videoId}/${quality}.jpg` : "";
};

/**
 * Validates if a URL is a valid YouTube URL
 * @param url URL to validate
 * @returns boolean indicating if URL is a valid YouTube URL
 */
export const isValidYouTubeUrl = (url: string): boolean => {
  return !!extractYouTubeVideoId(url);
};
