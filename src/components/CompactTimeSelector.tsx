import { useState } from "react";
import { cn } from "@/lib/utils";

const hours = Array.from({ length: 14 }, (_, i) => (i + 9).toString().padStart(2, "0"));
const minutes = ["00", "15", "30", "45"];

interface CompactTimeSelectorProps {
  value: string;
  onChange: (time: string) => void;
  disabled?: boolean;
}

export const CompactTimeSelector = ({ value, onChange, disabled = false }: CompactTimeSelectorProps) => {
  const [hour, minute] = value.split(":").map(v => v?.replace(" JST", "") || "");
  const [selectedHour, setSelectedHour] = useState(hour || "17");
  const [selectedMinute, setSelectedMinute] = useState(minute || "00");

  const handleHourSelect = (h: string) => {
    setSelectedHour(h);
    onChange(`${h}:${selectedMinute} JST`);
  };

  const handleMinuteSelect = (m: string) => {
    setSelectedMinute(m);
    onChange(`${selectedHour}:${m} JST`);
  };

  return (
    <div className={cn(
      "bg-white/90 backdrop-blur-sm border border-slate-200 rounded-xl overflow-hidden transition-opacity",
      disabled && "opacity-50 pointer-events-none"
    )}>
      <div className="grid grid-cols-2 divide-x divide-slate-200">
        {/* Hour Column */}
        <div>
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Hour</span>
          </div>
          <div className="h-40 overflow-y-auto scrollbar-hide">
            {hours.map((h) => (
              <button
                key={h}
                type="button"
                onClick={() => handleHourSelect(h)}
                className={cn(
                  "w-full px-4 py-2 text-sm font-body text-left transition-colors",
                  selectedHour === h
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                {h}:00
              </button>
            ))}
          </div>
        </div>

        {/* Minute Column */}
        <div>
          <div className="px-4 py-2 bg-slate-100 border-b border-slate-200">
            <span className="text-xs font-medium text-slate-600 uppercase tracking-wide">Minute</span>
          </div>
          <div className="h-40 overflow-y-auto scrollbar-hide">
            {minutes.map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => handleMinuteSelect(m)}
                className={cn(
                  "w-full px-4 py-2 text-sm font-body text-left transition-colors",
                  selectedMinute === m
                    ? "bg-blue-600 text-white font-medium"
                    : "text-slate-600 hover:bg-slate-50"
                )}
              >
                :{m}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Selected Time Display */}
      <div className="px-4 py-3 bg-slate-50 border-t border-slate-200 text-center">
        <span className="text-sm text-slate-500">Selected: </span>
        <span className="font-medium text-slate-900">{selectedHour}:{selectedMinute} JST</span>
      </div>
    </div>
  );
};
