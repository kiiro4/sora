import React, { useState, useEffect, useRef } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import {
  Loader2, Trash2, Cloud, ArrowLeft, ImageOff, Download,
  Pencil, Check, X, Settings, LogOut, AlertTriangle, Bell, Images
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import PhotoLightbox from "@/components/PhotoLightbox";

const TABS = ["投稿", "通知"];

export default function MyPage() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("投稿");
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [lightboxPhoto, setLightboxPhoto] = useState(null);
  const [editingNickname, setEditingNickname] = useState(false);
  const [nicknameInput, setNicknameInput] = useState("");
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    base44.auth.me().then((u) => {
      setUser(u);
      setNicknameInput(u?.nickname || "");
    }).catch(() => {});
  }, []);

  const { data: allPhotos, isLoading } = useQuery({
    queryKey: ["my-photos", user?.id],
    queryFn: () =>
      base44.entities.SkyPhoto.filter({ created_by_id: user.id }, "-created_date", 200),
    enabled: !!user?.id,
    initialData: [],
  });

  const photos = allPhotos.filter((p) => !p.ai_deleted);
  const deletedNotifications = allPhotos.filter((p) => p.ai_deleted);

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await base44.entities.SkyPhoto.delete(deleteTarget);
    setDeleteTarget(null);
    queryClient.invalidateQueries({ queryKey: ["my-photos", user?.id] });
    queryClient.invalidateQueries({ queryKey: ["sky-photos"] });
  };

  const handleSaveNickname = async () => {
    await base44.auth.updateMe({ nickname: nicknameInput });
    setUser((u) => ({ ...u, nickname: nicknameInput }));
    setEditingNickname(false);
  };

  const handleAvatarChange = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarUploading(true);
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    await base44.auth.updateMe({ avatar_url: file_url });
    setUser((u) => ({ ...u, avatar_url: file_url }));
    setAvatarUploading(false);
  };

  const handleSavePhoto = async (photo) => {
    const res = await fetch(photo.image_url);
    const blob = await res.blob();
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `soraNi_${photo.id}.jpg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const displayName = user?.nickname || user?.full_name || user?.email || "ユーザー";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50/60 via-background to-background">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/70 dark:bg-card/70 backdrop-blur-2xl border-b border-border/30 shadow-sm">
        <div className="max-w-6xl mx-auto px-4 flex items-center justify-between" style={{ height: "60px" }}>
          <Link to="/" className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="text-sm">戻る</span>
          </Link>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center">
              <Cloud className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-heading font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">マイページ</span>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors px-3 py-1.5 rounded-full hover:bg-sky-50">
                <Settings className="w-4 h-4" />
                <span className="hidden sm:inline">設定</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuItem
                onClick={() => base44.auth.logout("/login")}
                className="text-destructive focus:text-destructive gap-2 rounded-lg"
              >
                <LogOut className="w-4 h-4" />
                ログアウト
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8">
        {/* Profile card */}
        <div className="flex items-center gap-5 mb-8 p-5 rounded-3xl bg-white/80 dark:bg-card border border-border/30 shadow-md shadow-sky-100/30 backdrop-blur-sm">
          <div className="relative">
            <Avatar
              className="w-20 h-20 cursor-pointer ring-2 ring-sky-200 hover:ring-sky-400 transition-all shadow-lg"
              onClick={() => avatarInputRef.current?.click()}
            >
              <AvatarImage src={user?.avatar_url} />
              <AvatarFallback className="bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600 text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            {avatarUploading && (
              <div className="absolute inset-0 rounded-full bg-black/40 flex items-center justify-center">
                <Loader2 className="w-5 h-5 text-white animate-spin" />
              </div>
            )}
            <div className="absolute bottom-0 right-0 w-6 h-6 rounded-full bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-md">
              <Pencil className="w-3 h-3 text-white" />
            </div>
            <input ref={avatarInputRef} type="file" accept="image/*" className="hidden" onChange={handleAvatarChange} />
          </div>

          <div className="flex-1 min-w-0">
            {editingNickname ? (
              <div className="flex items-center gap-2">
                <Input
                  value={nicknameInput}
                  onChange={(e) => setNicknameInput(e.target.value)}
                  placeholder="あだ名を入力"
                  className="h-9 text-sm rounded-xl"
                  autoFocus
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveNickname(); if (e.key === "Escape") setEditingNickname(false); }}
                />
                <button onClick={handleSaveNickname} className="p-1.5 rounded-xl bg-primary text-white hover:bg-primary/90">
                  <Check className="w-4 h-4" />
                </button>
                <button onClick={() => setEditingNickname(false)} className="p-1.5 rounded-xl border hover:bg-muted">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-heading font-bold text-foreground truncate">{displayName}</h1>
                <button
                  onClick={() => setEditingNickname(true)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-sky-50 transition-colors"
                >
                  <Pencil className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
            <p className="text-sm text-muted-foreground mt-0.5">
              {isLoading ? "…" : `${photos.length} 枚の投稿`}
              {deletedNotifications.length > 0 && (
                <span className="ml-2 inline-flex items-center gap-1 text-destructive text-xs font-medium">
                  <Bell className="w-3 h-3" />
                  {deletedNotifications.length}件の通知
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 p-1 rounded-2xl bg-muted/50 w-fit mb-6">
          {TABS.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-1.5 px-5 py-2 rounded-xl text-sm font-medium transition-all ${
                activeTab === tab
                  ? "bg-white dark:bg-card shadow-sm text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab === "投稿" && <Images className="w-3.5 h-3.5" />}
              {tab === "通知" && (
                <span className="relative">
                  <Bell className="w-3.5 h-3.5" />
                  {deletedNotifications.length > 0 && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-destructive" />
                  )}
                </span>
              )}
              {tab}
              {tab === "通知" && deletedNotifications.length > 0 && (
                <span className="px-1.5 py-0.5 rounded-full bg-destructive/10 text-destructive text-xs">
                  {deletedNotifications.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center py-28">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : activeTab === "投稿" ? (
          photos.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                <ImageOff className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">まだ投稿がありません</p>
              <Link to="/">
                <Button className="mt-6 rounded-full" variant="outline">
                  ホームに戻って投稿する
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {photos.map((photo, i) => (
                <motion.div
                  key={photo.id}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  className="group relative rounded-2xl overflow-hidden bg-card border border-border/30 shadow-sm"
                >
                  <div className="aspect-square overflow-hidden cursor-pointer" onClick={() => setLightboxPhoto(photo)}>
                    <img
                      src={photo.image_url}
                      alt="空の写真"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      loading="lazy"
                    />
                  </div>
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/25 transition-all duration-300 pointer-events-none" />
                  <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => handleSavePhoto(photo)}
                      className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-sky-500 transition-colors"
                    >
                      <Download className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => setDeleteTarget(photo.id)}
                      className="w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-red-500 transition-colors"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    <p className="text-white text-xs">
                      {photo.created_date ? format(new Date(photo.created_date), "M月d日", { locale: ja }) : ""}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        ) : (
          // Notifications tab
          deletedNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-28 text-center">
              <div className="w-20 h-20 rounded-3xl bg-muted flex items-center justify-center mb-4">
                <Bell className="w-10 h-10 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">通知はありません</p>
            </div>
          ) : (
            <div className="space-y-3">
              {deletedNotifications.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-start gap-4 p-4 rounded-2xl bg-white/80 dark:bg-card border border-destructive/20 shadow-sm"
                >
                  {/* Thumbnail */}
                  {(p.deleted_image_thumb || p.image_url) && (
                    <div className="w-14 h-14 rounded-xl overflow-hidden flex-shrink-0 border border-border/30">
                      <img
                        src={p.deleted_image_thumb || p.image_url}
                        alt="削除された写真"
                        className="w-full h-full object-cover opacity-60 grayscale"
                      />
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-6 h-6 rounded-full bg-destructive/10 flex items-center justify-center">
                        <AlertTriangle className="w-3.5 h-3.5 text-destructive" />
                      </div>
                      <span className="text-sm font-semibold text-destructive">投稿が削除されました</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      投稿した写真が「空の写真ではない」とAIに判定されたため、削除されました。
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1.5">
                      {p.created_date ? format(new Date(p.created_date), "yyyy年M月d日 HH:mm", { locale: ja }) : ""}
                    </p>
                  </div>
                </motion.div>
              ))}
            </div>
          )
        )}
      </main>

      <AlertDialog open={!!deleteTarget} onOpenChange={(v) => { if (!v) setDeleteTarget(null); }}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle>写真を削除しますか？</AlertDialogTitle>
            <AlertDialogDescription>
              この操作は取り消せません。写真は完全に削除されます。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">キャンセル</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl"
            >
              削除する
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <PhotoLightbox photo={lightboxPhoto} onClose={() => setLightboxPhoto(null)} />
    </div>
  );
}