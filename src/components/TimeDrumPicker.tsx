import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface TimeDrumPickerProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
}

const hours = Array.from({ length: 14 }, (_, i) => (i + 9).toString().padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];

const VISIBLE_ITEMS = 5;
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2);

export const TimeDrumPicker = ({ value, onChange, disabled = false }: TimeDrumPickerProps) => {
  const isMobile = useIsMobile();
  const ITEM_HEIGHT = isMobile ? 48 : 40;
  const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;

  const [selectedHour, setSelectedHour] = useState("17");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutHour = useRef<ReturnType<typeof setTimeout> | null>(null);
  const scrollTimeoutMinute = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (value) {
      const [h, m] = value.replace(" JST", "").split(":");
      if (h) setSelectedHour(h);
      if (m) setSelectedMinute(m);
    }
  }, []);

  useEffect(() => {
    onChange(`${selectedHour}:${selectedMinute} JST`);
  }, [selectedHour, selectedMinute, onChange]);

  const smoothScrollTo = useCallback((ref: React.RefObject<HTMLDivElement>, targetTop: number) => {
    if (!ref.current) return;
    const element = ref.current;
    const startTop = element.scrollTop;
    const distance = targetTop - startTop;
    const duration = 300;
    let startTime: number | null = null;
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateScroll = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      element.scrollTop = startTop + (distance * easeOutCubic(progress));
      if (progress < 1) requestAnimationFrame(animateScroll);
    };
    requestAnimationFrame(animateScroll);
  }, []);

  const snapToNearest = useCallback((
    ref: React.RefObject<HTMLDivElement>,
    items: string[],
    setter: (val: string) => void,
    itemHeight: number
  ) => {
    if (!ref.current) return;
    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    setter(items[clampedIndex]);
    smoothScrollTo(ref, clampedIndex * itemHeight);
  }, [smoothScrollTo]);

  const handleScroll = useCallback((
    ref: React.RefObject<HTMLDivElement>,
    items: string[],
    setter: (val: string) => void,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
    itemHeight: number
  ) => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (ref.current) {
      const index = Math.round(ref.current.scrollTop / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      setter(items[clampedIndex]);
    }
    timeoutRef.current = setTimeout(() => {
      snapToNearest(ref, items, setter, itemHeight);
    }, 100);
  }, [snapToNearest]);

  const handleItemClick = useCallback((
    ref: React.RefObject<HTMLDivElement>,
    setter: (val: string) => void,
    val: string,
    index: number,
    itemHeight: number
  ) => {
    setter(val);
    smoothScrollTo(ref, index * itemHeight);
  }, [smoothScrollTo]);

  // Scroll to initial position
  useEffect(() => {
    const hourIndex = hours.indexOf(selectedHour);
    const minuteIndex = minutes.indexOf(selectedMinute);
    setTimeout(() => {
      if (hourRef.current && hourIndex >= 0) hourRef.current.scrollTop = hourIndex * ITEM_HEIGHT;
      if (minuteRef.current && minuteIndex >= 0) minuteRef.current.scrollTop = minuteIndex * ITEM_HEIGHT;
    }, 50);
    return () => {
      if (scrollTimeoutHour.current) clearTimeout(scrollTimeoutHour.current);
      if (scrollTimeoutMinute.current) clearTimeout(scrollTimeoutMinute.current);
    };
  }, [ITEM_HEIGHT]);

  const renderColumn = (
    items: string[],
    selected: string,
    ref: React.RefObject<HTMLDivElement>,
    setter: (val: string) => void,
    timeoutRef: React.MutableRefObject<NodeJS.Timeout | null>,
    prefix?: string
  ) => (
    <div className="relative flex-1 md:flex-none">
      <div
        ref={ref}
        className="overflow-y-auto scrollbar-hide relative z-20 snap-y snap-mandatory"
        style={{
          height: CONTAINER_HEIGHT,
          WebkitOverflowScrolling: "touch",
        }}
        onScroll={() => handleScroll(ref, items, setter, timeoutRef, ITEM_HEIGHT)}
      >
        <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />
        {items.map((item, index) => (
          <div
            key={item}
            className={cn(
              "flex items-center justify-center cursor-pointer select-none snap-center",
              "text-xl md:text-2xl font-bold font-body",
              "transition-all duration-200 ease-out rounded-lg",
              "md:hover:bg-muted/50 md:hover:scale-105",
              selected === item
                ? "text-foreground scale-110 opacity-100"
                : "text-muted-foreground scale-100 opacity-50"
            )}
            style={{ height: ITEM_HEIGHT }}
            onClick={() => handleItemClick(ref, setter, item, index, ITEM_HEIGHT)}
          >
            {prefix}{item}
          </div>
        ))}
        <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />
      </div>
    </div>
  );

  return (
    <div className={cn(
      "relative flex items-center justify-center gap-1 overflow-hidden",
      "bg-white/70 backdrop-blur-xl rounded-3xl shadow-editorial border border-white/30",
      "w-full md:max-w-[220px] md:mx-auto p-4",
      disabled && "opacity-50 pointer-events-none"
    )}>
      {/* Center selection highlight */}
      <div
        className="absolute left-3 right-3 z-10 pointer-events-none rounded-xl bg-white/60 backdrop-blur-md border border-white/40 shadow-sm"
        style={{ height: ITEM_HEIGHT, top: `calc(50% - ${ITEM_HEIGHT / 2}px)` }}
      />

      {renderColumn(hours, selectedHour, hourRef, setSelectedHour, scrollTimeoutHour)}

      <span className="text-2xl font-bold text-foreground z-20 select-none animate-pulse">:</span>

      {renderColumn(minutes, selectedMinute, minuteRef, setSelectedMinute, scrollTimeoutMinute)}

      <span className="text-lg font-semibold text-accent z-20 ml-2 select-none">JST</span>

      {/* Top gradient mask */}
      <div className="absolute top-0 left-0 right-0 h-20 bg-gradient-to-b from-white/90 via-white/40 to-transparent pointer-events-none z-30 rounded-t-3xl" />
      {/* Bottom gradient mask */}
      <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-white/90 via-white/40 to-transparent pointer-events-none z-30 rounded-b-3xl" />
    </div>
  );
};
