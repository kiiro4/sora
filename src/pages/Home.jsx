import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import { startOfDay, addDays, subDays, isSameDay, format } from "date-fns";
import { toZonedTime } from "date-fns-tz";
import { ja } from "date-fns/locale";
import AppHeader from "@/components/AppHeader";
import PhotoCard from "@/components/PhotoCard";
import UploadModal from "@/components/UploadModal";
import EmptyState from "@/components/EmptyState";
import PhotoLightbox from "@/components/PhotoLightbox";
import DatePickerPopover from "@/components/DatePickerPopover";
import { Button } from "@/components/ui/button";

const JST = "Asia/Tokyo";

function toJST(date) {
  return toZonedTime(date, JST);
}
function startOfDayJST(date) {
  return startOfDay(toZonedTime(date, JST));
}
function isSameDayJST(a, b) {
  return isSameDay(toZonedTime(a, JST), toZonedTime(b, JST));
}

export default function Home() {
  const [user, setUser] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [currentDate, setCurrentDate] = useState(() => startOfDayJST(new Date()));
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then(setUser).catch(() => {});
  }, []);

  const { data: photos, isLoading } = useQuery({
    queryKey: ["sky-photos"],
    queryFn: () => base44.entities.SkyPhoto.list("-created_date", 500),
    initialData: [],
  });

  const todayJST = startOfDayJST(new Date());
  const isToday = isSameDay(currentDate, todayJST);

  const visiblePhotos = photos.filter((p) => {
    if (p.ai_deleted) return false;
    if (!p.ai_passed && p.ai_checked) return false;
    return isSameDayJST(new Date(p.created_date), currentDate);
  });

  const prevDate = subDays(currentDate, 1);
  const nextDate = addDays(currentDate, 1);
  const hasPrev = photos.some(
    (p) => !p.ai_deleted && isSameDayJST(new Date(p.created_date), prevDate)
  );
  const hasNext = !isToday && photos.some(
    (p) => !p.ai_deleted && isSameDayJST(new Date(p.created_date), nextDate)
  );

  const handleUploadSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["sky-photos"] });
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-background to-background">
      <AppHeader user={user} onUploadClick={() => setShowUpload(true)} />

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Date navigation */}
        <div className="flex items-center justify-between mb-8 gap-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(subDays(currentDate, 1))}
            disabled={!hasPrev}
            className="gap-1 text-muted-foreground disabled:opacity-20 hover:bg-sky-50 hover:text-sky-600 rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
            <span className="hidden sm:inline text-xs">前の日</span>
          </Button>

          <div className="flex flex-col items-center gap-2">
            <h2 className="text-2xl font-heading font-bold text-foreground">
              {isToday ? "今日の空" : format(currentDate, "M月d日（E）", { locale: ja })}
            </h2>
            <div className="flex items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {format(currentDate, "yyyy年M月d日", { locale: ja })}
              </span>
              <DatePickerPopover
                currentDate={currentDate}
                today={todayJST}
                onSelect={setCurrentDate}
              />
            </div>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentDate(addDays(currentDate, 1))}
            disabled={isToday || !hasNext}
            className="gap-1 text-muted-foreground disabled:opacity-20 hover:bg-sky-50 hover:text-sky-600 rounded-full"
          >
            <span className="hidden sm:inline text-xs">次の日</span>
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-28">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : visiblePhotos.length === 0 ? (
          <EmptyState onUploadClick={() => setShowUpload(true)} />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {visiblePhotos.map((photo, i) => (
              <PhotoCard
                key={photo.id}
                photo={photo}
                index={i}
                onClick={(p) => setLightboxPhoto(p)}
              />
            ))}
          </div>
        )}
      </main>

      <UploadModal
        open={showUpload}
        onClose={() => setShowUpload(false)}
        onSuccess={handleUploadSuccess}
        user={user}
      />

      <PhotoLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  );
}