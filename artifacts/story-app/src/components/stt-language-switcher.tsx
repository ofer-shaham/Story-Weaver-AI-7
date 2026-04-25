import { Languages, Sparkles, Eye } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STT_LANGUAGES } from "@/config/stt";

export const VIEW_OFF = "off" as const;

interface Props {
  value: string;
  onChange: (lang: string) => void;
  /**
   * Visual variant changes the icon, default labels, and (for "view") adds
   * an "Original" entry that disables translation.
   */
  variant?: "stt" | "ai" | "view";
  /** Short label shown inside the trigger to indicate purpose. */
  label?: string;
  /** Override aria-label / title (defaults are derived from variant). */
  ariaLabel?: string;
  title?: string;
  /** Override the data-testid (defaults are derived from variant). */
  testId?: string;
}

/**
 * Compact language picker shown in the story page header. Used for:
 *   - speech-recognition language ("stt")
 *   - AI response language ("ai")
 *   - on-screen translation language ("view") — includes an "Original" entry.
 */
export function SttLanguageSwitcher({
  value,
  onChange,
  variant = "stt",
  label,
  ariaLabel,
  title,
  testId,
}: Props) {
  const Icon =
    variant === "ai" ? Sparkles : variant === "view" ? Eye : Languages;

  const defaultAria =
    variant === "ai"
      ? "AI response language"
      : variant === "view"
        ? "Translation language"
        : "Speech recognition language";

  const displayValue = value === VIEW_OFF ? "Original" : value;

  const defaultTitle =
    variant === "ai"
      ? `AI response language: ${value}`
      : variant === "view"
        ? value === VIEW_OFF
          ? "Translation: off (showing original)"
          : `Translate story to: ${value}`
        : `Speech recognition language: ${value}`;

  const defaultTestId =
    variant === "ai"
      ? "select-ai-language-quick"
      : variant === "view"
        ? "select-view-language-quick"
        : "select-stt-language-quick";

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label={ariaLabel ?? defaultAria}
        title={title ?? defaultTitle}
        data-testid={testId ?? defaultTestId}
        className="h-8 gap-1 px-2 border-border/60 bg-transparent text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent/40 [&>svg:last-child]:hidden focus:ring-0 focus:ring-offset-0 w-auto min-w-0"
      >
        <Icon className="w-4 h-4 shrink-0" />
        {label && (
          <span className="text-[10px] uppercase tracking-wide font-sans font-medium opacity-70 leading-none">
            {label}
          </span>
        )}
        <SelectValue>{displayValue}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72">
        {variant === "view" && (
          <SelectItem value={VIEW_OFF}>
            Original{" "}
            <span className="text-muted-foreground font-mono text-xs">
              (off)
            </span>
          </SelectItem>
        )}
        {STT_LANGUAGES.map((l) => (
          <SelectItem key={l.code} value={l.code}>
            {l.label}{" "}
            <span className="text-muted-foreground font-mono text-xs">
              {l.code}
            </span>
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
