import { useState, useEffect, useCallback } from "react";
import confetti from "canvas-confetti";

const SPARKLE_CHARS = ["✨", "⭐", "💖", "🌟", "✦", "♡", "★"];
const NYAN_COLORS = ["#ff6b81", "#ffa502", "#fbbf24", "#34d399", "#38bdf8", "#a78bfa"];

/**
 * SparkBurst: renders N particles on trigger, CSS-animated outward burst, auto-cleanup
 */
export function SparkBurst({ trigger, count = 8, originRef }) {
  const [particles, setParticles] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const newParticles = Array.from({ length: count }, (_, i) => {
      const angle = (i / count) * 360 + (Math.random() * 30 - 15);
      const distance = 40 + Math.random() * 40;
      const rad = (angle * Math.PI) / 180;
      return {
        id: `${Date.now()}-${i}`,
        char: SPARKLE_CHARS[Math.floor(Math.random() * SPARKLE_CHARS.length)],
        tx: `${Math.cos(rad) * distance}px`,
        ty: `${Math.sin(rad) * distance}px`,
        size: 10 + Math.random() * 8,
        delay: Math.random() * 0.1,
      };
    });

    setParticles(newParticles);
    const timer = setTimeout(() => setParticles([]), 700);
    return () => clearTimeout(timer);
  }, [trigger, count]);

  if (particles.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
      <div className="relative w-full h-full">
        {particles.map((p) => (
          <span
            key={p.id}
            className="sparkle-particle"
            style={{
              position: "absolute",
              left: "50%",
              top: "50%",
              fontSize: `${p.size}px`,
              "--tx": p.tx,
              "--ty": p.ty,
              animationDelay: `${p.delay}s`,
            }}
          >
            {p.char}
          </span>
        ))}
      </div>
    </div>
  );
}

/**
 * FloatingHearts: 3-5 hearts float up and fade (for encouraging moments)
 */
export function FloatingHearts({ trigger }) {
  const [hearts, setHearts] = useState([]);

  useEffect(() => {
    if (!trigger) return;

    const count = 3 + Math.floor(Math.random() * 3);
    const newHearts = Array.from({ length: count }, (_, i) => ({
      id: `${Date.now()}-${i}`,
      left: 30 + Math.random() * 40,
      delay: i * 0.15,
      size: 14 + Math.random() * 10,
    }));

    setHearts(newHearts);
    const timer = setTimeout(() => setHearts([]), 1500);
    return () => clearTimeout(timer);
  }, [trigger]);

  if (hearts.length === 0) return null;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-visible z-20">
      {hearts.map((h) => (
        <span
          key={h.id}
          className="heart-particle"
          style={{
            left: `${h.left}%`,
            bottom: "20%",
            fontSize: `${h.size}px`,
            animationDelay: `${h.delay}s`,
          }}
        >
          💕
        </span>
      ))}
    </div>
  );
}

/**
 * RainbowExplosion: fires canvas-confetti with nyan colors
 * intensity: "small" | "medium" | "epic"
 */
export function RainbowExplosion({ trigger, intensity = "medium" }) {
  const fire = useCallback(() => {
    if (typeof window === "undefined") return;

    const defaults = {
      colors: NYAN_COLORS,
      disableForReducedMotion: true,
      shapes: ["star", "circle"],
      ticks: 100,
      zIndex: 9999,
    };

    if (intensity === "small") {
      confetti({
        ...defaults,
        particleCount: 30,
        spread: 50,
        origin: { y: 0.7 },
        scalar: 0.8,
      });
    } else if (intensity === "medium") {
      confetti({
        ...defaults,
        particleCount: 60,
        spread: 70,
        origin: { y: 0.6 },
        scalar: 1,
      });
      setTimeout(() => {
        confetti({
          ...defaults,
          particleCount: 30,
          spread: 90,
          origin: { y: 0.65 },
          scalar: 0.8,
        });
      }, 200);
    } else {
      // epic: triple burst
      confetti({
        ...defaults,
        particleCount: 80,
        spread: 100,
        origin: { y: 0.5, x: 0.3 },
        scalar: 1.2,
      });
      setTimeout(() => {
        confetti({
          ...defaults,
          particleCount: 80,
          spread: 100,
          origin: { y: 0.5, x: 0.7 },
          scalar: 1.2,
        });
      }, 200);
      setTimeout(() => {
        confetti({
          ...defaults,
          particleCount: 100,
          spread: 160,
          origin: { y: 0.6, x: 0.5 },
          scalar: 1,
          startVelocity: 45,
        });
      }, 400);
    }
  }, [intensity]);

  useEffect(() => {
    if (trigger) fire();
  }, [trigger, fire]);

  return null;
}
