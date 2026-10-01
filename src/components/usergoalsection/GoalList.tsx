'use client';

import { useCallback, useState, type ReactNode } from "react";
import toast from "react-hot-toast";
import { useGetUserGoalsQuery, useDeleteGoalMutation } from "../../Redux/api/usergoalApi";
import GoalForm from "./GoalForm";
import { UserGoal } from "../../Redux/api/usergoalApi";
import {
  Target,
  Pencil,
  Trash2,
  CalendarDays,
  Clock,
  LayoutGrid,
  List,
  CheckCircle2,
  PlayCircle,
  PauseCircle,
  Plus,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { Badge, Button, CountUp, EmptyState, ErrorState, Skeleton, Stagger, StaggerItem, Tabs, cn, inputClass } from "@/ui";

interface GoalListProps {
  userId: string | undefined;
}

type ViewMode = "grid" | "list";
type StatusFilter = "all" | "pending" | "in-progress" | "completed";

const formatDate = (value?: string | null) => {
  if (!value) return "—";
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const normalizeStatus = (status?: string) => {
  const s = status?.toLowerCase() ?? "";
  return s === "in progress" ? "in-progress" : s;
};

const GoalList: React.FC<GoalListProps> = ({ userId }) => {
  const { data, isLoading, isError, error, isFetching, refetch } = useGetUserGoalsQuery(userId ?? "", { skip: !userId });
  const [deleteGoal] = useDeleteGoalMutation();

  const [openModal, setOpenModal] = useState(false);
  const [formKey, setFormKey] = useState(0);
  const [editingGoal, setEditingGoal] = useState<UserGoal | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [sortBy, setSortBy] = useState<"date" | "title" | "status">("date");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  // Stable reference: the Modal re-runs its focus handling whenever onClose changes
  const closeModal = useCallback(() => setOpenModal(false), []);

  const handleDeleteGoal = async (goal: UserGoal) => {
    if (deletingId) return;
    if (!window.confirm(`Delete "${goal.goalTitle}"? This can't be undone.`)) return;
    setDeletingId(goal.id);
    try {
      await deleteGoal(goal.id).unwrap();
      toast.success("Goal deleted");
    } catch (err) {
      console.error("Failed to delete goal:", err);
      toast.error("Couldn't delete the goal. Please try again.");
    } finally {
      setDeletingId(null);
    }
  };

  const statusBadge = (status: string) => {
    switch (normalizeStatus(status)) {
      case "completed":
        return (
          <Badge tone="success">
            <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
            Completed
          </Badge>
        );
      case "in-progress":
        return (
          <Badge tone="brand">
            <PlayCircle className="h-3.5 w-3.5" aria-hidden />
            In progress
          </Badge>
        );
      case "pending":
        return (
          <Badge tone="warning">
            <PauseCircle className="h-3.5 w-3.5" aria-hidden />
            Pending
          </Badge>
        );
      default:
        return (
          <Badge tone="neutral">
            <Target className="h-3.5 w-3.5" aria-hidden />
            {getDisplayStatus(status)}
          </Badge>
        );
    }
  };

  // Get goals array safely
  const getGoalsArray = (): UserGoal[] => {
    if (!data?.data) return [];
    return Array.isArray(data.data) ? data.data : [data.data];
  };

  // Display status text
  const getDisplayStatus = (status: string): string => {
    switch (status?.toLowerCase()) {
      case "in-progress":
        return "In progress";
      case "pending":
        return "Pending";
      case "completed":
        return "Completed";
      default:
        return status ? status.charAt(0).toUpperCase() + status.slice(1) : "Unknown";
    }
  };

  // Sort goals
  const getSortedGoals = (goals: UserGoal[]): UserGoal[] => {
    const time = (v?: string) => {
      const t = new Date(v || 0).getTime();
      return Number.isNaN(t) ? 0 : t;
    };
    return [...goals].sort((a, b) => {
      switch (sortBy) {
        case "title":
          return (a.goalTitle || "").localeCompare(b.goalTitle || "");
        case "status":
          return (a.status || "").localeCompare(b.status || "");
        case "date":
        default:
          return time(b.createdAt) - time(a.createdAt);
      }
    });
  };

  if (!userId || isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[1, 2, 3, 4].map((n) => (
            <Skeleton key={n} className="h-24 border border-line" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <Skeleton key={n} className="h-52 border border-line" />
          ))}
        </div>
      </div>
    );
  }

  // A 404 means the user has no goals yet
  const isNotFound = isError && typeof error === "object" && error !== null && "status" in error && error.status === 404;

  if (isError && !isNotFound) {
    return <ErrorState title="We couldn't load your goals" onRetry={() => refetch()} retrying={isFetching} />;
  }

  const goals = isNotFound ? [] : getGoalsArray();
  const sortedGoals = getSortedGoals(goals).filter((g) => statusFilter === "all" || normalizeStatus(g.status) === statusFilter);

  const handleAddGoal = () => {
    setEditingGoal(null);
    setFormKey((k) => k + 1);
    setOpenModal(true);
  };

  const handleEditGoal = (goal: UserGoal) => {
    setEditingGoal(goal);
    setFormKey((k) => k + 1);
    setOpenModal(true);
  };

  const countStatus = (status: string) => goals.filter((goal) => normalizeStatus(goal.status) === status).length;

  const completedCount = countStatus("completed");
  const inProgressCount = countStatus("in-progress");
  const pendingCount = countStatus("pending");
  const completionRate = goals.length > 0 ? Math.round((completedCount / goals.length) * 100) : 0;

  const filterTabs: { id: StatusFilter; label: ReactNode }[] = [
    { id: "all", label: <>All <span className="opacity-60">{goals.length}</span></> },
    { id: "pending", label: <>Pending <span className="opacity-60">{pendingCount}</span></> },
    { id: "in-progress", label: <>In progress <span className="opacity-60">{inProgressCount}</span></> },
    { id: "completed", label: <>Completed <span className="opacity-60">{completedCount}</span></> },
  ];

  const viewBtn = (mode: ViewMode, Icon: typeof LayoutGrid, label: string) => (
    <button
      type="button"
      onClick={() => setViewMode(mode)}
      aria-label={`${label} view`}
      aria-pressed={viewMode === mode}
      className={cn("inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors", viewMode === mode ? "bg-ink text-white" : "text-ink-3 hover:text-ink")}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );

  const actionButtons = (goal: UserGoal, compact = false) => {
    const isDeletingThis = deletingId === goal.id;
    return (
      <div className={cn("flex gap-2", !compact && "w-full")}>
        <Button
          variant="outline"
          size="sm"
          onClick={() => handleEditGoal(goal)}
          disabled={isDeletingThis}
          aria-label={compact ? `Edit ${goal.goalTitle}` : undefined}
          className={compact ? "h-10 w-10 px-0" : "h-10 flex-1"}
        >
          <Pencil className="h-4 w-4" aria-hidden />
          {!compact && "Edit"}
        </Button>
        <Button
          variant="danger"
          size="sm"
          onClick={() => handleDeleteGoal(goal)}
          disabled={!!deletingId}
          aria-label={compact ? `Delete ${goal.goalTitle}` : undefined}
          className={compact ? "h-10 w-10 px-0" : "h-10 flex-1"}
        >
          {isDeletingThis ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : <Trash2 className="h-4 w-4" aria-hidden />}
          {!compact && (isDeletingThis ? "Deleting..." : "Delete")}
        </Button>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Stats */}
      {goals.length > 0 && (
        <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-4">
          {[
            { label: "Total goals", value: String(goals.length) },
            { label: "Completed", value: String(completedCount) },
            { label: "In progress", value: String(inProgressCount) },
            { label: "Completion", value: `${completionRate}%` },
          ].map((stat) => (
            <StaggerItem key={stat.label}>
              <div className="rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-soft)] sm:p-5">
                <CountUp value={stat.value} className="block text-2xl font-semibold tracking-tight text-ink sm:text-3xl" />
                <p className="mt-0.5 text-sm text-ink-3">{stat.label}</p>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* Toolbar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {goals.length > 0 ? <Tabs tabs={filterTabs} value={statusFilter} onChange={setStatusFilter} size="sm" /> : <span />}
        <div className="flex flex-wrap items-center gap-2">
          {goals.length > 0 && (
            <>
              <div className="inline-flex items-center gap-1 rounded-full border border-line bg-white p-1">
                {viewBtn("grid", LayoutGrid, "Grid")}
                {viewBtn("list", List, "List")}
              </div>
              <div className="relative">
                <ArrowUpDown className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as "date" | "title" | "status")}
                  aria-label="Sort goals"
                  className={cn(inputClass(), "h-11 w-auto cursor-pointer appearance-none rounded-full pl-10 pr-6 text-sm")}
                >
                  <option value="date">Newest first</option>
                  <option value="title">Title</option>
                  <option value="status">Status</option>
                </select>
              </div>
            </>
          )}
          <Button onClick={handleAddGoal} className="ml-auto lg:ml-0">
            <Plus className="h-4 w-4" aria-hidden />
            New goal
          </Button>
        </div>
      </div>

      {/* Create / edit modal (stays mounted while closing so it can animate out) */}
      <GoalForm key={formKey} open={openModal} userId={userId} editingGoal={editingGoal} onClose={closeModal} onSuccess={closeModal} />

      {/* Empty states */}
      {goals.length === 0 && (
        <EmptyState
          icon={<Target className="h-5 w-5" />}
          title="No goals yet"
          text="Create your first goal to start tracking progress."
          action={
            <Button onClick={handleAddGoal}>
              <Plus className="h-4 w-4" aria-hidden />
              Create a goal
            </Button>
          }
        />
      )}
      {goals.length > 0 && sortedGoals.length === 0 && (
        <EmptyState
          icon={<Target className="h-5 w-5" />}
          title="Nothing here"
          text="No goals match this filter."
          action={
            <Button variant="outline" size="sm" onClick={() => setStatusFilter("all")}>
              Show all
            </Button>
          }
        />
      )}

      {/* Grid view */}
      {sortedGoals.length > 0 && viewMode === "grid" && (
        <Stagger key={`grid-${statusFilter}`} className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {sortedGoals.map((goal) => (
            <StaggerItem key={goal.id} className="h-full">
              <article className="group flex h-full flex-col rounded-2xl border border-line bg-white p-5 shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]">
                <div className="flex items-start justify-between gap-3">
                  {statusBadge(goal.status)}
                  {goal.targetDate && (
                    <span className="inline-flex items-center gap-1 text-xs font-medium text-ink-3">
                      <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                      {formatDate(goal.targetDate)}
                    </span>
                  )}
                </div>

                <div className="mb-5 mt-4 flex-1">
                  <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-ink">{goal.goalTitle}</h3>
                  <p className={cn("mt-1.5 line-clamp-3 text-sm", goal.goalDescription ? "text-ink-3" : "text-ink-3/70")}>
                    {goal.goalDescription || "No description"}
                  </p>
                </div>

                <p className="mb-4 flex items-center gap-1.5 text-xs text-ink-3">
                  <Clock className="h-3.5 w-3.5" aria-hidden />
                  Created {formatDate(goal.createdAt)}
                </p>

                <div className="border-t border-line pt-4">{actionButtons(goal)}</div>
              </article>
            </StaggerItem>
          ))}
        </Stagger>
      )}

      {/* List view: rows that stack on mobile */}
      {sortedGoals.length > 0 && viewMode === "list" && (
        <div className="divide-y divide-line overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-soft)]">
          {sortedGoals.map((goal) => (
            <div key={goal.id} className="flex flex-col gap-3 p-4 transition-colors hover:bg-surface/50 sm:flex-row sm:items-center sm:gap-5 sm:px-6">
              <div className="min-w-0 flex-1">
                <p className="truncate font-semibold text-ink">{goal.goalTitle}</p>
                <p className="mt-0.5 line-clamp-1 text-sm text-ink-3">{goal.goalDescription || "No description"}</p>
              </div>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-ink-3">
                {statusBadge(goal.status)}
                <span className="inline-flex items-center gap-1">
                  <CalendarDays className="h-3.5 w-3.5" aria-hidden />
                  {goal.targetDate ? formatDate(goal.targetDate) : "No target"}
                </span>
                <span className="hidden md:inline">Created {formatDate(goal.createdAt)}</span>
              </div>
              <div className="sm:shrink-0">{actionButtons(goal, true)}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GoalList;
