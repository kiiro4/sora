import { motion } from 'framer-motion';
import { Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function PhotoGrid({ photos, onPhotoClick, lockedCount = 0 }) {
  if (photos.length === 0 && lockedCount === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-28 text-center">
        <div className="text-6xl mb-4">🌤️</div>
        <p className="text-muted-foreground font-body text-lg">まだ写真がありません</p>
        <p className="text-muted-foreground font-body text-sm mt-1">空の写真を投稿してみましょう</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
      {photos.map((photo, index) => (
        <motion.div
          key={photo.id}
          initial={{ opacity: 0, scale: 0.97 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4, delay: index * 0.03 }}
          className="aspect-square overflow-hidden cursor-pointer group relative"
          onClick={() => onPhotoClick(photo)}
        >
          <img
            src={photo.image_url}
            alt="空の写真"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
            loading="lazy"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        </motion.div>
      ))}

      {/* Locked / premium tiles */}
      {lockedCount > 0 &&
        Array.from({ length: Math.min(lockedCount, 6) }).map((_, i) => (
          <motion.div
            key={`locked-${i}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4, delay: (photos.length + i) * 0.03 }}
            className="aspect-square overflow-hidden relative bg-gradient-to-br from-sky-100 to-blue-200 flex items-center justify-center"
          >
            <div className="absolute inset-0 backdrop-blur-sm" />
            <div className="relative z-10 flex flex-col items-center gap-1 text-center px-2">
              <Lock className="w-5 h-5 text-primary/70" />
              {i === 0 && (
                <p className="text-xs text-primary/80 font-semibold leading-tight">プレミアムで全件表示</p>
              )}
            </div>
          </motion.div>
        ))
      }

      {/* Premium upsell banner if there are locked photos */}
      {lockedCount > 0 && (
        <div className="col-span-3 mt-3 mx-1">
          <div className="bg-gradient-to-r from-primary/10 via-sky-100 to-accent/30 border border-primary/20 rounded-2xl px-5 py-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-heading font-bold text-sm text-foreground">
                🌅 {lockedCount}枚の過去の空が待っています
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">プレミアムプランで全ての投稿を閲覧できます</p>
            </div>
            <Link to="/login">
              <button className="shrink-0 bg-primary text-primary-foreground text-xs font-bold px-4 py-2 rounded-full shadow-md shadow-primary/25 hover:bg-primary/90 transition-all hover:-translate-y-px">
                アップグレード
              </button>
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}