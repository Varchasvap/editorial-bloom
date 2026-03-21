import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

interface FeatureRowProps {
  title: string;
  description: string;
  buttonText: string;
  buttonVariant?: "ghost" | "default";
  buttonColor?: "slate" | "rose" | "indigo";
  imageUrl: string;
  imageAlt: string;
  reversed?: boolean;
  href?: string;
}

const buttonColorClasses = {
  slate: "bg-gradient-to-r from-rose-100/80 to-pink-100/80 text-slate-800 border border-rose-200/50 shadow-sm hover:shadow-md hover:from-rose-200/90 hover:to-pink-200/90 hover:scale-[1.03] backdrop-blur-sm",
  rose: "text-rose-600 hover:text-rose-700 hover:bg-rose-50",
  indigo: "text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50",
};

export function FeatureRow({
  title,
  description,
  buttonText,
  buttonVariant = "ghost",
  buttonColor = "slate",
  imageUrl,
  imageAlt,
  reversed = false,
  href,
}: FeatureRowProps) {
  const isProminent = buttonColor === "slate";
  const ButtonContent = (
    <Button
      variant={isProminent ? "default" : buttonVariant}
      className={cn(
        "text-base font-medium transition-all duration-300",
        isProminent
          ? "px-6 py-2.5 rounded-full"
          : "px-0 hover:px-4",
        buttonColorClasses[buttonColor]
      )}
    >
      {buttonText}
    </Button>
  );
  return (
    <div
      className={cn(
        "grid md:grid-cols-2 gap-0 bg-white/70 backdrop-blur-xl",
        "border border-white/60 rounded-3xl overflow-hidden",
        "shadow-xl shadow-blue-900/10"
      )}
    >
      {/* Image Section */}
      <div
        className={cn(
          "relative h-64 md:h-auto min-h-[280px]",
          reversed && "md:order-2"
        )}
      >
        <img
          src={imageUrl}
          alt={imageAlt}
          className="absolute inset-0 w-full h-full object-cover"
        />
      </div>

      {/* Text Content */}
      <div
        className={cn(
          "flex flex-col justify-center p-8 md:p-12",
          reversed && "md:order-1"
        )}
      >
        <h3 className="font-display text-2xl md:text-3xl font-bold text-slate-900 mb-4">
          {title}
        </h3>
        <p className="font-body text-slate-700 text-lg leading-relaxed mb-6">
          {description}
        </p>
        <div>
          {href ? <Link to={href}>{ButtonContent}</Link> : ButtonContent}
        </div>
      </div>
    </div>
  );
}
