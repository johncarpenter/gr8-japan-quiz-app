import { useState, useEffect, useCallback } from "react";
import { useApi } from "../hooks/useApi.js";
import ProgressBar from "./ProgressBar.jsx";
import KawaiiCat from "./kawaii/KawaiiCat.jsx";
import { SparkBurst, FloatingHearts, RainbowExplosion } from "./kawaii/ParticleEffects.jsx";

const BUCKET_LABELS = ["Learning", "Reviewing", "Mastered"];
const BUCKET_COLORS = [
  "bg-sakura-200 text-sakura-500",
  "bg-amber-200 text-amber-500",
  "bg-mint-200 text-mint-500",
];

const HAPPY_SPEECH = ["Nyan~!", "Sugoi!", "Pawfect!", "Yatta!", "Meow-velous!", "Purr-fect!", "Nyamazing!"];
const ENCOURAGE_SPEECH = ["Ganbatte!", "You can do it!", "Almost nyan~!", "Don't give up!"];
const STREAK_SPEECH = ["On fire!", "Unstoppable!", "Nyantastic!"];

function pickRandom(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function pickWeightedCard(buckets, lastCardId) {
  const weights = [6, 3, 1];
  const weighted = [];
  buckets.forEach((bucket, bi) => {
    bucket.forEach((card) => {
      for (let i = 0; i < weights[bi]; i++) {
        weighted.push(card);
      }
    });
  });

  const candidates = weighted.filter((c) => c.id !== lastCardId);
  if (candidates.length === 0) {
    return weighted.length > 0 ? weighted[0] : null;
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

export default function FlashMode({ reviewDeck, onClearReviewDeck }) {
  const { get, loading, error } = useApi();
  const [cards, setCards] = useState([]);
  const [buckets, setBuckets] = useState([[], [], []]);
  const [streaks, setStreaks] = useState({});
  const [currentCard, setCurrentCard] = useState(null);
  const [flipped, setFlipped] = useState(false);
  const [lastCardId, setLastCardId] = useState(null);
  const [allMastered, setAllMastered] = useState(false);
  const [isReviewMode, setIsReviewMode] = useState(false);

  // Kawaii state
  const [globalStreak, setGlobalStreak] = useState(0);
  const [lastAction, setLastAction] = useState(null); // "gotit" | "notyet" | null
  const [catMood, setCatMood] = useState("idle");
  const [catSpeech, setCatSpeech] = useState(null);
  const [sparkTrigger, setSparkTrigger] = useState(0);
  const [sparkCount, setSparkCount] = useState(8);
  const [heartTrigger, setHeartTrigger] = useState(0);
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [confettiIntensity, setConfettiIntensity] = useState("medium");
  const [cardWiggle, setCardWiggle] = useState(false);
  const [cardShake, setCardShake] = useState(false);
  const [nyanFly, setNyanFly] = useState(false);

  useEffect(() => {
    if (reviewDeck && reviewDeck.length > 0) {
      initializeDeck(reviewDeck);
      setIsReviewMode(true);
    } else {
      loadCards();
    }
  }, [reviewDeck]);

  async function loadCards() {
    const data = await get("/api/flashcards");
    if (data && data.length > 0) {
      initializeDeck(data);
      setIsReviewMode(false);
    }
  }

  function initializeDeck(deckCards) {
    setCards(deckCards);
    const shuffled = [...deckCards].sort(() => Math.random() - 0.5);
    setBuckets([shuffled, [], []]);
    setStreaks({});
    setAllMastered(false);
    setFlipped(false);
    setLastCardId(null);
    setGlobalStreak(0);
    setLastAction(null);
    setCatMood("idle");
    setCatSpeech(null);
    setNyanFly(false);
    setCurrentCard(shuffled[0] || null);
  }

  function findCardBucket(cardId) {
    for (let b = 0; b < 3; b++) {
      if (buckets[b].some((c) => c.id === cardId)) return b;
    }
    return 0;
  }

  // Trigger kawaii effects based on streak
  function triggerGotItEffects(newStreak) {
    setLastAction("gotit");

    // Card wiggle
    setCardWiggle(true);
    setTimeout(() => setCardWiggle(false), 500);

    if (newStreak >= 7) {
      // Full celebration mode
      setCatMood("celebrating");
      setCatSpeech(`${newStreak}x Streak! ${pickRandom(STREAK_SPEECH)}`);
      setSparkCount(20);
      setSparkTrigger((t) => t + 1);
      setConfettiIntensity("medium");
      setConfettiTrigger((t) => t + 1);
    } else if (newStreak >= 4) {
      // Streak badge + star eyes
      setCatMood("celebrating");
      setCatSpeech(`${newStreak}x! ${pickRandom(HAPPY_SPEECH)}`);
      setSparkCount(14);
      setSparkTrigger((t) => t + 1);
    } else if (newStreak >= 2) {
      // More sparkles, cat double-jump
      setCatMood("happy");
      setCatSpeech(pickRandom(HAPPY_SPEECH));
      setSparkCount(10);
      setSparkTrigger((t) => t + 1);
    } else {
      setCatMood("happy");
      setCatSpeech(pickRandom(HAPPY_SPEECH));
      setSparkCount(8);
      setSparkTrigger((t) => t + 1);
    }

    // Reset mood after delay
    setTimeout(() => {
      setCatMood("idle");
      setCatSpeech(null);
    }, 2200);
  }

  function triggerNotYetEffects() {
    setLastAction("notyet");
    setCatMood("encouraging");
    setCatSpeech(pickRandom(ENCOURAGE_SPEECH));
    setHeartTrigger((t) => t + 1);

    // Gentle shake
    setCardShake(true);
    setTimeout(() => setCardShake(false), 400);

    setTimeout(() => {
      setCatMood("idle");
      setCatSpeech(null);
    }, 2200);
  }

  function triggerAllMasteredEffects() {
    setCatMood("nyan");
    setCatSpeech("PURR-FECT! All mastered! 🌈");
    setConfettiIntensity("epic");
    setConfettiTrigger((t) => t + 1);
    setNyanFly(true);
    setTimeout(() => setNyanFly(false), 2500);
  }

  const handleGotIt = useCallback(() => {
    if (!currentCard || !flipped) return;

    const cardId = currentCard.id;
    const currentBucket = findCardBucket(cardId);
    const newStreaks = { ...streaks, [cardId]: (streaks[cardId] || 0) + 1 };
    setStreaks(newStreaks);

    const newBuckets = buckets.map((b) => [...b]);
    newBuckets[currentBucket] = newBuckets[currentBucket].filter(
      (c) => c.id !== cardId
    );

    const nextBucket = Math.min(currentBucket + 1, 2);
    newBuckets[nextBucket].push(currentCard);
    setBuckets(newBuckets);

    // Update global streak
    const newGlobalStreak = globalStreak + 1;
    setGlobalStreak(newGlobalStreak);

    // Check if all mastered
    if (newBuckets[0].length === 0 && newBuckets[1].length === 0) {
      setAllMastered(true);
      setCurrentCard(null);
      triggerAllMasteredEffects();
      return;
    }

    triggerGotItEffects(newGlobalStreak);

    setLastCardId(cardId);
    setFlipped(false);
    const next = pickWeightedCard(newBuckets, cardId);
    setCurrentCard(next);
  }, [currentCard, flipped, buckets, streaks, globalStreak]);

  const handleNotYet = useCallback(() => {
    if (!currentCard || !flipped) return;

    const cardId = currentCard.id;
    const currentBucket = findCardBucket(cardId);
    const newStreaks = { ...streaks, [cardId]: 0 };
    setStreaks(newStreaks);

    const newBuckets = buckets.map((b) => [...b]);
    newBuckets[currentBucket] = newBuckets[currentBucket].filter(
      (c) => c.id !== cardId
    );
    newBuckets[0].push(currentCard);
    setBuckets(newBuckets);

    setGlobalStreak(0);
    triggerNotYetEffects();

    setLastCardId(cardId);
    setFlipped(false);
    const next = pickWeightedCard(newBuckets, cardId);
    setCurrentCard(next);
  }, [currentCard, flipped, buckets, streaks]);

  const handleFlip = useCallback(() => {
    if (currentCard) setFlipped((f) => !f);
  }, [currentCard]);

  // Keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e) {
      if (e.target.tagName === "INPUT" || e.target.tagName === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        handleFlip();
      } else if (e.code === "ArrowRight") {
        e.preventDefault();
        handleGotIt();
      } else if (e.code === "ArrowLeft") {
        e.preventDefault();
        handleNotYet();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleFlip, handleGotIt, handleNotYet]);

  function handleReset() {
    if (isReviewMode && onClearReviewDeck) {
      onClearReviewDeck();
    }
    if (isReviewMode && reviewDeck?.length > 0) {
      initializeDeck(reviewDeck);
    } else {
      loadCards();
    }
  }

  function handleBackToAllCards() {
    if (onClearReviewDeck) onClearReviewDeck();
    setIsReviewMode(false);
    loadCards();
  }

  if (loading && cards.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="animate-pulse text-text-secondary">Loading flashcards...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-sakura-500 font-semibold">Failed to load flashcards</p>
        <p className="text-sm text-text-secondary mt-1">{error}</p>
        <button
          onClick={loadCards}
          className="mt-4 px-4 py-2 bg-sakura-400 text-white rounded-xl font-bold btn-bounce"
        >
          Retry
        </button>
      </div>
    );
  }

  const totalCards = cards.length;

  // All mastered state
  if (allMastered) {
    return (
      <div className={`text-center py-12 animate-slide-in ${nyanFly ? "animate-bg-rainbow-pulse" : ""}`}>
        <RainbowExplosion trigger={confettiTrigger} intensity="epic" />

        {/* Nyan cat flying across */}
        {nyanFly && (
          <div className="fixed top-1/3 left-0 z-50 animate-nyan-fly pointer-events-none">
            <KawaiiCat mood="nyan" size="lg" />
          </div>
        )}

        <div className="mb-4">
          <KawaiiCat mood="celebrating" size="lg" speechBubble="PURR-FECT! 🌈" />
        </div>
        <h2 className="text-2xl font-extrabold text-text-primary mb-2 animate-bounce-in">
          All Mastered!
        </h2>
        <p className="text-text-secondary mb-6">
          You've mastered all {totalCards} cards. Amazing work!
        </p>
        <div className="flex gap-3 justify-center">
          <button
            onClick={handleReset}
            className="px-6 py-3 bg-gradient-to-r from-sakura-400 to-lavender-400 text-white rounded-xl font-bold btn-bounce"
          >
            Study Again
          </button>
          {isReviewMode && (
            <button
              onClick={handleBackToAllCards}
              className="px-6 py-3 bg-white border-2 border-sakura-200 text-sakura-500 rounded-xl font-bold btn-bounce"
            >
              Back to All Cards
            </button>
          )}
        </div>
      </div>
    );
  }

  if (!currentCard) return null;

  const currentBucket = findCardBucket(currentCard.id);

  // Card animation class
  const cardAnimClass = cardWiggle ? "animate-happy-wiggle" : cardShake ? "animate-gentle-shake" : "";

  return (
    <div className="space-y-4">
      {/* Confetti + hearts layer */}
      <RainbowExplosion trigger={confettiTrigger} intensity={confettiIntensity} />

      {/* Header info */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {BUCKET_LABELS.map((label, i) => (
            <span
              key={i}
              className={`category-pill ${BUCKET_COLORS[i]}`}
            >
              {label}: {buckets[i].length}
            </span>
          ))}
        </div>
        <div className="flex gap-2 items-center">
          {isReviewMode && (
            <span className="category-pill bg-lavender-200 text-lavender-500">
              Review Mode
            </span>
          )}
        </div>
      </div>

      <ProgressBar
        current={buckets[2].length}
        total={totalCards}
        label="Mastered"
        streakActive={globalStreak >= 4}
      />

      {/* Cat mascot + streak badge */}
      <div className="flex items-center justify-center gap-3 relative">
        <div className="relative">
          <KawaiiCat mood={catMood} size="md" speechBubble={catSpeech} />
          <FloatingHearts trigger={heartTrigger} />
        </div>

        {/* Streak badge */}
        {globalStreak >= 4 && (
          <div
            className={`animate-pop-in rounded-full px-3 py-1.5 font-extrabold text-sm flex items-center gap-1 ${
              globalStreak >= 7
                ? "bg-gradient-to-r from-sakura-400 to-lavender-400 text-white rainbow-border"
                : "bg-amber-100 text-amber-600"
            }`}
          >
            <span className={globalStreak >= 7 ? "animate-fire-pulse" : ""}>
              {globalStreak >= 7 ? "🔥" : "⚡"}
            </span>
            {globalStreak}x Streak!
          </div>
        )}
      </div>

      {/* Flashcard */}
      <div
        className={`card-flip-container cursor-pointer relative ${cardAnimClass}`}
        onClick={handleFlip}
        role="button"
        tabIndex={0}
        aria-label={flipped ? "Answer side. Click to flip back." : "Question side. Click to flip."}
      >
        {/* Sparkle burst on card */}
        <SparkBurst trigger={sparkTrigger} count={sparkCount} />

        {/* Rainbow border on card during high streak */}
        <div className={`card-flip-inner ${flipped ? "flipped" : ""}`}>
          {/* Invisible sizer: renders both sides to set container height */}
          <div className="invisible" aria-hidden="true">
            <div className={`p-6 sm:p-8 min-h-[240px] flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                <span className="category-pill">&nbsp;</span>
                <span className="text-xs">&nbsp;</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-lg font-bold text-center leading-relaxed">{currentCard.front}</p>
              </div>
            </div>
            <div className={`p-6 sm:p-8 min-h-[240px] flex flex-col`}>
              <div className="flex justify-between items-start mb-4">
                <span className="category-pill">&nbsp;</span>
                <span className="text-xs">&nbsp;</span>
              </div>
              <div className="flex-1 flex items-center justify-center">
                <p className="text-sm sm:text-base text-center leading-relaxed">{currentCard.back}</p>
              </div>
            </div>
          </div>

          {/* Front */}
          <div className={`card-front absolute inset-0 bg-white rounded-2xl shadow-lg border ${globalStreak >= 7 ? "border-transparent rainbow-border" : "border-sakura-100"} p-6 sm:p-8 flex flex-col`}>
            <div className="flex justify-between items-start mb-4">
              <span className={`category-pill ${BUCKET_COLORS[currentBucket]}`}>
                {currentCard.category}
              </span>
              <span className="text-xs text-text-secondary font-semibold">
                Tap to flip
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-lg font-bold text-center leading-relaxed">
                {currentCard.front}
              </p>
            </div>
          </div>

          {/* Back */}
          <div className={`card-back absolute inset-0 bg-white rounded-2xl shadow-lg border ${globalStreak >= 7 ? "border-transparent rainbow-border" : "border-lavender-200"} p-6 sm:p-8 flex flex-col overflow-y-auto`}>
            <div className="flex justify-between items-start mb-4 shrink-0">
              <span className={`category-pill ${BUCKET_COLORS[currentBucket]}`}>
                {currentCard.category}
              </span>
              <span className="text-xs text-text-secondary font-semibold">
                Tap to flip back
              </span>
            </div>
            <div className="flex-1 flex items-center justify-center">
              <p className="text-sm sm:text-base text-center leading-relaxed text-text-primary">
                {currentCard.back}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex gap-3">
        <button
          onClick={handleNotYet}
          disabled={!flipped}
          className={`flex-1 py-3.5 rounded-xl font-bold text-sm btn-bounce transition-opacity ${
            flipped
              ? "bg-amber-100 text-amber-600 hover:bg-amber-200"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          {"\u2190"} Not Yet
        </button>
        <button
          onClick={handleFlip}
          className="px-6 py-3.5 rounded-xl font-bold text-sm bg-white border-2 border-sakura-200 text-sakura-500 hover:bg-sakura-50 btn-bounce"
        >
          Flip
        </button>
        <button
          onClick={handleGotIt}
          disabled={!flipped}
          className={`flex-1 py-3.5 rounded-xl font-bold text-sm btn-bounce transition-opacity ${
            flipped
              ? "bg-mint-100 text-mint-600 hover:bg-mint-200"
              : "bg-gray-100 text-gray-300 cursor-not-allowed"
          }`}
        >
          Got It {"\u2192"}
        </button>
      </div>

      {/* Keyboard hint */}
      <p className="text-center text-xs text-text-secondary">
        Keyboard: <kbd className="px-1.5 py-0.5 bg-white rounded border border-sakura-100 text-[10px] font-mono">Space</kbd> flip
        {" "}<kbd className="px-1.5 py-0.5 bg-white rounded border border-sakura-100 text-[10px] font-mono">{"\u2190"}</kbd> not yet
        {" "}<kbd className="px-1.5 py-0.5 bg-white rounded border border-sakura-100 text-[10px] font-mono">{"\u2192"}</kbd> got it
      </p>
    </div>
  );
}
