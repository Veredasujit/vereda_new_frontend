"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  Check,
  CheckCircle2,
  ClipboardList,
  Clock,
  GraduationCap,
  ListChecks,
  RefreshCcw,
  Timer,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import {
  AnimatePresence,
  Badge,
  Button,
  Card,
  CountUp,
  EmptyState,
  ErrorState,
  Eyebrow,
  Reveal,
  Spinner,
  cn,
  motion,
} from "@/ui";
import { useGetAllQuestionsMutation } from "@/Redux/api/questionApi";

import { useUpdateWeeklyProgressForUserMutation } from "@/Redux/api/questionApi";
import { useState, useEffect, useMemo, useCallback, Suspense } from "react";
import Image from "next/image";

type Question = {
  id: string;
  questionText: string;
  optionA?: string;
  optionB?: string;
  optionC?: string;
  optionD?: string;
  correctOption?: "A" | "B" | "C" | "D";
  marks?: number;
};

interface Questionss {
  id: string;
  setNo: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: "A" | "B" | "C" | "D";
  marks: number;
  courseId?: string;
  createdAt?: string;
  updatedAt?: string;
}

const TestContent = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const week = searchParams.get("week") || "1";

  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);
  const [getAllQuestions, { isLoading }] = useGetAllQuestionsMutation();
  const [updateWeeklyProgress] = useUpdateWeeklyProgressForUserMutation();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [questionId: string]: "A" | "B" | "C" | "D" | "" }>({});
  const [visited, setVisited] = useState<Record<string, boolean>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [started, setStarted] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [showAnswers, setShowAnswers] = useState(false);
  
  const [passingStatus, setPassingStatus] = useState<"passed" | "failed">("failed");
  const [isUpdatingProgress, setIsUpdatingProgress] = useState(false);
  const [loadError, setLoadError] = useState(false);

  const test = true;

  const currentQuestion = useMemo(
    () => (questions.length > 0 ? questions[currentIndex] : null),
    [questions, currentIndex]
  );

  const fetchQuestions = async () => {
    setLoadError(false);
    try {
      const res = await getAllQuestions({ setNo: Number(week) }).unwrap();
      if (res?.success && Array.isArray(res.questions)) {
        const fetched = test ? res.questions.slice(0, 8) : res.questions;
        setQuestions(fetched);
        const initAnswers: { [k: string]: "" } = {};
        const initVisited: Record<string, boolean> = {};
        fetched.forEach((q: Questionss) => {
          initAnswers[q.id] = "";
          initVisited[q.id] = false;
        });
        setAnswers(initAnswers);
        setVisited(initVisited);
        setCurrentIndex(0);
      } else {
        setQuestions([]);
        
      }
    } catch (err) {
      console.error("Error fetching questions:", err);
      setLoadError(true);
    }
  };

 const updateProgress = useCallback(async (weekMarks: number, weekStatus: "passed" | "failed") => {
  try {
    setIsUpdatingProgress(true);
    const result = await updateWeeklyProgress({
      weekNumber: Number(week),
      weekMarks,
      weekStatus,
    }).unwrap();

    return result;
  } catch (error) {
    console.error("Failed to update progress:", error);
    throw error;
  } finally {
    setIsUpdatingProgress(false);
  }
}, [week, updateWeeklyProgress]);

const calculateScore = useCallback(() => {
  let total = 0;
  let correctAnswers = 0;

  questions.forEach((q) => {
    if (answers[q.id] && q.correctOption && answers[q.id] === q.correctOption) {
      total += q.marks ?? 1;
      correctAnswers++;
    }
  });

  const totalQuestions = questions.length;
  const requiredToPass = Math.ceil(totalQuestions * (2 / 3));
  const passed = correctAnswers >= requiredToPass;

  setScore(total);
  setPassingStatus(passed ? "passed" : "failed");
  setSubmitted(true);

  updateProgress(total, passed ? "passed" : "failed");
}, [questions, answers, updateProgress]);


  const startTest = async () => {
    await fetchQuestions();
    setStarted(true);
    setTimeout(() => {
      if (questions[0]) {
        setVisited((prev) => ({ ...prev, [questions[0].id]: true }));
      }
    }, 0);
  };

  useEffect(() => {
    if (started && questions.length > 0) {
      const q = questions[currentIndex];
      if (q) setVisited((prev) => ({ ...prev, [q.id]: true }));
    }
  }, [currentIndex, started, questions.length,questions]);

  const handleAnswer = (questionId: string, option: "A" | "B" | "C" | "D") => {
    setAnswers((prev) => ({ ...prev, [questionId]: option }));
    const idx = questions.findIndex((q) => q.id === questionId);
    setTimeout(() => {
      if (idx >= 0 && idx < questions.length - 1) {
        setCurrentIndex(idx + 1);
      }
    }, 180);
  };

 useEffect(() => {
  if (!started || submitted) return;
  if (timeLeft <= 0) {
    calculateScore();
    return;
  }
  const t = setInterval(() => setTimeLeft((s) => s - 1), 1000);
  return () => clearInterval(t);
}, [started, submitted, timeLeft, calculateScore]);


  const formatTime = (secs: number) => {
    if (secs < 0) secs = 0;
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`;
  };

  const fallbackAvatar = "https://cdn-icons-png.flaticon.com/512/847/847969.png";
 

  const questionStatus = (q: Question) => {
    if (!q) return "not";
    if (answers[q.id]) return "answered";
    if (visited[q.id]) return "visited";
    return "not";
  };

 

  // Calculate correct answers count
  const correctAnswersCount = useMemo(() => {
    return questions.filter(q => 
      answers[q.id] && q.correctOption && answers[q.id] === q.correctOption
    ).length;
  }, [questions, answers]);

  const totalQuestions = questions.length;
  const requiredToPass = Math.ceil(totalQuestions * (2/3));

  const totalMarks = questions.reduce((acc, q) => acc + (q.marks ?? 1), 0);
  const answeredCount = Object.values(answers).filter((a) => a).length;
  const answeredPct = totalQuestions > 0 ? (answeredCount / totalQuestions) * 100 : 0;
  const lowTime = timeLeft <= 60;
  const passed = passingStatus === "passed";

  const rules = [
    {
      icon: ListChecks,
      text:
        totalQuestions > 0
          ? `Get ${requiredToPass} of ${totalQuestions} right to pass`
          : "Get two-thirds right to pass",
    },
    { icon: CheckCircle2, text: "No negative marking" },
    { icon: Timer, text: "Auto-submits when time runs out" },
    { icon: RefreshCcw, text: "Don't refresh during the test" },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-surface">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-line bg-white/85 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-2">
            <Button variant="ghost" size="sm" onClick={() => router.back()} aria-label="Go back" className="h-11 px-3">
              <ArrowLeft className="h-4 w-4" aria-hidden />
              <span className="hidden sm:inline">Back</span>
            </Button>
            <span className="h-5 w-px bg-line" aria-hidden />
            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
              <GraduationCap className="h-4 w-4" aria-hidden />
            </span>
            <span className="truncate text-sm font-semibold text-ink">Week {week} test</span>
          </div>

          {started && !submitted && (
            <span
              className={cn(
                "inline-flex h-9 items-center gap-2 rounded-full px-3.5 text-sm font-semibold tabular-nums ring-1 ring-inset transition-colors",
                lowTime ? "bg-red-50 text-red-700 ring-red-200" : "bg-surface text-ink ring-line",
              )}
              aria-label={`Time left ${formatTime(timeLeft)}`}
            >
              <Clock className="h-4 w-4" aria-hidden />
              {formatTime(timeLeft)}
            </span>
          )}
        </div>

        {started && !submitted && totalQuestions > 0 && (
          <div className="h-1 w-full bg-line/60" aria-hidden>
            <motion.div
              className="h-full bg-brand-gradient"
              initial={false}
              animate={{ width: `${answeredPct}%` }}
              transition={{ duration: 0.4, ease: "easeOut" }}
            />
          </div>
        )}
      </header>

      <main className="flex-1 py-10 sm:py-14">
        <div className="mx-auto max-w-6xl px-4 sm:px-6">
          {/* Intro */}
          {!started && (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1.4fr)_minmax(0,1fr)] lg:gap-8">
              <Reveal>
                <Card className="p-6 sm:p-10">
                  <Eyebrow>Week {week} assessment</Eyebrow>
                  <h1 className="mt-5 text-3xl font-semibold tracking-tight text-ink sm:text-5xl">Ready for your test?</h1>
                  <p className="mt-3 text-lg text-ink-3">Show what you learned this week.</p>

                  <dl className="mt-8 grid grid-cols-3 gap-3">
                    {[
                      { label: "Questions", value: totalQuestions > 0 ? String(totalQuestions) : "—" },
                      { label: "Time limit", value: "25 min" },
                      { label: "Pass mark", value: "67%" },
                    ].map((stat) => (
                      <div key={stat.label} className="rounded-2xl bg-surface p-4">
                        <dt className="text-xs font-medium text-ink-3">{stat.label}</dt>
                        <dd className="mt-1 text-xl font-semibold tracking-tight text-ink sm:text-2xl">{stat.value}</dd>
                      </div>
                    ))}
                  </dl>

                  <ul className="mt-8 grid gap-3 sm:grid-cols-2">
                    {rules.map(({ icon: Icon, text }) => (
                      <li key={text} className="flex items-center gap-3 text-sm text-ink-2">
                        <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                          <Icon className="h-4 w-4" aria-hidden />
                        </span>
                        {text}
                      </li>
                    ))}
                  </ul>

                  <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                    <Button
                      size="lg"
                      disabled={!isAuthenticated || isLoading}
                      loading={isLoading}
                      onClick={startTest}
                      className="sm:flex-1"
                    >
                      {isLoading ? (
                        "Loading test..."
                      ) : (
                        <>
                          Start test
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden />
                        </>
                      )}
                    </Button>
                    <Button variant="outline" size="lg" onClick={() => router.push("/dashboard")}>
                      Return to dashboard
                    </Button>
                  </div>
                  {!isAuthenticated && (
                    <p className="mt-4 text-sm text-ink-3">
                      <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
                        Log in
                      </Link>{" "}
                      to start the test.
                    </p>
                  )}
                </Card>
              </Reveal>

              {isAuthenticated && user && (
                <Reveal delay={0.08}>
                  <Card className="p-6 sm:p-8">
                    <p className="text-xs font-semibold uppercase tracking-wider text-ink-3">Candidate</p>
                    <div className="mt-5 flex items-center gap-4">
                      <Image
                        src={user.profileURL || fallbackAvatar}
                        alt={user.name}
                        width={64}
                        height={64}
                        className="h-16 w-16 rounded-full object-cover ring-4 ring-brand-50"
                      />
                      <div className="min-w-0">
                        <h2 className="truncate text-lg font-semibold text-ink">{user.name}</h2>
                        <p className="truncate text-sm text-ink-3">{user.email}</p>
                      </div>
                    </div>
                    <dl className="mt-6 space-y-3 border-t border-line pt-5 text-sm">
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-3">Candidate ID</dt>
                        <dd className="font-mono text-ink">{String(user.id || "").slice(0, 8)}...</dd>
                      </div>
                      <div className="flex justify-between gap-4">
                        <dt className="text-ink-3">Assessment</dt>
                        <dd className="font-medium text-ink">Week {week}</dd>
                      </div>
                    </dl>
                  </Card>
                </Reveal>
              )}
            </div>
          )}

          {/* Load failed / no questions */}
          {started && !submitted && totalQuestions === 0 && (
            <div className="mx-auto max-w-xl">
              {loadError ? (
                <ErrorState
                  title="Couldn't load the test"
                  text="Check your connection and try again."
                  onRetry={startTest}
                  retrying={isLoading}
                />
              ) : (
                <EmptyState
                  icon={<ClipboardList className="h-5 w-5" />}
                  title="No questions yet"
                  text={`Questions for week ${week} aren't available yet.`}
                  action={
                    <Button variant="outline" onClick={() => router.push("/dashboard")}>
                      Return to dashboard
                    </Button>
                  }
                />
              )}
            </div>
          )}

          {/* Exam interface */}
          {started && !submitted && totalQuestions > 0 && (
            <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
              {/* Question */}
              <Card className="overflow-hidden p-6 sm:p-10">
                {currentQuestion && (
                  <>
                    <AnimatePresence mode="wait" initial={false}>
                      <motion.div
                        key={currentQuestion.id}
                        initial={{ opacity: 0, x: 24 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -24 }}
                        transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone="brand">
                            Question {currentIndex + 1} of {totalQuestions}
                          </Badge>
                          <Badge tone="neutral">
                            {currentQuestion.marks || 1} mark{currentQuestion.marks !== 1 ? "s" : ""}
                          </Badge>
                        </div>
                        <h2 className="mt-5 text-xl font-semibold leading-snug tracking-tight text-ink sm:text-2xl">
                          {currentQuestion.questionText}
                        </h2>

                        <div className="mt-8 space-y-3" role="group" aria-label="Answer options">
                          {(["A", "B", "C", "D"] as const).map((option) => {
                            const optionText = currentQuestion[`option${option}`];
                            if (!optionText) return null;

                            const isSelected = answers[currentQuestion.id] === option;

                            return (
                              <motion.button
                                key={option}
                                type="button"
                                whileTap={{ scale: 0.99 }}
                                onClick={() => handleAnswer(currentQuestion.id, option)}
                                aria-pressed={isSelected}
                                className={cn(
                                  "flex min-h-14 w-full items-center gap-4 rounded-2xl border p-4 text-left transition-all duration-200 sm:p-5",
                                  isSelected
                                    ? "border-brand-500 bg-brand-50 ring-4 ring-brand-100"
                                    : "border-line bg-white hover:border-brand-200 hover:bg-surface",
                                )}
                              >
                                <span
                                  className={cn(
                                    "inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-semibold transition-colors",
                                    isSelected ? "bg-brand-600 text-white" : "bg-surface text-ink-2 ring-1 ring-inset ring-line",
                                  )}
                                >
                                  {option}
                                </span>
                                <span className="flex-1 font-medium text-ink">{optionText}</span>
                                {isSelected && <Check className="h-5 w-5 shrink-0 text-brand-600" aria-hidden />}
                              </motion.button>
                            );
                          })}
                        </div>
                      </motion.div>
                    </AnimatePresence>

                    <div className="mt-10 flex items-center justify-between gap-3 border-t border-line pt-6">
                      <Button
                        variant="outline"
                        onClick={() => setCurrentIndex((i) => Math.max(0, i - 1))}
                        disabled={currentIndex === 0}
                      >
                        <ArrowLeft className="h-4 w-4" aria-hidden />
                        Previous
                      </Button>

                      <span className="hidden text-sm text-ink-3 sm:inline">
                        Selected: <span className="font-semibold text-ink">{answers[currentQuestion.id] || "None"}</span>
                      </span>

                      {currentIndex < totalQuestions - 1 ? (
                        <Button onClick={() => setCurrentIndex((i) => Math.min(totalQuestions - 1, i + 1))}>
                          Next
                          <ArrowRight className="h-4 w-4" aria-hidden />
                        </Button>
                      ) : (
                        <Button onClick={calculateScore}>Submit test</Button>
                      )}
                    </div>
                  </>
                )}
              </Card>

              {/* Navigator */}
              <Card className="p-6 lg:sticky lg:top-24">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-ink">Questions</h3>
                  <span className="text-sm tabular-nums text-ink-3">
                    {answeredCount}/{totalQuestions} answered
                  </span>
                </div>

                <div className="mt-5 grid grid-cols-5 gap-2">
                  {questions.map((q, idx) => {
                    const status = questionStatus(q);
                    const isCurrent = currentIndex === idx;
                    const statusClasses = {
                      not: "bg-surface text-ink-3 ring-line",
                      visited: "bg-amber-50 text-amber-800 ring-amber-200",
                      answered: "bg-brand-600 text-white ring-brand-600",
                    };

                    return (
                      <button
                        key={q.id}
                        type="button"
                        aria-label={`Question ${idx + 1}, ${status === "not" ? "not visited" : status}`}
                        aria-current={isCurrent ? "step" : undefined}
                        onClick={() => {
                          setCurrentIndex(idx);
                          setVisited((p) => ({ ...p, [q.id]: true }));
                        }}
                        className={cn(
                          "flex h-11 w-full items-center justify-center rounded-xl text-sm font-semibold ring-1 ring-inset transition-all hover:-translate-y-0.5",
                          statusClasses[status],
                          isCurrent && "outline outline-2 outline-offset-2 outline-brand-500",
                        )}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>

                <ul className="mt-5 flex flex-wrap gap-x-4 gap-y-2 text-xs text-ink-3">
                  <li className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-brand-600" aria-hidden /> Answered
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-amber-300" aria-hidden /> Visited
                  </li>
                  <li className="inline-flex items-center gap-1.5">
                    <span className="h-2.5 w-2.5 rounded-full bg-line" aria-hidden /> Not visited
                  </li>
                </ul>

                <div className="mt-6 space-y-2 border-t border-line pt-6">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => {
                      const firstUnanswered = questions.findIndex((q) => !answers[q.id]);
                      setCurrentIndex(firstUnanswered >= 0 ? firstUnanswered : questions.length - 1);
                    }}
                  >
                    First unanswered
                  </Button>
                  <Button variant="dark" className="w-full" onClick={calculateScore}>
                    Submit test
                  </Button>
                </div>
              </Card>
            </div>
          )}

          {/* Results */}
          {submitted && (
            <AnimatePresence mode="wait" initial={false}>
              {!showAnswers ? (
                <motion.div
                  key="result"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto max-w-2xl"
                >
                  <Card className="p-6 text-center sm:p-12">
                    <motion.span
                      initial={{ scale: 0.6, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.1 }}
                      className={cn(
                        "mx-auto inline-flex h-16 w-16 items-center justify-center rounded-full ring-8",
                        passed ? "bg-emerald-50 text-emerald-600 ring-emerald-50/60" : "bg-amber-50 text-amber-600 ring-amber-50/60",
                      )}
                    >
                      {passed ? <GraduationCap className="h-8 w-8" aria-hidden /> : <BookOpenCheck className="h-8 w-8" aria-hidden />}
                    </motion.span>

                    <h2 className="mt-6 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
                      {passed ? "You passed" : "Test complete"}
                    </h2>
                    <p className={cn("mt-2 text-[15px]", passed ? "text-emerald-700" : "text-ink-3")}>
                      {passed
                        ? "You passed the test."
                        : `You need ${requiredToPass - correctAnswersCount} more correct answers to pass.`}
                    </p>

                    <div className="mt-8 flex items-end justify-center gap-2">
                      <CountUp value={String(score)} className="text-6xl font-semibold tracking-tight text-ink tabular-nums" />
                      <span className="pb-2 text-lg text-ink-3">/ {totalMarks} points</span>
                    </div>

                    <div className="mx-auto mt-8 max-w-sm">
                      <div className="flex justify-between text-xs text-ink-3">
                        <span>
                          {correctAnswersCount} of {totalQuestions} correct
                        </span>
                        <span>Pass: {requiredToPass}</span>
                      </div>
                      <div className="relative mt-2 h-2 rounded-full bg-surface">
                        <motion.div
                          className={cn("h-full rounded-full", passed ? "bg-emerald-500" : "bg-amber-400")}
                          initial={{ width: 0 }}
                          animate={{ width: `${totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0}%` }}
                          transition={{ duration: 0.9, ease: "easeOut", delay: 0.2 }}
                        />
                        {totalQuestions > 0 && (
                          <span
                            className="absolute -top-1 h-4 w-0.5 rounded bg-ink/40"
                            style={{ left: `${(requiredToPass / totalQuestions) * 100}%` }}
                            aria-hidden
                          />
                        )}
                      </div>
                    </div>

                    {isUpdatingProgress && (
                      <p className="mt-6 inline-flex items-center gap-2 text-sm text-ink-3">
                        <Spinner className="h-4 w-4" /> Saving your progress...
                      </p>
                    )}

                    <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
                      <Button size="lg" onClick={() => setShowAnswers(true)}>
                        Review answers
                      </Button>
                      <Button variant="outline" size="lg" onClick={() => router.push("/dashboard")}>
                        Back to dashboard
                      </Button>
                    </div>
                  </Card>
                </motion.div>
              ) : (
                <motion.div
                  key="review"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -16 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="mx-auto max-w-3xl"
                >
                  <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
                    <div>
                      <Eyebrow>Week {week}</Eyebrow>
                      <h2 className="mt-4 text-3xl font-semibold tracking-tight text-ink sm:text-4xl">Answer review</h2>
                    </div>
                    <Button variant="ghost" onClick={() => setShowAnswers(false)}>
                      <ArrowLeft className="h-4 w-4" aria-hidden />
                      Back to score
                    </Button>
                  </div>

                  <ol className="space-y-4">
                    {questions.map((q, index) => {
                      const userAnswer = answers[q.id];
                      const isCorrect = q.correctOption === userAnswer;

                      return (
                        <li key={q.id}>
                          <Card className="p-5 sm:p-6">
                            <div className="flex items-start gap-3">
                              {isCorrect ? (
                                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-emerald-600" aria-label="Correct" />
                              ) : (
                                <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" aria-label="Incorrect" />
                              )}
                              <h3 className="flex-1 font-semibold leading-snug text-ink">
                                {index + 1}. {q.questionText}
                              </h3>
                              <Badge tone={isCorrect ? "success" : "danger"} className="shrink-0">
                                {isCorrect ? "Correct" : "Incorrect"}
                              </Badge>
                            </div>

                            <div className="mt-4 grid gap-3 pl-8 md:grid-cols-2">
                              <div>
                                <p className="mb-1.5 text-xs font-medium text-ink-3">Your answer</p>
                                <div
                                  className={cn(
                                    "rounded-xl px-3 py-2.5 text-sm ring-1 ring-inset",
                                    isCorrect ? "bg-emerald-50 text-emerald-800 ring-emerald-100" : "bg-red-50 text-red-800 ring-red-100",
                                  )}
                                >
                                  {userAnswer ? (
                                    <span className="font-medium">
                                      {userAnswer}. {q[`option${userAnswer}`]}
                                    </span>
                                  ) : (
                                    <span className="text-ink-3">Not answered</span>
                                  )}
                                </div>
                              </div>

                              {!isCorrect && q.correctOption && (
                                <div>
                                  <p className="mb-1.5 text-xs font-medium text-ink-3">Correct answer</p>
                                  <div className="rounded-xl bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800 ring-1 ring-inset ring-emerald-100">
                                    <span className="font-medium">
                                      {q.correctOption}. {q[`option${q.correctOption}`]}
                                    </span>
                                  </div>
                                </div>
                              )}
                            </div>
                          </Card>
                        </li>
                      );
                    })}
                  </ol>

                  <div className="mt-10 flex justify-center">
                    <Button size="lg" onClick={() => router.push("/dashboard")}>
                      Return to dashboard
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          )}
        </div>
      </main>

      <footer className="border-t border-line bg-white py-6">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-ink-3 sm:px-6">
          &copy; {new Date().getFullYear()} Vereda. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

const TestPage = () => (
  <Suspense
    fallback={
      <div className="flex min-h-screen items-center justify-center bg-surface">
        <Spinner className="h-8 w-8" />
      </div>
    }
  >
    <TestContent />
  </Suspense>
);

export default TestPage;
