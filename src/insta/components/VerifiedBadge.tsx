

/**
 * VerifiedBadge — pixel-accurate Instagram/Meta verified starburst badge
 *
 * The badge is a 10-pointed starburst (rosette) — NOT a circle.
 * Coordinates generated mathematically: outer R=10.5, inner r=8, 10 points.
 *
 * blue = #3797f0  (Instagram standard verified)
 * gold = #f0b429  (Meta Verified for businesses)
 */
interface Props { type: "blue" | "gold"; size?: number; }

const STAR =
  "M 12 1.5 L 14.472 4.392 L 18.172 3.505 L 18.472 7.298 " +
  "L 21.986 8.755 L 20 12 L 21.986 15.245 L 18.472 16.702 " +
  "L 18.172 20.495 L 14.472 19.608 L 12 22.5 L 9.528 19.608 " +
  "L 5.828 20.495 L 5.528 16.702 L 2.014 15.245 L 4 12 " +
  "L 2.014 8.755 L 5.528 7.298 L 5.828 3.505 L 9.528 4.392 Z";

export default function VerifiedBadge({ type, size = 16 }: Props) {
  const fill = type === "gold" ? "#f0b429" : "#3797f0";
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ display: "inline-block", flexShrink: 0, verticalAlign: "middle" }}
      aria-label={type === "gold" ? "Meta Verified (ouro)" : "Conta verificada"}
    >
      {/* 10-pointed starburst — exact shape of Instagram's verified badge */}
      <path d={STAR} fill={fill} />
      {/* White checkmark */}
      <polyline
        points="7.5,12.5 10.5,15.5 16.5,9.5"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
    </svg>
  );
}
