// On-screen version of the webinar certificate (same layout as the PDF).

import type { Webinar } from "@/webinars/lib/types";
import { fmtDateLong, fmtDuration, totalMinutes } from "@/webinars/lib/utils";
import { cx } from "./ui";

export default function CertificatePreview({
  name,
  webinar: w,
  certId,
  speakers,
  sample = false,
  className,
}: {
  name: string;
  webinar: Webinar;
  certId: string;
  speakers: string[];
  sample?: boolean;
  className?: string;
}) {
  const last = w.sessions[w.sessions.length - 1];
  return (
    <div className={cx("@container relative aspect-[842/595] w-full overflow-hidden border-[3px] border-[#1055C9] bg-white text-gray-900", className)}>
      <div className="absolute inset-[1.6%] border border-gray-200" />
      <div className="flex h-[7.4%] items-center justify-between bg-[#1055C9] px-[4%] text-[1.6cqw] font-bold tracking-wide text-white">
        <span>VEREDA DIGITAL LEARNING</span>
        <span>WEBINAR</span>
      </div>
      <div className="relative flex h-[92.6%] flex-col items-center px-[8%] pt-[6%] text-center">
        <p className="font-serif text-[4.6cqw] font-bold leading-none">Certificate of Participation</p>
        <p className="mt-[3%] text-[1.6cqw] text-gray-500">This is to certify that</p>
        <p className="mt-[2.5%] max-w-full truncate font-serif text-[4.8cqw] italic leading-tight text-[#1055C9]">{name}</p>
        <div className="mt-[1%] h-px w-[60%] bg-gray-200" />
        <p className="mt-[3%] text-[1.6cqw] text-gray-500">attended the live webinar</p>
        <p className="mt-[1.5%] text-[2.4cqw] font-bold leading-tight">{w.title}</p>
        <p className="mt-[1.5%] text-[1.45cqw] text-gray-500">
          {fmtDateLong(last.startsAt)} · {fmtDuration(totalMinutes(w))} · Online, live
        </p>
        <div className="absolute bottom-[12%] left-[8%] right-[8%] flex items-end justify-between text-left">
          <div className="w-[34%] border-t border-gray-900 pt-[1.2%]">
            <p className="truncate text-[1.45cqw]">{speakers.join(", ")}</p>
            <p className="text-[1.2cqw] text-gray-500">Speaker</p>
          </div>
          <div className="text-right">
            <p className="text-[1.35cqw] font-bold">Certificate ID: {certId}</p>
            <p className="text-[1.1cqw] text-gray-500">Verify at vereda.co.in/webinars/verify</p>
          </div>
        </div>
      </div>
      {sample && (
        <span className="pointer-events-none absolute inset-0 flex items-center justify-center">
          <span className="-rotate-12 rounded border-4 border-gray-400/60 px-6 py-2 text-[6cqw] font-black tracking-widest text-gray-400/60">SAMPLE</span>
        </span>
      )}
    </div>
  );
}
