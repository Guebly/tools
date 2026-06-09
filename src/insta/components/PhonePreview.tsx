
import type { ProfileData, Highlight, FeedImage, IgTheme } from "../types";
import { igC } from "../igColors";
import DraggableFeedGrid from "./DraggableFeedGrid";
import VerifiedBadge from "./VerifiedBadge";

interface Props {
  profile: ProfileData; highlights: Highlight[];
  feed: FeedImage[];    onFeedReorder: (f: FeedImage[]) => void;
  igTheme: IgTheme;
}

export default function PhonePreview({ profile, highlights, feed, onFeedReorder, igTheme }: Props) {
  const c = igC(igTheme);
  const isOwner   = profile.viewMode !== "visitor";
  const hasAvatar = !!profile.avatarUrl;
  const bioLinks  = profile.bioLinks || [];

  return (
    <div className="phone-shadow w-[375px] flex-shrink-0 rounded-[44px] border-[8px] border-[#2a2a2a] overflow-hidden"
      style={{ background: c.bg, outline: "1px solid #555" }}>

      {/* Notch */}
      <div style={{ background: c.navBg }}>
        <div className="relative">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-7 bg-[#2a2a2a] rounded-b-[20px] z-10" />
        </div>
        <div className="pt-8 ig-font">

          {/* Top bar */}
          <div className="flex items-center justify-between px-4 py-2 border-b" style={{ borderColor: c.border }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="2.2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
            <div className="flex items-center gap-1.5">
              <span className="text-[15px] font-bold" style={{ color: c.text }}>
                {profile.username || "seu_usuario"}
              </span>
              {profile.verified !== "none" && (
                <VerifiedBadge type={profile.verified as "blue" | "gold"} size={14} />
              )}
            </div>
            <div className="flex items-center gap-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="1.8">
                <line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c.icon} strokeWidth="1.8">
                <line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </div>
          </div>

          {/* Profile */}
          <div className="px-4 pt-4">

            {/* Avatar + stats */}
            <div className="flex items-center gap-6 mb-3">
              <div className={`w-[86px] h-[86px] rounded-full p-[3px] flex-shrink-0 ${profile.storyActive && hasAvatar ? "ig-gradient" : ""}`}
                style={!profile.storyActive || !hasAvatar ? { background: c.border } : {}}>
                <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                  style={{ border: `2px solid ${c.bg}`, background: c.bgSec }}>
                  {hasAvatar
                    ? <img src={profile.avatarUrl!} alt="" className="w-full h-full object-cover" />
                    : <svg width="38" height="38" viewBox="0 0 24 24" fill="none" stroke={c.border} strokeWidth="1.5">
                        <circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
                      </svg>
                  }
                </div>
              </div>

              <div className="flex flex-1 justify-around">
                {[
                  { val: profile.posts,     label: "publicações" },
                  { val: profile.followers, label: "seguidores"  },
                  { val: profile.following, label: "seguindo"    },
                ].map(({ val, label }) => (
                  <div key={label} className="flex flex-col items-center">
                    <span className="text-[17px] font-bold leading-tight" style={{ color: c.text }}>{val || "0"}</span>
                    <span className="text-[12px]" style={{ color: c.text }}>{label}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Bio section */}
            <div className="mb-3">
              {(profile.displayName || profile.verified !== "none") && (
                <div className="flex items-center gap-1.5 mb-0.5">
                  {profile.displayName && (
                    <p className="text-[14px] font-bold leading-snug" style={{ color: c.text }}>{profile.displayName}</p>
                  )}
                  {profile.verified !== "none" && (
                    <VerifiedBadge type={profile.verified as "blue" | "gold"} size={13} />
                  )}
                </div>
              )}
              {profile.category && (
                <p className="text-[13px]" style={{ color: c.textSec }}>{profile.category}</p>
              )}
              {profile.bio && (
                <p className="text-[13px] whitespace-pre-line leading-[1.45] mt-0.5" style={{ color: c.text }}>
                  {profile.bio}
                </p>
              )}

              {/* Single legacy link */}
              {profile.link && bioLinks.length === 0 && (
                <p className="text-[13px] font-semibold mt-0.5" style={{ color: c.link }}>{profile.link}</p>
              )}

              {/* Multiple bio links */}
              {bioLinks.length > 0 && (
                <div className="mt-2 flex flex-col gap-1">
                  {bioLinks.map(l => (
                    <div key={l.id} className="flex items-center gap-1.5">
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={c.link} strokeWidth="2.2">
                        <path d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"/>
                        <path d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"/>
                      </svg>
                      <span className="text-[12px] font-semibold" style={{ color: c.link }}>
                        {l.label || l.url || "Link"}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Action buttons — Owner vs Visitor */}
            <div className="flex gap-1.5 mb-3">
              {isOwner ? (<>
                <button className="flex-1 py-[6px] text-[13px] font-semibold rounded-lg border"
                  style={{ background: c.btnBg, borderColor: c.border, color: c.text }}>Editar perfil</button>
                <button className="flex-1 py-[6px] text-[13px] font-semibold rounded-lg border"
                  style={{ background: c.btnBg, borderColor: c.border, color: c.text }}>Compartilhar</button>
                {profile.ctaLabel ? (
                  <button className="flex-1 py-[6px] text-[12px] font-semibold rounded-lg border"
                    style={{ background: c.btnBg, borderColor: c.border, color: c.text }}>{profile.ctaLabel}</button>
                ) : (
                  <button className="py-[6px] px-2.5 rounded-lg border"
                    style={{ background: c.btnBg, borderColor: c.border, color: c.text }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                      <path d="M16 21v-2a4 4 0 00-8 0v2"/><circle cx="12" cy="7" r="4"/>
                      <line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/>
                    </svg>
                  </button>
                )}
              </>) : (<>
                {/* Visitor POV */}
                <button className="flex-1 py-[6px] text-[13px] font-bold rounded-lg text-white"
                  style={{ background: "#0095f6" }}>Seguir</button>
                <button className="flex-1 py-[6px] text-[13px] font-semibold rounded-lg border"
                  style={{ background: c.btnBg, borderColor: c.border, color: c.text }}>Mensagem</button>
                {profile.ctaLabel ? (
                  <button className="flex-1 py-[6px] text-[12px] font-semibold rounded-lg border"
                    style={{ background: c.btnBg, borderColor: c.border, color: c.text }}>{profile.ctaLabel}</button>
                ) : (
                  <button className="py-[6px] px-2.5 rounded-lg border"
                    style={{ background: c.btnBg, borderColor: c.border, color: c.text }}>
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <polyline points="6 9 12 15 18 9"/>
                    </svg>
                  </button>
                )}
              </>)}
            </div>
          </div>

          {/* Highlights */}
          {highlights.length > 0 && (
            <div className="flex gap-4 px-4 pb-4 overflow-x-auto border-b"
              style={{ borderColor: c.border, scrollbarWidth: "none" }}>
              {highlights.map(h => (
                <div key={h.id} className="flex flex-col items-center gap-1 flex-shrink-0">
                  <div className="w-[62px] h-[62px] rounded-full border p-[2px]"
                    style={{ borderColor: c.hlBorder, background: c.bg }}>
                    <div className="w-full h-full rounded-full overflow-hidden flex items-center justify-center"
                      style={{ background: c.bgSec }}>
                      {h.coverUrl
                        ? <img src={h.coverUrl} alt="" className="w-full h-full object-cover" />
                        : <span style={{ color: c.border, fontSize: 18 }}>○</span>
                      }
                    </div>
                  </div>
                  <span className="text-[11px] max-w-[62px] text-center overflow-hidden text-ellipsis whitespace-nowrap"
                    style={{ color: c.text }}>
                    {h.name || "Destaque"}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Feed tabs */}
          <div className="flex border-b" style={{ borderColor: c.border }}>
            {[
              <svg key="g" width="22" height="22" viewBox="0 0 24 24" fill={c.tabActive}>
                <rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/>
                <rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>
              </svg>,
              <svg key="r" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.tabInact} strokeWidth="1.6">
                <rect x="2" y="2" width="20" height="20" rx="4"/><circle cx="12" cy="12" r="3.5"/>
                <circle cx="6.5" cy="6.5" r="1.2" fill={c.tabInact}/><circle cx="17.5" cy="6.5" r="1.2" fill={c.tabInact}/>
              </svg>,
              <svg key="t" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c.tabInact} strokeWidth="1.6">
                <path d="M20.59 13.41l-7.17 7.17a2 2 0 01-2.83 0L2 12V2h10l8.59 8.59a2 2 0 010 2.82z"/>
                <circle cx="7" cy="7" r="1.5" fill={c.tabInact}/>
              </svg>,
            ].map((icon, i) => (
              <div key={i} className="flex-1 py-2.5 flex items-center justify-center border-b-[1.5px]"
                style={{ borderColor: i === 0 ? c.tabActive : "transparent" }}>
                {icon}
              </div>
            ))}
          </div>

          <DraggableFeedGrid images={feed} onReorder={onFeedReorder} bgColor={c.bgSec} />
        </div>
      </div>
    </div>
  );
}
