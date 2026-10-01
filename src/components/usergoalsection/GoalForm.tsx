"use client";

import { useState, useEffect } from "react";
import { useCreateGoalMutation, useUpdateGoalMutation } from "../../Redux/api/usergoalApi";
import toast from "react-hot-toast";
import { UserGoal } from "../../Redux/api/usergoalApi";
import { Clock, PlayCircle, CheckCircle } from "lucide-react";
import { Button, Field, Input, Modal, Textarea, cn } from "@/ui";

interface GoalFormProps {
  /** Controls visibility; keep the form mounted while closing so the modal can animate out. */
  open?: boolean;
  userId: string | undefined;
  editingGoal: UserGoal | null;
  onClose: () => void;
  onSuccess: () => void;
}

type GoalStatus = "pending" | "in-progress" | "completed";

const getErrorMessage = (error: unknown, fallback: string) => {
  if (error && typeof error === "object" && "data" in error) {
    const data = (error as { data?: unknown }).data;
    if (data && typeof data === "object" && "message" in data) {
      const message = (data as { message?: unknown }).message;
      if (typeof message === "string" && message) return message;
    }
  }
  return fallback;
};

const GoalForm: React.FC<GoalFormProps> = ({ open = true, userId, editingGoal, onClose, onSuccess }) => {
  const [createGoal] = useCreateGoalMutation();
  const [updateGoal] = useUpdateGoalMutation();

  const [formData, setFormData] = useState({
    goalTitle: "",
    goalDescription: "",
    targetDate: "",
    status: "pending" as GoalStatus,
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (editingGoal) {
      setFormData({
        goalTitle: editingGoal.goalTitle || "",
        goalDescription: editingGoal.goalDescription || "",
        targetDate: editingGoal.targetDate?.slice(0, 10) || "",
        status: editingGoal.status || "pending",
      });
    }
  }, [editingGoal]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleStatusChange = (status: GoalStatus) => {
    setFormData((prev) => ({ ...prev, status }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmitting) return;

    if (!userId) {
      setFormError("Your session has expired. Please log in again.");
      return;
    }

    const payload = {
      goalTitle: formData.goalTitle.trim(),
      goalDescription: formData.goalDescription.trim(),
      targetDate: formData.targetDate,
      status: formData.status,
    };

    if (!payload.goalTitle) {
      setFormError("Goal title is required.");
      return;
    }

    setFormError(null);
    setIsSubmitting(true);

    try {
      const res = editingGoal
        ? await updateGoal({ id: editingGoal.id, updatedData: payload })
        : await createGoal({ userId, ...payload });

      if ("data" in res && res.data?.success) {
        toast.success(editingGoal ? "Goal updated" : "Goal created");
        onSuccess();
      } else {
        const message =
          "error" in res
            ? getErrorMessage(res.error, "Couldn't save your goal. Please try again.")
            : res.data?.message || "Couldn't save your goal. Please try again.";
        setFormError(message);
        toast.error(message);
      }
    } catch (error) {
      const message = getErrorMessage(error, "Couldn't save your goal. Please try again.");
      setFormError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusOptions: { value: GoalStatus; label: string; icon: React.ReactNode }[] = [
    { value: "pending", label: "Not started", icon: <Clock className="h-4 w-4" /> },
    { value: "in-progress", label: "In progress", icon: <PlayCircle className="h-4 w-4" /> },
    { value: "completed", label: "Completed", icon: <CheckCircle className="h-4 w-4" /> },
  ];

  const today = new Date().toISOString().split("T")[0];
  // When editing, allow an existing past target date so the form can still be submitted
  const minDate =
    editingGoal && formData.targetDate && formData.targetDate < today ? formData.targetDate : today;

  return (
    <Modal
      open={open}
      onClose={onClose}
      closeDisabled={isSubmitting}
      title={editingGoal ? "Edit goal" : "New goal"}
      description={editingGoal ? "Update your goal details." : "What do you want to achieve?"}
    >
      <form onSubmit={handleSubmit} className="space-y-5" noValidate>
        <Field label="Goal title" htmlFor="goalTitle" hint={`${formData.goalTitle.length}/100`}>
          <Input
            id="goalTitle"
            name="goalTitle"
            placeholder="e.g. Finish the Flutter course"
            value={formData.goalTitle}
            onChange={handleChange}
            required
            maxLength={100}
          />
        </Field>

        <Field label="Description" htmlFor="goalDescription" hint={`Optional · ${formData.goalDescription.length}/500`}>
          <Textarea
            id="goalDescription"
            name="goalDescription"
            placeholder="Add details"
            value={formData.goalDescription}
            onChange={handleChange}
            rows={3}
            maxLength={500}
          />
        </Field>

        {editingGoal && (
          <div>
            <span className="mb-1.5 block text-sm font-medium text-ink">Status</span>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Status">
              {statusOptions.map((option) => {
                const selected = formData.status === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    onClick={() => handleStatusChange(option.value)}
                    className={cn(
                      "flex min-h-[72px] flex-col items-center justify-center gap-1.5 rounded-2xl border p-3 text-xs font-semibold transition-all sm:text-sm",
                      selected
                        ? "border-brand-600 bg-brand-50 text-brand-700 ring-4 ring-brand-100"
                        : "border-line text-ink-2 hover:border-brand-200 hover:bg-surface",
                    )}
                  >
                    {option.icon}
                    <span>{option.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <Field label="Target date" htmlFor="targetDate" hint="Optional">
          <Input id="targetDate" type="date" name="targetDate" value={formData.targetDate} onChange={handleChange} min={minDate} />
        </Field>

        {formError && (
          <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700" role="alert">
            {formError}
          </p>
        )}

        <div className="flex flex-col-reverse gap-3 pt-2 sm:flex-row">
          <Button type="button" variant="outline" onClick={onClose} disabled={isSubmitting} className="sm:flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting} disabled={!formData.goalTitle.trim()} className="sm:flex-1">
            {isSubmitting ? (editingGoal ? "Updating..." : "Creating...") : editingGoal ? "Update goal" : "Create goal"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default GoalForm;
