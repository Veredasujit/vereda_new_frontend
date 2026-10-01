"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { BadgeCheck, ChevronLeft, SearchX } from "lucide-react";
import * as api from "@/webinars/lib/api";
import { fmtDateLong, endOf } from "@/webinars/lib/utils";
import { Button, Card } from "@/webinars/components/ui";

export default function VerifyPage() {
  return (
    <Suspense fallback={null}>
      <Verify />
    </Suspense>
  );
}

function Verify() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const id = (params.get("id") ?? "").trim();
  const [input, setInput] = useState(id);
  const [result, setResult] = useState<ReturnType<typeof api.verifyCertificate> | undefined>(undefined);

  useEffect(() => {
    setInput(id);
    setResult(id ? api.verifyCertificate(id) : undefined);
  }, [id]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const v = input.trim().toUpperCase();
    router.replace(v ? `${pathname}?id=${encodeURIComponent(v)}` : pathname);
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-10">
      <Link href="/webinars" className="inline-flex items-center gap-1 text-sm text-ink-3 hover:text-ink">
        <ChevronLeft size={16} /> Webinars
      </Link>
      <h1 className="mt-6 text-3xl font-bold tracking-tight text-ink">Verify a webinar certificate</h1>
      <p className="mt-2 text-ink-3">Enter the ID printed at the bottom right of the certificate.</p>

      <form onSubmit={submit} className="mt-6 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="VDL-WB-XXXXX-XXXXXX"
          className="flex-1 rounded-lg border border-line bg-white px-3 py-2.5 font-mono text-sm uppercase outline-none placeholder:normal-case focus:border-brand-500 focus:ring-2 focus:ring-brand-100"
          aria-label="Certificate ID"
        />
        <Button type="submit" disabled={!input.trim()}>Verify</Button>
      </form>
      <p className="mt-2 text-xs text-ink-3">Try the sample ID VDL-WB-FLUTT-7Q4K2M.</p>

      {result === null && (
        <Card className="mt-8 flex gap-4 border-red-100 p-6">
          <SearchX className="shrink-0 text-red-500" size={28} />
          <div>
            <p className="font-semibold text-ink">No certificate found</p>
            <p className="mt-1 text-sm text-ink-3">Check the ID for typos. Certificates appear here within 24 hours of the webinar. Still stuck? Contact us.</p>
          </div>
        </Card>
      )}
      {result && (
        <Card className="mt-8 border-green-200 p-6">
          <p className="flex items-center gap-2 font-semibold text-green-700">
            <BadgeCheck size={22} /> Valid certificate
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div><dt className="text-ink-3">Issued to</dt><dd className="font-semibold text-ink">{result.name}</dd></div>
            <div><dt className="text-ink-3">Certificate ID</dt><dd className="font-mono text-ink">{result.id}</dd></div>
            <div className="sm:col-span-2"><dt className="text-ink-3">Webinar</dt><dd className="font-semibold text-ink">{result.webinar.title}</dd></div>
            <div><dt className="text-ink-3">Date</dt><dd className="text-ink">{fmtDateLong(endOf(result.webinar))}</dd></div>
            <div><dt className="text-ink-3">Type</dt><dd className="text-ink">Participation · Live webinar</dd></div>
          </dl>
        </Card>
      )}
    </div>
  );
}
