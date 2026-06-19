export function getYouTubeId(url: string | null | undefined): string | null {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/
  );
  return match ? match[1] : null;
}

export function getEmbedUrl(
  url: string | null | undefined,
  options?: { autoplay?: boolean; mute?: boolean }
): string | null {
  const id = getYouTubeId(url);
  if (!id) return null;

  const params = new URLSearchParams();
  if (options?.autoplay) params.set('autoplay', '1');
  if (options?.mute) params.set('mute', '1');
  if (options?.autoplay) {
    params.set('playsinline', '1');
    params.set('enablejsapi', '1');
    if (typeof window !== 'undefined') {
      params.set('origin', window.location.origin);
    }
  }

  const query = params.toString();
  return `https://www.youtube.com/embed/${id}${query ? `?${query}` : ''}`;
}
