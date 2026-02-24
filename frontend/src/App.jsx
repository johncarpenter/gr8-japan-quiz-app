import { useState, useCallback } from "react";
import FlashMode from "./components/FlashMode.jsx";
import QuizMode from "./components/QuizMode.jsx";
import ExplainMode from "./components/ExplainMode.jsx";

const TABS = [
  { id: "flash", label: "Flash", icon: "\u26A1" },
  { id: "explain", label: "Explain", icon: "\uD83D\uDCAC" },
  { id: "quiz", label: "Quiz", icon: "\uD83D\uDCDD" },
];

export default function App() {
  const [activeTab, setActiveTab] = useState("flash");
  const [reviewDeck, setReviewDeck] = useState(null);

  const handleReviewMistakes = useCallback((missedCards) => {
    setReviewDeck(missedCards);
    setActiveTab("flash");
  }, []);

  const handleClearReviewDeck = useCallback(() => {
    setReviewDeck(null);
  }, []);

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-sakura-200 sticky top-0 z-50">
        <div className="max-w-3xl mx-auto px-4">
          <div className="flex items-center justify-between py-3">
            <h1 className="text-xl font-extrabold tracking-tight">
              <span className="text-sakura-500">Edo</span>{" "}
              <span className="text-lavender-500">Japan</span>{" "}
              <span className="text-sky-500">Study</span>
            </h1>
            <span className="text-xs text-text-secondary font-semibold bg-sakura-100 px-2 py-0.5 rounded-full">
              Grade 8
            </span>
          </div>

          {/* Tab Bar */}
          <nav className="flex gap-1 -mb-px">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
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

      {/* Content Area — all modes stay mounted for state preservation */}
      <main className="flex-1 max-w-3xl mx-auto w-full px-4 py-6">
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
