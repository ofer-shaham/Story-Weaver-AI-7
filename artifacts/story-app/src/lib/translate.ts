/**
 * Translate text using Google Translate's free public endpoint.
 * No API key required. Pass `fromLang = "auto"` to auto-detect the source.
 */
export const translate = ({
  finalTranscriptProxy,
  fromLang,
  toLang,
}: {
  finalTranscriptProxy: string;
  fromLang: string;
  toLang: string;
}): Promise<string> => {
  return fetch(
    `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${fromLang}&tl=${toLang}&dt=t&q=${encodeURIComponent(
      finalTranscriptProxy,
    )}`,
  )
    .then((res) => res.json())
    .then((data) => {
      // Google returns chunks; concatenate all translated segments so long
      // paragraphs are not truncated to just the first sentence.
      const chunks: string[] = (data?.[0] ?? [])
        .map((row: unknown[]) => (Array.isArray(row) ? (row[0] as string) : ""))
        .filter(Boolean);
      return chunks.join("");
    })
    .catch((err) => {
      console.error(err.message);
      return `translation error`;
    });
};

/**
 * BCP-47 → ISO-639-1 (or region) used by Google Translate's `tl` param.
 * Google accepts most BCP-47 tags directly, but a few need stripping.
 */
export function toGoogleLang(bcp47: string): string {
  if (!bcp47) return "en";
  // zh-CN / zh-TW are accepted as-is, everything else use the language part.
  if (/^zh-(cn|tw)$/i.test(bcp47)) return bcp47.toLowerCase();
  return bcp47.split("-")[0].toLowerCase();
}
