"use client";
import GoalList from "@/components/usergoalsection/GoalList";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { DashboardPageHeader } from "../DashboardClientLayout";

const GoalsPage = () => {
  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;

  return (
    <div>
      <DashboardPageHeader title="Goals" subtitle="Set goals and track your progress." />
      <GoalList userId={userId} />
    </div>
  );
};

export default GoalsPage;
