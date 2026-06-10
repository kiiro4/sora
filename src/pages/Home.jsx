import { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { useAuth } from '@/lib/AuthContext';
import Header from '@/components/Header';
import PhotoGrid from '@/components/PhotoGrid';
import PhotoModal from '@/components/PhotoModal';
import UploadModal from '@/components/UploadModal';

export default function Home() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [showUpload, setShowUpload] = useState(false);

  const { data: allPhotos = [], isLoading } = useQuery({
    queryKey: ['skyPhotos'],
    queryFn: () => base44.entities.SkyPhoto.list('-created_date', 500),
  });

  // Freemium logic: own photos always visible; others' photos only today unless premium
  const { visiblePhotos, lockedCount } = useMemo(() => {
    const todayStart = new Date();
    todayStart.setHours(0, 0, 0, 0);

    const visible = [];
    let locked = 0;

    allPhotos.forEach((photo) => {
      const isOwn = user && photo.uploader_user_id === user.id;
      const isToday = new Date(photo.created_date) >= todayStart;

      if (isOwn || isToday) {
        visible.push(photo);
      } else {
        locked++;
      }
    });

    return { visiblePhotos: visible, lockedCount: locked };
  }, [allPhotos, user]);

  return (
    <div className="min-h-screen bg-background">
      <Header onUploadClick={() => setShowUpload(true)} />

      <main className="max-w-4xl mx-auto">
        {isLoading ? (
          <div className="grid grid-cols-3 gap-0.5 sm:gap-1 mt-0">
            {Array.from({ length: 12 }).map((_, i) => (
              <div key={i} className="aspect-square bg-muted animate-pulse" />
            ))}
          </div>
        ) : (
          <PhotoGrid
            photos={visiblePhotos}
            onPhotoClick={setSelectedPhoto}
            lockedCount={lockedCount}
          />
        )}
      </main>

      <PhotoModal photo={selectedPhoto} onClose={() => setSelectedPhoto(null)} />

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUploaded={() => queryClient.invalidateQueries({ queryKey: ['skyPhotos'] })}
        />
      )}
    </div>
  );
}