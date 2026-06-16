import React, { useState, useRef, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Camera, Loader2, X, MapPin, MapPinOff } from "lucide-react";

export default function UploadModal({ open, onClose, onSuccess, user }) {
  const [capturedFile, setCapturedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [locationChoice, setLocationChoice] = useState(null); // null | "ask" | "granted" | "denied"
  const [coords, setCoords] = useState(null);
  const [locationName, setLocationName] = useState(null);
  const cameraInputRef = useRef(null);

  // Reset when modal opens
  useEffect(() => {
    if (open) {
      setCapturedFile(null);
      setPreview(null);
      setUploading(false);
      setLocationChoice(null);
      setCoords(null);
      setLocationName(null);
    }
  }, [open]);

  const handleCapture = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCapturedFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result);
    reader.readAsDataURL(file);
    // Ask location after capture
    setLocationChoice("ask");
  };

  const handleLocationAllow = () => {
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        setCoords({ lat, lon });
        // Reverse geocode via nominatim
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&accept-language=ja`
          );
          const data = await res.json();
          const city =
            data.address?.city ||
            data.address?.town ||
            data.address?.village ||
            data.address?.state ||
            "";
          setLocationName(city);
        } catch {
          setLocationName(null);
        }
        setLocationChoice("granted");
      },
      () => setLocationChoice("denied")
    );
  };

  const handleLocationDeny = () => {
    setLocationChoice("denied");
  };

  const handleSubmit = async () => {
    if (!capturedFile) return;
    setUploading(true);

    const { file_url } = await base44.integrations.Core.UploadFile({ file: capturedFile });

    const photoData = {
      image_url: file_url,
      author_name: user?.nickname || user?.full_name || user?.email || "匿名",
      author_nickname: user?.nickname || null,
      author_avatar_url: user?.avatar_url || null,
      ai_checked: false,
      ai_passed: false,
    };
    if (coords) {
      photoData.latitude = coords.lat;
      photoData.longitude = coords.lon;
    }
    if (locationName) {
      photoData.location_name = locationName;
    }

    const created = await base44.entities.SkyPhoto.create(photoData);

    // Run AI check in background (non-blocking for UX)
    runAiCheck(created.id, file_url, user?.email);

    setUploading(false);
    onSuccess();
    onClose();
  };

  const runAiCheck = async (photoId, imageUrl, userEmail) => {
    try {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: "この画像は空（sky）の写真ですか？空、雲、夕焼け、星空、朝焼けなど空が主役の写真であればis_sky=trueとしてください。建物、人物、食べ物、動物など空が主役でない場合はfalseとしてください。",
        file_urls: [imageUrl],
        response_json_schema: {
          type: "object",
          properties: {
            is_sky: { type: "boolean" },
            reason: { type: "string" }
          }
        }
      });

      if (result.is_sky) {
        await base44.entities.SkyPhoto.update(photoId, { ai_checked: true, ai_passed: true });
      } else {
        // Mark as ai_deleted for notification, then delete
        await base44.entities.SkyPhoto.update(photoId, {
          ai_checked: true,
          ai_passed: false,
          ai_deleted: true,
          deleted_image_thumb: imageUrl,
        });
        // Delete after short delay so user can see notification
        setTimeout(async () => {
          await base44.entities.SkyPhoto.delete(photoId);
        }, 30000);
      }
    } catch (e) {
      console.error("AI check failed", e);
    }
  };

  const readyToPost = capturedFile && (locationChoice === "granted" || locationChoice === "denied");

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) onClose(); }}>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 font-heading">
            <Camera className="w-5 h-5 text-primary" />
            空の写真を撮影して投稿
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {!capturedFile ? (
            <div>
              <p className="text-sm text-muted-foreground mb-4 text-center">
                カメラで今この瞬間の空を撮影して投稿しましょう
              </p>
              <Button
                className="w-full h-14 rounded-xl gap-2 text-base font-medium shadow-md shadow-primary/20"
                onClick={() => cameraInputRef.current?.click()}
              >
                <Camera className="w-5 h-5" />
                カメラを起動する
              </Button>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleCapture}
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative rounded-2xl overflow-hidden">
                <img
                  src={preview}
                  alt="撮影した写真"
                  className="w-full aspect-square object-cover"
                />
                <button
                  onClick={() => { setCapturedFile(null); setPreview(null); setLocationChoice(null); setCoords(null); setLocationName(null); }}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
                {locationName && (
                  <div className="absolute bottom-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-sm text-white text-xs">
                    <MapPin className="w-3 h-3" />
                    {locationName}
                  </div>
                )}
              </div>

              {/* Location ask */}
              {locationChoice === "ask" && (
                <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 space-y-3">
                  <p className="text-sm font-medium text-foreground text-center">
                    📍 位置情報を付与しますか？
                  </p>
                  <p className="text-xs text-muted-foreground text-center">撮影場所の地名が写真に表示されます</p>
                  <div className="flex gap-2">
                    <Button size="sm" className="flex-1" onClick={handleLocationAllow}>
                      <MapPin className="w-3.5 h-3.5 mr-1" /> 許可する
                    </Button>
                    <Button size="sm" variant="outline" className="flex-1" onClick={handleLocationDeny}>
                      <MapPinOff className="w-3.5 h-3.5 mr-1" /> 許可しない
                    </Button>
                  </div>
                </div>
              )}

              {locationChoice === "granted" && (
                <div className="text-xs text-center text-muted-foreground flex items-center justify-center gap-1">
                  <MapPin className="w-3 h-3 text-primary" />
                  {locationName ? `${locationName}の位置情報を付与します` : "位置情報を取得しました"}
                </div>
              )}

              {readyToPost && (
                <Button
                  onClick={handleSubmit}
                  disabled={uploading}
                  className="w-full h-12 rounded-xl font-medium shadow-md shadow-primary/20"
                >
                  {uploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      投稿中...
                    </>
                  ) : (
                    "投稿する"
                  )}
                </Button>
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}