import React from "react";
import { CloudSun, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";

export default function EmptyState({ onUploadClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col items-center justify-center py-28 text-center px-4"
    >
      <div className="w-24 h-24 rounded-3xl bg-primary/10 flex items-center justify-center mb-6">
        <CloudSun className="w-12 h-12 text-primary" />
      </div>
      <h2 className="text-xl font-heading font-semibold text-foreground mb-2">
        まだ写真がありません
      </h2>
      <p className="text-muted-foreground text-sm mb-8 max-w-xs">
        空の写真を投稿して、みんなと美しい空を共有しましょう
      </p>
      <Button
        onClick={onUploadClick}
        className="rounded-full gap-2 px-6 h-12 font-medium shadow-lg shadow-primary/20"
      >
        <Plus className="w-5 h-5" />
        最初の写真を投稿する
      </Button>
    </motion.div>
  );
}