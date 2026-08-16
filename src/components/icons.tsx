import type { ReactNode, SVGProps } from "react";

export type IconName =
  | "search" | "pin" | "briefcase" | "clock" | "bookmark" | "bookmark-filled"
  | "x" | "arrow-right" | "arrow-up-right" | "building" | "coins" | "cap"
  | "chevron-down" | "check" | "send" | "bell" | "grid" | "plus" | "spark"
  | "trend" | "user" | "mail" | "calendar" | "zap" | "layers" | "target"
  | "globe" | "doc" | "trash" | "compass" | "shield" | "filter";

const paths: Record<IconName, ReactNode> = {
  search: (<><circle cx="11" cy="11" r="7" /><path d="m20 20-3.8-3.8" /></>),
  pin: (<><path d="M12 21s-7-5.3-7-11a7 7 0 0 1 14 0c0 5.7-7 11-7 11Z" /><circle cx="12" cy="10" r="2.6" /></>),
  briefcase: (<><rect x="3" y="7" width="18" height="13" rx="2.5" /><path d="M8.5 7V5.5A1.5 1.5 0 0 1 10 4h4a1.5 1.5 0 0 1 1.5 1.5V7" /><path d="M3 12.5h18" /></>),
  clock: (<><circle cx="12" cy="12" r="8.5" /><path d="M12 7.5V12l3 2" /></>),
  bookmark: (<path d="M6.5 4h11A0 0 0 0 1 17.5 4v17l-5.5-3.6L6.5 21V4a0 0 0 0 1 0 0Z" />),
  "bookmark-filled": (<path d="M6.5 3.5h11a.5.5 0 0 1 .5.5v17l-6-4-6 4V4a.5.5 0 0 1 .5-.5Z" />),
  x: (<path d="M6 6l12 12M18 6 6 18" />),
  "arrow-right": (<path d="M4 12h16m-6-6 6 6-6 6" />),
  "arrow-up-right": (<path d="M7 17 17 7M9 7h8v8" />),
  building: (<><rect x="4.5" y="3.5" width="15" height="17" rx="1.5" /><path d="M9 8h2m2 0h2M9 12h2m2 0h2M9 16h2m2 0h2M4.5 20.5h15" /></>),
  coins: (<><ellipse cx="12" cy="6.5" rx="7" ry="3" /><path d="M5 6.5V12c0 1.66 3.13 3 7 3s7-1.34 7-3V6.5" /><path d="M5 12v5.5c0 1.66 3.13 3 7 3s7-1.34 7-3V12" /></>),
  cap: (<><path d="m12 4 10 4.5L12 13 2 8.5 12 4Z" /><path d="M6.5 10.8V15c0 1.4 2.5 2.8 5.5 2.8s5.5-1.4 5.5-2.8v-4.2" /><path d="M22 8.5V14" /></>),
  "chevron-down": (<path d="m6 9 6 6 6-6" />),
  check: (<path d="m4.5 12.5 5 5L19.5 7" />),
  send: (<><path d="M21 3 10.5 13.5" /><path d="M21 3 14 21l-3.5-7.5L3 10l18-7Z" /></>),
  bell: (<><path d="M18 9a6 6 0 1 0-12 0c0 6-2.5 7-2.5 7h17S18 15 18 9Z" /><path d="M10 20a2.2 2.2 0 0 0 4 0" /></>),
  grid: (<><rect x="3.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="3.5" width="7" height="7" rx="1.5" /><rect x="3.5" y="13.5" width="7" height="7" rx="1.5" /><rect x="13.5" y="13.5" width="7" height="7" rx="1.5" /></>),
  plus: (<path d="M12 5v14M5 12h14" />),
  spark: (<path d="M12 2.5 14 9l6.5 2L14 13.5 12 20l-2-6.5L3.5 11 10 9l2-6.5Z" />),
  trend: (<><path d="m3 17 6-6 4 4 7.5-7.5" /><path d="M14.5 7.5H20.5V13.5" /></>),
  user: (<><circle cx="12" cy="8" r="4" /><path d="M4.5 20.5c1.2-3.6 4.1-5.5 7.5-5.5s6.3 1.9 7.5 5.5" /></>),
  mail: (<><rect x="3" y="5.5" width="18" height="13" rx="2" /><path d="m3.5 7.5 8.5 6 8.5-6" /></>),
  calendar: (<><rect x="3.5" y="5" width="17" height="15.5" rx="2" /><path d="M8 3v4m8-4v4M3.5 10h17" /></>),
  zap: (<path d="M13 2.5 4.5 13.5H11l-1 8L18.5 10H12l1-7.5Z" />),
  layers: (<><path d="m12 3 9 5-9 5-9-5 9-5Z" /><path d="m3.5 12.5 8.5 4.7 8.5-4.7" /><path d="m3.5 16.5 8.5 4.7 8.5-4.7" /></>),
  target: (<><circle cx="12" cy="12" r="8.5" /><circle cx="12" cy="12" r="4.5" /><circle cx="12" cy="12" r="0.8" /></>),
  globe: (<><circle cx="12" cy="12" r="8.5" /><path d="M3.5 12h17M12 3.5c2.6 2.3 3.9 5.1 3.9 8.5s-1.3 6.2-3.9 8.5c-2.6-2.3-3.9-5.1-3.9-8.5s1.3-6.2 3.9-8.5Z" /></>),
  doc: (<><path d="M6 3.5h8L19 8.5v12H6v-17Z" /><path d="M14 3.5v5h5" /><path d="M9 13h6m-6 3.5h6" /></>),
  trash: (<><path d="M4.5 6.5h15M9.5 6V4.5h5V6" /><path d="M6.5 6.5 7.5 20h9l1-13.5" /><path d="M10 10.5v6m4-6v6" /></>),
  compass: (<><circle cx="12" cy="12" r="8.5" /><path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" /></>),
  shield: (<><path d="M12 3 5 5.5v5.6c0 4.4 2.9 7.6 7 9.4 4.1-1.8 7-5 7-9.4V5.5L12 3Z" /><path d="m8.8 11.8 2.2 2.2 4.2-4.5" /></>),
  filter: (<path d="M4 5.5h16L14 13v6l-4-1.8V13L4 5.5Z" />),
};

interface IconProps extends SVGProps<SVGSVGElement> {
  name: IconName;
  filled?: boolean;
}

export function Icon({ name, filled = false, ...rest }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill={filled ? "currentColor" : "none"}
      stroke="currentColor"
      strokeWidth={filled ? 0 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {paths[name]}
    </svg>
  );
}

/** CareerHub brand mark — a hub ring with a signal dot. */
export function LogoMark({ className = "w-8 h-8" }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect width="32" height="32" rx="8" fill="var(--color-pine-600)" />
      <path d="M21 11a6.4 6.4 0 1 0 0 10" fill="none" stroke="var(--color-paper)" strokeWidth="3.1" strokeLinecap="round" />
      <circle cx="21.6" cy="16" r="2.4" fill="var(--color-honey-500)" />
    </svg>
  );
}
