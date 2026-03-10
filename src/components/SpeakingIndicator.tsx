interface SpeakingIndicatorProps {
  label: string;
  color?: "blue" | "orange";
}

const colorClasses = {
  blue: "text-blue-500",
  orange: "text-orange-500",
} as const;

const dotClasses = {
  blue: "bg-blue-500",
  orange: "bg-orange-500",
} as const;

export function SpeakingIndicator({ label, color = "blue" }: SpeakingIndicatorProps) {
  return (
    <div className={`flex items-center gap-1.5 ${colorClasses[color]} text-sm font-medium`}>
      <span className={`w-2 h-2 rounded-full ${dotClasses[color]} animate-bounce`} style={{ animationDelay: "0ms" }} />
      <span className={`w-2 h-2 rounded-full ${dotClasses[color]} animate-bounce`} style={{ animationDelay: "150ms" }} />
      <span className={`w-2 h-2 rounded-full ${dotClasses[color]} animate-bounce`} style={{ animationDelay: "300ms" }} />
      <span className="ml-1">{label}</span>
    </div>
  );
}
