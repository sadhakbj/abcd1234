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

      {/* Ring 1 — fast inner orbit (10s) */}
      <div className="orbit-flag" style={{ animation: "orbit-1 10s linear infinite" }}>
        <span className="orbit-flag-label">Welcome!</span>
        <span className="orbit-flag-emoji">🇬🇧</span>
      </div>
      <div className="orbit-flag" style={{ animation: "orbit-1 10s linear infinite", animationDelay: "-5s" }}>
        <span className="orbit-flag-label">いらっしゃいませ</span>
        <span className="orbit-flag-emoji">🇯🇵</span>
      </div>

      {/* Ring 2 — medium orbit (16s) */}
      <div className="orbit-flag" style={{ animation: "orbit-2 16s linear infinite" }}>
        <span className="orbit-flag-label">欢迎光临</span>
        <span className="orbit-flag-emoji">🇨🇳</span>
      </div>
      <div className="orbit-flag" style={{ animation: "orbit-2 16s linear infinite", animationDelay: "-8s" }}>
        <span className="orbit-flag-label">환영합니다</span>
        <span className="orbit-flag-emoji">🇰🇷</span>
      </div>

      {/* Ring 3 — slow outer orbit (22s) */}
      <div className="orbit-flag" style={{ animation: "orbit-3 22s linear infinite" }}>
        <span className="orbit-flag-label">Xin chào</span>
        <span className="orbit-flag-emoji">🇻🇳</span>
      </div>
      <div className="orbit-flag" style={{ animation: "orbit-3 22s linear infinite", animationDelay: "-11s" }}>
        <span className="orbit-flag-label">स्वागत छ</span>
        <span className="orbit-flag-emoji">🇳🇵</span>
      </div>
    </div>
  );
}
