import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: "indigo" | "vermilion" | "sakura";
  className?: string;
}

const iconColorClasses = {
  indigo: "text-ink",
  vermilion: "text-vermilion",
  sakura: "text-sakura",
};

export function NavigationCard({
  title,
  description,
  icon: Icon,
  iconColor,
  className,
}: NavigationCardProps) {
  return (
    <div
      className={cn(
        "group relative bg-card/60 backdrop-blur-sm rounded-lg p-8",
        "border-t-4 border-t-ink",
        "shadow-sm hover:shadow-editorial transition-all duration-300",
        "cursor-pointer hover:-translate-y-1",
        className
      )}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={cn(
            "p-4 rounded-full bg-muted/50",
            "group-hover:scale-110 transition-transform duration-300"
          )}
        >
          <Icon className={cn("w-8 h-8", iconColorClasses[iconColor])} />
        </div>
        <h3 className="font-display text-xl font-bold text-ink tracking-tight">
          {title}
        </h3>
        <p className="font-body text-charcoal leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
