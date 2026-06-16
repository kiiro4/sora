import React, { useState } from "react";
import { format, addDays, subDays, startOfDay, isBefore, isAfter } from "date-fns";
import { ja } from "date-fns/locale";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { CalendarDays } from "lucide-react";

export default function DatePickerPopover({ currentDate, today, onSelect }) {
  const [open, setOpen] = useState(false);

  const handleSelect = (date) => {
    if (!date) return;
    const d = startOfDay(date);
    if (isAfter(d, today)) return;
    onSelect(d);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/60 dark:bg-white/10 border border-border/50 text-xs text-muted-foreground hover:bg-white hover:text-foreground transition-all shadow-sm">
          <CalendarDays className="w-3.5 h-3.5" />
          <span>日付を選ぶ</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0 rounded-2xl shadow-xl border border-border/50" align="center">
        <Calendar
          mode="single"
          selected={currentDate}
          onSelect={handleSelect}
          locale={ja}
          disabled={(date) => isAfter(startOfDay(date), today)}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  );
}