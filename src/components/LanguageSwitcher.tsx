import { Globe } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { useLanguage, SUPPORTED_LANGUAGES, AppLanguage } from "@/contexts/LanguageContext";

interface LanguageSwitcherProps {
  variant?: "icon" | "full";
}

const LanguageSwitcher = ({ variant = "icon" }: LanguageSwitcherProps) => {
  const { language, setLanguage } = useLanguage();
  const current = SUPPORTED_LANGUAGES[language] ?? SUPPORTED_LANGUAGES.both;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {variant === "icon" ? (
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <Globe className="h-4 w-4" />
          </Button>
        ) : (
          <Button variant="ghost" size="sm" className="gap-2">
            <span>{current.flag}</span>
            <span className="text-sm">{current.native}</span>
          </Button>
        )}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="max-h-80 overflow-y-auto min-w-[180px]">
        {(Object.entries(SUPPORTED_LANGUAGES) as [AppLanguage, typeof current][]).map(([key, val]) => (
          <DropdownMenuItem
            key={key}
            onClick={() => setLanguage(key)}
            className={`gap-2 cursor-pointer ${language === key ? "bg-primary/10 text-primary font-medium" : ""}`}
          >
            <span className="text-lg">{val.flag}</span>
            <span>{val.native}</span>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;
