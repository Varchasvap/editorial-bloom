import { useLanguage } from "@/contexts/LanguageContext";
import { cn } from "@/lib/utils";

export function LanguageSwitcher() {
  const { language, setLanguage } = useLanguage();

  return (
    <div className="fixed top-4 right-4 z-50">
      <div className="flex items-center gap-1 bg-white/70 backdrop-blur-xl border border-white/60 rounded-full p-1 shadow-lg shadow-blue-900/10">
        <button
          onClick={() => setLanguage('en')}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            language === 'en'
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          )}
        >
          English
        </button>
        <button
          onClick={() => setLanguage('jp')}
          className={cn(
            "px-3 py-1.5 rounded-full text-sm font-medium transition-all",
            language === 'jp'
              ? "bg-slate-900 text-white"
              : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
          )}
        >
          日本語
        </button>
      </div>
    </div>
  );
}
