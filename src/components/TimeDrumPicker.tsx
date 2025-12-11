import { useRef, useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

interface TimeDrumPickerProps {
  value: string;
  onChange: (time: string) => void;
}

const hours = Array.from({ length: 15 }, (_, i) => (i + 8).toString().padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const CONTAINER_HEIGHT = ITEM_HEIGHT * VISIBLE_ITEMS;
const PADDING_ITEMS = Math.floor(VISIBLE_ITEMS / 2);

export const TimeDrumPicker = ({ value, onChange }: TimeDrumPickerProps) => {
  const [selectedHour, setSelectedHour] = useState("17");
  const [selectedMinute, setSelectedMinute] = useState("00");
  const hourRef = useRef<HTMLDivElement>(null);
  const minuteRef = useRef<HTMLDivElement>(null);
  const scrollTimeoutHour = useRef<NodeJS.Timeout | null>(null);
  const scrollTimeoutMinute = useRef<NodeJS.Timeout | null>(null);

  // Parse initial value
  useEffect(() => {
    if (value) {
      const [h, m] = value.replace(" JST", "").split(":");
      if (h) setSelectedHour(h);
      if (m) setSelectedMinute(m);
    }
  }, []);

  // Update parent when selection changes
  useEffect(() => {
    onChange(`${selectedHour}:${selectedMinute} JST`);
  }, [selectedHour, selectedMinute, onChange]);

  // Smooth snap animation using easing
  const smoothScrollTo = useCallback((ref: React.RefObject<HTMLDivElement>, targetTop: number) => {
    if (!ref.current) return;
    
    const element = ref.current;
    const startTop = element.scrollTop;
    const distance = targetTop - startTop;
    const duration = 300;
    let startTime: number | null = null;

    // Ease out cubic for smooth deceleration
    const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

    const animateScroll = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutCubic(progress);
      
      element.scrollTop = startTop + (distance * easedProgress);

      if (progress < 1) {
        requestAnimationFrame(animateScroll);
      }
    };

    requestAnimationFrame(animateScroll);
  }, []);

  // Snap to nearest item after scroll ends
  const snapToNearest = useCallback((
    ref: React.RefObject<HTMLDivElement>,
    items: string[],
    setter: (val: string) => void
  ) => {
    if (!ref.current) return;
    
    const scrollTop = ref.current.scrollTop;
    const index = Math.round(scrollTop / ITEM_HEIGHT);
    const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
    const targetTop = clampedIndex * ITEM_HEIGHT;
    
    setter(items[clampedIndex]);
    smoothScrollTo(ref, targetTop);
  }, [smoothScrollTo]);

  // Handle scroll with debounce for snap
  const handleHourScroll = useCallback(() => {
    if (scrollTimeoutHour.current) {
      clearTimeout(scrollTimeoutHour.current);
    }
    
    // Update selection immediately for visual feedback
    if (hourRef.current) {
      const scrollTop = hourRef.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, hours.length - 1));
      setSelectedHour(hours[clampedIndex]);
    }

    // Snap after scroll momentum settles
    scrollTimeoutHour.current = setTimeout(() => {
      snapToNearest(hourRef, hours, setSelectedHour);
    }, 100);
  }, [snapToNearest]);

  const handleMinuteScroll = useCallback(() => {
    if (scrollTimeoutMinute.current) {
      clearTimeout(scrollTimeoutMinute.current);
    }
    
    if (minuteRef.current) {
      const scrollTop = minuteRef.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, minutes.length - 1));
      setSelectedMinute(minutes[clampedIndex]);
    }

    scrollTimeoutMinute.current = setTimeout(() => {
      snapToNearest(minuteRef, minutes, setSelectedMinute);
    }, 100);
  }, [snapToNearest]);

  const handleHourClick = (hour: string, index: number) => {
    setSelectedHour(hour);
    smoothScrollTo(hourRef, index * ITEM_HEIGHT);
  };

  const handleMinuteClick = (minute: string, index: number) => {
    setSelectedMinute(minute);
    smoothScrollTo(minuteRef, index * ITEM_HEIGHT);
  };

  // Scroll to initial position on mount
  useEffect(() => {
    const hourIndex = hours.indexOf(selectedHour);
    const minuteIndex = minutes.indexOf(selectedMinute);
    
    // Use timeout to ensure DOM is ready
    setTimeout(() => {
      if (hourRef.current && hourIndex >= 0) {
        hourRef.current.scrollTop = hourIndex * ITEM_HEIGHT;
      }
      if (minuteRef.current && minuteIndex >= 0) {
        minuteRef.current.scrollTop = minuteIndex * ITEM_HEIGHT;
      }
    }, 50);

    return () => {
      if (scrollTimeoutHour.current) clearTimeout(scrollTimeoutHour.current);
      if (scrollTimeoutMinute.current) clearTimeout(scrollTimeoutMinute.current);
    };
  }, []);

  return (
    <div className="relative flex items-center justify-center gap-1 bg-slate-50 rounded-2xl p-4 overflow-hidden">
      {/* Selection Highlight Bar */}
      <div 
        className="absolute left-4 right-4 h-10 top-1/2 -translate-y-1/2 bg-blue-100/60 border-y-2 border-blue-200 rounded-lg pointer-events-none z-10"
        style={{ backdropFilter: "blur(4px)" }}
      />

      {/* Hours Column */}
      <div className="relative">
        <div
          ref={hourRef}
          className="overflow-y-auto scrollbar-hide relative z-20"
          style={{ 
            height: CONTAINER_HEIGHT,
            scrollBehavior: "auto",
            WebkitOverflowScrolling: "touch",
          }}
          onScroll={handleHourScroll}
        >
          {/* Top Padding */}
          <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />
          
          {hours.map((hour, index) => (
            <div
              key={hour}
              className={cn(
                "flex items-center justify-center cursor-pointer select-none",
                "text-2xl font-bold font-body",
                "transition-all duration-200 ease-out",
                selectedHour === hour 
                  ? "text-slate-900 scale-110 opacity-100" 
                  : "text-slate-400 scale-100 opacity-60"
              )}
              style={{ height: ITEM_HEIGHT }}
              onClick={() => handleHourClick(hour, index)}
            >
              {hour}
            </div>
          ))}
          
          {/* Bottom Padding */}
          <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />
        </div>
      </div>

      {/* Colon Separator */}
      <span className="text-2xl font-bold text-slate-900 z-20 select-none animate-pulse">:</span>

      {/* Minutes Column */}
      <div className="relative">
        <div
          ref={minuteRef}
          className="overflow-y-auto scrollbar-hide relative z-20"
          style={{ 
            height: CONTAINER_HEIGHT,
            scrollBehavior: "auto",
            WebkitOverflowScrolling: "touch",
          }}
          onScroll={handleMinuteScroll}
        >
          {/* Top Padding */}
          <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />
          
          {minutes.map((minute, index) => (
            <div
              key={minute}
              className={cn(
                "flex items-center justify-center cursor-pointer select-none",
                "text-2xl font-bold font-body",
                "transition-all duration-200 ease-out",
                selectedMinute === minute 
                  ? "text-slate-900 scale-110 opacity-100" 
                  : "text-slate-400 scale-100 opacity-60"
              )}
              style={{ height: ITEM_HEIGHT }}
              onClick={() => handleMinuteClick(minute, index)}
            >
              {minute}
            </div>
          ))}
          
          {/* Bottom Padding */}
          <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />
        </div>
      </div>

      {/* JST Label */}
      <span className="text-lg font-semibold text-blue-600 z-20 ml-2 select-none">
        JST
      </span>

      {/* Top/Bottom Fade Gradients */}
      <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-slate-50 to-transparent pointer-events-none z-30 rounded-t-2xl" />
      <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-slate-50 to-transparent pointer-events-none z-30 rounded-b-2xl" />
    </div>
  );
};
