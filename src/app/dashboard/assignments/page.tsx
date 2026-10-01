"use client";

import { useState } from "react";
import { FolderKanban } from "lucide-react";
import QuizComponent from "./quizComponent/QuizComponent";
import { DashboardPageHeader } from "../DashboardClientLayout";
import { AnimatePresence, EmptyState, Tabs, motion } from "@/ui";

type TabType = "projects" | "quizzes";

const tabs: { id: TabType; label: string }[] = [
  { id: "projects", label: "Assignments" },
  { id: "quizzes", label: "Quizzes" },
];

const StudentDashboard = () => {
  const [activeTab, setActiveTab] = useState<TabType>("projects");

  return (
    <div>
      <DashboardPageHeader title="My Assignments" subtitle="Projects and weekly quizzes." />

      <Tabs tabs={tabs} value={activeTab} onChange={setActiveTab} className="mb-6" />

      <div className="min-h-[300px]">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
          >
            {activeTab === "projects" ? (
              <EmptyState
                icon={<FolderKanban className="h-5 w-5" />}
                title="No projects yet"
                text="Your assignments and hands-on projects will appear here."
              />
            ) : (
              <QuizComponent onExit={() => setActiveTab("projects")} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudentDashboard;
