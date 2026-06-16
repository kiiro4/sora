import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, MapPin, User, Clock, Navigation } from "lucide-react";
import { format } from "date-fns";
import { ja } from "date-fns/locale";

export default function PhotoLightbox({ photo, onClose }) {
  const [showMap, setShowMap] = useState(false);

  useEffect(() => {
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  useEffect(() => {
    setShowMap(false);
  }, [photo?.id]);

  const hasLocation = photo?.latitude && photo?.longitude;

  return (
    <AnimatePresence>
      {photo && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/95 backdrop-blur-md p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.92, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 20 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="relative w-full max-w-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute -top-12 right-0 w-9 h-9 rounded-full bg-white/10 text-white/80 flex items-center justify-center hover:bg-white/20 transition-colors z-10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Image */}
            <div className="rounded-2xl overflow-hidden shadow-2xl">
              <img
                src={photo.image_url}
                alt="空の写真"
                className="w-full object-contain max-h-[65vh]"
              />
            </div>

            {/* Info panel */}
            <div className="mt-3 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 overflow-hidden">
              <div className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <User className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-medium">
                      {photo.author_nickname || photo.author_name || "名無し"}
                    </p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Clock className="w-3 h-3 text-white/40" />
                      <span className="text-white/50 text-xs">
                        {photo.created_date
                          ? format(new Date(photo.created_date), "yyyy年M月d日 HH:mm", { locale: ja })
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>

                {hasLocation && (
                  <button
                    onClick={() => setShowMap(!showMap)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      showMap
                        ? "bg-primary text-white"
                        : "bg-white/10 text-white/70 hover:bg-white/20"
                    }`}
                  >
                    <Navigation className="w-3.5 h-3.5" />
                    {showMap ? "地図を閉じる" : "地図を見る"}
                  </button>
                )}
              </div>

              {photo.location_name && (
                <div className="px-4 pb-3 flex items-center gap-1.5 text-white/50 text-xs">
                  <MapPin className="w-3 h-3 flex-shrink-0" />
                  <span>{photo.location_name}</span>
                </div>
              )}

              {/* Map */}
              <AnimatePresence>
                {showMap && hasLocation && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 220, opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <iframe
                      title="撮影場所の地図"
                      width="100%"
                      height="220"
                      frameBorder="0"
                      style={{ border: 0, display: "block" }}
                      src={`https://www.google.com/maps?q=${photo.latitude},${photo.longitude}&z=14&output=embed`}
                      allowFullScreen
                    />
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}