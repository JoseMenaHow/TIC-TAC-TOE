interface BotIconProps {
  size?: number;
}

export default function BotIcon({ size = 24 }: BotIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="5"
        y="8"
        width="14"
        height="12"
        rx="2"
        stroke="currentColor"
        strokeWidth="2"
      />
      <circle
        cx="9"
        cy="13"
        r="1.5"
        fill="currentColor"
      />
      <circle
        cx="15"
        cy="13"
        r="1.5"
        fill="currentColor"
      />
      <path
        d="M9 17H15"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M12 8V5M10 5H14"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
