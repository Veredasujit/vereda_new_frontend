"use client";

import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { useGetWeeklyResultsQuery } from "@/Redux/api/weekApi";
import { Trophy, AlertTriangle, Lock, PlayCircle, RotateCw, ClipboardCheck } from "lucide-react";
import { Badge, Button, EmptyState, ErrorState, Skeleton, Stagger, StaggerItem, cn, motion } from "@/ui";

interface QuizProps {
  onExit: () => void;
}

const QuizComponent: React.FC<QuizProps> = ({ onExit }) => {
  const router = useRouter();
  const { data, isLoading, isFetching, error, refetch } = useGetWeeklyResultsQuery();
  const weeks = useMemo(() => (Array.isArray(data?.data) ? data.data : []), [data]);

  // Determine locked weeks
  const availableWeeks = useMemo(() => {
    if (!weeks.length) return [];
    const firstLockedIndex = weeks.findIndex((w) => w.weekStatus === "failed" || w.weekStatus === "appearing");
    return weeks.map((w, i) => ({
      ...w,
      isLocked: i > firstLockedIndex && firstLockedIndex !== -1,
    }));
  }, [weeks]);

  const completedWeeks = weeks.filter((w) => w.weekStatus === "passed").length;
  const totalWeeks = weeks.length;
  const progressPercentage = totalWeeks > 0 ? (completedWeeks / totalWeeks) * 100 : 0;

  // Retests are allowed for passed, failed and appearing weeks
  const handleWeekClick = (weekNumber: number, isLocked: boolean) => {
    if (isLocked) return;
    router.push(`/test?week=${weekNumber}`);
  };

  if (isLoading)
    return (
      <div className="space-y-5" aria-busy="true" aria-label="Loading your progress">
        <Skeleton className="h-36 border border-line" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-44 border border-line" />
          ))}
        </div>
      </div>
    );

  if (error) {
    // A 401/404 here means the user has no test records yet
    const status = typeof error === "object" && error !== null && "status" in error ? error.status : undefined;
    const noRecords = status === 401 || status === 404;

    if (noRecords) {
      return (
        <EmptyState
          icon={<ClipboardCheck className="h-5 w-5" />}
          title="No test records yet"
          text="Start the Week 1 test to begin."
          action={
            <Button onClick={() => router.push("/test?week=1")}>
              <PlayCircle className="h-4 w-4" aria-hidden />
              Start Week 1 test
            </Button>
          }
        />
      );
    }

    return (
      <div className="space-y-4">
        <ErrorState title="We couldn't load your tests" onRetry={() => refetch()} retrying={isFetching} />
        <div className="flex justify-center">
          <Button variant="ghost" size="sm" onClick={() => router.push("/test?week=1")}>
            Start Week 1 test
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Progress header */}
      <div className="relative overflow-hidden rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-soft)] sm:p-7">
        <div className="pointer-events-none absolute -right-16 -top-20 h-56 w-56 rounded-full bg-brand-100/60 blur-3xl" aria-hidden />
        <div className="relative flex flex-col items-start justify-between gap-6 md:flex-row md:items-center">
          <div className="w-full max-w-xl">
            <Badge tone="brand">Weekly tests</Badge>
            <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Flutter Learning Path</h2>

            <div className="mt-5">
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-ink-3">Overall progress</span>
                <span className="font-semibold text-ink">
                  {completedWeeks}/{totalWeeks} weeks
                </span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-surface"
                role="progressbar"
                aria-valuenow={Math.round(progressPercentage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Weeks passed"
              >
                <motion.div
                  className="h-full rounded-full bg-brand-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>
          </div>

          <Button variant="outline" size="sm" onClick={onExit}>
            Exit
          </Button>
        </div>
      </div>

      {/* Week cards */}
      {availableWeeks.length > 0 ? (
        <Stagger className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {availableWeeks.map((week) => {
            const isAppearing = week.weekStatus === "appearing";
            const isPassed = week.weekStatus === "passed";
            const isFailed = week.weekStatus === "failed";
            const isLocked = week.isLocked;

            const icon = isLocked ? (
              <Lock className="h-5 w-5" aria-hidden />
            ) : isPassed ? (
              <Trophy className="h-5 w-5" aria-hidden />
            ) : isFailed ? (
              <AlertTriangle className="h-5 w-5" aria-hidden />
            ) : (
              <PlayCircle className="h-5 w-5" aria-hidden />
            );
            const tile = isLocked
              ? "bg-surface text-ink-3 ring-line"
              : isPassed
                ? "bg-emerald-50 text-emerald-600 ring-emerald-100"
                : isFailed
                  ? "bg-red-50 text-red-600 ring-red-100"
                  : "bg-brand-50 text-brand-600 ring-brand-100";

            const badge = isLocked ? (
              <Badge tone="neutral">Locked</Badge>
            ) : isPassed ? (
              <Badge tone="success">Passed</Badge>
            ) : isFailed ? (
              <Badge tone="danger">Not passed</Badge>
            ) : (
              <Badge tone="brand">Ready</Badge>
            );

            return (
              <StaggerItem key={week.id} className="h-full">
                <div
                  className={cn(
                    "flex h-full flex-col rounded-2xl border border-line p-5 transition-all duration-300",
                    isLocked ? "bg-surface/60" : "bg-white shadow-[var(--shadow-soft)] hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]",
                  )}
                >
                  <div className="flex items-start justify-between">
                    <span className={cn("inline-flex h-11 w-11 items-center justify-center rounded-xl ring-1 ring-inset", tile)}>{icon}</span>
                    {badge}
                  </div>

                  <h3 className="mt-4 text-lg font-semibold tracking-tight text-ink">Week {week.weekNumber}</h3>
                  <p className="mt-1 text-sm text-ink-3">
                    {isAppearing && "Ready to begin."}
                    {isPassed && "Retake it anytime."}
                    {isFailed && "You can retake it."}
                    {isLocked && "Finish the previous week first."}
                  </p>

                  {!isAppearing && !isLocked && (
                    <p className="mt-3 text-sm text-ink-3">
                      Score <span className="ml-1 text-base font-semibold text-ink">{week.weekMarks ?? "—"}</span>
                    </p>
                  )}

                  <div className="mt-auto pt-5">
                    <Button
                      variant={isLocked ? "outline" : isPassed ? "outline" : "primary"}
                      size="md"
                      disabled={isLocked}
                      onClick={() => handleWeekClick(week.weekNumber, isLocked)}
                      className="w-full"
                    >
                      {isLocked ? (
                        <Lock className="h-4 w-4" aria-hidden />
                      ) : isPassed || isFailed ? (
                        <RotateCw className="h-4 w-4" aria-hidden />
                      ) : (
                        <PlayCircle className="h-4 w-4" aria-hidden />
                      )}
                      {isLocked ? "Locked" : isAppearing ? "Begin quiz" : isFailed ? "Retake quiz" : isPassed ? "Retest" : "Start"}
                    </Button>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </Stagger>
      ) : (
        <EmptyState icon={<ClipboardCheck className="h-5 w-5" />} title="No modules available" text="New weekly modules will appear here soon." />
      )}
    </div>
  );
};

export default QuizComponent;
