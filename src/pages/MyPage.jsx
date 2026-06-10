import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import { Trash2, LogOut, Cloud } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import PhotoModal from '@/components/PhotoModal';
import UploadModal from '@/components/UploadModal';
import Header from '@/components/Header';

export default function MyPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUpload, setShowUpload] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const { data: photos = [], isLoading } = useQuery({
    queryKey: ['myPhotos', user?.id],
    queryFn: () => base44.entities.SkyPhoto.filter({ uploader_user_id: user.id }, '-created_date'),
    enabled: !!user,
  });

  const handleDelete = async (e, photoId) => {
    e.stopPropagation();
    setDeletingId(photoId);
    await base44.entities.SkyPhoto.delete(photoId);
    queryClient.invalidateQueries({ queryKey: ['myPhotos'] });
    queryClient.invalidateQueries({ queryKey: ['skyPhotos'] });
    setDeletingId(null);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">ログインが必要です</p>
          <Link to="/login">
            <Button className="rounded-full bg-primary text-primary-foreground">ログイン</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header onUploadClick={() => setShowUpload(true)} />

      <main className="max-w-4xl mx-auto px-4 py-10">
        {/* Profile section */}
        <div className="flex flex-col items-center mb-10">
          <div className="w-22 h-22 w-24 h-24 rounded-3xl bg-gradient-to-br from-primary via-sky-400 to-accent flex items-center justify-center shadow-xl shadow-primary/20 mb-4">
            <Cloud className="w-11 h-11 text-white" />
          </div>
          <h1 className="font-heading font-bold text-2xl text-foreground tracking-wide">{user.full_name || 'ユーザー'}</h1>
          <p className="text-muted-foreground text-sm mt-1">{user.email}</p>
          <div className="flex items-center gap-1.5 mt-3 bg-primary/10 rounded-full px-4 py-1.5">
            <span className="font-bold text-primary text-lg">{photos.length}</span>
            <span className="text-primary/80 text-sm font-medium">枚の空</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="mt-4 text-muted-foreground hover:text-destructive gap-1.5 text-sm rounded-full"
            onClick={() => base44.auth.logout()}
          >
            <LogOut className="w-4 h-4" />
            ログアウト
          </Button>
        </div>

        {/* Divider */}
        <div className="border-t border-border mb-6" />

        {/* Photo grid */}
        {isLoading ? (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse rounded-sm" />
            ))}
          </div>
        ) : photos.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="text-5xl mb-4">🌤️</div>
            <p className="text-muted-foreground text-base">まだ投稿がありません</p>
            <Button
              className="mt-5 rounded-full bg-primary text-primary-foreground font-semibold shadow-md shadow-primary/20 px-6"
              onClick={() => setShowUpload(true)}
            >
              最初の空を投稿する
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1">
            <AnimatePresence>
              {photos.map((photo, index) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.03 }}
                  className="aspect-square overflow-hidden cursor-pointer relative group"
                  onClick={() => setSelectedPhoto(photo)}
                >
                  <img
                    src={photo.image_url}
                    alt="空の写真"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/35 transition-colors flex items-center justify-center">
                    <button
                      className="opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 text-white rounded-full p-2.5 hover:bg-destructive"
                      onClick={(e) => handleDelete(e, photo.id)}
                    >
                      {deletingId === photo.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </main>

      <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => {
            queryClient.invalidateQueries({ queryKey: ['myPhotos'] });
            queryClient.invalidateQueries({ queryKey: ['skyPhotos'] });
          }}
        />
      )}
    </div>
  );
}