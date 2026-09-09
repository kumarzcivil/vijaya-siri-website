import { useEffect, useState } from "react";

/**
 * Vijaya Siri — Premium Service Provider Splash
 *
 * Uses the REAL brand logo.
 *
 * Visual direction:
 * - Premium service-provider feel
 * - Architectural / construction identity
 * - Cinematic but not Netflix-like
 * - Warm ivory + navy + orange
 * - Real logo as the hero
 * - Subtle depth / zoom animation
 * - Smooth transition into website
 */

export default function VijayaSiriSplash({
  onFinish,
  minDuration = 2800,
}) {
  const [exiting, setExiting] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const exitTimer = setTimeout(() => {
      setExiting(true);
    }, minDuration);

    const hideTimer = setTimeout(() => {
      setHidden(true);
      onFinish?.();
    }, minDuration + 750);

    return () => {
      clearTimeout(exitTimer);
      clearTimeout(hideTimer);
    };
  }, [minDuration, onFinish]);

  if (hidden) return null;

  return (
    <div
      className={`vs-splash ${
        exiting ? "vs-exiting" : ""
      }`}
      role="status"
      aria-label="Loading Vijaya Siri"
    >
      <style>{`

        @import url(
          'https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&display=swap'
        );

        /* =====================================================
           ROOT
        ===================================================== */

        .vs-splash {
          position: fixed;

          inset: 0;

          z-index: 99999;

          display: flex;

          align-items: center;
          justify-content: center;

          overflow: hidden;

          background: #F7F5F1;

          perspective: 1600px;

          animation:
            vsFadeIn
            0.5s
            ease-out
            both;
        }

        /* =====================================================
           ARCHITECTURAL BACKGROUND
        ===================================================== */

        .vs-architecture {
          position: absolute;

          inset: 0;

          pointer-events: none;

          opacity: 0;

          animation:
            vsArchitectureIn
            1.2s
            0.15s
            ease-out
            forwards;
        }

        /*
         * Blueprint grid
         */

        .vs-grid {
          position: absolute;

          inset: -15%;

          background-image:
            linear-gradient(
              rgba(21,35,64,0.035) 1px,
              transparent 1px
            ),
            linear-gradient(
              90deg,
              rgba(21,35,64,0.035) 1px,
              transparent 1px
            );

          background-size: 65px 65px;

          mask-image:
            radial-gradient(
              ellipse at center,
              black 0%,
              transparent 72%
            );

          animation:
            vsGridMove
            22s
            linear
            infinite;
        }

        /*
         * Architectural circles
         */

        .vs-circle {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 700px;
          height: 700px;

          transform:
            translate(-50%, -50%);

          border:
            1px solid
            rgba(21,35,64,0.045);

          border-radius: 50%;
        }

        .vs-circle::before {
          content: "";

          position: absolute;

          inset: 65px;

          border:
            1px dashed
            rgba(21,35,64,0.045);

          border-radius: 50%;
        }

        .vs-circle::after {
          content: "";

          position: absolute;

          top: 50%;
          left: -80px;

          width: calc(100% + 160px);

          height: 1px;

          background:
            rgba(21,35,64,0.035);
        }

        /* =====================================================
           ORANGE AMBIENT LIGHT
        ===================================================== */

        .vs-orange-light {
          position: absolute;

          left: 50%;
          top: 50%;

          width: 420px;
          height: 420px;

          transform:
            translate(-50%, -50%);

          border-radius: 50%;

          background:
            radial-gradient(
              circle,
              rgba(232,111,37,0.13),
              transparent 68%
            );

          filter: blur(40px);

          opacity: 0;

          animation:
            vsOrangeLight
            2s
            0.2s
            ease-out
            forwards;
        }

        /* =====================================================
           MAIN STAGE
        ===================================================== */

        .vs-stage {
          position: relative;

          display: flex;

          flex-direction: column;

          align-items: center;

          justify-content: center;

          transform-style: preserve-3d;

          /*
           * This is the main cinematic movement.
           *
           * Starts close to viewer.
           * Moves backward into screen.
           */
          animation:
            vsStageIn
            1.45s
            cubic-bezier(.16,1,.3,1)
            both;
        }

        /* =====================================================
           REAL BRAND LOGO
        ===================================================== */

        .vs-logo-wrap {
          position: relative;

          display: flex;

          align-items: center;

          justify-content: center;

          transform-style: preserve-3d;

          opacity: 0;

          animation:
            vsLogoIn
            1s
            0.25s
            cubic-bezier(.16,1,.3,1)
            forwards;
        }

        .vs-logo {
          display: block;

          /*
           * Change this path to your
           * actual logo.
           */
          width: min(
            360px,
            70vw
          );

          max-height: 150px;

          object-fit: contain;

          object-position: center;

          filter:
            drop-shadow(
              0 14px 28px
              rgba(21,35,64,0.12)
            );
        }

        /*
         * Soft ring behind logo
         */

        .vs-logo-ring {
          position: absolute;

          width: 260px;
          height: 260px;

          border-radius: 50%;

          border:
            1px solid
            rgba(232,111,37,0.12);

          opacity: 0;

          transform: scale(0.8);

          animation:
            vsRing
            1.4s
            0.55s
            cubic-bezier(.16,1,.3,1)
            forwards;
        }

        .vs-logo-ring::before {
          content: "";

          position: absolute;

          inset: 16px;

          border:
            1px dashed
            rgba(21,35,64,0.07);

          border-radius: 50%;
        }

        /* =====================================================
           ORANGE ACCENT
        ===================================================== */

        .vs-accent {
          width: 0;

          height: 3px;

          margin-top: 28px;

          border-radius: 10px;

          background: #E86F25;

          box-shadow:
            0 0 18px
            rgba(232,111,37,0.25);

          animation:
            vsAccent
            0.65s
            1.35s
            cubic-bezier(.16,1,.3,1)
            forwards;
        }

        /* =====================================================
           TAGLINE
        ===================================================== */

        .vs-tagline {
          margin-top: 20px;

          font-family:
            "DM Sans",
            sans-serif;

          font-size:
            clamp(11px, 1.5vw, 14px);

          font-weight: 500;

          letter-spacing: 0.12em;

          text-transform: uppercase;

          color: #697183;

          opacity: 0;

          transform: translateY(12px);

          animation:
            vsTagline
            0.6s
            1.55s
            ease-out
            forwards;
        }

        /* =====================================================
           SERVICE PROVIDER MESSAGE
        ===================================================== */

        .vs-message {
          margin-top: 8px;

          font-family:
            "DM Sans",
            sans-serif;

          font-size: 10px;

          letter-spacing: 0.04em;

          color: #A1A4AA;

          opacity: 0;

          animation:
            vsMessage
            0.55s
            1.75s
            ease-out
            forwards;
        }

        /* =====================================================
           LOADING
        ===================================================== */

        .vs-loading {
          position: fixed;

          left: 50%;

          bottom: 55px;

          width: min(
            230px,
            55vw
          );

          transform:
            translateX(-50%);

          opacity: 0;

          animation:
            vsLoading
            0.5s
            1.9s
            ease-out
            forwards;
        }

        .vs-loading-label {
          display: flex;

          justify-content: space-between;

          margin-bottom: 9px;

          font-family:
            "DM Sans",
            sans-serif;

          font-size: 8px;

          font-weight: 600;

          letter-spacing: 0.14em;

          text-transform: uppercase;

          color: #A5A7AD;
        }

        .vs-loading-status {
          color: #E86F25;
        }

        .vs-progress {
          width: 100%;

          height: 3px;

          overflow: hidden;

          border-radius: 10px;

          background: #E8E4DD;
        }

        .vs-progress-fill {
          width: 0;

          height: 100%;

          border-radius: inherit;

          background: #E86F25;

          animation:
            vsProgress
            2.45s
            0.2s
            cubic-bezier(.3,.6,.3,1)
            forwards;
        }

        /* =====================================================
           SMALL BRAND FOOTER
        ===================================================== */

        .vs-footer {
          position: fixed;

          left: 50%;

          bottom: 20px;

          transform:
            translateX(-50%);

          font-family:
            "DM Sans",
            sans-serif;

          font-size: 7px;

          font-weight: 600;

          letter-spacing: 0.22em;

          color: #C2C1BF;

          opacity: 0;

          animation:
            vsFooter
            0.5s
            2s
            ease-out
            forwards;
        }

        /* =====================================================
           EXIT
        ===================================================== */

        .vs-exiting {
          animation:
            vsExitScene
            0.8s
            ease-in
            forwards;
        }

        .vs-exiting .vs-stage {
          animation:
            vsStageOut
            0.8s
            cubic-bezier(.5,0,.7,1)
            forwards;
        }

        .vs-exiting .vs-orange-light {
          animation:
            vsLightOut
            0.8s
            ease-in
            forwards;
        }

        /* =====================================================
           ENTRANCE ANIMATION
        ===================================================== */

        @keyframes vsStageIn {

          0% {
            opacity: 0;

            transform:
              perspective(1400px)
              translateZ(420px)
              scale(1.45);
          }

          25% {
            opacity: 1;

            transform:
              perspective(1400px)
              translateZ(250px)
              scale(1.28);
          }

          55% {
            transform:
              perspective(1400px)
              translateZ(100px)
              scale(1.12);
          }

          78% {
            transform:
              perspective(1400px)
              translateZ(25px)
              scale(1.025);
          }

          100% {
            opacity: 1;

            transform:
              perspective(1400px)
              translateZ(0)
              scale(1);
          }
        }

        @keyframes vsLogoIn {

          0% {
            opacity: 0;

            transform:
              scale(1.25);
          }

          35% {
            opacity: 1;

            transform:
              scale(1.1);
          }

          100% {
            opacity: 1;

            transform:
              scale(1);
          }
        }

        @keyframes vsRing {

          from {
            opacity: 0;

            transform:
              scale(0.75);
          }

          to {
            opacity: 1;

            transform:
              scale(1);
          }
        }

        @keyframes vsAccent {

          from {
            width: 0;
          }

          to {
            width: 85px;
          }
        }

        @keyframes vsTagline {

          from {
            opacity: 0;

            transform:
              translateY(12px);
          }

          to {
            opacity: 1;

            transform:
              translateY(0);
          }
        }

        @keyframes vsMessage {

          from {
            opacity: 0;

            transform:
              translateY(8px);
          }

          to {
            opacity: 1;

            transform:
              translateY(0);
          }
        }

        @keyframes vsLoading {

          from {
            opacity: 0;

            transform:
              translateX(-50%)
              translateY(8px);
          }

          to {
            opacity: 1;

            transform:
              translateX(-50%)
              translateY(0);
          }
        }

        @keyframes vsProgress {

          from {
            width: 0;
          }

          to {
            width: 100%;
          }
        }

        @keyframes vsFooter {

          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        @keyframes vsArchitectureIn {

          from {
            opacity: 0;

            transform: scale(1.08);
          }

          to {
            opacity: 1;

            transform: scale(1);
          }
        }

        @keyframes vsOrangeLight {

          0% {
            opacity: 0;

            transform:
              translate(-50%, -50%)
              scale(0.5);
          }

          100% {
            opacity: 1;

            transform:
              translate(-50%, -50%)
              scale(1);
          }
        }

        @keyframes vsGridMove {

          from {
            transform:
              translate(0, 0);
          }

          to {
            transform:
              translate(65px, 65px);
          }
        }

        /* =====================================================
           EXIT ANIMATION
        ===================================================== */

        @keyframes vsStageOut {

          0% {
            opacity: 1;

            transform:
              perspective(1400px)
              translateZ(0)
              scale(1);
          }

          30% {
            opacity: 1;

            transform:
              perspective(1400px)
              translateZ(80px)
              scale(1.08);
          }

          100% {
            opacity: 0;

            transform:
              perspective(1400px)
              translateZ(500px)
              scale(1.5);

            filter: blur(10px);
          }
        }

        @keyframes vsLightOut {

          from {
            opacity: 1;
          }

          to {
            opacity: 0;

            transform:
              translate(-50%, -50%)
              scale(1.5);
          }
        }

        @keyframes vsExitScene {

          from {
            opacity: 1;
          }

          to {
            opacity: 0;
          }
        }

        @keyframes vsFadeIn {

          from {
            opacity: 0;
          }

          to {
            opacity: 1;
          }
        }

        /* =====================================================
           MOBILE
        ===================================================== */

        @media (max-width: 600px) {

          .vs-logo {
            width: 280px;
            max-height: 110px;
          }

          .vs-logo-ring {
            width: 210px;
            height: 210px;
          }

          .vs-tagline {
            font-size: 9px;

            letter-spacing: 0.1em;
          }

          .vs-message {
            font-size: 9px;
          }

          .vs-circle {
            width: 470px;
            height: 470px;
          }

          .vs-loading {
            bottom: 48px;
          }
        }

        /* =====================================================
           REDUCED MOTION
        ===================================================== */

        @media (prefers-reduced-motion: reduce) {

          *,
          *::before,
          *::after {
            animation-duration:
              0.01ms !important;

            animation-iteration-count:
              1 !important;
          }

        }

      `}</style>

      {/* =====================================================
          BACKGROUND
      ===================================================== */}

      <div className="vs-architecture">

        <div className="vs-grid" />

        <div className="vs-circle" />

      </div>

      <div className="vs-orange-light" />

      {/* =====================================================
          MAIN LOGO
      ===================================================== */}

      <div className="vs-stage">

        <div className="vs-logo-wrap">

          <div className="vs-logo-ring" />

          {/* ================================================
              YOUR REAL LOGO
              
              Change /logo.png to your actual logo path.
          ================================================= */}

          <img
            src="/logo.png"
            alt="Vijaya Siri"
            className="vs-logo"
          />

        </div>

        {/* Orange architectural accent */}
        <div className="vs-accent" />

        {/* Main brand statement */}
        <div className="vs-tagline">
          Building Trust, Crafting Homes.
        </div>

        {/* Service-provider message */}
        <div className="vs-message">
          Your trusted partner for quality home services
        </div>

      </div>

      {/* =====================================================
          LOADING
      ===================================================== */}

      <div className="vs-loading">

        <div className="vs-loading-label">

          <span>
            Preparing your experience
          </span>

          <span className="vs-loading-status">
            Loading
          </span>

        </div>

        <div className="vs-progress">

          <div className="vs-progress-fill" />

        </div>

      </div>

      {/* Footer */}
      <div className="vs-footer">
        VIJAYA SIRI • QUALITY • TRUST
      </div>

    </div>
  );
}


/* =========================================================
   DEMO
========================================================= */

export function SplashDemo() {

  const [ready, setReady] = useState(false);

  return (
    <div
      className="min-h-screen"
      style={{
        background: "#F7F5F1",
      }}
    >

      {!ready && (
        <VijayaSiriSplash
          onFinish={() => setReady(true)}
        />
      )}

      {ready && (
        <div
          className="
            flex
            min-h-screen
            items-center
            justify-center
          "
        >
          <p
            style={{
              fontFamily:
                "DM Sans, sans-serif",

              color: "#152340",
            }}
          >
            App content goes here.
          </p>
        </div>
      )}

    </div>
  );
}