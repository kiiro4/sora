import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { Cloud, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function AppHeader({ user, onUploadClick }) {
  const navigate = useNavigate();

  const displayName = user?.nickname || user?.full_name || user?.email || "U";
  const initials = displayName.slice(0, 2).toUpperCase();

  return (
    <header className="sticky top-0 z-50 bg-white/70 dark:bg-card/70 backdrop-blur-2xl border-b border-border/30 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-15 flex items-center justify-between" style={{ height: "60px" }}>
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-2xl bg-gradient-to-br from-sky-400 to-blue-500 flex items-center justify-center shadow-md shadow-sky-200 transition-transform group-hover:scale-110">
            <Cloud className="w-4 h-4 text-white" />
          </div>
          <span className="text-base font-heading font-bold bg-gradient-to-r from-sky-500 to-blue-600 bg-clip-text text-transparent">
            きょうのそら
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <Button
            onClick={onUploadClick}
            size="sm"
            className="rounded-full gap-2 px-4 font-medium bg-gradient-to-r from-sky-400 to-blue-500 hover:from-sky-500 hover:to-blue-600 border-0 shadow-md shadow-sky-200/60 hover:shadow-lg hover:shadow-sky-200/80 transition-all text-white"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">投稿する</span>
          </Button>

          <Avatar
            className="w-9 h-9 cursor-pointer hover:ring-2 hover:ring-primary/40 transition-all ring-offset-1"
            onClick={() => navigate("/mypage")}
          >
            <AvatarImage src={user?.avatar_url} />
            <AvatarFallback className="bg-gradient-to-br from-sky-100 to-blue-100 text-sky-600 text-sm font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}