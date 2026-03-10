interface VolumeIndicatorProps {
  volumeLevel: number;
  barCount?: number;
}

export function VolumeIndicator({ volumeLevel, barCount = 5 }: VolumeIndicatorProps) {
  return (
    <div className="flex items-end gap-1.5 h-8">
      {Array.from({ length: barCount }).map((_, i) => {
        const threshold = ((i + 1) / barCount) * 100;
        const isActive = volumeLevel >= threshold;
        return (
          <div
            key={i}
            className={`w-2 rounded-full transition-all duration-100 ${
              isActive ? "bg-red-500" : "bg-slate-200"
            }`}
            style={{ height: `${8 + (i + 1) * 4}px` }}
          />
        );
      })}
    </div>
  );
}
