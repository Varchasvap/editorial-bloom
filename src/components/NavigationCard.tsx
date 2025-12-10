import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface NavigationCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  iconColor: "blue" | "rose" | "purple";
  className?: string;
}

const iconColorClasses = {
  blue: "text-blue-600",
  rose: "text-rose-500",
  purple: "text-purple-600",
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
        "group relative bg-white/60 backdrop-blur-sm rounded-2xl p-8",
        "border border-white/80",
        "shadow-lg hover:shadow-2xl hover:shadow-purple-200/50 transition-all duration-300",
        "cursor-pointer hover:-translate-y-2",
        className
      )}
    >
      <div className="flex flex-col items-center text-center space-y-4">
        <div
          className={cn(
            "p-4 rounded-full bg-white/50",
            "group-hover:scale-110 transition-transform duration-300"
          )}
        >
          <Icon className={cn("w-8 h-8", iconColorClasses[iconColor])} />
        </div>
        <h3 className="font-display text-xl font-bold text-slate-900 tracking-tight">
          {title}
        </h3>
        <p className="font-body text-slate-600 leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  );
}
