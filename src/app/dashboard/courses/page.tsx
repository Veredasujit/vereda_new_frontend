"use client";
import React, { useState, useMemo } from "react";
import { useGetEnrollmentByIdQuery } from "@/Redux/api/enrollmentApi";
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import Image from "next/image";
import { ArrowRight, BookOpen, CalendarDays, Clock, FileText, LayoutGrid, List, RefreshCw } from "lucide-react";
import { DashboardPageHeader } from "../DashboardClientLayout";
import { Badge, Button, CountUp, EmptyState, ErrorState, Skeleton, Stagger, StaggerItem, Tabs, cn } from "@/ui";

interface Course {
  id: string;
  title: string;
  description: string;
  price: number;
  purchaseDate: string;
  progress: number;
  instructorName: string;
  category: string;
  thumbnail?: string;
  courseDuration: string;
  level: string;
  status: "completed" | "in-progress" | "not-started";
  courseImageURL: string;
  batch: string;
}

interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: "completed" | "in-progress" | "not-started";
  createdAt: string;
  updatedAt: string;
  course: Course;
}

type FilterKey = "all" | "in-progress" | "completed" | "not-started";

const formatPrice = (price: number) => (Number.isFinite(price) ? `₹${price.toLocaleString("en-IN")}` : "—");

const formatDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
};

const STATUS_META: Record<Course["status"], { label: string; tone: "success" | "brand" | "neutral" }> = {
  completed: { label: "Completed", tone: "success" },
  "in-progress": { label: "In progress", tone: "brand" },
  "not-started": { label: "Not started", tone: "neutral" },
};

const StatusBadge = ({ status }: { status: Course["status"] }) => {
  const meta = STATUS_META[status] ?? STATUS_META["not-started"];
  return <Badge tone={meta.tone}>{meta.label}</Badge>;
};

const CourseThumb: React.FC<{ src?: string; alt: string; className: string; size: "lg" | "sm" }> = ({ src, alt, className, size }) => {
  const [failed, setFailed] = useState(false);
  if (src && src.startsWith("http") && !failed) {
    return (
      <Image
        src={src}
        alt={alt}
        width={size === "lg" ? 400 : 80}
        height={size === "lg" ? 208 : 80}
        className={cn("object-cover", className)}
        onError={() => setFailed(true)}
      />
    );
  }
  return (
    <div className={cn("flex items-center justify-center bg-gradient-to-br from-brand-50 to-surface", className)}>
      <BookOpen className={size === "lg" ? "h-8 w-8 text-brand-300" : "h-6 w-6 text-brand-300"} aria-hidden />
    </div>
  );
};

const DemoPptLink = ({ className }: { className?: string }) => (
  <a
    href="/demo-ppt.pptx"
    target="_blank"
    rel="noopener noreferrer"
    className={cn(
      "inline-flex h-10 items-center justify-center gap-1.5 rounded-full border border-line bg-white px-4 text-sm font-semibold text-ink transition hover:border-brand-300 hover:bg-brand-50/40",
      className,
    )}
  >
    <FileText className="h-4 w-4 text-brand-600" aria-hidden />
    Demo PPT
  </a>
);

const CourseDetails: React.FC = () => {
  const [filter, setFilter] = useState<FilterKey>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isClient, setIsClient] = useState(false);

  const user = useSelector((state: RootState) => state.auth.user);
  const userId = user?.id;

  const { data: enrollmentsData, error, isLoading, isFetching, refetch } = useGetEnrollmentByIdQuery(userId, { skip: !userId });

  // Set client-side flag to prevent hydration mismatches
  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Transform enrollment data to course format
  const enrolledCourses: Course[] = useMemo(() => {
    const enrollments = enrollmentsData?.enrollments;
    if (!Array.isArray(enrollments)) return [];

    return enrollments
      .filter((enrollment: Enrollment) => enrollment?.course)
      .map((enrollment: Enrollment) => {
        const course = enrollment.course;
        const rawPrice: unknown = course.price;
        const price = typeof rawPrice === "string" ? parseFloat(rawPrice) : Number(rawPrice);
        return {
          id: course.id,
          title: course.title || "Untitled course",
          description: course.description,
          price,
          purchaseDate: enrollment.createdAt,
          progress: enrollment.status === "completed" ? 100 : enrollment.status === "in-progress" ? 50 : 0,
          instructorName: course.instructorName || "Unknown Instructor",
          category: course.category || "Uncategorized",
          status: enrollment.status,
          thumbnail: course.courseImageURL || "",
          courseDuration: course.courseDuration || "",
          level: course.level || "Beginner",
          batch: course.batch,
          courseImageURL: course.courseImageURL,
        };
      });
  }, [enrollmentsData]);

  const filteredCourses = enrolledCourses.filter((course) => filter === "all" || course.status === filter);

  const countBy = (status: Course["status"]) => enrolledCourses.filter((c) => c.status === status).length;

  const filters: { id: FilterKey; label: React.ReactNode }[] = [
    { id: "all", label: <>All <span className="opacity-60">{enrolledCourses.length}</span></> },
    { id: "in-progress", label: <>In progress <span className="opacity-60">{countBy("in-progress")}</span></> },
    { id: "completed", label: <>Completed <span className="opacity-60">{countBy("completed")}</span></> },
    { id: "not-started", label: <>Not started <span className="opacity-60">{countBy("not-started")}</span></> },
  ];

  const header = (
    <DashboardPageHeader
      title="My Courses"
      subtitle="Everything you are enrolled in."
      action={
        <Button href="/view-courses" variant="outline" size="sm">
          Browse courses
          <ArrowRight className="h-4 w-4" aria-hidden />
        </Button>
      }
    />
  );

  // Loading state (also covers pre-hydration render)
  if (!isClient || isLoading) {
    return (
      <div>
        {header}
        <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <div key={n} className="overflow-hidden rounded-2xl border border-line bg-white">
              <Skeleton className="h-44 rounded-none" />
              <div className="space-y-3 p-5">
                <Skeleton className="h-5 w-4/5" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // A 404 from the enrollments endpoint means the user has no enrollments yet
  const isNotFound = !!error && typeof error === "object" && "status" in error && error.status === 404;

  if (error && !isNotFound) {
    return (
      <div>
        {header}
        <ErrorState title="We couldn't load your courses" onRetry={() => refetch()} retrying={isFetching} />
      </div>
    );
  }

  const averageProgress =
    enrolledCourses.length > 0 ? Math.round(enrolledCourses.reduce((acc, course) => acc + course.progress, 0) / enrolledCourses.length) : 0;

  const renderGrid = () => (
    <Stagger key={`grid-${filter}`} className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {filteredCourses.map((course) => (
        <StaggerItem key={course.id} className="h-full">
          <article className="group flex h-full flex-col overflow-hidden rounded-2xl border border-line bg-white shadow-[var(--shadow-soft)] transition-all duration-300 hover:-translate-y-1 hover:border-brand-200 hover:shadow-[var(--shadow-lift)]">
            <div className="relative overflow-hidden">
              <CourseThumb src={course.thumbnail} alt={course.title} size="lg" className="h-44 w-full transition-transform duration-500 group-hover:scale-[1.03]" />
              <div className="absolute left-3 top-3">
                <StatusBadge status={course.status} />
              </div>
            </div>
            <div className="flex flex-1 flex-col p-5">
              <h3 className="line-clamp-2 text-lg font-semibold tracking-tight text-ink">{course.title}</h3>
              <div className="mb-5 mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-ink-3">
                {course.courseDuration && (
                  <span className="inline-flex items-center gap-1.5">
                    <Clock className="h-4 w-4" aria-hidden />
                    {course.courseDuration}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays className="h-4 w-4" aria-hidden />
                  {formatDate(course.purchaseDate)}
                </span>
              </div>
              <div className="mt-auto flex items-center justify-between gap-3 border-t border-line pt-4">
                <span className="text-base font-semibold text-ink">{formatPrice(course.price)}</span>
                <DemoPptLink />
              </div>
            </div>
          </article>
        </StaggerItem>
      ))}
    </Stagger>
  );

  const renderList = () => (
    <Stagger key={`list-${filter}`} className="space-y-3">
      {filteredCourses.map((course) => (
        <StaggerItem key={course.id}>
          <article className="flex flex-col gap-4 rounded-2xl border border-line bg-white p-4 shadow-[var(--shadow-soft)] transition hover:border-brand-200 sm:flex-row sm:items-center sm:p-5">
            <div className="flex min-w-0 flex-1 items-center gap-4">
              <CourseThumb src={course.thumbnail} alt={course.title} size="sm" className="h-16 w-16 shrink-0 rounded-xl sm:h-20 sm:w-20" />
              <div className="min-w-0">
                <h3 className="line-clamp-2 font-semibold text-ink">{course.title}</h3>
                <div className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-ink-3">
                  <StatusBadge status={course.status} />
                  {course.courseDuration && (
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" aria-hidden />
                      {course.courseDuration}
                    </span>
                  )}
                  <span>Purchased {formatDate(course.purchaseDate)}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center justify-between gap-4 border-t border-line pt-3 sm:border-0 sm:pt-0">
              <span className="font-semibold text-ink">{formatPrice(course.price)}</span>
              <DemoPptLink />
            </div>
          </article>
        </StaggerItem>
      ))}
    </Stagger>
  );

  const viewBtn = (mode: "grid" | "list", Icon: typeof LayoutGrid, label: string) => (
    <button
      type="button"
      onClick={() => setViewMode(mode)}
      aria-pressed={viewMode === mode}
      aria-label={`${label} view`}
      className={cn(
        "inline-flex h-9 w-9 items-center justify-center rounded-full transition-colors",
        viewMode === mode ? "bg-ink text-white" : "text-ink-3 hover:text-ink",
      )}
    >
      <Icon className="h-4 w-4" aria-hidden />
    </button>
  );

  return (
    <div className="space-y-6">
      {header}

      {/* Summary */}
      {enrolledCourses.length > 0 && (
        <Stagger className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-4">
          {[
            { label: "Total courses", value: String(enrolledCourses.length) },
            { label: "In progress", value: String(countBy("in-progress")) },
            { label: "Completed", value: String(countBy("completed")) },
            { label: "Avg. progress", value: `${averageProgress}%` },
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

      {/* Controls */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs tabs={filters} value={filter} onChange={setFilter} size="sm" />
        <div className="inline-flex items-center gap-1 self-start rounded-full border border-line bg-white p-1 sm:self-auto">
          {viewBtn("grid", LayoutGrid, "Grid")}
          {viewBtn("list", List, "List")}
          {isFetching && <RefreshCw className="mx-2 h-4 w-4 animate-spin text-ink-3" aria-label="Refreshing" />}
        </div>
      </div>

      {/* Courses */}
      {filteredCourses.length === 0 ? (
        <EmptyState
          icon={<BookOpen className="h-5 w-5" />}
          title={enrolledCourses.length === 0 ? "No courses yet" : "Nothing here"}
          text={enrolledCourses.length === 0 ? "Enroll in a course to see it here." : "Try a different filter."}
          action={
            enrolledCourses.length === 0 ? (
              <Button href="/view-courses">
                Browse courses
                <ArrowRight className="h-4 w-4" aria-hidden />
              </Button>
            ) : (
              <Button variant="outline" size="sm" onClick={() => setFilter("all")}>
                Show all
              </Button>
            )
          }
        />
      ) : viewMode === "grid" ? (
        renderGrid()
      ) : (
        renderList()
      )}
    </div>
  );
};

export default CourseDetails;
