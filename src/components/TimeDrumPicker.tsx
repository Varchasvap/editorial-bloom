import { useRef, useEffect, useState } from "react";
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

  const scrollToItem = (ref: React.RefObject<HTMLDivElement>, index: number) => {
    if (ref.current) {
      ref.current.scrollTo({
        top: index * ITEM_HEIGHT,
        behavior: "smooth",
      });
    }
  };

  const handleScroll = (
    ref: React.RefObject<HTMLDivElement>,
    items: string[],
    setter: (val: string) => void
  ) => {
    if (ref.current) {
      const scrollTop = ref.current.scrollTop;
      const index = Math.round(scrollTop / ITEM_HEIGHT);
      const clampedIndex = Math.max(0, Math.min(index, items.length - 1));
      setter(items[clampedIndex]);
    }
  };

  const handleHourClick = (hour: string, index: number) => {
    setSelectedHour(hour);
    scrollToItem(hourRef, index);
  };

  const handleMinuteClick = (minute: string, index: number) => {
    setSelectedMinute(minute);
    scrollToItem(minuteRef, index);
  };

  // Scroll to initial position on mount
  useEffect(() => {
    const hourIndex = hours.indexOf(selectedHour);
    const minuteIndex = minutes.indexOf(selectedMinute);
    
    if (hourRef.current && hourIndex >= 0) {
      hourRef.current.scrollTop = hourIndex * ITEM_HEIGHT;
    }
    if (minuteRef.current && minuteIndex >= 0) {
      minuteRef.current.scrollTop = minuteIndex * ITEM_HEIGHT;
    }
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
            scrollSnapType: "y mandatory",
          }}
          onScroll={() => handleScroll(hourRef, hours, setSelectedHour)}
        >
          {/* Top Padding */}
          <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />
          
          {hours.map((hour, index) => (
            <div
              key={hour}
              className={cn(
                "flex items-center justify-center cursor-pointer transition-all duration-150",
                "text-2xl font-bold font-body select-none",
                selectedHour === hour 
                  ? "text-slate-900 scale-110" 
                  : "text-slate-400"
              )}
              style={{ 
                height: ITEM_HEIGHT,
                scrollSnapAlign: "center",
              }}
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
      <span className="text-2xl font-bold text-slate-900 z-20 select-none">:</span>

      {/* Minutes Column */}
      <div className="relative">
        <div
          ref={minuteRef}
          className="overflow-y-auto scrollbar-hide relative z-20"
          style={{ 
            height: CONTAINER_HEIGHT,
            scrollSnapType: "y mandatory",
          }}
          onScroll={() => handleScroll(minuteRef, minutes, setSelectedMinute)}
        >
          {/* Top Padding */}
          <div style={{ height: ITEM_HEIGHT * PADDING_ITEMS }} />
          
          {minutes.map((minute, index) => (
            <div
              key={minute}
              className={cn(
                "flex items-center justify-center cursor-pointer transition-all duration-150",
                "text-2xl font-bold font-body select-none",
                selectedMinute === minute 
                  ? "text-slate-900 scale-110" 
                  : "text-slate-400"
              )}
              style={{ 
                height: ITEM_HEIGHT,
                scrollSnapAlign: "center",
              }}
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
