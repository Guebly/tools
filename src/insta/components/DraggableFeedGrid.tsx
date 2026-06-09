
import { useState, useRef } from "react";
import type { FeedImage } from "../types";
import { Pin } from "lucide-react";

interface Props {
  images:   FeedImage[];
  onReorder: (f: FeedImage[]) => void;
  bgColor?: string;
}

export default function DraggableFeedGrid({ images, onReorder, bgColor = "#efefef" }: Props) {
  const [dragId, setDragId] = useState<string | null>(null);
  const [overId, setOverId] = useState<string | null>(null);
  const touchStart = useRef(-1);
  const touchOver  = useRef(-1);

  /* sort: pinned first */
  const sorted = [...images.filter(f => f.pinned), ...images.filter(f => !f.pinned)];

  function reorder(fromId: string, toId: string) {
    const arr   = [...sorted];
    const fromI = arr.findIndex(f => f.id === fromId);
    const toI   = arr.findIndex(f => f.id === toId);
    if (fromI < 0 || toI < 0) return;
    const [item] = arr.splice(fromI, 1);
    arr.splice(toI, 0, item);
    onReorder(arr);
  }

  function reset() { setDragId(null); setOverId(null); }

  function onDragOver(e: React.DragEvent, id: string) { e.preventDefault(); setOverId(id); }
  function onDrop(e: React.DragEvent, targetId: string) {
    e.preventDefault();
    if (dragId && dragId !== targetId) reorder(dragId, targetId);
    reset();
  }

  function onTouchMove(e: React.TouchEvent) {
    e.preventDefault();
    const t  = e.touches[0];
    const el = document.elementFromPoint(t.clientX, t.clientY)?.closest("[data-fi]") as HTMLElement | null;
    if (el) touchOver.current = Number(el.dataset.fi);
  }
  function onTouchEnd() {
    const from = touchStart.current, to = touchOver.current;
    if (from >= 0 && to >= 0 && from !== to) {
      const fId = sorted[from]?.id, tId = sorted[to]?.id;
      if (fId && tId) reorder(fId, tId);
    }
    touchStart.current = -1; touchOver.current = -1;
  }

  const TOTAL = Math.max(9, Math.ceil((sorted.length + 1) / 3) * 3);
  const cells = Array.from({ length: TOTAL }, (_, i) => sorted[i] ?? null);

  return (
    <div className="grid grid-cols-3 gap-[2px]">
      {cells.map((img, idx) => {
        if (!img) return <div key={`e-${idx}`} className="aspect-square" style={{ background: bgColor }} />;
        const isDragging = dragId === img.id;
        const isOver     = overId  === img.id && dragId !== img.id;
        return (
          <div
            key={img.id}
            data-fi={idx}
            draggable
            onDragStart={() => setDragId(img.id)}
            onDragOver={e => onDragOver(e, img.id)}
            onDrop={e => onDrop(e, img.id)}
            onDragEnd={reset}
            onTouchStart={() => { touchStart.current = idx; }}
            onTouchMove={onTouchMove}
            onTouchEnd={onTouchEnd}
            className={`aspect-square relative overflow-hidden cursor-grab active:cursor-grabbing select-none transition-all duration-150
              ${isDragging ? "feed-cell-dragging" : ""}
              ${isOver     ? "feed-cell-over"     : ""}`}
          >
            <img src={img.url} alt="" draggable={false} className="w-full h-full object-cover pointer-events-none select-none" />
            {img.pinned && (
              <div className="absolute top-1 left-1 w-4 h-4 ig-gradient rounded-full flex items-center justify-center">
                <Pin size={8} className="text-white" />
              </div>
            )}
            {/* drag hint */}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M5 9l-3 3 3 3M9 5l3-3 3 3M15 19l-3 3-3-3M19 9l3 3-3 3M2 12h20M12 2v20" />
              </svg>
            </div>
          </div>
        );
      })}
    </div>
  );
}
