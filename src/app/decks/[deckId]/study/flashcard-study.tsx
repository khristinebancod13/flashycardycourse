"use client";

import { useState, useCallback, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  ChevronLeft,
  ChevronRight,
  RotateCcw,
  Shuffle,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Check,
  X,
} from "lucide-react";

interface Card {
  id: number;
  front: string;
  back: string;
}

type Grade = "correct" | "incorrect" | null;

interface FlashcardStudyProps {
  cards: Card[];
  deckId: number;
}

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function emptyResults(length: number): Grade[] {
  return new Array(length).fill(null);
}

export function FlashcardStudy({ cards, deckId }: FlashcardStudyProps) {
  const [deck, setDeck] = useState<Card[]>(cards);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [isPendingFinish, setIsPendingFinish] = useState(false);
  // Per-pass results (index-based) — drives the progress bar for the current sub-session.
  const [results, setResults] = useState<Grade[]>(() => emptyResults(cards.length));
  // Cumulative results (card-ID-keyed) — persists across sub-sessions; used for the final summary.
  const [cumulativeResults, setCumulativeResults] = useState<Record<number, Grade>>({});

  const currentCard = deck[currentIndex];
  const total = deck.length;

  // Current-pass counters (for progress bar).
  const correctCount = results.filter((r) => r === "correct").length;
  const incorrectCount = results.filter((r) => r === "incorrect").length;
  const gradedCount = correctCount + incorrectCount;
  const skippedCards = deck.filter((_, i) => results[i] === null);

  // Advance after grading — receives the already-updated results so we can
  // accurately count skipped cards without waiting for a re-render.
  const advanceAfterGrade = useCallback(
    (nextIndex: number, updatedResults: Grade[]) => {
      if (nextIndex >= total) {
        const hasSkipped = updatedResults.some((r) => r === null);
        hasSkipped ? setIsPendingFinish(true) : setIsFinished(true);
      } else {
        setCurrentIndex(nextIndex);
        setIsFlipped(false);
      }
    },
    [total]
  );

  const gradeCard = useCallback(
    (grade: "correct" | "incorrect") => {
      const cardId = deck[currentIndex].id;
      const newResults = [...results];
      newResults[currentIndex] = grade;
      setResults(newResults);
      setCumulativeResults((prev) => ({ ...prev, [cardId]: grade }));
      advanceAfterGrade(currentIndex + 1, newResults);
    },
    [currentIndex, deck, results, advanceAfterGrade]
  );

  const goNext = useCallback(() => {
    if (currentIndex + 1 >= total) {
      const hasSkipped = results.some((r) => r === null);
      hasSkipped ? setIsPendingFinish(true) : setIsFinished(true);
    } else {
      setCurrentIndex((i) => i + 1);
      setIsFlipped(false);
    }
  }, [currentIndex, total, results]);

  const goPrev = useCallback(() => {
    if (isPendingFinish) {
      setIsPendingFinish(false);
      setIsFlipped(false);
      return;
    }
    if (currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
      setIsFlipped(false);
    }
  }, [currentIndex, isPendingFinish]);

  const handleReviewSkipped = useCallback(() => {
    // Use original cards + cumulative results so previously graded cards are excluded.
    const skipped = cards.filter((c) => !cumulativeResults[c.id]);
    setDeck(skipped);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsPendingFinish(false);
    setResults(emptyResults(skipped.length));
    // cumulativeResults is intentionally preserved.
  }, [cards, cumulativeResults]);

  const handleShuffle = useCallback(() => {
    setDeck(shuffleArray(cards));
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setIsPendingFinish(false);
    setResults(emptyResults(cards.length));
    setCumulativeResults({});
  }, [cards]);

  const handleRestart = useCallback(() => {
    setDeck([...cards]);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setIsPendingFinish(false);
    setResults(emptyResults(cards.length));
    setCumulativeResults({});
  }, [cards]);

  useEffect(() => {
    if (isFinished || isPendingFinish) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") {
        goPrev();
      } else if (e.key === "ArrowRight") {
        goNext();
      } else if (e.key === " ") {
        e.preventDefault();
        setIsFlipped((f) => !f);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isFinished, isPendingFinish, goPrev, goNext]);

  const handleStudyMissed = useCallback(() => {
    // Use original cards + cumulative results so the sub-session covers the full missed set.
    const missed = cards.filter((c) => cumulativeResults[c.id] !== "correct");
    setDeck(missed);
    setCurrentIndex(0);
    setIsFlipped(false);
    setIsFinished(false);
    setIsPendingFinish(false);
    setResults(emptyResults(missed.length));
    // cumulativeResults is intentionally preserved.
  }, [cards, cumulativeResults]);

  if (cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center gap-4">
        <p className="text-zinc-400 text-lg">This deck has no cards yet.</p>
        <Button asChild variant="outline">
          <Link href={`/decks/${deckId}`}>Go add some cards</Link>
        </Button>
      </div>
    );
  }

  /* ── Segmented progress bar ── */
  // Always anchored to the full original deck regardless of which sub-session is active.
  const currentCardId = !isFinished && !isPendingFinish ? deck[currentIndex]?.id : null;
  const cumCorrectCount = cards.filter((c) => cumulativeResults[c.id] === "correct").length;
  const cumIncorrectCount = cards.filter((c) => cumulativeResults[c.id] === "incorrect").length;
  const cumGradedCount = cumCorrectCount + cumIncorrectCount;
  const currentFullIndex = currentCardId != null
    ? cards.findIndex((c) => c.id === currentCardId)
    : -1;

  const ProgressBar = (
    <div className="w-full max-w-xl space-y-2">
      <div className="flex items-center justify-between text-sm text-zinc-400">
        <div className="flex items-center gap-3">
          <span>
            {isFinished
              ? cards.length
              : currentFullIndex >= 0
              ? currentFullIndex + 1
              : "–"}{" "}
            / {cards.length}
          </span>
          {cumGradedCount > 0 && (
            <span className="flex items-center gap-2 text-xs">
              <span className="flex items-center gap-1 text-green-400">
                <Check className="w-3 h-3" />
                {cumCorrectCount}
              </span>
              <span className="flex items-center gap-1 text-red-400">
                <X className="w-3 h-3" />
                {cumIncorrectCount}
              </span>
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleShuffle}
            className="h-7 px-2 text-zinc-400 hover:text-zinc-100"
          >
            <Shuffle className="w-4 h-4 mr-1" />
            Shuffle
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRestart}
            className="h-7 px-2 text-zinc-400 hover:text-zinc-100"
          >
            <RotateCcw className="w-4 h-4 mr-1" />
            Restart
          </Button>
        </div>
      </div>

      {/* Segmented track — always one segment per card in the original deck */}
      <div className="flex gap-0.5 w-full h-1.5 rounded-full overflow-hidden">
        {cards.map((card) => {
          const grade = cumulativeResults[card.id];
          const isCurrent = card.id === currentCardId;
          let bg = "bg-zinc-800";
          if (grade === "correct") bg = "bg-green-500";
          else if (grade === "incorrect") bg = "bg-red-500";
          else if (isCurrent) bg = "bg-zinc-500";
          return (
            <div
              key={card.id}
              className={`flex-1 rounded-sm transition-colors duration-300 ${bg}`}
            />
          );
        })}
      </div>
    </div>
  );

  /* ── Skipped-cards gate ── */
  if (isPendingFinish) {
    return (
      <div className="flex flex-col items-center gap-6 w-full">
        {ProgressBar}

        <div className="w-full max-w-xl rounded-2xl border border-yellow-500/30 bg-zinc-900 p-10 flex flex-col items-center text-center gap-5 shadow-xl">
          <AlertCircle className="w-14 h-14 text-yellow-400" />
          <div>
            <h2 className="text-2xl font-bold text-zinc-50">You have skipped cards</h2>
            <p className="text-zinc-400 mt-1">
              {skippedCards.length} {skippedCards.length === 1 ? "card was" : "cards were"} skipped
              without being marked. Go back and review them, or finish the session now.
            </p>
          </div>

          <div className="w-full text-left space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Skipped cards ({skippedCards.length})
            </p>
            <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
              {skippedCards.map((card) => (
                <div
                  key={card.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 flex items-start gap-2"
                >
                  <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-sm text-zinc-200 truncate">{card.front}</p>
                    <p className="text-xs text-zinc-500 truncate">{card.back}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <Separator className="bg-zinc-800 w-full" />

          <div className="flex gap-3 flex-wrap justify-center">
            <Button onClick={handleReviewSkipped} variant="default">
              <RotateCcw className="w-4 h-4 mr-2" />
              Review Skipped ({skippedCards.length})
            </Button>
            <Button
              onClick={() => {
                setIsPendingFinish(false);
                setIsFinished(true);
              }}
              variant="outline"
            >
              Finish Anyway
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Completion screen ── */
  if (isFinished) {
    // Always compute stats against the full original deck using cumulative results.
    const cumTotal = cards.length;
    const cumCorrect = cards.filter((c) => cumulativeResults[c.id] === "correct").length;
    const cumIncorrect = cards.filter((c) => cumulativeResults[c.id] === "incorrect").length;
    const cumGraded = cumCorrect + cumIncorrect;
    const pct = cumTotal > 0 ? Math.round((cumCorrect / cumTotal) * 100) : 0;
    const missedCards = cards
      .map((c) => ({ card: c, grade: cumulativeResults[c.id] ?? null }))
      .filter(({ grade }) => grade !== "correct");

    return (
      <div className="flex flex-col items-center gap-6 w-full">
        {ProgressBar}

        <div className="w-full max-w-xl rounded-2xl border border-zinc-700 bg-zinc-900 p-10 flex flex-col items-center text-center gap-5 shadow-xl">
          <CheckCircle2 className="w-14 h-14 text-green-400" />
          <div>
            <h2 className="text-2xl font-bold text-zinc-50">Session complete!</h2>
            <p className="text-zinc-400 mt-1">
              You graded {cumGraded} of {cumTotal}{" "}
              {cumTotal === 1 ? "card" : "cards"}
            </p>
          </div>

          {/* Score ring */}
          <div className="flex items-center gap-6">
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-green-400">{cumCorrect}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Correct</span>
            </div>
            <div className="text-3xl font-light text-zinc-600">/</div>
            <div className="flex flex-col items-center gap-1">
              <span className="text-3xl font-bold text-red-400">{cumIncorrect}</span>
              <span className="text-xs text-zinc-500 uppercase tracking-wider">Incorrect</span>
            </div>
            {cumGraded < cumTotal && (
              <>
                <div className="text-3xl font-light text-zinc-600">/</div>
                <div className="flex flex-col items-center gap-1">
                  <span className="text-3xl font-bold text-zinc-400">
                    {cumTotal - cumGraded}
                  </span>
                  <span className="text-xs text-zinc-500 uppercase tracking-wider">Skipped</span>
                </div>
              </>
            )}
          </div>

          {cumGraded > 0 && (
            <Badge
              variant="secondary"
              className="text-sm px-3 py-1"
            >
              {pct}% correct
            </Badge>
          )}

          <Separator className="bg-zinc-800 w-full" />

          {/* Missed + skipped cards list */}
          {missedCards.length > 0 && (
            <div className="w-full text-left space-y-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-zinc-500">
                Cards to review ({missedCards.length})
              </p>
              <div className="space-y-1 max-h-40 overflow-y-auto pr-1">
                {missedCards.map(({ card, grade }) => (
                  <div
                    key={card.id}
                    className="rounded-lg border border-zinc-800 bg-zinc-950 px-3 py-2 flex items-start gap-2"
                  >
                    {grade === "incorrect" ? (
                      <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-400 shrink-0 mt-0.5" />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm text-zinc-200 truncate">{card.front}</p>
                      <p className="text-xs text-zinc-500 truncate">{card.back}</p>
                    </div>
                    <span className="text-xs text-zinc-600 shrink-0 mt-0.5">
                      {grade === "incorrect" ? "Incorrect" : "Skipped"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-3 flex-wrap justify-center">
            {missedCards.length > 0 && (
              <Button onClick={handleStudyMissed} variant="default">
                <RotateCcw className="w-4 h-4 mr-2" />
                Study Missed &amp; Skipped ({missedCards.length})
              </Button>
            )}
            <Button onClick={handleRestart} variant={missedCards.length > 0 ? "outline" : "default"}>
              <RotateCcw className="w-4 h-4 mr-2" />
              Study Again
            </Button>
            <Button onClick={handleShuffle} variant="outline">
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle &amp; Restart
            </Button>
            <Button asChild variant="outline">
              <Link href={`/decks/${deckId}`}>Back to Deck</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  /* ── Active study ── */
  return (
    <div className="flex flex-col items-center gap-6">
      {ProgressBar}

      {/* Flashcard */}
      <div
        className="w-full max-w-xl cursor-pointer select-none"
        style={{ perspective: "1200px" }}
        onClick={() => setIsFlipped((f) => !f)}
        role="button"
        aria-label={isFlipped ? "Show front" : "Reveal answer"}
      >
        <div
          className="relative w-full transition-transform duration-500"
          style={{
            transformStyle: "preserve-3d",
            transform: isFlipped ? "rotateY(180deg)" : "rotateY(0deg)",
            minHeight: "280px",
          }}
        >
          {/* Front */}
          <div
            className="absolute inset-0 rounded-2xl border border-zinc-700 bg-zinc-900 shadow-xl flex flex-col"
            style={{ backfaceVisibility: "hidden" }}
          >
            <div className="px-6 pt-5 pb-2">
              <Badge variant="secondary" className="text-xs">Front</Badge>
            </div>
            <div className="flex-1 flex items-center justify-center px-8 pb-8">
              <p className="text-xl font-medium text-zinc-50 text-center leading-relaxed whitespace-pre-wrap">
                {currentCard.front}
              </p>
            </div>
            <div className="pb-5 flex justify-center">
              <p className="text-xs text-zinc-500">Click to reveal answer</p>
            </div>
          </div>

          {/* Back */}
          <div
            className="absolute inset-0 rounded-2xl border border-zinc-600 bg-zinc-800 shadow-xl flex flex-col"
            style={{
              backfaceVisibility: "hidden",
              transform: "rotateY(180deg)",
            }}
          >
            <div className="px-6 pt-5 pb-2">
              <Badge className="text-xs bg-zinc-600 text-zinc-200 hover:bg-zinc-600">
                Back
              </Badge>
            </div>
            <div className="flex-1 flex items-center justify-center px-8 pb-8">
              <p className="text-xl font-medium text-zinc-100 text-center leading-relaxed whitespace-pre-wrap">
                {currentCard.back}
              </p>
            </div>
            <div className="pb-5 flex justify-center">
              <p className="text-xs text-zinc-500">Click to flip back</p>
            </div>
          </div>
        </div>
      </div>

      {/* Grade buttons — only shown after flip */}
      <div
        className={`flex gap-3 transition-all duration-300 ${
          isFlipped ? "opacity-100 translate-y-0" : "opacity-0 pointer-events-none translate-y-2"
        }`}
      >
        <Button
          size="lg"
          variant="outline"
          className="border-red-500/50 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-400 gap-2"
          onClick={(e) => { e.stopPropagation(); gradeCard("incorrect"); }}
        >
          <X className="w-5 h-5" />
          Incorrect
        </Button>
        <Button
          size="lg"
          variant="outline"
          className="border-green-500/50 text-green-400 hover:bg-green-500/10 hover:text-green-300 hover:border-green-400 gap-2"
          onClick={(e) => { e.stopPropagation(); gradeCard("correct"); }}
        >
          <Check className="w-5 h-5" />
          Correct
        </Button>
      </div>

      {/* Navigation */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={goPrev}
          disabled={currentIndex === 0}
          aria-label="Previous card"
          className="text-zinc-500 hover:text-zinc-200"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>

        <span className="text-sm text-zinc-600 w-20 text-center">
          {currentFullIndex >= 0 ? currentFullIndex + 1 : "–"} of {cards.length}
        </span>

        <Button
          variant="ghost"
          size="icon"
          onClick={goNext}
          aria-label="Skip card"
          className="text-zinc-500 hover:text-zinc-200"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      <p className="text-xs text-zinc-600">
        Use ← → arrows to navigate · Space to flip · Mark correct or incorrect after flipping
      </p>
    </div>
  );
}
