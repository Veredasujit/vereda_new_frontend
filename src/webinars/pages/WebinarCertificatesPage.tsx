"use client";
import { DashboardPageHeader } from "@/app/dashboard/DashboardClientLayout";

// Webinar certificates (separate from the existing course Certificate page).

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import toast from "react-hot-toast";
import { Award, ChevronDown, Copy, Download, Loader2 } from "lucide-react";
import * as api from "@/webinars/lib/api";
import { useCurrentUser, useMyRegistrations, useNow } from "@/webinars/lib/hooks";
import type { CertificateState, Webinar, WebinarRegistration } from "@/webinars/lib/types";
import { CERT_COPY, certificateId, certificateState, endOf, fmtDate, fmtDateLong, pdfSafe, recordingState, RECORDING_PROCESSING_HOURS } from "@/webinars/lib/utils";
import CertificatePreview from "@/webinars/components/CertificatePreview";
import QuizModal from "@/webinars/components/QuizModal";
import { Badge, Button, EmptyState, Skeleton, cx } from "@/webinars/components/ui";

type Item = { w: Webinar; r: WebinarRegistration; state: CertificateState };

const ORDER: CertificateState[] = ["eligible", "quiz-pending", "processing", "after-webinar", "waitlisted", "low-attendance", "missed", "cancelled"];

export default function WebinarCertificatesPage() {
  const user = useCurrentUser();
  const now = useNow(30_000);
  const regs = useMyRegistrations();
  const [quizFor, setQuizFor] = useState<Webinar | null>(null);

  useEffect(() => {
    if (user) api.seedDemoHistory({ id: user.id, name: user.name, email: user.email, phone: user.phone });
  }, [user]);

  const items: Item[] = useMemo(() => {
    if (!now) return [];
    return regs
      .map((r) => ({ r, w: api.getWebinarById(r.webinarId)! }))
      .filter((x) => x.w && x.w.certificate.offered)
      .map((x) => ({ ...x, state: certificateState(x.w, now, x.r) }))
      .sort((a, b) => ORDER.indexOf(a.state) - ORDER.indexOf(b.state) || endOf(b.w) - endOf(a.w));
  }, [regs, now]);

  const ready = items.filter((i) => i.state === "eligible");
  const rest = items.filter((i) => i.state !== "eligible");
  const displayName = user?.name?.trim() || "";

  return (
    <div className="space-y-8">
      <DashboardPageHeader
        title="Webinar Certificates"
        subtitle={
          <>
            For live webinars. Course certificates are on the{" "}
            <Link href="/dashboard/Certificate" className="font-medium text-brand-700 hover:underline">Certificate</Link> page.
          </>
        }
      />

      {displayName && pdfSafe(displayName) !== displayName && (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          Your profile name has characters the certificate can&apos;t print yet. Add your name in English in{" "}
          <Link href="/dashboard/settings" className="font-semibold underline">Settings</Link> before downloading.
        </p>
      )}

      {!now ? (
        <Skeleton className="h-64 w-full rounded-2xl" />
      ) : items.length === 0 ? (
        <EmptyState
          title="No webinar certificates yet"
          text="Attend a webinar live to earn a participation certificate. It shows up here within 24 hours."
          action={<Button href="/webinars">Find a webinar</Button>}
        />
      ) : (
        <>
          <section>
            <h2 className="text-lg font-semibold text-ink">Ready to download ({ready.length})</h2>
            {ready.length === 0 ? (
              <p className="mt-2 text-sm text-ink-3">Nothing ready yet — see what&apos;s pending below.</p>
            ) : (
              <ul className="mt-4 space-y-4">
                {ready.map((it) => (
                  <ReadyCertificate key={it.w.id} item={it} name={displayName || it.r.name} />
                ))}
              </ul>
            )}
          </section>

          {rest.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-ink">In progress & not eligible</h2>
              <ul className="mt-4 divide-y divide-gray-100 rounded-3xl border border-line bg-white">
                {rest.map(({ w, r, state }) => {
                  const rec = recordingState(w, now, r);
                  const copy = CERT_COPY[state];
                  return (
                    <li key={w.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <Badge tone={copy.tone === "red" ? "gray" : copy.tone}>{copy.label}</Badge>
                          <span className="text-xs text-ink-3">{fmtDate(w.sessions[0].startsAt)}</span>
                        </div>
                        <Link href={`/webinars/${w.slug}`} className="mt-1 block font-semibold text-ink hover:text-brand-700">{w.title}</Link>
                        <p className="text-sm text-ink-3">
                          {copy.text(w)}
                          {state === "low-attendance" && r.attendancePct !== undefined && ` You attended ${r.attendancePct}%.`}
                          {state === "processing" && ` Expected by ${fmtDateLong(endOf(w) + RECORDING_PROCESSING_HOURS * 3_600_000)}.`}
                        </p>
                      </div>
                      <div className="flex shrink-0 gap-2">
                        {state === "quiz-pending" && <Button size="sm" onClick={() => setQuizFor(w)}>Take quiz</Button>}
                        {(state === "missed" || state === "low-attendance") && rec === "available" && (
                          <Button size="sm" variant="secondary" href={`/webinars/${w.slug}/recording`}>Watch recording</Button>
                        )}
                        {(state === "missed" || state === "low-attendance") && <Button size="sm" variant="ghost" href="/webinars">Next webinars</Button>}
                        {state === "after-webinar" && <Button size="sm" variant="secondary" href={`/webinars/${w.slug}`}>View</Button>}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </section>
          )}
        </>
      )}

      {quizFor && <QuizModal webinar={quizFor} open onClose={() => setQuizFor(null)} />}
    </div>
  );
}

function ReadyCertificate({ item: { w, r }, name }: { item: Item; name: string }) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const id = certificateId(w, r.email);
  const speakers = w.speakerIds.map((s) => api.getSpeaker(s)?.name).filter(Boolean) as string[];
  const verifyPath = `/webinars/verify?id=${id}`;

  const download = async () => {
    setBusy(true);
    try {
      // pdf-lib is loaded only when someone downloads
      const { downloadCertificatePdf } = await import("@/webinars/lib/certificatePdf");
      await downloadCertificatePdf({ name, webinar: w, certId: id, speakers, verifyUrl: "vereda.co.in/webinars/verify" });
    } catch (e) {
      toast.error((e as Error)?.name === "CertificateNameError" ? (e as Error).message : "Couldn't create the PDF. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}${verifyPath}`);
      toast.success("Verification link copied");
    } catch {
      toast.error("Couldn't copy — select the ID manually");
    }
  };

  return (
    <li className="overflow-hidden rounded-3xl border border-line bg-white">
      <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
          <Award size={22} />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-semibold text-ink">{w.title}</p>
          <p className="text-sm text-ink-3">
            {fmtDateLong(endOf(w))} · attended {r.attendancePct}% · <span className="font-mono">{id}</span>
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={download} disabled={busy}>
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Download size={15} />} Download PDF
          </Button>
          <Button size="sm" variant="secondary" onClick={copy}><Copy size={15} /> Verify link</Button>
          <Button size="sm" variant="ghost" onClick={() => setOpen(!open)} aria-expanded={open}>
            Preview <ChevronDown size={15} className={cx("transition", open && "rotate-180")} />
          </Button>
        </div>
      </div>
      {open && (
        <div className="border-t border-line bg-surface p-4 sm:p-6">
          <CertificatePreview name={name} webinar={w} certId={id} speakers={speakers} className="mx-auto max-w-3xl shadow-sm" />
          <p className="mt-3 text-center text-xs text-ink-3">
            Name wrong? Update it in <Link href="/dashboard/settings" className="underline">Settings</Link> and download again.
          </p>
        </div>
      )}
    </li>
  );
}
