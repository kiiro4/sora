import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Upload, ImagePlus, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { base44 } from '@/api/base44Client';

const SkyCheckStatus = ({ status, message }) => {
  if (status === 'checking') return (
    <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted rounded-xl px-4 py-2.5 mt-3">
      <Loader2 className="w-4 h-4 animate-spin shrink-0" />
      <span>AIが空の写真かチェック中…</span>
    </div>
  );
  if (status === 'pass') return (
    <div className="flex items-center gap-2 text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-2.5 mt-3">
      <CheckCircle2 className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
  if (status === 'fail') return (
    <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl px-4 py-2.5 mt-3">
      <AlertTriangle className="w-4 h-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
  return null;
};

export default function UploadModal({ onClose, onUploaded }) {
  const [preview, setPreview] = useState(null);
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [skyCheck, setSkyCheck] = useState({ status: null, message: '', passed: false });
  const inputRef = useRef();

  const handleFileChange = async (f) => {
    if (!f) return;
    setFile(f);
    setSkyCheck({ status: null, message: '', passed: false });
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target.result);
    reader.readAsDataURL(f);

    // Upload for AI check
    setSkyCheck({ status: 'checking', message: '', passed: false });
    const { file_url } = await base44.integrations.Core.UploadFile({ file: f });

    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `この画像を見て、「空（そら）が主役の写真」かどうかを判定してください。
空が写っていれば（どんな天気でも可：青空、曇り、夕焼け、星空など）OKとします。
地面や建物が主役の写真、空が全く写っていない写真はNGです。
JSONで返してください。`,
      file_urls: [file_url],
      response_json_schema: {
        type: 'object',
        properties: {
          is_sky: { type: 'boolean' },
          reason: { type: 'string' },
        },
      },
    });

    if (result.is_sky) {
      setSkyCheck({ status: 'pass', message: `✓ ${result.reason}`, passed: true, uploadedUrl: file_url });
    } else {
      setSkyCheck({ status: 'fail', message: `空の写真ではないようです。${result.reason}`, passed: false });
    }
  };

  const handleInputChange = (e) => handleFileChange(e.target.files[0]);

  const handleDrop = (e) => {
    e.preventDefault();
    const f = e.dataTransfer.files[0];
    if (!f || !f.type.startsWith('image/')) return;
    handleFileChange(f);
  };

  const handleSubmit = async () => {
    if (!file || !skyCheck.passed) return;
    setUploading(true);
    const user = await base44.auth.me();
    const imageUrl = skyCheck.uploadedUrl || (await base44.integrations.Core.UploadFile({ file })).file_url;
    await base44.entities.SkyPhoto.create({
      image_url: imageUrl,
      uploader_user_id: user.id,
    });
    setUploading(false);
    onUploaded();
    onClose();
  };

  const canSubmit = file && skyCheck.passed && !uploading && skyCheck.status !== 'checking';

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.93, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.93, opacity: 0, y: 20 }}
          transition={{ duration: 0.28, type: 'spring', stiffness: 300, damping: 28 }}
          className="bg-white rounded-3xl shadow-2xl w-full max-w-sm p-6"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading font-bold text-xl text-foreground">空の写真を投稿</h2>
            <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors w-8 h-8 rounded-full hover:bg-muted flex items-center justify-center">
              <X className="w-5 h-5" />
            </button>
          </div>

          {!preview ? (
            <div
              className="border-2 border-dashed border-primary/30 rounded-2xl p-8 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-primary/60 hover:bg-primary/5 transition-all"
              onClick={() => inputRef.current.click()}
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
            >
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/15 to-accent/30 flex items-center justify-center">
                <ImagePlus className="w-7 h-7 text-primary" />
              </div>
              <p className="text-sm font-body text-muted-foreground text-center">
                クリックまたはドラッグ＆ドロップ<br />
                <span className="text-xs">JPG, PNG, WEBP など</span>
              </p>
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleInputChange}
              />
            </div>
          ) : (
            <div className="relative rounded-2xl overflow-hidden aspect-square">
              <img src={preview} alt="プレビュー" className="w-full h-full object-cover" />
              <button
                className="absolute top-2 right-2 bg-black/50 text-white rounded-full p-1.5 hover:bg-black/70 transition-colors"
                onClick={() => { setPreview(null); setFile(null); setSkyCheck({ status: null, message: '', passed: false }); }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}

          <SkyCheckStatus status={skyCheck.status} message={skyCheck.message} />

          <Button
            className="w-full mt-4 rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30 disabled:opacity-50"
            disabled={!canSubmit}
            onClick={handleSubmit}
          >
            {uploading ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> アップロード中…</>
            ) : skyCheck.status === 'checking' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> AIチェック中…</>
            ) : (
              <><Upload className="w-4 h-4" /> 投稿する</>
            )}
          </Button>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}