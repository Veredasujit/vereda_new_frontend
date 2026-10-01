"use client";
import { useState } from "react";
import Image from "next/image";
import { ArrowRight, CheckCircle2, FileDown, Lock } from "lucide-react";
import { DashboardPageHeader } from "../DashboardClientLayout";
import { Badge, Button, Reveal, motion, cn } from "@/ui";

const CERTIFICATE_SRC = "/images/certificate002.png";
const REQUIRED_ASSIGNMENTS = 7;
const TOTAL_ASSIGNMENTS = 8;

export default function CertificateSection() {
  // Mock user progress: replace with real data from the API when available
  const [completedAssignments] = useState(0);
  const [imageFailed, setImageFailed] = useState(false);

  const isEligible = completedAssignments >= REQUIRED_ASSIGNMENTS;
  const progress = Math.min(100, Math.round((completedAssignments / REQUIRED_ASSIGNMENTS) * 100));
  const remaining = Math.max(0, REQUIRED_ASSIGNMENTS - completedAssignments);

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = CERTIFICATE_SRC;
    link.download = "vereda-course-certificate.png";
    document.body.appendChild(link);
    link.click();
    link.remove();
  };

  return (
    <div>
      <DashboardPageHeader title="Course Certificate" subtitle="Finish your assignments to unlock it." />

      <div className="grid gap-5 lg:grid-cols-5">
        {/* Progress */}
        <Reveal className="lg:col-span-2">
          <div className="flex h-full flex-col rounded-3xl border border-line bg-white p-6 shadow-[var(--shadow-soft)] sm:p-7">
            {isEligible ? (
              <Badge tone="success" className="self-start">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />
                Unlocked
              </Badge>
            ) : (
              <Badge tone="neutral" className="self-start">
                <Lock className="h-3.5 w-3.5" aria-hidden />
                Locked
              </Badge>
            )}

            <h2 className="mt-5 text-xl font-semibold tracking-tight text-ink">
              {isEligible ? "Your certificate is ready" : `${remaining} assignments to go`}
            </h2>
            <p className="mt-1.5 text-sm text-ink-3">
              Complete {REQUIRED_ASSIGNMENTS} of {TOTAL_ASSIGNMENTS} assignments.
            </p>

            <div className="mt-6">
              <div className="mb-2 flex items-baseline justify-between text-sm">
                <span className="text-ink-3">Progress</span>
                <span className="font-semibold text-ink">
                  {completedAssignments}/{REQUIRED_ASSIGNMENTS}
                </span>
              </div>
              <div
                className="h-2.5 overflow-hidden rounded-full bg-surface"
                role="progressbar"
                aria-valuenow={progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Assignments completed"
              >
                <motion.div
                  className="h-full rounded-full bg-brand-gradient"
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
                />
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 lg:mt-auto lg:pt-8">
              {isEligible ? (
                <Button onClick={handleDownload} size="lg">
                  <FileDown className="h-4 w-4" aria-hidden />
                  Download certificate
                </Button>
              ) : (
                <Button href="/dashboard/assignments" variant="dark">
                  Go to assignments
                  <ArrowRight className="h-4 w-4" aria-hidden />
                </Button>
              )}
            </div>
          </div>
        </Reveal>

        {/* Preview */}
        <Reveal delay={0.08} className="lg:col-span-3">
          <figure className="relative overflow-hidden rounded-3xl border border-line bg-surface p-3 shadow-[var(--shadow-soft)] sm:p-4">
            <div className={cn("relative overflow-hidden rounded-2xl bg-white", !isEligible && "select-none")}>
              {imageFailed ? (
                <div className="flex aspect-[1200/850] items-center justify-center text-sm text-ink-3">Preview unavailable</div>
              ) : (
                <Image
                  width={1200}
                  height={850}
                  src={CERTIFICATE_SRC}
                  alt="Certificate preview"
                  className={cn("h-auto w-full transition", !isEligible && "opacity-60 blur-[1.5px] grayscale-[40%]")}
                  onError={() => setImageFailed(true)}
                />
              )}
              {!isEligible && !imageFailed && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="inline-flex items-center gap-2 rounded-full bg-white/90 px-4 py-2 text-sm font-semibold text-ink shadow-[var(--shadow-soft)] backdrop-blur">
                    <Lock className="h-4 w-4 text-ink-3" aria-hidden />
                    Preview
                  </span>
                </div>
              )}
            </div>
          </figure>
        </Reveal>
      </div>
    </div>
  );
}
