interface PeopleIconProps {
  size?: number;
}

export default function PeopleIcon({ size = 24 }: PeopleIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="9"
        cy="7"
        r="3"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M3 21C3 17.686 5.686 15 9 15C12.314 15 15 17.686 15 21"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle
        cx="17"
        cy="7"
        r="2.5"
        stroke="currentColor"
        strokeWidth="2"
      />
      <path
        d="M21 21C21 18.791 19.209 17 17 17C16.5 17 16.02 17.09 15.57 17.25"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
