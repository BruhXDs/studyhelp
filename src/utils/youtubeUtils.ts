export function extractYouTubeId(url: string): string | null {
  if (!url) return null;

  try {
    // Handle youtu.be URLs
    if (url.includes('youtu.be')) {
      const youtubeUrl = new URL(url);
      return youtubeUrl.pathname.slice(1);
    }

    // Handle youtube.com URLs
    if (url.includes('youtube.com')) {
      const youtubeUrl = new URL(url);
      return youtubeUrl.searchParams.get('v');
    }

    // Handle direct video IDs (11 characters)
    if (/^[a-zA-Z0-9_-]{11}$/.test(url)) {
      return url;
    }

    return null;
  } catch (e) {
    return null;
  }
}