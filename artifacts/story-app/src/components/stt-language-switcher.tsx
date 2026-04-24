import { Languages } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { STT_LANGUAGES } from "@/config/stt";

interface Props {
  value: string;
  onChange: (lang: string) => void;
}

/**
 * Compact language picker shown in the story page header so users can switch
 * the speech-recognition language without opening the settings dialog.
 */
export function SttLanguageSwitcher({ value, onChange }: Props) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger
        aria-label="Speech recognition language"
        title={`Speech recognition language: ${value}`}
        data-testid="select-stt-language-quick"
        className="h-8 gap-1 px-2 border-border/60 bg-transparent text-xs font-mono text-muted-foreground hover:text-foreground hover:bg-accent/40 [&>svg:last-child]:hidden focus:ring-0 focus:ring-offset-0 w-auto min-w-0"
      >
        <Languages className="w-4 h-4 shrink-0" />
        {/* Force trigger to show only the code, not the full label */}
        <SelectValue>{value}</SelectValue>
      </SelectTrigger>
      <SelectContent className="max-h-72">
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
