import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi.js";

export default function ExplainMode() {
  const { get, post, loading, error, clearError } = useApi();
  const [prompts, setPrompts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState(null);
  const [showMissed, setShowMissed] = useState(false);
  const [showModel, setShowModel] = useState(false);
  const [results, setResults] = useState([]); // track scores for summary
  const [phase, setPhase] = useState("answering"); // answering | feedback | summary

  useEffect(() => {
    loadPrompts();
  }, []);

  async function loadPrompts() {
    const data = await get("/api/explain/prompts");
    if (data) setPrompts(data);
  }

  async function handleSubmit() {
    if (!answer.trim() || loading) return;
    clearError();
    const prompt = prompts[currentIndex];
    const result = await post("/api/explain/evaluate", {
      prompt_id: prompt.id,
      student_answer: answer,
    });
    if (result) {
      setFeedback(result);
      setPhase("feedback");
      setResults((prev) => [...prev, { promptId: prompt.id, category: prompt.category, ...result }]);
    }
  }

  function handleTryAgain() {
    setAnswer("");
    setFeedback(null);
    setShowMissed(false);
    setShowModel(false);
    setPhase("answering");
    // Remove last result since they're retrying
    setResults((prev) => prev.slice(0, -1));
  }

  function handleNext() {
    if (currentIndex + 1 >= prompts.length) {
      setPhase("summary");
    } else {
      setCurrentIndex((i) => i + 1);
      setAnswer("");
      setFeedback(null);
      setShowMissed(false);
      setShowModel(false);
      setPhase("answering");
    }
  }

  function handleRestart() {
    setCurrentIndex(0);
    setAnswer("");
    setFeedback(null);
    setShowMissed(false);
    setShowModel(false);
    setResults([]);
    setPhase("answering");
  }

  // Handle Ctrl+Enter submit
  function handleKeyDown(e) {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      handleSubmit();
    }
  }

  if (prompts.length === 0 && !loading) {
    return (
      <div className="text-center py-12 text-text-secondary">
        <p className="font-semibold">No prompts available</p>
        <p className="text-sm mt-1">Add explain prompts to the content directory.</p>
      </div>
    );
  }

  // SUMMARY
  if (phase === "summary") {
    const avgScore =
      results.length > 0
        ? results.reduce((sum, r) => sum + r.score / r.total, 0) / results.length
        : 0;
    const pct = Math.round(avgScore * 100);

    return (
      <div className="space-y-6 animate-slide-in">
        <div
          className={`rounded-2xl p-8 text-center ${
            pct >= 80 ? "bg-mint-100" : pct >= 50 ? "bg-amber-100" : "bg-sakura-100"
          }`}
        >
          <div className="text-5xl mb-3">
            {pct >= 80 ? "\uD83C\uDF89" : pct >= 50 ? "\uD83C\uDF1F" : "\uD83D\uDCAA"}
          </div>
          <div className="text-3xl font-extrabold text-text-primary animate-count-up">
            {pct}% Average
          </div>
          <p className="text-sm text-text-secondary mt-2">
            Across {results.length} prompt{results.length !== 1 ? "s" : ""}
          </p>
        </div>

        {/* Per-prompt results */}
        <div className="bg-white rounded-2xl border border-sakura-100 overflow-hidden">
          <div className="px-5 py-3 border-b border-sakura-100">
            <h3 className="font-bold text-sm">Results by Prompt</h3>
          </div>
          <div className="divide-y divide-sakura-50">
            {results.map((r, i) => {
              const rPct = Math.round((r.score / r.total) * 100);
              return (
                <div key={i} className="px-5 py-3 flex items-center justify-between">
                  <div>
                    <span className="category-pill bg-lavender-100 text-lavender-500 mr-2">
                      {r.category}
                    </span>
                    <span className="text-sm font-semibold">
                      {prompts[i]?.prompt?.slice(0, 60)}...
                    </span>
                  </div>
                  <span
                    className={`text-sm font-bold ${
                      rPct >= 80
                        ? "text-mint-500"
                        : rPct >= 50
                          ? "text-amber-500"
                          : "text-sakura-500"
                    }`}
                  >
                    {r.score}/{r.total}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleRestart}
          className="w-full py-3.5 bg-gradient-to-r from-sakura-400 to-lavender-400 text-white rounded-xl font-bold btn-bounce"
        >
          Try All Again
        </button>
      </div>
    );
  }

  const prompt = prompts[currentIndex];
  if (!prompt) return null;

  // Score color
  function scoreColor(score, total) {
    const ratio = score / total;
    if (ratio >= 0.75) return "text-mint-500 bg-mint-100";
    if (ratio >= 0.4) return "text-amber-500 bg-amber-100";
    return "text-sakura-500 bg-sakura-100";
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-text-primary">
          Prompt {currentIndex + 1} of {prompts.length}
        </span>
        <span className="category-pill bg-lavender-100 text-lavender-500">
          {prompt.category}
        </span>
      </div>

      {/* Prompt */}
      <div className="bg-white rounded-2xl border border-sakura-100 p-6">
        <p className="text-lg font-bold text-text-primary leading-relaxed">
          {prompt.prompt}
        </p>
      </div>

      {/* Answer input */}
      <div>
        <textarea
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={phase === "feedback"}
          placeholder="Explain in your own words..."
          rows={4}
          className="w-full p-4 rounded-2xl border border-sakura-200 text-sm font-medium leading-relaxed focus:outline-none focus:ring-2 focus:ring-sakura-300 focus:border-sakura-300 resize-y disabled:bg-gray-50 disabled:text-gray-500"
        />
        {phase === "answering" && (
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-text-secondary">
              <kbd className="px-1.5 py-0.5 bg-white rounded border border-sakura-100 text-[10px] font-mono">
                Ctrl+Enter
              </kbd>{" "}
              to submit
            </span>
            <button
              onClick={handleSubmit}
              disabled={!answer.trim() || loading}
              className="px-6 py-2.5 bg-sakura-400 text-white rounded-xl font-bold text-sm btn-bounce disabled:opacity-40"
            >
              {loading ? "Evaluating..." : "Check My Answer"}
            </button>
          </div>
        )}
      </div>

      {/* Error */}
      {error && (
        <div className="p-4 rounded-xl bg-sakura-100 animate-slide-in">
          <p className="font-bold text-sm text-sakura-500">Error</p>
          <p className="text-sm text-text-primary">{error}</p>
        </div>
      )}

      {/* Feedback */}
      {phase === "feedback" && feedback && (
        <div className="space-y-3 animate-slide-in">
          {/* Score */}
          <div
            className={`flex items-center gap-3 p-4 rounded-2xl ${scoreColor(feedback.score, feedback.total)}`}
          >
            <span className="text-3xl font-extrabold">
              {feedback.score}/{feedback.total}
            </span>
            <span className="text-sm font-semibold">key points covered</span>
          </div>

          {/* Praise */}
          {feedback.praise && (
            <div className="bg-mint-100 rounded-2xl p-4">
              <p className="text-sm font-bold text-mint-600 mb-1">What you got right</p>
              <p className="text-sm text-text-primary">{feedback.praise}</p>
              {feedback.points_hit.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {feedback.points_hit.map((p, i) => (
                    <li key={i} className="text-sm text-mint-600 flex items-start gap-1.5">
                      <span className="mt-0.5">{"\u2705"}</span> {p}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Hint */}
          {feedback.hint && (
            <div className="bg-amber-100 rounded-2xl p-4">
              <p className="text-sm font-bold text-amber-600 mb-1">What's missing</p>
              <p className="text-sm text-text-primary">{feedback.hint}</p>

              {/* Collapsible: show missed points */}
              {feedback.points_missed.length > 0 && (
                <div className="mt-3">
                  <button
                    onClick={() => setShowMissed(!showMissed)}
                    className="text-xs font-bold text-amber-600 hover:text-amber-700"
                  >
                    {showMissed ? "Hide details" : "Show what was missed"} {showMissed ? "\u25B2" : "\u25BC"}
                  </button>
                  {showMissed && (
                    <ul className="mt-2 space-y-1">
                      {feedback.points_missed.map((p, i) => (
                        <li key={i} className="text-sm text-amber-600 flex items-start gap-1.5">
                          <span className="mt-0.5">{"\u274C"}</span> {p}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Model answer */}
          <div className="bg-white rounded-2xl border border-sakura-100 p-4">
            <button
              onClick={() => setShowModel(!showModel)}
              className="text-sm font-bold text-lavender-500 hover:text-lavender-600"
            >
              {showModel ? "Hide model answer" : "Show model answer"} {showModel ? "\u25B2" : "\u25BC"}
            </button>
            {showModel && (
              <p className="mt-3 text-sm text-text-primary leading-relaxed">
                {feedback.model_answer}
              </p>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleTryAgain}
              className="flex-1 py-3.5 bg-white border-2 border-sakura-200 text-sakura-500 rounded-xl font-bold btn-bounce"
            >
              Try Again
            </button>
            <button
              onClick={handleNext}
              className="flex-1 py-3.5 bg-gradient-to-r from-sakura-400 to-lavender-400 text-white rounded-xl font-bold btn-bounce"
            >
              {currentIndex + 1 >= prompts.length ? "See Summary" : "Next Question"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
