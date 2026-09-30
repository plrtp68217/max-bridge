type IconProps = {
  size?: number;
  className?: string;
};

function base(size: number, className?: string) {
  return {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    className,
    "aria-hidden": true,
  };
}

export function ChatsIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4.2A8 8 0 1 1 20 12z" />
    </svg>
  );
}

export function ContactsIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="9" cy="8" r="3.2" />
      <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
      <path d="M16 6.2a3 3 0 0 1 0 5.6M17.5 19a5.6 5.6 0 0 0-2.2-4.4" />
    </svg>
  );
}

export function PhoneIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M5 3.8h3l1.4 3.6-2 1.4a11 11 0 0 0 5.4 5.4l1.4-2 3.6 1.4v3a1.6 1.6 0 0 1-1.8 1.6A15.6 15.6 0 0 1 3.4 5.6 1.6 1.6 0 0 1 5 3.8z" />
    </svg>
  );
}

export function VideoIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <rect x="3" y="6" width="12" height="12" rx="3" />
      <path d="M15 11l5-3v8l-5-3z" />
    </svg>
  );
}

export function SettingsIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8l1.4 2.4 2.7-.5.6 2.7 2.5 1.2-1.2 2.5 1.2 2.5-2.5 1.2-.6 2.7-2.7-.5L12 21.2l-1.4-2.4-2.7.5-.6-2.7-2.5-1.2 1.2-2.5-1.2-2.5 2.5-1.2.6-2.7 2.7.5z" />
    </svg>
  );
}

export function SearchIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="M16 16l4 4" />
    </svg>
  );
}

export function PlusIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2.2}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

export function BackIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M15 5l-7 7 7 7" />
    </svg>
  );
}

export function SendIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2}>
      <path d="M5 12h13M12 5l7 7-7 7" />
    </svg>
  );
}

export function TrashIcon({ size = 18, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M4 7h16M10 7V5h4v2M6 7l1 12h10l1-12" />
    </svg>
  );
}

export function LogoutIcon({ size = 20, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <path d="M14 4h4a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2h-4" />
      <path d="M10 8l-4 4 4 4M6 12h10" />
    </svg>
  );
}

/** Одна галочка — отправлено, две — доставлено/прочитано. */
export function CheckIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2}>
      <path d="M4.5 12.5l4 4 10-10" />
    </svg>
  );
}

export function DoubleCheckIcon({ size = 16, className }: IconProps) {
  return (
    <svg {...base(size, className)} strokeWidth={2}>
      <path d="M2 12.5l4 4 9-9" />
      <path d="M11 16.5l1.5 1.5 9-9" />
    </svg>
  );
}

export function ClockIcon({ size = 14, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 7.5V12l3 2" />
    </svg>
  );
}

export function AlertIcon({ size = 14, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7.5v5M12 16h.01" />
    </svg>
  );
}

export function EmojiIcon({ size = 22, className }: IconProps) {
  return (
    <svg {...base(size, className)}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M9 10h.01M15 10h.01M8.5 14a4 4 0 0 0 7 0" />
    </svg>
  );
}
