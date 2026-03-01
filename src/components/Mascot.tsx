
export function Mascot({ className }: { className?: string }) {
  return (
    <div className={`relative flex items-center justify-center ${className}`}>
      {/* Kawaii Mascot Placeholder (e.g., Duolingo Owl style) */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        className="w-full h-full drop-shadow-xl"
      >
        <circle cx="100" cy="100" r="90" fill="#a7f3d0" /> {/* Pastel Green Body */}
        {/* Eyes */}
        <circle cx="65" cy="80" r="15" fill="#1f2937" />
        <circle cx="135" cy="80" r="15" fill="#1f2937" />
        <circle cx="70" cy="75" r="5" fill="#ffffff" />
        <circle cx="140" cy="75" r="5" fill="#ffffff" />
        {/* Blush */}
        <ellipse cx="45" cy="100" rx="10" ry="5" fill="#fca5a5" opacity="0.6" />
        <ellipse cx="155" cy="100" rx="10" ry="5" fill="#fca5a5" opacity="0.6" />
        {/* Beak */}
        <path d="M 90 100 L 110 100 L 100 115 Z" fill="#fbbf24" />
        {/* Leaf on head */}
        <path d="M 100 10 Q 90 -10, 70 15 Q 90 20, 100 10" fill="#34d399" />
      </svg>
    </div>
  );
}
