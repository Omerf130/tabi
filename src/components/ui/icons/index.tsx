type IconProps = {
  className?: string;
};

const stroke = {
  width: 24,
  height: 24,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true as const,
  focusable: false as const,
};

export function IconHome({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M4 10.5 12 4l8 6.5" />
      <path d="M6.5 9.5V20h11V9.5" />
    </svg>
  );
}

export function IconItinerary({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <rect x="5" y="4.5" width="14" height="16" rx="2" />
      <path d="M8 3.5v3M16 3.5v3M5 9.5h14" />
    </svg>
  );
}

export function IconDocuments({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M7 4.5h7l5 5V19.5H7z" />
      <path d="M14 4.5V10h5.5" />
    </svg>
  );
}

export function IconMemories({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <rect x="4" y="6" width="16" height="13" rx="2" />
      <circle cx="9" cy="11" r="1.25" />
      <path d="m8 16.5 3.2-3.2 2.3 2.3 2.2-2.8 4.3 3.7" />
    </svg>
  );
}

export function IconMore({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <circle cx="6" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.15" fill="currentColor" stroke="none" />
      <circle cx="18" cy="12" r="1.15" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconBack({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M15 5.5 8.5 12 15 18.5" />
    </svg>
  );
}

export function IconChevron({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M9 6.5 14.5 12 9 17.5" />
    </svg>
  );
}

export function IconTrips({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <rect x="4.5" y="5.5" width="15" height="13" rx="2" />
      <path d="M4.5 9.5h15M9 5.5V4M15 5.5V4" />
    </svg>
  );
}

export function IconMembers({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <circle cx="9" cy="8.5" r="2.75" />
      <path d="M4.5 18.5c.5-2.75 2.5-4.5 4.5-4.5s4 1.75 4.5 4.5" />
      <path d="M16.5 9.5v3M18 11h-3" />
    </svg>
  );
}

export function IconAccommodation({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M5 19V8.5h14V19" />
      <path d="M5 12h14" />
      <path d="M9 8.5V5h6v3.5" />
      <path d="M12 15v4" />
    </svg>
  );
}

export function IconActivityAttraction({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M12 4.5 13.8 9.2 18.5 11 13.8 12.8 12 17.5 10.2 12.8 5.5 11 10.2 9.2Z" />
    </svg>
  );
}

export function IconActivityTransport({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <rect x="4.5" y="8.5" width="15" height="7" rx="1.5" />
      <path d="M8 8.5V6.5h8v2" />
      <circle cx="8" cy="16" r="1.1" />
      <circle cx="16" cy="16" r="1.1" />
    </svg>
  );
}

export function IconActivityRestaurant({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M8 5v8.5M10 5v8.5" />
      <path d="M9 13.5V19" />
      <path d="M15 5v14" />
    </svg>
  );
}

export function IconActivityHotel({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M5 19V8.5h14V19" />
      <path d="M5 12h14" />
      <path d="M9 8.5V5h6v3.5" />
    </svg>
  );
}

export function IconActivityFreeTime({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <circle cx="12" cy="12" r="6.5" />
      <path d="M12 8.5V12l2.5 2" />
    </svg>
  );
}

export function IconActivityShopping({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M7 8.5h10l-1 10H8z" />
      <path d="M9 8.5V6.5h6v2" />
    </svg>
  );
}

export function IconActivityOther({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <circle cx="7" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="12" cy="12" r="1.1" fill="currentColor" stroke="none" />
      <circle cx="17" cy="12" r="1.1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconGrid({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <rect x="5" y="5" width="6" height="6" rx="1" />
      <rect x="13" y="5" width="6" height="6" rx="1" />
      <rect x="5" y="13" width="6" height="6" rx="1" />
      <rect x="13" y="13" width="6" height="6" rx="1" />
    </svg>
  );
}

export function IconPlane({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M4 13 10 11 20 5l-2 8-4 1-1 4-2-1 1-4-4 1Z" />
    </svg>
  );
}

export function IconTrain({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <rect x="5" y="6" width="14" height="11" rx="2" />
      <path d="M5 11h14" />
      <path d="M8 19v-2M16 19v-2" />
      <circle cx="8.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
      <circle cx="15.5" cy="15.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function IconTicket({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M5 8.5h14v7H5z" />
      <path d="M9 8.5v7M15 8.5v7" strokeDasharray="2 2" />
    </svg>
  );
}

export function IconShield({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M12 4.5 18 7v5.5c0 3.5-2.8 6.2-6 7.5-3.2-1.3-6-4.2-6-7.5V7z" />
    </svg>
  );
}

export function IconLink({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M10 8.5a3.5 3.5 0 0 1 5 5l-1.5 1.5" />
      <path d="M14 15.5a3.5 3.5 0 0 1-5-5L10.5 9" />
    </svg>
  );
}

export function IconFilePdf({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M8 4.5h6l5 5v10H8z" />
      <path d="M14 4.5V10h5.5" />
      <path d="M10 14h5M10 17h3.5" />
    </svg>
  );
}

export function IconFileImage({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <rect x="5" y="5.5" width="14" height="13" rx="2" />
      <circle cx="9.5" cy="10.5" r="1.25" />
      <path d="m7 17 3.5-3.5 2.5 2 3-4 3 5.5" />
    </svg>
  );
}

export function IconCalendar({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <rect x="5" y="6" width="14" height="13" rx="2" />
      <path d="M8 4.5v3M16 4.5v3M5 10h14" />
    </svg>
  );
}

export function IconSettings({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <circle cx="12" cy="12" r="2.75" />
      <path d="M12 4.5v2M12 17.5v2M4.5 12h2M17.5 12h2M6.4 6.4l1.4 1.4M16.2 16.2l1.4 1.4M6.4 17.6l1.4-1.4M16.2 7.8l1.4-1.4" />
    </svg>
  );
}

export function IconCurrency({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <circle cx="12" cy="12" r="6.5" />
      <path d="M9.5 10.5h4.5a1.5 1.5 0 1 1 0 3H10.5" />
      <path d="M12 7.5v9" />
    </svg>
  );
}

export function IconWeather({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <circle cx="12" cy="10" r="3.25" />
      <path d="M7.5 16.5h9a2.75 2.75 0 0 0 .4-5.47A4 4 0 0 0 8.2 11.2 3.25 3.25 0 0 0 7.5 16.5Z" />
    </svg>
  );
}

export function IconDictionary({ className }: IconProps) {
  return (
    <svg {...stroke} className={className}>
      <path d="M6.5 5.5h11v13H6.5a2 2 0 0 1-2-2v-9a2 2 0 0 1 2-2Z" />
      <path d="M8.5 5.5V19.5" />
      <path d="M12 9.5h4M12 12.5h3" />
    </svg>
  );
}
