"use client";

import { useEffect, useState } from "react";
import { CheckCircle2, Loader2, X, XCircle } from "lucide-react";
import * as api from "@/webinars/lib/api";
import type { Webinar } from "@/webinars/lib/types";
import { useCurrentUser } from "@/webinars/lib/hooks";
import { Button, cx } from "./ui";

// Dummy question bank. Backend: GET /webinars/:id/quiz (answers never sent to the client).
const BANK: Record<Webinar["topic"], { q: string; options: string[]; answer: number }[]> = {
  "ai-ml": [
    { q: "What makes LLM output easier to use inside an app?", options: ["Longer prompts", "Asking for structured output like JSON", "Higher temperature", "Removing examples"], answer: 1 },
    { q: "Which is a safe way to use AI while studying?", options: ["Copy answers directly", "Ask it to explain, then solve yourself", "Skip reading the docs", "Never check its output"], answer: 1 },
    { q: "Tool calling lets a model…", options: ["Train itself", "Request your code to run a function", "Access the internet by default", "Store memory forever"], answer: 1 },
  ],
  flutter: [
    { q: "What rebuilds when state changes in Flutter?", options: ["The whole app always", "Widgets that depend on that state", "Only the MaterialApp", "Nothing"], answer: 1 },
    { q: "Hot reload keeps…", options: ["App state", "Nothing", "Only images", "The database"], answer: 0 },
    { q: "Which is NOT a state management approach?", options: ["Riverpod", "Bloc", "Provider", "Gradle"], answer: 3 },
  ],
  backend: [
    { q: "FastAPI endpoints are defined with…", options: ["Decorators", "XML files", "Makefiles", "CSS"], answer: 0 },
    { q: "HTTP 200 means…", options: ["Server error", "Not found", "Success", "Redirect"], answer: 2 },
    { q: "Where should a trained model be loaded?", options: ["On every request", "Once at startup", "In the browser", "Never"], answer: 1 },
  ],
  career: [
    { q: "What should a fresher's resume highlight first?", options: ["Hobbies", "Projects with links", "School marks only", "A long objective"], answer: 1 },
    { q: "Best way to explain a project?", options: ["List every library", "Problem, what you built, result", "Read the code aloud", "Skip it"], answer: 1 },
    { q: "Mock interviews help because…", options: ["They replace learning", "You practise explaining clearly", "They guarantee a job", "They are required"], answer: 1 },
  ],
};

export default function QuizModal({ webinar: w, open, onClose }: { webinar: Webinar; open: boolean; onClose: () => void }) {
  const user = useCurrentUser();
  const qs = BANK[w.topic];
  const [answers, setAnswers] = useState<(number | null)[]>(qs.map(() => null));
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState<{ passed: boolean; correct: number } | null>(null);

  useEffect(() => {
    if (open) {
      setAnswers(qs.map(() => null));
      setResult(null);
    }
  }, [open, qs]);

  if (!open) return null;

  const submit = async () => {
    setBusy(true);
    const correct = answers.filter((a, i) => a === qs[i].answer).length;
    const passed = await api.submitQuiz(w.id, user ? { id: user.id, email: user.email } : null, correct, qs.length);
    setResult({ passed, correct });
    setBusy(false);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 sm:items-center sm:p-4" role="dialog" aria-modal="true">
      <div className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white shadow-xl sm:max-w-lg sm:rounded-2xl">
        <div className="flex items-start justify-between border-b border-line p-5">
          <div>
            <p className="text-xs font-medium text-brand-600">Certificate quiz · pass mark 60%</p>
            <h2 className="mt-0.5 text-lg font-bold text-ink">{w.title}</h2>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-ink-3 hover:bg-surface" aria-label="Close">
            <X size={20} />
          </button>
        </div>

        {result ? (
          <div className="p-6 text-center">
            {result.passed ? <CheckCircle2 className="mx-auto text-green-600" size={44} /> : <XCircle className="mx-auto text-red-500" size={44} />}
            <p className="mt-3 text-xl font-bold text-ink">{result.passed ? "Passed — certificate unlocked" : "Not quite"}</p>
            <p className="mt-1 text-sm text-ink-3">
              You got {result.correct} of {qs.length} right.{!result.passed && " You can try again as many times as you like."}
            </p>
            <div className="mt-5 flex justify-center gap-2">
              {!result.passed && <Button variant="secondary" onClick={() => { setAnswers(qs.map(() => null)); setResult(null); }}>Try again</Button>}
              <Button onClick={onClose}>{result.passed ? "See certificate" : "Close"}</Button>
            </div>
          </div>
        ) : (
          <div className="space-y-5 p-5">
            {qs.map((item, i) => (
              <fieldset key={i}>
                <legend className="text-sm font-semibold text-ink">
                  {i + 1}. {item.q}
                </legend>
                <div className="mt-2 grid gap-2">
                  {item.options.map((o, j) => (
                    <label key={o} className={cx("flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm", answers[i] === j ? "border-brand-500 bg-brand-50" : "border-line hover:bg-surface")}>
                      <input type="radio" name={`q${i}`} checked={answers[i] === j} onChange={() => setAnswers(answers.map((a, k) => (k === i ? j : a)))} />
                      {o}
                    </label>
                  ))}
                </div>
              </fieldset>
            ))}
            <Button className="w-full" onClick={submit} disabled={busy || answers.some((a) => a === null)}>
              {busy && <Loader2 size={16} className="animate-spin" />} Submit answers
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
