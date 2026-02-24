import { useState, useCallback, useRef, useEffect } from "react";
import FlashMode from "./components/FlashMode.jsx";
import QuizMode from "./components/QuizMode.jsx";
import ExplainMode from "./components/ExplainMode.jsx";
import FloatingBackground from "./components/kawaii/FloatingBackground.jsx";
import KawaiiCat from "./components/kawaii/KawaiiCat.jsx";

const TABS = [
  { id: "flash", label: "Flash", icon: "\u26A1" },
  { id: "explain", label: "Explain", icon: "\uD83D\uDCAC" },
  { id: "quiz", label: "Quiz", icon: "\uD83D\uDCDD" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("flash");
  const [reviewDeck, setReviewDeck] = useState(null);
  const [headerCatMood, setHeaderCatMood] = useState("idle");
  const [nyanTabPos, setNyanTabPos] = useState(null);
  const tabRefs = useRef({});

  const handleReviewMistakes = useCallback((missedCards) => {
    setReviewDeck(missedCards);
    setActiveTab("flash");
  }, []);

  const handleClearReviewDeck = useCallback(() => {
    setReviewDeck(null);
  }, []);

  function handleTabChange(tabId) {
    if (tabId === activeTab) return;

    // Nyan cat tab transition
    const fromEl = tabRefs.current[activeTab];
    const toEl = tabRefs.current[tabId];
    if (fromEl && toEl) {
      const fromRect = fromEl.getBoundingClientRect();
      const toRect = toEl.getBoundingClientRect();
      setNyanTabPos({
        startX: fromRect.left + fromRect.width / 2,
        endX: toRect.left + toRect.width / 2,
        y: fromRect.top + fromRect.height / 2,
      });
      setTimeout(() => setNyanTabPos(null), 500);
    }

    // Flash header cat to happy
    setHeaderCatMood("happy");
    setTimeout(() => setHeaderCatMood("idle"), 1200);

    setActiveTab(tabId);
  }

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Floating background */}
      <FloatingBackground />

      {/* Nyan tab transition */}
      {nyanTabPos && (
        <NyanTabTransition
          startX={nyanTabPos.startX}
          endX={nyanTabPos.endX}
          y={nyanTabPos.y}
        />
      )}

      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sakura-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <div className="flex items-center gap-2">
              <KawaiiCat mood={headerCatMood} size="sm" />
              <h1 className="text-xl font-extrabold tracking-tight">
                <span className="text-sakura-500">Edo</span>{" "}
                <span className="text-lavender-500">Japan</span>{" "}
                <span className="text-sky-500">Study</span>
              </h1>
            </div>
            <span className="text-xs text-text-secondary font-semibold bg-sakura-100 px-2 py-0.5 rounded-full">
              Grade 8
            </span>
          </div>

          {/* Tab Bar */}
          <nav className="flex gap-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                ref={(el) => { tabRefs.current[tab.id] = el; }}
                onClick={() => handleTabChange(tab.id)}
                className={`flex-1 py-2.5 text-sm font-bold rounded-t-lg transition-colors ${
                  activeTab === tab.id
                    ? "text-sakura-500 bg-white tab-active"
                    : "text-text-secondary hover:text-text-primary hover:bg-white/50"
                }`}
              >
                <span className="mr-1.5">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6 relative z-10">
        <div className={activeTab === "flash" ? "" : "hidden"}>
          <FlashMode
            reviewDeck={reviewDeck}
            onClearReviewDeck={handleClearReviewDeck}
          />
        </div>
        <div className={activeTab === "explain" ? "" : "hidden"}>
          <ExplainMode />
        </div>
        <div className={activeTab === "quiz" ? "" : "hidden"}>
          <QuizMode onReviewMistakes={handleReviewMistakes} />
        </div>
      </main>
    </div>
  );
}

/** Mini nyan cat that zips between tabs with rainbow trail */
function NyanTabTransition({ startX, endX, y }) {
  const [pos, setPos] = useState(startX);
  const direction = endX > startX ? 1 : -1;

  useEffect(() => {
    // Animate to endX
    requestAnimationFrame(() => setPos(endX));
  }, [endX]);

  return (
    <div
      className="fixed pointer-events-none z-[60]"
      style={{
        left: pos,
        top: y - 10,
        transition: "left 0.4s ease-in-out",
        transform: `scaleX(${direction})`,
      }}
    >
      <div className="relative">
        {/* Rainbow trail */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-3 rainbow-trail rounded-full"
          style={{
            width: "40px",
            right: direction === 1 ? "100%" : "auto",
            left: direction === -1 ? "100%" : "auto",
          }}
        />
        <span className="text-lg">😺</span>
      </div>
    </div>
  );
}
