import React from "react";
import { MapPin } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function PhotoCard({ photo, index, onClick }) {
  const name = photo.author_nickname || photo.author_name || "";
  const initials = name ? name.slice(0, 2).toUpperCase() : "？";

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.07, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="group relative rounded-3xl overflow-hidden bg-card border border-border/30 shadow-md hover:shadow-2xl hover:shadow-sky-100/50 transition-all duration-500 cursor-pointer"
      onClick={() => onClick && onClick(photo)}
    >
      <div className="aspect-[4/3] overflow-hidden">
        <img
          src={photo.image_url}
          alt="空の写真"
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-108"
          loading="lazy"
          style={{ transformOrigin: "center" }}
        />
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-400" />

      {/* Time badge */}
      <div className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-black/30 backdrop-blur-md text-white/90 text-xs font-medium">
        {photo.created_date
          ? format(new Date(photo.created_date), "HH:mm", { locale: ja })
          : ""}
      </div>

      {/* Author + location */}
      <div className="absolute bottom-0 left-0 right-0 p-3.5 translate-y-1 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
        <div className="flex items-center gap-2">
          <Avatar className="w-6 h-6 ring-1 ring-white/50">
            <AvatarImage src={photo.author_avatar_url} />
            <AvatarFallback className="bg-sky-400 text-white text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            {name && (
              <p className="text-white text-xs font-semibold leading-tight truncate">{name}</p>
            )}
            {photo.location_name && (
              <p className="flex items-center gap-0.5 text-white/70 text-xs truncate">
                <MapPin className="w-2.5 h-2.5 flex-shrink-0" />
                {photo.location_name}
              </p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}