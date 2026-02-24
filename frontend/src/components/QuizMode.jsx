import { useState, useEffect } from "react";
import { useApi } from "../hooks/useApi.js";
import ProgressBar from "./ProgressBar.jsx";
import ScoreCard from "./ScoreCard.jsx";

const COUNT_OPTIONS = [5, 10, 20, "All"];

export default function QuizMode({ onReviewMistakes }) {
  const { get, loading } = useApi();
  const [phase, setPhase] = useState("setup"); // setup | playing | scorecard
  const [categories, setCategories] = useState([]);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedCount, setSelectedCount] = useState(10);
  const [selectedDifficulty, setSelectedDifficulty] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [results, setResults] = useState([]);
  const [selectedOption, setSelectedOption] = useState(null);
  const [shortAnswer, setShortAnswer] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [feedback, setFeedback] = useState(null); // { correct, explanation }

  // Load categories on mount
  useEffect(() => {
    get("/api/categories").then((cats) => {
      if (cats) setCategories(cats);
    });
  }, []);

  function toggleCategory(cat) {
    setSelectedCategories((prev) =>
      prev.includes(cat) ? prev.filter((c) => c !== cat) : [...prev, cat]
    );
  }

  async function startQuiz() {
    const params = new URLSearchParams();
    if (selectedCount !== "All") params.set("count", selectedCount);
    if (selectedCategories.length > 0)
      params.set("category", selectedCategories.join(","));
    if (selectedDifficulty) params.set("difficulty", selectedDifficulty);

    const data = await get(`/api/quiz/questions?${params}`);
    if (data && data.length > 0) {
      setQuestions(data);
      setCurrentIndex(0);
      setResults([]);
      setPhase("playing");
      resetQuestion();
    }
  }

  function resetQuestion() {
    setSelectedOption(null);
    setShortAnswer("");
    setSubmitted(false);
    setFeedback(null);
  }

  function submitMC(optionIndex) {
    if (submitted) return;
    setSelectedOption(optionIndex);
    setSubmitted(true);
    const q = questions[currentIndex];
    const correct = optionIndex === q.correct;
    setFeedback({ correct, explanation: q.explanation });
    setResults((prev) => [
      ...prev,
      { correct, category: q.category, answer: q.options[optionIndex] },
    ]);
  }

  function submitShortAnswer() {
    if (submitted || !shortAnswer.trim()) return;
    setSubmitted(true);
    const q = questions[currentIndex];
    // Case-insensitive keyword matching — any keyword = correct
    const answer = shortAnswer.toLowerCase();
    const correct = q.keywords.some((kw) => answer.includes(kw.toLowerCase()));
    setFeedback({
      correct,
      explanation: correct
        ? q.explanation
        : `Expected: ${q.expected_answer}\n\n${q.explanation}`,
    });
    setResults((prev) => [
      ...prev,
      { correct, category: q.category, answer: shortAnswer },
    ]);
  }

  function nextQuestion() {
    if (currentIndex + 1 >= questions.length) {
      setPhase("scorecard");
    } else {
      setCurrentIndex((i) => i + 1);
      resetQuestion();
    }
  }

  function tryAgain() {
    setPhase("setup");
    resetQuestion();
  }

  // SETUP SCREEN
  if (phase === "setup") {
    return (
      <div className="space-y-6">
        <div className="text-center mb-2">
          <h2 className="text-xl font-extrabold text-text-primary">Quiz Setup</h2>
          <p className="text-sm text-text-secondary">
            Choose your quiz settings
          </p>
        </div>

        {/* Question count */}
        <div className="bg-white rounded-2xl border border-sakura-100 p-5">
          <label className="block text-sm font-bold text-text-primary mb-3">
            Number of Questions
          </label>
          <div className="flex gap-2">
            {COUNT_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setSelectedCount(opt)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold btn-bounce ${
                  selectedCount === opt
                    ? "bg-sakura-400 text-white"
                    : "bg-sakura-50 text-sakura-500 hover:bg-sakura-100"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Categories */}
        <div className="bg-white rounded-2xl border border-sakura-100 p-5">
          <label className="block text-sm font-bold text-text-primary mb-3">
            Categories{" "}
            <span className="text-text-secondary font-normal">
              (none selected = all)
            </span>
          </label>
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => toggleCategory(cat)}
                className={`category-pill btn-bounce py-1.5 px-3 ${
                  selectedCategories.includes(cat)
                    ? "bg-lavender-400 text-white"
                    : "bg-lavender-100 text-lavender-500"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Difficulty */}
        <div className="bg-white rounded-2xl border border-sakura-100 p-5">
          <label className="block text-sm font-bold text-text-primary mb-3">
            Difficulty
          </label>
          <div className="flex gap-2">
            {[
              { value: null, label: "All" },
              { value: "core", label: "Core" },
              { value: "important", label: "Important" },
              { value: "detail", label: "Detail" },
            ].map((opt) => (
              <button
                key={opt.label}
                onClick={() => setSelectedDifficulty(opt.value)}
                className={`flex-1 py-2.5 rounded-xl text-sm font-bold btn-bounce ${
                  selectedDifficulty === opt.value
                    ? "bg-sky-400 text-white"
                    : "bg-sky-100 text-sky-500 hover:bg-sky-200"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Start */}
        <button
          onClick={startQuiz}
          disabled={loading}
          className="w-full py-4 bg-gradient-to-r from-sakura-400 to-lavender-400 text-white rounded-xl font-extrabold text-lg btn-bounce disabled:opacity-50"
        >
          {loading ? "Loading..." : "Start Quiz"}
        </button>
      </div>
    );
  }

  // SCORECARD
  if (phase === "scorecard") {
    return (
      <ScoreCard
        results={results}
        questions={questions}
        onReviewMistakes={onReviewMistakes}
        onTryAgain={tryAgain}
      />
    );
  }

  // PLAYING
  const q = questions[currentIndex];
  const correctSoFar = results.filter((r) => r.correct).length;

  return (
    <div className="space-y-4">
      {/* Running score */}
      <div className="flex items-center justify-between">
        <span className="text-sm font-bold text-text-primary">
          Question {currentIndex + 1} of {questions.length}
        </span>
        <span className="text-sm font-bold text-mint-500">
          {correctSoFar}/{results.length} correct
        </span>
      </div>

      <ProgressBar
        current={currentIndex + (submitted ? 1 : 0)}
        total={questions.length}
        label="Progress"
      />

      {/* Question card */}
      <div className="bg-white rounded-2xl border border-sakura-100 p-6">
        <div className="flex items-start justify-between mb-4">
          <span className="category-pill bg-lavender-100 text-lavender-500">
            {q.category}
          </span>
          <span className="category-pill bg-sky-100 text-sky-500">
            {q.type === "multiple_choice" ? "Multiple Choice" : "Short Answer"}
          </span>
        </div>

        <p className="text-lg font-bold text-text-primary mb-6">{q.question}</p>

        {/* Multiple Choice */}
        {q.type === "multiple_choice" && (
          <div className="space-y-2">
            {q.options.map((opt, i) => {
              let btnStyle =
                "bg-sakura-50 text-text-primary hover:bg-sakura-100 border-sakura-100";

              if (submitted) {
                if (i === q.correct) {
                  btnStyle = "bg-mint-100 text-mint-600 border-mint-300 ring-2 ring-mint-300";
                } else if (i === selectedOption && !feedback.correct) {
                  btnStyle = "bg-red-100 text-red-600 border-red-300 ring-2 ring-red-300";
                } else {
                  btnStyle = "bg-gray-50 text-gray-400 border-gray-100";
                }
              }

              return (
                <button
                  key={i}
                  onClick={() => submitMC(i)}
                  disabled={submitted}
                  className={`w-full text-left py-3 px-4 rounded-xl font-semibold text-sm border btn-bounce transition-all ${btnStyle}`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        )}

        {/* Short Answer */}
        {q.type === "short_answer" && (
          <div className="space-y-3">
            <textarea
              value={shortAnswer}
              onChange={(e) => setShortAnswer(e.target.value)}
              disabled={submitted}
              placeholder="Type your answer..."
              rows={2}
              className="w-full p-3 rounded-xl border border-sakura-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-sakura-300 focus:border-sakura-300 resize-none disabled:bg-gray-50 disabled:text-gray-500"
            />
            {!submitted && (
              <button
                onClick={submitShortAnswer}
                disabled={!shortAnswer.trim()}
                className="w-full py-3 bg-sakura-400 text-white rounded-xl font-bold text-sm btn-bounce disabled:opacity-40"
              >
                Submit Answer
              </button>
            )}
          </div>
        )}

        {/* Feedback */}
        {submitted && feedback && (
          <div
            className={`mt-4 p-4 rounded-xl animate-slide-in ${
              feedback.correct ? "bg-mint-100" : "bg-amber-100"
            }`}
          >
            <p className="font-bold text-sm mb-1">
              {feedback.correct ? "\u2705 Correct!" : "\u274C Not quite"}
            </p>
            <p className="text-sm text-text-primary whitespace-pre-line">
              {feedback.explanation}
            </p>
          </div>
        )}
      </div>

      {/* Next button */}
      {submitted && (
        <button
          onClick={nextQuestion}
          className="w-full py-3.5 bg-gradient-to-r from-sakura-400 to-lavender-400 text-white rounded-xl font-bold btn-bounce"
        >
          {currentIndex + 1 >= questions.length ? "See Results" : "Next Question"}
        </button>
      )}
    </div>
  );
}
