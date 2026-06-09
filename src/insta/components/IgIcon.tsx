/** Instagram icon with official gradient */
export const IG_GRADIENT =
  "linear-gradient(135deg,#f09433 0%,#e6683c 22%,#dc2743 45%,#cc2366 72%,#bc1888 100%)";

interface IgIconProps {
  size?: number;
  className?: string;
}

export default function IgIcon({ size = 24, className = "" }: IgIconProps) {
  const id = "ig-grad-" + size;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      className={className}
    >
      <defs>
        <linearGradient id={id} x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%"   stopColor="#f09433" />
          <stop offset="22%"  stopColor="#e6683c" />
          <stop offset="45%"  stopColor="#dc2743" />
          <stop offset="72%"  stopColor="#cc2366" />
          <stop offset="100%" stopColor="#bc1888" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="20" height="20" rx="6" stroke={`url(#${id})`} strokeWidth="2" />
      <circle cx="12" cy="12" r="4"             stroke={`url(#${id})`} strokeWidth="2" />
      <circle cx="17.5" cy="6.5" r="1.5"        fill={`url(#${id})`} />
    </svg>
  );
}
