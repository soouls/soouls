export function ButterflyLogo({
  className = 'w-6 h-6',
  style,
}: { className?: string; style?: React.CSSProperties }) {
  return (
    <svg viewBox="0 0 100 100" fill="currentColor" className={className} style={style}>
      <path d="M50,50 C50,50 38,20 22,24 C6,28 8,52 50,50 Z" />
      <path d="M50,50 C50,50 62,20 78,24 C94,28 92,52 50,50 Z" />
      <path d="M50,50 C50,50 38,80 22,76 C6,72 8,48 50,50 Z" />
      <path d="M50,50 C50,50 62,80 78,76 C94,72 92,48 50,50 Z" />
    </svg>
  );
}
