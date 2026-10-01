"use client";

// Links a webinar to one of the existing courses. Uses the existing
// courses API hook read-only; if nothing matches (or the API is down)
// it falls back to the /view-courses page. Course code is not modified.

import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BookOpen, Tag } from "lucide-react";
import { useGetAllCoursesQuery } from "@/Redux/api/coursesApi";
import type { Webinar } from "@/webinars/lib/types";
import { Skeleton } from "./ui";

type ApiCourse = { id: string; title: string; courseImageURL?: string; price?: string | number; courseDuration?: string; status?: string; description?: string };

function extract(data: unknown): ApiCourse[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as ApiCourse[];
  const d = data as Record<string, unknown>;
  for (const k of ["courses", "data", "result"]) {
    const v = d[k];
    if (Array.isArray(v)) return v as ApiCourse[];
    if (v && typeof v === "object") {
      const inner = extract(v);
      if (inner.length) return inner;
    }
  }
  return [];
}

function match(courses: ApiCourse[], keyword: string) {
  const k = keyword.toLowerCase();
  const re = new RegExp(`\\b${k.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
  const hits = courses.filter((c) => re.test(`${c.title} ${c.description ?? ""}`));
  return hits.find((c) => c.status === "live") ?? hits[0] ?? null;
}

export default function RelatedCourse({ webinar: w }: { webinar: Webinar }) {
  const { data, isLoading } = useGetAllCoursesQuery();
  const course = match(extract(data), w.relatedCourse.keyword);
  const price = course?.price !== undefined ? Number(course.price) : NaN;

  if (isLoading) return <Skeleton className="h-36 w-full rounded-2xl" />;

  return (
    <div className="overflow-hidden rounded-3xl border border-line bg-white">
      <div className="flex flex-col sm:flex-row">
        {course?.courseImageURL ? (
          <div className="relative aspect-video w-full shrink-0 bg-surface sm:aspect-auto sm:w-56">
            <Image src={course.courseImageURL} alt={course.title} fill className="object-cover" sizes="224px" />
          </div>
        ) : (
          <div className="flex w-full shrink-0 items-center justify-center bg-gray-900 py-8 text-white sm:w-40">
            <BookOpen size={34} strokeWidth={1.5} />
          </div>
        )}
        <div className="flex flex-1 flex-col p-5">
          <p className="text-xs font-medium text-brand-600">Go deeper with the full course</p>
          <p className="mt-1 text-lg font-bold text-ink">{course?.title ?? w.relatedCourse.fallbackTitle}</p>
          {course?.courseDuration && <p className="text-sm text-ink-3">{course.courseDuration}{!isNaN(price) && price > 0 ? ` · ₹${price.toLocaleString("en-IN")}` : ""}</p>}
          {w.courseOffer && (
            <p className="mt-3 inline-flex items-start gap-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-900">
              <Tag size={15} className="mt-0.5 shrink-0" />
              <span>
                {w.courseOffer.text} Code <span className="font-mono font-semibold">{w.courseOffer.code}</span>
              </span>
            </p>
          )}
          <Link
            href={course ? `/courses/lessons/${course.id}` : "/view-courses"}
            className="mt-4 inline-flex items-center gap-1 self-start text-sm font-semibold text-ink hover:text-brand-700"
          >
            {course ? "View course" : "Browse courses"} <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </div>
  );
}
