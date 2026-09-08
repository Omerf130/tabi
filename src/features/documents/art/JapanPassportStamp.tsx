type JapanPassportStampProps = {
  className?: string;
};

export function JapanPassportStamp({ className }: JapanPassportStampProps) {
  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
      focusable={false}
    >
      <circle
        cx="60"
        cy="60"
        r="52"
        stroke="#7a2e38"
        strokeWidth="2.5"
        strokeDasharray="4 3"
        fill="#f3e6e7"
        fillOpacity="0.55"
      />
      <circle cx="60" cy="60" r="42" stroke="#7a2e38" strokeWidth="1.5" strokeOpacity="0.45" />
      <text
        x="60"
        y="42"
        textAnchor="middle"
        fill="#7a2e38"
        fontSize="11"
        fontWeight="700"
        fontFamily="system-ui, sans-serif"
        letterSpacing="1.5"
      >
        JAPAN
      </text>
      <path
        d="M60 48 L64 58 L74 58 L66 64 L69 74 L60 68 L51 74 L54 64 L46 58 L56 58 Z"
        fill="#7a2e38"
        fillOpacity="0.85"
      />
      <text
        x="60"
        y="92"
        textAnchor="middle"
        fill="#7a2e38"
        fontSize="8"
        fontWeight="600"
        fontFamily="system-ui, sans-serif"
        letterSpacing="0.5"
      >
        GOOD TRIPS
      </text>
      <text
        x="60"
        y="102"
        textAnchor="middle"
        fill="#7a2e38"
        fontSize="7"
        fontFamily="system-ui, sans-serif"
        opacity="0.75"
      >
        BETTER MEMORIES
      </text>
    </svg>
  );
}
