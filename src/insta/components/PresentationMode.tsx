
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, ChevronLeft, ChevronRight, Monitor, Smartphone } from "lucide-react";
import type { ProfileData, Highlight, FeedImage, IgTheme } from "../types";
import PhonePreview from "./PhonePreview";
import DesktopPreview from "./DesktopPreview";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: ProfileData;
  highlights: Highlight[];
  feed: FeedImage[];
  onFeedReorder: (f: FeedImage[]) => void;
  igTheme: IgTheme;
}

type ViewMode = "mobile" | "desktop";

export default function PresentationMode({
  isOpen,
  onClose,
  profile,
  highlights,
  feed,
  onFeedReorder,
  igTheme,
}: Props) {
  const [viewMode, setViewMode] = useState<ViewMode>("mobile");

  // Keyboard shortcuts
  useEffect(() => {
    if (!isOpen) return;

    const handler = (e: KeyboardEvent) => {
      switch (e.key) {
        case "Escape":
          onClose();
          break;
        case "ArrowLeft":
          setViewMode("mobile");
          break;
        case "ArrowRight":
          setViewMode("desktop");
          break;
        case " ":
          e.preventDefault();
          setViewMode((m) => (m === "mobile" ? "desktop" : "mobile"));
          break;
      }
    };

    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black z-[100] flex items-center justify-center p-8"
      >
        {/* Background pattern */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage:
              "radial-gradient(circle,rgba(255,255,255,0.1) 1px,transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />

        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col items-center justify-center gap-8">
          {/* Preview */}
          <AnimatePresence mode="wait">
            <motion.div
              key={viewMode}
              initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
              animate={{ opacity: 1, scale: 1, rotateY: 0 }}
              exit={{ opacity: 0, scale: 0.9, rotateY: 10 }}
              transition={{ duration: 0.4, ease: "easeInOut" }}
              className="max-h-[80vh] flex items-center justify-center"
            >
              {viewMode === "mobile" ? (
                <div className="scale-110">
                  <PhonePreview
                    profile={profile}
                    highlights={highlights}
                    feed={feed}
                    onFeedReorder={onFeedReorder}
                    igTheme={igTheme}
                  />
                </div>
              ) : (
                <div className="scale-90">
                  <DesktopPreview
                    profile={profile}
                    highlights={highlights}
                    feed={feed}
                    onFeedReorder={onFeedReorder}
                    igTheme={igTheme}
                  />
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setViewMode("mobile")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
                transition-all ${
                  viewMode === "mobile"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
            >
              <Smartphone size={16} />
              Mobile
            </button>

            <button
              onClick={() => setViewMode("desktop")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm
                transition-all ${
                  viewMode === "desktop"
                    ? "bg-white text-black"
                    : "bg-white/10 text-white/60 hover:bg-white/20"
                }`}
            >
              <Monitor size={16} />
              Desktop
            </button>
          </div>

          {/* Keyboard hints */}
          <div className="flex items-center gap-6 text-xs text-white/40">
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/10 rounded">ESC</kbd>
              Sair
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/10 rounded">←</kbd>
              <kbd className="px-2 py-1 bg-white/10 rounded">→</kbd>
              Trocar view
            </span>
            <span className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/10 rounded">SPACE</kbd>
              Alternar
            </span>
          </div>
        </div>

        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-8 right-8 w-12 h-12 rounded-full
            bg-white/10 hover:bg-white/20 text-white
            flex items-center justify-center transition-all
            hover:scale-110 active:scale-95"
          aria-label="Fechar modo apresentação"
        >
          <X size={24} />
        </button>
      </motion.div>
    </AnimatePresence>
  );
}
