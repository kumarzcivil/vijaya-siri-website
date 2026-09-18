import { useEffect, useState } from "react";

export default function VijayaSiriSplash({
  onFinish,
  minDuration = 5000,
}: {
  onFinish?: () => void;
  minDuration?: number;
}) {
  const [exit, setExit] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => setExit(true), minDuration);
    const hideTimer = setTimeout(() => {
      setHidden(true);
      onFinish?.();
    }, minDuration + 650);
    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [minDuration, onFinish]);

  if (hidden) return null;

  return (
    <div
      className={`vs-splash ${exit ? "vs-exit" : ""}`}
      role="status"
      aria-label="Loading Vijaya Siri"
    >
      <style>{`
        .vs-splash {
          position: fixed;
          inset: 0;
          z-index: 9999;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          background: #F7F5F1;
          animation: vsFadeIn .4s ease both;
        }
        .vs-splash.vs-exit {
          animation: vsFadeOut .6s ease both;
        }
        @keyframes vsFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes vsFadeOut { from { opacity: 1; } to { opacity: 0; } }

        @keyframes vsDraw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes vsPop {
          0% { opacity: 0; transform: scale(.6); }
          70% { opacity: 1; transform: scale(1.08); }
          100% { opacity: 1; transform: scale(1); }
        }
        @keyframes vsRise {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes vsLine {
          to { transform: scaleX(1); }
        }
        @keyframes vsGlow {
          0%, 100% { opacity: .35; }
          50% { opacity: .75; }
        }
        @keyframes vsBarFill {
          from { width: 0%; }
          to   { width: 100%; }
        }
        @keyframes vsDotPulse {
          0%, 100% { opacity: .3; transform: translateY(0); }
          50% { opacity: 1; transform: translateY(-3px); }
        }

        .vs-house-path {
          stroke-dasharray: 520;
          stroke-dashoffset: 520;
          animation: vsDraw 1.1s cubic-bezier(.65,.05,.36,1) .15s forwards;
        }
        .vs-house-roof {
          opacity: 0;
          animation: vsPop .45s ease-out 1.15s forwards;
        }
        .vs-glow {
          animation: vsGlow 2.4s ease-in-out infinite;
        }
        .vs-word-a { opacity: 0; animation: vsRise .5s ease-out 1.3s forwards; }
        .vs-word-b { opacity: 0; animation: vsRise .5s ease-out 1.45s forwards; }
        .vs-foundation {
          transform: scaleX(0);
          transform-origin: center;
          animation: vsLine .5s ease-out 1.65s forwards;
        }
        .vs-tagline { opacity: 0; animation: vsRise .5s ease-out 1.85s forwards; }
        .vs-bar-track { opacity: 0; animation: vsRise .4s ease-out 2s forwards; }
        .vs-bar-fill {
          width: 0%;
          animation: vsBarFill ${Math.max(minDuration - 1000, 1600)}ms cubic-bezier(.3,.6,.3,1) .35s forwards;
        }
        .vs-dot { animation: vsDotPulse 1.2s ease-in-out infinite; }
        .vs-dot:nth-child(2) { animation-delay: .15s; }
        .vs-dot:nth-child(3) { animation-delay: .3s; }

        @media (prefers-reduced-motion: reduce) {
          .vs-splash, .vs-house-path, .vs-house-roof, .vs-word-a, .vs-word-b,
          .vs-foundation, .vs-tagline, .vs-bar-track, .vs-glow, .vs-dot {
            animation: none !important;
            opacity: 1 !important;
            transform: none !important;
            stroke-dashoffset: 0 !important;
          }
          .vs-bar-fill { width: 100% !important; }
        }
      `}</style>

      <div
        className="vs-glow"
        style={{
          position: "absolute",
          width: 380,
          height: 380,
          borderRadius: "50%",
          background: "#E06B2A",
          filter: "blur(60px)",
          pointerEvents: "none",
        }}
      />

      <div
        style={{
          position: "relative",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "0 2rem",
        }}
      >
        <svg
          width="88"
          height="76"
          viewBox="0 0 120 100"
          style={{ position: "relative" }}
        >
          <g
            fill="none"
            stroke="#F6F2E9"
            strokeWidth="6"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path
              className="vs-house-path"
              d="M20,92 L20,44 L60,12 L100,44 L100,92 L20,92"
            />
          </g>
          <polygon
            className="vs-house-roof"
            points="14,48 60,10 106,48"
            fill="#E06B2A"
          />
          <rect
            className="vs-house-roof"
            x="48"
            y="60"
            width="24"
            height="32"
            fill="#F6F2E9"
          />
        </svg>

        <h1
          style={{
            fontFamily: "'Fraunces', ui-serif, Georgia, serif",
            fontSize: "clamp(2.25rem, 6vw, 3rem)",
            fontWeight: 700,
            letterSpacing: "-0.01em",
            marginTop: "1.5rem",
            display: "flex",
            gap: "0.5rem",
          }}
        >
          <span className="vs-word-a" style={{ color: "#152340" }}>
            Vijaya
          </span>

          <span className="vs-word-b" style={{ color: "#E86F25" }}>
            Siri
          </span>
        </h1>

        <div
          className="vs-foundation"
          style={{
            marginTop: "0.75rem",
            height: 3,
            width: 160,
            borderRadius: 2,
            background: "#E06B2A",
          }}
        />

        <p
          className="vs-tagline"
          style={{
            fontFamily: "'Inter', ui-sans-serif, system-ui, sans-serif",
            marginTop: "1rem",
            fontSize: "0.875rem",
            letterSpacing: "0.05em",
            color: "#E06B2A",
          }}
        >
          Building Trust, Crafting Homes.
        </p>

        <div
          className="vs-bar-track"
          style={{
            marginTop: "2.25rem",
            width: 192,
            height: 6,
            borderRadius: 999,
            overflow: "hidden",
            background: "rgba(246,242,233,0.15)",
          }}
        >
          <div
            className="vs-bar-fill"
            style={{ height: "100%", borderRadius: 999, background: "#E06B2A" }}
          />
        </div>

        <div style={{ marginTop: "1rem", display: "flex", gap: 6 }}>
          <span
            className="vs-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#F6F2E9",
            }}
          />
          <span
            className="vs-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#F6F2E9",
            }}
          />
          <span
            className="vs-dot"
            style={{
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "#F6F2E9",
            }}
          />
        </div>
      </div>
    </div>
  );
}
