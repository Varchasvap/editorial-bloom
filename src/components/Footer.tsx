import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

export const Footer = () => {
  const { t } = useLanguage();

  return (
    <footer className="relative z-10 py-8 px-6 border-t border-slate-200/50 bg-white/30 backdrop-blur-sm">
      <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
        <p className="font-body text-sm text-slate-500">
          © {new Date().getFullYear()} Sakura Learning Hub
        </p>
        <Link
          to="/admin"
          className="font-body text-xs text-slate-400 hover:text-slate-600 transition-colors"
        >
          {t("footer.adminLogin")}
        </Link>
      </div>
    </footer>
  );
};
