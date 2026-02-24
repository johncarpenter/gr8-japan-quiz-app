import { useState, useEffect, useRef, lazy, Suspense } from "react";
import Lottie from "lottie-react";

import idleData from "../../assets/lottie/idle.json";
import happyData from "../../assets/lottie/happy.json";
import celebratingData from "../../assets/lottie/celebrating.json";
import encouragingData from "../../assets/lottie/encouraging.json";
import nyanData from "../../assets/lottie/nyan.json";
import thinkingData from "../../assets/lottie/thinking.json";

const ANIMATIONS = {
  idle: idleData,
  happy: happyData,
  celebrating: celebratingData,
  encouraging: encouragingData,
  nyan: nyanData,
  thinking: thinkingData,
};

const SIZES = {
  sm: 48,
  md: 80,
  lg: 96,
};

// Moods that should loop continuously
const LOOPING_MOODS = new Set(["idle", "nyan", "thinking"]);

export default function KawaiiCat({ mood = "idle", size = "md", speechBubble = null }) {
  const [showBubble, setShowBubble] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const lottieRef = useRef(null);

  useEffect(() => {
    if (speechBubble) {
      setBubbleText(speechBubble);
      setShowBubble(true);
      const timer = setTimeout(() => setShowBubble(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [speechBubble]);

  // Restart animation when mood changes
  useEffect(() => {
    if (lottieRef.current) {
      lottieRef.current.goToAndPlay(0);
    }
  }, [mood]);

  const dimension = SIZES[size] || SIZES.md;
  const animationData = ANIMATIONS[mood] || ANIMATIONS.idle;

  return (
    <div
      className="relative inline-flex flex-col items-center"
      style={{ width: dimension, minHeight: dimension + (showBubble ? 30 : 0) }}
    >
      {/* Speech bubble */}
      {showBubble && bubbleText && (
        <div
          className="animate-speech-bubble absolute -top-1 left-1/2 -translate-x-1/2 bg-white border-2 border-sakura-200 rounded-xl px-2.5 py-1 text-xs font-bold text-sakura-500 whitespace-nowrap shadow-sm z-10"
          style={{ marginTop: size === "sm" ? "-20px" : "-28px" }}
        >
          {bubbleText}
          <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white border-b-2 border-r-2 border-sakura-200 rotate-45" />
        </div>
      )}

      {/* Lottie animation */}
      <Lottie
        lottieRef={lottieRef}
        animationData={animationData}
        loop={LOOPING_MOODS.has(mood)}
        autoplay
        style={{ width: dimension, height: dimension }}
        aria-label={`Kawaii cat feeling ${mood}`}
        role="img"
      />
    </div>
  );
}
