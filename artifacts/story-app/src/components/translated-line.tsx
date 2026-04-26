import { useQuery } from "@tanstack/react-query";
import { Languages } from "lucide-react";
import { translate, toGoogleLang } from "@/lib/translate";

interface Props {
  text: string;
  /** BCP-47 target language. */
  toLang: string;
}

/**
 * Renders a translated copy of a story line below the original. Translations
 * are cached by react-query keyed on (text, toLang) so navigating around or
 * re-rendering does not trigger duplicate network calls.
 */
export function TranslatedLine({ text, toLang }: Props) {
  const trimmed = text.trim();
  const target = toGoogleLang(toLang);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["translation", target, trimmed],
    queryFn: () =>
      translate({
        finalTranscriptProxy: trimmed,
        fromLang: "auto",
        toLang: target,
      }),
    enabled: !!trimmed && !!target,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: 1,
  });

  if (!trimmed) return null;

  return (
    <div
      className="mt-2 pl-3 border-l-2 border-border/40 text-base text-muted-foreground italic flex gap-2"
      data-testid={`translated-line-${toLang}`}
    >
      <Languages className="w-3.5 h-3.5 mt-1.5 shrink-0 opacity-60" />
      <div className="whitespace-pre-wrap min-w-0 flex-1">
        {/*
          BCP-47 code shown inline so users with multiple translations can
          tell at a glance which language each line is in (e.g. "fr-FR
          Bonjour…"). Mono + smaller + non-italic to make it visually
          distinct from the translated text itself.
        */}
        <span
          className="font-mono not-italic text-xs uppercase tracking-wider mr-2 px-1 py-0.5 rounded bg-muted/40 text-muted-foreground/80 align-middle"
          data-testid={`translated-line-lang-${toLang}`}
        >
          {toLang}
        </span>
        {isLoading
          ? "Translating…"
          : isError || data === "translation error"
            ? "(translation unavailable)"
            : data}
      </div>
    </div>
  );
}
