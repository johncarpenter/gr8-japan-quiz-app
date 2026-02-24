import { useState, useEffect } from "react";
import KawaiiCat from "./kawaii/KawaiiCat.jsx";
import { SparkBurst, FloatingHearts, RainbowExplosion } from "./kawaii/ParticleEffects.jsx";

export default function ScoreCard({ results, questions, onReviewMistakes, onTryAgain }) {
  const total = results.length;
  const correct = results.filter((r) => r.correct).length;
  const pct = total > 0 ? Math.round((correct / total) * 100) : 0;

  // Kawaii state
  const [confettiTrigger, setConfettiTrigger] = useState(0);
  const [sparkTrigger, setSparkTrigger] = useState(0);
  const [heartTrigger, setHeartTrigger] = useState(0);
  const [nyanFly, setNyanFly] = useState(false);

  // Determine tier
  const tier = pct === 100 ? "perfect" : pct >= 80 ? "great" : pct >= 50 ? "good" : "encourage";

  // Fire celebrations on mount
  useEffect(() => {
    const timer = setTimeout(() => {
      if (tier === "perfect") {
        setConfettiTrigger(1);
        setNyanFly(true);
        setTimeout(() => setNyanFly(false), 2500);
      } else if (tier === "great") {
        setConfettiTrigger(1);
      } else if (tier === "good") {
        setSparkTrigger(1);
      } else {
        setHeartTrigger(1);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  const catMood = tier === "perfect" ? "nyan" : tier === "great" ? "celebrating" : tier === "good" ? "happy" : "encouraging";
  const catSpeech = tier === "perfect" ? "PURR-FECT SCORE!" : tier === "great" ? "Amazing nyan~!" : tier === "good" ? "Good job!" : "You can do it!";
  const confettiIntensity = tier === "perfect" ? "epic" : tier === "great" ? "medium" : "small";

  // Category breakdown
  const byCategory = {};
  results.forEach((r) => {
    const cat = r.category || "Other";
    if (!byCategory[cat]) byCategory[cat] = { correct: 0, total: 0 };
    byCategory[cat].total++;
    if (r.correct) byCategory[cat].correct++;
  });

  // Missed questions
  const missed = results
    .map((r, i) => ({ ...r, question: questions[i] }))
    .filter((r) => !r.correct);

  function handleReview() {
    const flashcards = missed.map((m) => ({
      id: `review-${m.question.id}`,
      category: m.question.category,
      front: m.question.question,
      back:
        m.question.type === "multiple_choice"
          ? `${m.question.options[m.question.correct]}\n\n${m.question.explanation}`
          : `${m.question.expected_answer}\n\n${m.question.explanation}`,
      difficulty: m.question.difficulty,
    }));
    onReviewMistakes(flashcards);
  }

  // Color based on score
  let accentColor = "text-mint-500";
  let bgColor = "bg-mint-100";
  if (pct < 50) {
    accentColor = "text-sakura-500";
    bgColor = "bg-sakura-100";
  } else if (pct < 80) {
    accentColor = "text-amber-500";
    bgColor = "bg-amber-100";
  }

  return (
    <div className="space-y-6 animate-slide-in">
      {/* Confetti + particles */}
      <RainbowExplosion trigger={confettiTrigger} intensity={confettiIntensity} />

      {/* Nyan cat flying across for perfect score */}
      {nyanFly && (
        <div className="fixed top-1/4 left-0 z-50 animate-nyan-fly pointer-events-none">
          <KawaiiCat mood="nyan" size="lg" />
        </div>
      )}

      {/* Score */}
      <div className={`${bgColor} rounded-2xl p-8 text-center relative overflow-visible`}>
        <SparkBurst trigger={sparkTrigger} count={12} />
        <FloatingHearts trigger={heartTrigger} />

        {/* Cat mascot */}
        <div className="flex justify-center mb-3">
          <KawaiiCat mood={catMood} size="lg" speechBubble={catSpeech} />
        </div>

        <div className={`text-4xl font-extrabold ${accentColor} animate-count-up`}>
          {correct}/{total}
        </div>
        <div className="text-lg font-bold text-text-primary mt-1">{pct}% correct</div>
        <p className="text-sm text-text-secondary mt-2">
          {pct === 100
            ? "Perfect score! You're ready for this exam!"
            : pct >= 80
              ? "Great job! Just a few more to review."
              : pct >= 50
                ? "Good effort! Keep studying the ones you missed."
                : "Don't worry — review the missed ones and try again!"}
        </p>
      </div>

      {/* Category breakdown */}
      <div className="bg-white rounded-2xl border border-sakura-100 overflow-hidden">
        <div className="px-5 py-3 border-b border-sakura-100">
          <h3 className="font-bold text-sm text-text-primary">By Category</h3>
        </div>
        <div className="divide-y divide-sakura-50">
          {Object.entries(byCategory).map(([cat, data]) => {
            const catPct = Math.round((data.correct / data.total) * 100);
            return (
              <div key={cat} className="flex items-center justify-between px-5 py-2.5">
                <span className="text-sm font-semibold text-text-primary">{cat}</span>
                <div className="flex items-center gap-3">
                  <div className="w-24 h-2 bg-sakura-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full progress-fill"
                      style={{ width: `${catPct}%` }}
                    />
                  </div>
                  <span className="text-xs font-bold text-text-secondary w-16 text-right">
                    {data.correct}/{data.total} ({catPct}%)
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Missed questions */}
      {missed.length > 0 && (
        <div className="bg-white rounded-2xl border border-sakura-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-sakura-100">
            <h3 className="font-bold text-sm text-text-primary">
              Questions to Review ({missed.length})
            </h3>
          </div>
          <div className="divide-y divide-sakura-50">
            {missed.map((m, i) => (
              <div key={i} className="px-5 py-3">
                <p className="text-sm font-semibold text-text-primary">
                  {m.question.question}
                </p>
                <p className="text-xs text-mint-500 mt-1 font-semibold">
                  {m.question.type === "multiple_choice"
                    ? `Answer: ${m.question.options[m.question.correct]}`
                    : `Answer: ${m.question.expected_answer}`}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={onTryAgain}
          className="flex-1 py-3.5 bg-white border-2 border-sakura-200 text-sakura-500 rounded-xl font-bold btn-bounce"
        >
          Try Again
        </button>
        {missed.length > 0 && (
          <button
            onClick={handleReview}
            className="flex-1 py-3.5 bg-gradient-to-r from-sakura-400 to-lavender-400 text-white rounded-xl font-bold btn-bounce"
          >
            Review Mistakes in Flash Mode
          </button>
        )}
      </div>
    </div>
  );
}
