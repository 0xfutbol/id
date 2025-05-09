/**
 * Sanitizes URLs by converting IPFS URLs to HTTPS URLs.
 * If the URL already starts with "https://", it remains unchanged.
 * 
 * @param url - The URL to sanitize
 * @param filename - Optional filename to append to the URL
 * @returns The sanitized URL
 */
export function sanitizeUrl(url: string, provider: "ipfs.io" | "w3s" = "w3s", filename?: string): string {
  if (!url) return url;

  if (url.startsWith('ipfs://')) {
    const cidPath = url.replace('ipfs://', '');
    const parts = cidPath.split('/');
    const cid = parts[0];

    if (provider === "w3s") {
      if (filename) {
        return `https://${cid}.ipfs.w3s.link/${filename}.json`;
      } else if (parts.length > 1) {
      return `https://${cid}.ipfs.w3s.link/${parts.slice(1).join('/')}`;
    } else {
        return `https://${cid}.ipfs.w3s.link`;
      }
    } else {
      return `https://ipfs.io/ipfs/${cid}/${parts.slice(1).join('/')}`;
    }
  }

  return url;
} 