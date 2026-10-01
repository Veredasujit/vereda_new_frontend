'use client';

import { useMemo, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useGetAllCoursesQuery } from '../../Redux/api/coursesApi';
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { useRouter } from 'next/navigation';
import {
  Clock,
  Users,
  CheckCircle,
  Video,
  BookOpen,
  ClipboardCheck,
  ArrowRight,
  X,
  Briefcase,
  BarChart3,
  CalendarClock,
} from 'lucide-react';
import {
  Badge,
  Button,
  EmptyState,
  ErrorState,
  Eyebrow,
  IconTile,
  Reveal,
  Section,
  SectionHeader,
  Skeleton,
  Stagger,
  StaggerItem,
} from '@/ui';

// Interface based on the actual API response
interface Course {
  id: string;
  title: string;
  courseImageURL: string;
  description: string;
  price: string;
  instructorId: string;
  instructorName: string;
  courseDuration: string;
  status: 'coming_soon' | 'live' | 'expired';
  availableSeat: number;
  courseRatings: number;
  usersLearn: number;
  createdAt: string;
  updatedAt: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  totalSeat: number;
}

// Extended interface for UI
interface UICourse extends Course {
  category: 'Web Development' | 'Mobile Development' | 'AI & Machine Learning';
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  programName: string;
  batchStatus: 'Coming Soon' | 'Ongoing' | 'Starting Soon' | 'Expired';
  instructor: { name: string };
  totalSeats: number;
}

const FALLBACK_IMAGE = '/images/hero4.jpeg';

// The API may return a bare array or wrap it ({ courses: [...] } / { data: [...] }).
function extractCourses(data: unknown): Course[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as Course[];
  const d = data as Record<string, unknown>;
  for (const key of ['courses', 'data', 'result']) {
    const value = d[key];
    if (Array.isArray(value)) return value as Course[];
    if (value && typeof value === 'object') {
      const inner = extractCourses(value);
      if (inner.length) return inner;
    }
  }
  return [];
}

// Helper functions
const determineCategory = (course: Course): UICourse['category'] => {
  const title = (course.title ?? '').toLowerCase();
  const description = (course.description ?? '').toLowerCase();

  if (title.includes('flutter') || description.includes('flutter') ||
      title.includes('mobile') || description.includes('mobile') ||
      title.includes('dart') || title.includes('app')) {
    return 'Mobile Development';
  }

  if (title.includes('full stack') || title.includes('web') ||
      description.includes('web') || description.includes('frontend') ||
      description.includes('backend') || title.includes('javascript')) {
    return 'Web Development';
  }

  if (title.includes('ai') || title.includes('machine learning') || title.includes('ml') ||
      description.includes('ai') || description.includes('machine learning')) {
    return 'AI & Machine Learning';
  }

  return 'Web Development';
};

// No fake "original" price: the backend only provides the real price.

const mapStatusToBatchStatus = (status: string): UICourse['batchStatus'] => {
  switch (status) {
    case 'coming_soon': return 'Coming Soon';
    case 'live': return 'Ongoing';
    case 'expired': return 'Expired';
    default: return 'Starting Soon';
  }
};

const features = [
  { icon: Video, text: "Live weekly classes", subtext: "Plus recordings for revision." },
  { icon: BookOpen, text: "Beginner-friendly modules", subtext: "No coding background needed." },
  { icon: ClipboardCheck, text: "Weekly assignments", subtext: "Reviewed with personal feedback." },
  { icon: CheckCircle, text: "Five real app projects", subtext: "A portfolio you can show." },
  { icon: Users, text: "One-to-one mentor support", subtext: "Doubts solved in community chat." },
  { icon: Briefcase, text: "Job and freelance guidance", subtext: "Resume, interviews, proposals." },
];

function Header() {
  return (
    <SectionHeader
      eyebrow={<Eyebrow>Featured program</Eyebrow>}
      title="Master mobile app development"
      subtitle="A project-based program built for real jobs and freelance work."
      action={
        <Button href="/view-courses" variant="outline">
          All courses <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </Button>
      }
    />
  );
}

const statusTone = (status: Course['status']) =>
  status === 'live' ? 'success' : status === 'coming_soon' ? 'warning' : 'neutral';

export default function FeaturedCourses() {
  const { data: coursesData, isLoading, isFetching, error, refetch } = useGetAllCoursesQuery();
  const user = useSelector((state: RootState) => state.auth.user);
  const router = useRouter();
  const [failedImages, setFailedImages] = useState<Record<string, boolean>>({});

  const allCourses = useMemo(() => extractCourses(coursesData), [coursesData]);

  // Only the first course is featured on the home page.
  const featuredCourses: UICourse[] = useMemo(
    () =>
      allCourses.slice(0, 1).map((course): UICourse => {
        const category = determineCategory(course);
        const parsed = parseFloat(course.price);
        const discountedPrice = Number.isFinite(parsed) ? parsed : 0;
        const originalPrice = discountedPrice;
        const discountPercentage = 0;
        const totalSeats = course.totalSeat || ((course.availableSeat ?? 0) + (course.usersLearn ?? 0));

        return {
          ...course,
          category,
          originalPrice,
          discountedPrice,
          discountPercentage,
          programName: course.title,
          batchStatus: mapStatusToBatchStatus(course.status),
          instructor: { name: course.instructorName ?? '' },
          totalSeats,
        };
      }),
    [allCourses]
  );

  const handleEnrollClick = (course: UICourse) => {
    if (!user) {
      router.push('/login?redirect=/courses');
      return;
    }

    const enrollmentData = {
      course: {
        id: course.id,
        title: course.title,
        price: course.discountedPrice,
        originalPrice: course.originalPrice,
        discountPercentage: course.discountPercentage,
        instructor: course.instructor.name,
        duration: course.courseDuration,
        image: course.courseImageURL,
        category: course.category,
        level: course.level,
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileURL: user.profileURL,
        phone: user.phone,
      },
    };

    router.push(`/payment-page?data=${encodeURIComponent(JSON.stringify(enrollmentData))}`);
  };

  // Loading state
  if (isLoading) {
    return (
      <Section tone="surface">
        <Header />
        <div aria-busy="true" className="grid overflow-hidden rounded-3xl border border-line bg-white lg:grid-cols-[1.05fr_1fr]">
          <Skeleton className="aspect-[16/10] rounded-none lg:aspect-auto lg:min-h-[480px]" />
          <div className="space-y-5 p-6 sm:p-10">
            <Skeleton className="h-6 w-28 rounded-full" />
            <Skeleton className="h-9 w-4/5" />
            <div className="flex gap-3">
              <Skeleton className="h-8 w-24 rounded-full" />
              <Skeleton className="h-8 w-24 rounded-full" />
            </div>
            <div className="grid gap-4 pt-4 sm:grid-cols-2">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-14" />
              ))}
            </div>
            <Skeleton className="h-12 w-full rounded-full" />
          </div>
        </div>
      </Section>
    );
  }

  // Error state
  if (error) {
    return (
      <Section tone="surface">
        <Header />
        <ErrorState
          title="We couldn't load the course"
          text="Check your connection and try again."
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      </Section>
    );
  }

  // Empty state
  if (featuredCourses.length === 0) {
    return (
      <Section tone="surface">
        <Header />
        <EmptyState
          title="No courses open right now"
          text="New batches are announced regularly. Browse the catalogue or check back soon."
          action={
            <Button href="/view-courses" variant="outline">
              View all courses
            </Button>
          }
        />
      </Section>
    );
  }

  return (
    <Section tone="surface">
      <Header />

      {featuredCourses.map((course) => (
        <Reveal key={course.id}>
          <article className="grid overflow-hidden rounded-3xl border border-line bg-white shadow-[var(--shadow-soft)] lg:grid-cols-[1.05fr_1fr]">
            {/* Image */}
            <Link
              href={`/courses/lessons/${course.id}`}
              className="group relative block aspect-[16/10] overflow-hidden bg-surface lg:aspect-auto lg:min-h-[520px]"
              aria-label={`View structure of ${course.title}`}
            >
              <Image
                src={
                  failedImages[course.id] || !course.courseImageURL
                    ? FALLBACK_IMAGE
                    : course.courseImageURL
                }
                alt={course.title}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                priority
                onError={() =>
                  setFailedImages((prev) => ({ ...prev, [course.id]: true }))
                }
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/40 via-transparent to-transparent" aria-hidden />
              <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                <Badge tone={statusTone(course.status)} className="shadow-sm">
                  {course.batchStatus}
                </Badge>
                <Badge tone="neutral" className="shadow-sm">{course.category}</Badge>
              </div>
            </Link>

            {/* Details */}
            <div className="flex flex-col p-6 sm:p-10">
              <h3 className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
                {course.programName}
              </h3>

              <div className="mt-4 flex flex-wrap gap-2">
                {course.courseDuration && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-ink-2">
                    <CalendarClock className="h-4 w-4 text-ink-3" aria-hidden="true" />
                    {course.courseDuration}
                  </span>
                )}
                {course.level && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1.5 text-sm text-ink-2">
                    <BarChart3 className="h-4 w-4 text-ink-3" aria-hidden="true" />
                    {course.level}
                  </span>
                )}
              </div>

              <p className="mt-8 text-xs font-semibold uppercase tracking-wider text-ink-3">What&apos;s included</p>
              <Stagger className="mt-4 grid gap-x-6 gap-y-5 sm:grid-cols-2">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  return (
                    <StaggerItem key={feature.text} className="flex items-start gap-3">
                      <IconTile className="shrink-0">
                        <Icon className="h-4 w-4" aria-hidden="true" />
                      </IconTile>
                      <div>
                        <p className="text-sm font-semibold text-ink">{feature.text}</p>
                        <p className="mt-0.5 text-sm text-ink-3">{feature.subtext}</p>
                      </div>
                    </StaggerItem>
                  );
                })}
              </Stagger>

              <div className="mt-auto pt-10">
                <div className="flex flex-col gap-5 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-xs text-ink-3">Program fee</p>
                    <p className="text-3xl font-semibold tracking-tight text-ink">
                      ₹{course.discountedPrice.toLocaleString('en-IN')}
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                    <Button href={`/courses/lessons/${course.id}`} variant="ghost">
                      Course structure
                    </Button>
                    <Button
                      type="button"
                      size="lg"
                      onClick={() => handleEnrollClick(course)}
                      disabled={course.status !== 'live'}
                    >
                      {course.status === 'live' ? (
                        <>
                          Enroll now
                          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" aria-hidden="true" />
                        </>
                      ) : course.status === 'coming_soon' ? (
                        <>
                          <Clock className="h-4 w-4" aria-hidden="true" />
                          Coming soon
                        </>
                      ) : (
                        <>
                          <X className="h-4 w-4" aria-hidden="true" />
                          Enrollment closed
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </article>
        </Reveal>
      ))}

      {/* View all courses */}
      {allCourses.length > 2 && (
        <Reveal className="mt-6">
          <Link
            href="/view-courses"
            className="group flex items-center justify-between gap-4 rounded-2xl border border-line bg-white px-6 py-5 transition-colors hover:border-brand-200"
          >
            <span>
              <span className="block font-semibold text-ink">Explore all courses</span>
              <span className="block text-sm text-ink-3">{allCourses.length} courses across skill levels</span>
            </span>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-ink text-white transition-transform group-hover:translate-x-0.5">
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </span>
          </Link>
        </Reveal>
      )}
    </Section>
  );
}
