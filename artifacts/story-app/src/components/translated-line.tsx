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
    <div className="mt-2 pl-3 border-l-2 border-border/40 text-base text-muted-foreground italic flex gap-2">
      <Languages className="w-3.5 h-3.5 mt-1.5 shrink-0 opacity-60" />
      <div className="whitespace-pre-wrap">
        {isLoading
          ? "Translating…"
          : isError || data === "translation error"
            ? "(translation unavailable)"
            : data}
      </div>
    </div>
  );
}
