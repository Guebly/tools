
import React, { useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Trash2, Image as ImageIcon, Upload, Pin, PinOff, ExternalLink, X, User, Grid3x3, Sparkles, Camera } from "lucide-react";
import type { ProfileData, Highlight, FeedImage, SidebarTab, BioLink, Template } from "../types";
import { uid, readFileAsDataURL } from "../utils";
import VerifiedBadge from "./VerifiedBadge";
import FeedAnalysis from "./FeedAnalysis";
import TemplateGallery from "./TemplateGallery";
import SampleImagesButton from "./SampleImagesButton";

/* ── Shared styles ── */
const inp =
  "w-full px-3.5 py-2.5 rounded-xl text-sm font-medium outline-none transition-all " +
  "bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 " +
  "text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 " +
  "focus:border-ig-red focus:ring-2 focus:ring-ig-red/10 shadow-sm";

const Label = ({ children }: { children: React.ReactNode }) => (
  <p className="text-[10px] font-black uppercase tracking-wider text-slate-500 dark:text-slate-500 mb-2">
    {children}
  </p>
);
const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div><Label>{label}</Label>{children}</div>
);
const UploadBtn = ({ onClick, children }: { onClick: () => void; children: React.ReactNode }) => (
  <button onClick={onClick}
    className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl
      text-xs font-bold border-2 border-dashed
      border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-400
      hover:border-ig-red hover:text-ig-red hover:bg-ig-red/5
      dark:hover:border-ig-red dark:hover:text-ig-red dark:hover:bg-ig-red/10
      transition-all shadow-sm hover:shadow">
    {children}
  </button>
);
const Toggle = ({ checked, onChange, label, sub }: {
  checked: boolean; onChange: () => void; label: string; sub?: string;
}) => (
  <button onClick={onChange} className="flex items-center justify-between w-full py-3 px-1 gap-3 group">
    <div className="text-left">
      <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 block group-hover:text-ig-red transition">{label}</span>
      {sub && <span className="text-[11px] text-slate-500 dark:text-slate-500">{sub}</span>}
    </div>
    <span className={`relative w-11 h-6 rounded-full flex-shrink-0 transition-all shadow-inner ${
      checked ? "ig-gradient shadow-lg" : "bg-slate-200 dark:bg-slate-800"
    }`}>
      <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow-md transition-transform ${
        checked ? "translate-x-5" : ""
      }`} />
    </span>
  </button>
);

const TABS: { id: SidebarTab; icon: any; label: string }[] = [
  { id: "profile",    icon: User,      label: "Perfil"    },
  { id: "highlights", icon: Camera,    label: "Destaques" },
  { id: "feed",       icon: Grid3x3,   label: "Feed"      },
  { id: "analysis",   icon: Sparkles,  label: "Análise"   },
];

/* ── Verified options — typed explicitly to avoid TS inference issues ── */
interface VerifiedOption {
  val:   ProfileData["verified"];
  label: string;
  badge: React.ReactNode;
}
const VERIFIED_OPTIONS: VerifiedOption[] = [
  { val: "none", label: "Nenhum", badge: <span className="text-base leading-none">✕</span>  },
  { val: "blue", label: "Azul",   badge: <VerifiedBadge type="blue" size={16} /> },
  { val: "gold", label: "Ouro",   badge: <VerifiedBadge type="gold" size={16} /> },
];

/* ── View mode options ── */
interface ViewOption { val: ProfileData["viewMode"]; label: string; sub: string; }
const VIEW_OPTIONS: ViewOption[] = [
  { val: "owner",   label: "Dono",      sub: "Editar perfil" },
  { val: "visitor", label: "Visitante", sub: "Seguir + Msg"  },
];

/* ════════════════════════════════════════════════════════════════════ */

interface SidebarProps {
  activeTab:          SidebarTab;
  onTabChange:        (t: SidebarTab) => void;
  profile:            ProfileData;
  onProfileChange:    (p: Partial<ProfileData>) => void;
  highlights:         Highlight[];
  onHighlightsChange: (h: Highlight[]) => void;
  feed:               FeedImage[];
  onFeedChange:       (f: FeedImage[]) => void;
  onClose:            () => void;   // mobile X button
  onLoadTemplate:     (t: Template) => void;
}

export default function Sidebar({
  activeTab, onTabChange,
  profile, onProfileChange,
  highlights, onHighlightsChange,
  feed, onFeedChange,
  onClose,
  onLoadTemplate,
}: SidebarProps) {
  const avatarRef     = useRef<HTMLInputElement>(null);
  const hlCoverRefs   = useRef<Record<string, HTMLInputElement | null>>({});
  const feedMultiRef  = useRef<HTMLInputElement>(null);
  const feedSingleRef = useRef<HTMLInputElement>(null);
  const pendingSlot   = useRef<string | null>(null);

  /* ── Handlers ── */
  async function handleAvatar(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    onProfileChange({ avatarUrl: await readFileAsDataURL(f) });
    e.target.value = "";
  }
  async function handleHlCover(e: React.ChangeEvent<HTMLInputElement>, id: string) {
    const f = e.target.files?.[0]; if (!f) return;
    const url = await readFileAsDataURL(f);
    onHighlightsChange(highlights.map(h => h.id === id ? { ...h, coverUrl: url } : h));
    e.target.value = "";
  }
  async function handleMultiFeed(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []); if (!files.length) return;
    const urls  = await Promise.all(files.map(readFileAsDataURL));
    const next: FeedImage[] = [
      ...feed,
      ...urls.map(url => ({ id: uid(), url, pinned: false, archived: false })),
    ];
    onFeedChange(next);
    if (profile.autoCount) onProfileChange({ posts: String(next.length) });
    e.target.value = "";
  }
  async function handleSingleFeed(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]; if (!f) return;
    const url  = await readFileAsDataURL(f);
    const slot = pendingSlot.current;
    const next: FeedImage[] = slot
      ? feed.map(fi => fi.id === slot ? { ...fi, url } : fi)
      : [...feed, { id: uid(), url, pinned: false, archived: false }];
    pendingSlot.current = null;
    onFeedChange(next);
    if (profile.autoCount && !slot) onProfileChange({ posts: String(next.length) });
    e.target.value = "";
  }
  function removeImage(id: string) {
    const next = feed.filter(f => f.id !== id);
    onFeedChange(next);
    if (profile.autoCount) onProfileChange({ posts: String(next.length) });
  }
  function togglePin(id: string) {
    const pinnedCount = feed.filter(f => f.pinned).length;
    onFeedChange(feed.map(f => {
      if (f.id !== id) return f;
      if (!f.pinned && pinnedCount >= 3) return f; // max 3 pinned
      return { ...f, pinned: !f.pinned };
    }));
  }
  function addBioLink() {
    if ((profile.bioLinks || []).length >= 5) return;
    onProfileChange({ bioLinks: [...(profile.bioLinks || []), { id: uid(), label: "", url: "" }] });
  }
  function updateBioLink(id: string, patch: Partial<BioLink>) {
    onProfileChange({ bioLinks: (profile.bioLinks || []).map(l => l.id === id ? { ...l, ...patch } : l) });
  }
  function removeBioLink(id: string) {
    onProfileChange({ bioLinks: (profile.bioLinks || []).filter(l => l.id !== id) });
  }

  const sortedFeed = [...feed.filter(f => f.pinned), ...feed.filter(f => !f.pinned)];

  /* ════════════════════════════════════════════════════════════════ */
  return (
    <aside className="w-72 flex-shrink-0 flex flex-col overflow-hidden h-full
      border-r border-slate-200 dark:border-slate-800
      bg-gradient-to-b from-slate-50 to-white dark:from-slate-950 dark:to-[#0a0a0a]">

      {/* ── Header: tabs + mobile close ── */}
      <div className="flex items-center gap-1 p-2 border-b border-slate-200 dark:border-slate-800 flex-shrink-0 bg-white/50 dark:bg-slate-950/50 backdrop-blur-sm">
        {TABS.map(t => {
          const Icon = t.icon;
          return (
            <button key={t.id} onClick={() => onTabChange(t.id)}
              className={`flex-1 flex flex-col items-center gap-1 py-2.5 px-2 rounded-xl text-[10px] font-bold transition-all relative overflow-hidden group ${
                activeTab === t.id
                  ? "text-ig-red bg-gradient-to-br from-ig-red/10 to-pink-500/10 shadow-sm"
                  : "text-slate-500 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900/50"
              }`}>
              {activeTab === t.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute inset-0 bg-gradient-to-br from-ig-red/5 to-pink-500/5 rounded-xl"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <Icon size={16} className="relative z-10" />
              <span className="relative z-10">{t.label}</span>
            </button>
          );
        })}
        {/* X close — only visible on mobile (lg:hidden) */}
        <button
          onClick={onClose}
          className="lg:hidden flex items-center justify-center w-9 h-9 flex-shrink-0
            text-slate-500 dark:text-slate-400
            hover:text-slate-800 dark:hover:text-white
            hover:bg-slate-100 dark:hover:bg-slate-800 transition rounded-xl"
          aria-label="Fechar painel"
        >
          <X size={16} />
        </button>
      </div>

      {/* ── Scrollable panel ── */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">

        {/* ════ PERFIL ════ */}
        {activeTab === "profile" && (<>

          {/* Avatar */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Label>Foto de perfil</Label>
            <div className="flex items-center gap-3">
              <button onClick={() => avatarRef.current?.click()}
                className="w-16 h-16 rounded-full flex-shrink-0 overflow-hidden
                  border-4 border-slate-200 dark:border-slate-700
                  hover:border-ig-red dark:hover:border-ig-red transition-all
                  hover:scale-105 hover:shadow-lg
                  bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900
                  flex items-center justify-center text-2xl relative group">
                {profile.avatarUrl
                  ? <img src={profile.avatarUrl} alt="" className="w-full h-full object-cover" />
                  : <Camera size={24} className="text-slate-400 dark:text-slate-600" />}
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                  <Upload size={16} className="text-white" />
                </div>
              </button>
              <div className="flex-1">
                <UploadBtn onClick={() => avatarRef.current?.click()}>
                  <Upload size={14} />Enviar foto
                </UploadBtn>
              </div>
              <input ref={avatarRef} type="file" accept="image/*" className="hidden" onChange={handleAvatar} />
            </div>
          </motion.div>

          {/* Informações básicas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex flex-col gap-4 p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Label>Informações básicas</Label>
            <Field label="Usuário (@)">
              <input className={inp} placeholder="seu_usuario" value={profile.username}
                onChange={e => onProfileChange({ username: e.target.value })} />
            </Field>
            <Field label="Nome de exibição">
              <input className={inp} placeholder="Seu Nome Completo" value={profile.displayName}
                onChange={e => onProfileChange({ displayName: e.target.value })} />
            </Field>
            <Field label="Categoria do perfil">
              <input className={inp} placeholder="ex: Criador de conteúdo" value={profile.category}
                onChange={e => onProfileChange({ category: e.target.value })} />
            </Field>
            <Field label="Biografia">
              <textarea className={`${inp} resize-none min-h-[80px] leading-relaxed`}
                placeholder={"✨ Sua bio aqui\n🔗 www.seusite.com"}
                value={profile.bio}
                onChange={e => onProfileChange({ bio: e.target.value })} />
            </Field>
          </motion.div>

          {/* Links na bio */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Label>Links na bio <span className="normal-case font-normal text-slate-500">(até 5)</span></Label>
            <div className="flex flex-col gap-2">
              {(profile.bioLinks || []).map((link, idx) => (
                <motion.div
                  key={link.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex flex-col gap-2 p-3 rounded-xl
                    bg-white dark:bg-slate-950
                    border border-slate-200 dark:border-slate-800
                    hover:border-ig-red/50 dark:hover:border-ig-red/50
                    transition-all shadow-sm hover:shadow"
                >
                  <div className="flex items-center gap-2">
                    <ExternalLink size={12} className="text-slate-400 flex-shrink-0" />
                    <input
                      className="flex-1 bg-transparent text-xs font-semibold
                        text-slate-800 dark:text-slate-200 outline-none
                        placeholder-slate-400 dark:placeholder-slate-600"
                      placeholder="Rótulo (ex: Meu site)"
                      value={link.label}
                      onChange={e => updateBioLink(link.id, { label: e.target.value })} />
                    <button onClick={() => removeBioLink(link.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-red-500/10 transition">
                      <Trash2 size={12} />
                    </button>
                  </div>
                  <input
                    className="w-full bg-transparent text-[11px] text-slate-500 dark:text-slate-500
                      outline-none placeholder-slate-400 dark:placeholder-slate-600 font-mono pl-6"
                    placeholder="https://..."
                    value={link.url}
                    onChange={e => updateBioLink(link.id, { url: e.target.value })} />
                </motion.div>
              ))}
              {(profile.bioLinks || []).length < 5 && (
                <UploadBtn onClick={addBioLink}>
                  <Plus size={14} />Adicionar link
                </UploadBtn>
              )}
            </div>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <Field label="Botão CTA (opcional)">
              <input className={inp} placeholder="ex: Saiba mais / Agendar" value={profile.ctaLabel}
                onChange={e => onProfileChange({ ctaLabel: e.target.value })} />
            </Field>
          </motion.div>

          {/* Verificação */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Label>Verificação</Label>
            <div className="grid grid-cols-3 gap-2">
              {VERIFIED_OPTIONS.map(({ val, label, badge }) => (
                <button key={val}
                  onClick={() => onProfileChange({ verified: val })}
                  className={`flex flex-col items-center gap-2 py-3 px-2 rounded-xl
                    text-[11px] font-bold border-2 transition-all shadow-sm hover:shadow ${
                    profile.verified === val
                      ? "border-ig-red bg-gradient-to-br from-ig-red/10 to-pink-500/10 text-ig-red scale-105"
                      : "border-slate-200 dark:border-slate-700 text-slate-500 dark:text-slate-500 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}>
                  <span className="flex items-center justify-center h-5">{badge}</span>
                  {label}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Perspectiva */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Label>Perspectiva do preview</Label>
            <div className="grid grid-cols-2 gap-2">
              {VIEW_OPTIONS.map(({ val, label, sub }) => (
                <button key={val}
                  onClick={() => onProfileChange({ viewMode: val })}
                  className={`py-3 px-3 rounded-xl text-xs font-semibold border-2 text-left transition-all shadow-sm hover:shadow ${
                    profile.viewMode === val
                      ? "border-ig-red bg-gradient-to-br from-ig-red/10 to-pink-500/10 text-ig-red scale-105"
                      : "border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-slate-600"
                  }`}>
                  <span className="block font-bold">{label}</span>
                  <span className="text-[10px] opacity-70">{sub}</span>
                </button>
              ))}
            </div>
          </motion.div>

          {/* Estatísticas */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Label>Estatísticas</Label>
            <div className="grid grid-cols-3 gap-2">
              <div>
                <Label>Posts</Label>
                <input
                  className={`${inp} text-center font-bold ${profile.autoCount ? "opacity-50 cursor-not-allowed" : ""}`}
                  placeholder="0"
                  value={profile.posts}
                  disabled={profile.autoCount}
                  onChange={e => onProfileChange({ posts: e.target.value })} />
              </div>
              <div>
                <Label>Seguidores</Label>
                <input className={`${inp} text-center font-bold`} placeholder="0" value={profile.followers}
                  onChange={e => onProfileChange({ followers: e.target.value })} />
              </div>
              <div>
                <Label>Seguindo</Label>
                <input className={`${inp} text-center font-bold`} placeholder="0" value={profile.following}
                  onChange={e => onProfileChange({ following: e.target.value })} />
              </div>
            </div>
          </motion.div>

          {/* Toggles */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.45 }}
            className="flex flex-col gap-1 p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Label>Comportamento</Label>
            <Toggle
              checked={profile.autoCount}
              label="Posts automático"
              sub="Conta as fotos do feed"
              onChange={() => {
                const next = !profile.autoCount;
                onProfileChange({ autoCount: next, posts: next ? String(feed.length) : profile.posts });
              }} />
            <Toggle
              checked={profile.storyActive}
              label="Story ativo"
              sub="Anel colorido no avatar"
              onChange={() => onProfileChange({ storyActive: !profile.storyActive })} />
          </motion.div>
        </>)}

        {/* ════ DESTAQUES ════ */}
        {activeTab === "highlights" && (<>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <Label>Destaques (Stories)</Label>
            <div className="flex flex-col gap-2">
              {highlights.map((h, idx) => (
                <motion.div
                  key={h.id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="flex items-center gap-3 p-3 rounded-xl
                    bg-white dark:bg-slate-950
                    border border-slate-200 dark:border-slate-800
                    hover:border-ig-red/50 dark:hover:border-ig-red/50
                    transition-all shadow-sm hover:shadow"
                >
                  <button onClick={() => hlCoverRefs.current[h.id]?.click()}
                    className="w-12 h-12 rounded-full flex-shrink-0 overflow-hidden relative
                      border-3 border-dashed border-slate-300 dark:border-slate-700
                      hover:border-ig-red dark:hover:border-ig-red transition-all
                      hover:scale-105
                      bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900
                      flex items-center justify-center text-lg group">
                    {h.coverUrl
                      ? <img src={h.coverUrl} alt="" className="w-full h-full object-cover" />
                      : <Camera size={16} className="text-slate-400 dark:text-slate-600" />}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                      <Upload size={12} className="text-white" />
                    </div>
                  </button>
                  <input
                    ref={el => { hlCoverRefs.current[h.id] = el; }}
                    type="file" accept="image/*" className="hidden"
                    onChange={e => handleHlCover(e, h.id)} />
                  <input
                    className="flex-1 bg-transparent text-sm font-semibold
                      text-slate-800 dark:text-white outline-none
                      placeholder-slate-400 dark:placeholder-slate-600"
                    placeholder="Nome do destaque"
                    value={h.name}
                    onChange={e => onHighlightsChange(
                      highlights.map(x => x.id === h.id ? { ...x, name: e.target.value } : x)
                    )} />
                  <button
                    onClick={() => onHighlightsChange(highlights.filter(x => x.id !== h.id))}
                    className="p-2 rounded-lg text-slate-400 dark:text-slate-600
                      hover:text-red-500 hover:bg-red-500/10 transition">
                    <Trash2 size={14} />
                  </button>
                </motion.div>
              ))}
            </div>
            <div className="mt-3">
              <UploadBtn onClick={() => onHighlightsChange([...highlights, { id: uid(), name: "Novo", coverUrl: null }])}>
                <Plus size={14} />Adicionar destaque
              </UploadBtn>
            </div>
          </motion.div>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed px-1"
          >
            💡 Clique no círculo para adicionar capa. O nome aparece abaixo de cada destaque no preview.
          </motion.p>
        </>)}

        {/* ════ FEED ════ */}
        {activeTab === "feed" && (<>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="p-4 rounded-2xl bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <Label>
                Fotos do Feed
              </Label>
              <span className="text-[11px] font-bold text-slate-600 dark:text-slate-400 px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800">
                {feed.length} foto{feed.length !== 1 ? "s" : ""}
                {profile.autoCount && " · 🔄"}
              </span>
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-500 leading-relaxed mb-4 px-1">
              💡 Arraste no preview para reorganizar.{" "}
              <span className="text-ig-red font-bold">Pino</span> = aparece primeiro (máx. 3).
            </p>

            <div className="grid grid-cols-3 gap-2">
              {sortedFeed.map((img, idx) => (
                <motion.div
                  key={img.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.02 }}
                  className={`relative group aspect-square rounded-xl overflow-hidden
                    bg-slate-100 dark:bg-slate-900
                    border-2 ${img.pinned ? "border-ig-red shadow-lg" : "border-slate-200 dark:border-slate-800"}
                    hover:scale-105 transition-transform`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                  {img.pinned && (
                    <div className="absolute top-1.5 left-1.5 w-5 h-5 ig-gradient rounded-full flex items-center justify-center shadow-lg">
                      <Pin size={10} className="text-white" />
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 text-[10px] font-black text-white bg-black/60 rounded-md px-1.5 py-0.5 backdrop-blur-sm">
                    {idx + 1}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition flex items-center justify-center gap-1">
                    <button onClick={() => togglePin(img.id)} title={img.pinned ? "Desafixar" : "Fixar"}
                      className={`p-2 rounded-lg transition backdrop-blur-sm ${img.pinned ? "bg-ig-red text-white shadow-lg" : "bg-white/30 hover:bg-white/40 text-white"}`}>
                      {img.pinned ? <PinOff size={12} /> : <Pin size={12} />}
                    </button>
                    <button onClick={() => { pendingSlot.current = img.id; feedSingleRef.current?.click(); }}
                      className="p-2 rounded-lg bg-white/30 hover:bg-white/40 text-white transition backdrop-blur-sm">
                      <ImageIcon size={12} />
                    </button>
                    <button onClick={() => removeImage(img.id)}
                      className="p-2 rounded-lg bg-red-500/90 hover:bg-red-500 text-white transition backdrop-blur-sm shadow-lg">
                      <Trash2 size={12} />
                    </button>
                  </div>
                </motion.div>
              ))}

              {/* Add slot */}
              <button
                onClick={() => { pendingSlot.current = null; feedSingleRef.current?.click(); }}
                className="aspect-square rounded-xl border-2 border-dashed
                  border-slate-300 dark:border-slate-700
                  bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-950
                  flex items-center justify-center text-slate-400 dark:text-slate-600
                  hover:border-ig-red hover:text-ig-red hover:bg-ig-red/5 dark:hover:bg-ig-red/10
                  transition-all text-2xl font-light shadow-sm hover:shadow">
                <Plus size={20} />
              </button>
            </div>

            <div className="mt-3">
              <UploadBtn onClick={() => feedMultiRef.current?.click()}>
                <Upload size={14} />Importar múltiplas fotos
              </UploadBtn>
            </div>
          </motion.div>

          <input ref={feedMultiRef}  type="file" accept="image/*" multiple className="hidden" onChange={handleMultiFeed} />
          <input ref={feedSingleRef} type="file" accept="image/*"          className="hidden" onChange={handleSingleFeed} />
        </>)}

        {/* ════ ANÁLISE ════ */}
        {activeTab === "analysis" && (
          <AnimatePresence mode="wait">
            <motion.div
              key="analysis"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="space-y-4"
            >
              <TemplateGallery onLoadTemplate={onLoadTemplate} />
              <SampleImagesButton onLoadImages={onFeedChange} />
              <FeedAnalysis feed={feed} profile={profile} onFeedReorder={onFeedChange} />
            </motion.div>
          </AnimatePresence>
        )}

      </div>

      {/* ── Guebly footer ── */}
      <div className="flex-shrink-0 border-t border-slate-200 dark:border-slate-800 px-3 py-2.5
        bg-gradient-to-r from-slate-50 to-white dark:from-slate-950 dark:to-[#0a0a0a]">
        <a href="https://www.guebly.com.br" target="_blank" rel="noopener noreferrer"
          className="flex items-center gap-2.5 group p-2 rounded-xl
            hover:bg-white dark:hover:bg-slate-900/60
            border border-transparent hover:border-slate-200 dark:hover:border-slate-800
            transition-all duration-150">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0
            overflow-hidden ig-gradient p-0.5">
            <div className="w-full h-full rounded-md bg-white dark:bg-[#0a0a0a] flex items-center justify-center overflow-hidden">
              <img src="/logo-64.png" alt="Guebly" className="w-5 h-5 object-contain" />
            </div>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-slate-800 dark:text-slate-200 leading-tight truncate group-hover:ig-text transition">
              Guebly Tools
            </p>
            <p className="text-[10px] text-slate-400 dark:text-slate-600 leading-tight">
              Open-source · guebly.com.br
            </p>
          </div>
        </a>
      </div>
    </aside>
  );
}
