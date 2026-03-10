import { Mascot } from "./Mascot";

export function OrbitHero() {
  return (
    <div className="relative flex items-center justify-center mb-10" style={{ width: 400, height: 400 }}>
      {/* Orbit rings */}
      <div className="orbit-ring orbit-ring-1" />
      <div className="orbit-ring orbit-ring-2" />
      <div className="orbit-ring orbit-ring-3" />

      {/* Glow behind mascot */}
      <div
        className="absolute rounded-full bg-gradient-to-br from-blue-200 via-indigo-200 to-purple-200"
        style={{ width: 160, height: 160, top: "50%", left: "50%", marginTop: -80, marginLeft: -80, animation: "glow-pulse 3s ease-in-out infinite", filter: "blur(20px)" }}
      />

      {/* Mascot center */}
      <div className="absolute z-20" style={{ top: "50%", left: "50%", marginTop: -70, marginLeft: -70, animation: "mascot-float 3s ease-in-out infinite" }}>
        <Mascot className="w-36 h-36 drop-shadow-lg" />
      </div>

      {/* 3 flags evenly spaced on one orbit */}
      <div className="orbit-flag" style={{ animation: "orbit-2 14s linear infinite" }}>
        <span className="orbit-flag-label">Welcome!</span>
        <span className="orbit-flag-emoji">🇬🇧</span>
      </div>
      <div className="orbit-flag" style={{ animation: "orbit-2 14s linear infinite", animationDelay: "-4.67s" }}>
        <span className="orbit-flag-label">いらっしゃいませ</span>
        <span className="orbit-flag-emoji">🇯🇵</span>
      </div>
      <div className="orbit-flag" style={{ animation: "orbit-2 14s linear infinite", animationDelay: "-9.33s" }}>
        <span className="orbit-flag-label">स्वागत छ</span>
        <span className="orbit-flag-emoji">🇳🇵</span>
      </div>
    </div>
  );
}
