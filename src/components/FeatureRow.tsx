import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FeatureRowProps {
  title: string;
  description: string;
  buttonText: string;
  buttonVariant?: "ghost" | "default";
  buttonColor?: "slate" | "rose" | "indigo";
  imageUrl: string;
  imageAlt: string;
  reversed?: boolean;
}

const buttonColorClasses = {
  slate: "text-slate-700 hover:text-slate-900 hover:bg-slate-100",
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
}: FeatureRowProps) {
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
          <Button
            variant={buttonVariant}
            className={cn(
              "text-base font-medium px-0 hover:px-4 transition-all",
              buttonColorClasses[buttonColor]
            )}
          >
            {buttonText}
          </Button>
        </div>
      </div>
    </div>
  );
}
