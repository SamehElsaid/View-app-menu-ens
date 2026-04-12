type Props = {
  size?: number;
  className?: string;
};

/** Arrow used in CTAs; flips in RTL via `rtl:rotate-180` */
export default function NoirChevronRight({ size = 16, className = "" }: Props) {
  return (
    <svg
      width={size}
      height={size}
      className={`shrink-0 rtl:rotate-180 ${className}`}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      viewBox="0 0 24 24"
      aria-hidden
    >
      <path d="M5 12h14M12 5l7 7-7 7" />
    </svg>
  );
}
