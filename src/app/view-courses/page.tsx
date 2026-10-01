'use client';

import { useMemo, useState } from 'react';
import { Star, BookOpen, ArrowRight, Clock, BarChart3, Search, SearchX, RotateCcw, Users, Layers, ListChecks } from 'lucide-react';
import { useGetAllCoursesQuery } from '../../Redux/api/coursesApi';
import { useSelector } from "react-redux";
import { RootState } from "@/Redux/store";
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import {
  Accordion,
  Badge,
  Button,
  Card,
  CountUp,
  EmptyState,
  ErrorState,
  Eyebrow,
  Input,
  PageHeader,
  Reveal,
  Skeleton,
  Stagger,
  StaggerItem,
  Tabs,
  motion,
} from '@/ui';

// Interface for raw API response
interface ApiCourse {
  id: string;
  title: string;
  courseImageURL: string;
  description: string;
  price: string;
  instructorId: string | null;
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
  batch: string;
}

// Extended interface for UI with computed properties
interface UICourse extends ApiCourse {
  category: 'Mobile Development';
  tags: string[];
  originalPrice: number;
  discountedPrice: number;
  discountPercentage: number;
  programName: string;
  batchStatus: 'Coming Soon' | 'Ongoing' | 'Starting Soon' | 'Expired';
  instructor: { name: string };
  totalSeats: number;
  popularity: 'High' | 'Medium' | 'Low';
}

// API Response interfaces
interface ApiResponseSuccess {
  success: boolean;
  courses: ApiCourse[];
}

interface ApiResponseArray {
  data?: ApiCourse[];
  courses?: ApiCourse[];
  result?: ApiCourse[];
}

interface ApiResponseObject {
  data?: ApiCourse[] | ApiResponseArray;
  courses?: ApiCourse[];
  result?: ApiCourse[];
}

type ApiResponse = ApiCourse[] | ApiResponseObject | ApiResponseArray | ApiResponseSuccess | undefined;

// Helper functions
const determineCategory = (): 'Mobile Development' => {
  return 'Mobile Development';
};

const getCourseTags = (course: ApiCourse): string[] => {
  const tags: string[] = [];
  const content = ((course.title ?? '') + ' ' + (course.description ?? '')).toLowerCase();

  if (content.includes('flutter') || content.includes('dart')) {
    tags.push('Flutter', 'Dart', 'Mobile');
  }

  if (course.level) tags.push(course.level);
  return tags.length > 0 ? tags : ['Flutter', 'Mobile Development'];
};

const mapStatusToBatchStatus = (status: string): 'Coming Soon' | 'Ongoing' | 'Starting Soon' | 'Expired' => {
  switch (status) {
    case 'coming_soon': return 'Coming Soon';
    case 'live': return 'Ongoing';
    case 'expired': return 'Expired';
    default: return 'Starting Soon';
  }
};

const calculatePopularity = (course: ApiCourse): 'High' | 'Medium' | 'Low' => {
  if (course.usersLearn > 100 || course.courseRatings > 4.5) return 'High';
  if (course.usersLearn > 50 || course.courseRatings > 4.0) return 'Medium';
  return 'Low';
};

const formatPrice = (price: number): string => {
  if (!Number.isFinite(price) || price <= 0) return 'Free';
  return `₹${price.toLocaleString('en-IN')}`;
};

// Type guard to check if an item is a valid ApiCourse
const isValidCourse = (item: unknown): item is ApiCourse => {
  return (
    typeof item === 'object' &&
    item !== null &&
    'id' in item &&
    'title' in item &&
    'courseImageURL' in item &&
    'description' in item &&
    'price' in item
  );
};

// Type guards for API response
const isApiResponseSuccess = (data: unknown): data is ApiResponseSuccess => {
  return (
    typeof data === 'object' &&
    data !== null &&
    'success' in data &&
    'courses' in data &&
    Array.isArray((data as ApiResponseSuccess).courses)
  );
};

const hasDataProperty = (data: unknown): data is { data: unknown } => {
  return typeof data === 'object' && data !== null && 'data' in data;
};

const hasCoursesProperty = (data: unknown): data is { courses: unknown } => {
  return typeof data === 'object' && data !== null && 'courses' in data;
};

const hasResultProperty = (data: unknown): data is { result: unknown } => {
  return typeof data === 'object' && data !== null && 'result' in data;
};

// Function to extract courses from API response
const extractCoursesFromResponse = (data: ApiResponse): ApiCourse[] => {
  if (!data) return [];

  if (Array.isArray(data)) {
    return data.filter(isValidCourse);
  }

  if (isApiResponseSuccess(data)) {
    return data.courses.filter(isValidCourse);
  }

  if (hasCoursesProperty(data) && Array.isArray(data.courses)) {
    return data.courses.filter(isValidCourse);
  }

  if (hasDataProperty(data) && Array.isArray(data.data)) {
    return data.data.filter(isValidCourse);
  }

  if (hasResultProperty(data) && Array.isArray(data.result)) {
    return data.result.filter(isValidCourse);
  }

  if (hasDataProperty(data) && typeof data.data === 'object' && data.data !== null) {
    const nestedData = data.data;

    if (hasCoursesProperty(nestedData) && Array.isArray(nestedData.courses)) {
      return nestedData.courses.filter(isValidCourse);
    }

    if (hasDataProperty(nestedData) && Array.isArray(nestedData.data)) {
      return nestedData.data.filter(isValidCourse);
    }

    if (hasResultProperty(nestedData) && Array.isArray(nestedData.result)) {
      return nestedData.result.filter(isValidCourse);
    }
  }

  return [];
};

// Curriculum data - 12 weeks total
const professionalCurriculum = [
  {
    section: "Foundation & Setup",
    duration: "2 weeks",
    items: [
      { text: "Flutter & Dart environment setup", duration: "3h" },
      { text: "Git & GitHub version control", duration: "2h" },
      { text: "Flutter architecture & widget tree", duration: "3h" }
    ]
  },
  {
    section: "Core Development",
    duration: "3 weeks",
    items: [
      { text: "Stateless & Stateful widgets", duration: "6h" },
      { text: "API integration & HTTP requests", duration: "5h" },
      { text: "State management with Provider", duration: "8h" }
    ]
  },
  {
    section: "Backend Integration",
    duration: "2 weeks",
    items: [
      { text: "Firebase backend integration", duration: "7h" },
      { text: "Third-party API integrations", duration: "5h" },
      { text: "REST services & data modeling", duration: "4h" }
    ]
  },
  {
    section: "Advanced Features",
    duration: "2 weeks",
    items: [
      { text: "Animations & custom UI", duration: "6h" },
      { text: "Testing strategies", duration: "4h" },
      { text: "App security best practices", duration: "3h" }
    ]
  },
  {
    section: "AI Integration",
    duration: "2 weeks",
    items: [
      { text: "AI-powered features", duration: "5h" },
      { text: "AI chat & claim agents", duration: "6h" },
      { text: "Recommendation systems", duration: "4h" }
    ]
  },
  {
    section: "Production & Deployment",
    duration: "1 week",
    items: [
      { text: "App Store & Play Store deployment", duration: "6h" },
      { text: "Real-world projects", duration: "8h" },
      { text: "Performance optimization", duration: "3h" }
    ]
  }
];

// Curriculum shown as an accordion in a sticky side card
const curriculumItems = professionalCurriculum.map((section, i) => ({
  q: (
    <span className="flex items-center gap-3">
      <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
        {String(i + 1).padStart(2, '0')}
      </span>
      <span className="text-[15px]">{section.section}</span>
    </span>
  ),
  meta: (
    <span className="pl-10">
      {section.duration} · {section.items.length} modules
    </span>
  ),
  a: (
    <ul className="space-y-2.5 pl-10">
      {section.items.map((item) => (
        <li key={item.text} className="flex items-start justify-between gap-3 text-sm">
          <span className="text-ink-2">{item.text}</span>
          <span className="shrink-0 tabular-nums text-ink-3">{item.duration}</span>
        </li>
      ))}
    </ul>
  ),
}));

const CurriculumCard = ({ courseId }: { courseId: string }) => (
  <div>
    <div className="mb-4 flex items-end justify-between gap-4">
      <div>
        <p className="text-sm font-medium text-brand-700">Curriculum</p>
        <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">12 weeks, 6 stages</h2>
      </div>
      <ListChecks className="h-6 w-6 text-ink-3" aria-hidden />
    </div>
    <div className="mb-4 flex flex-wrap gap-2">
      <Badge tone="neutral">Weekly tests</Badge>
      <Badge tone="neutral">5 projects</Badge>
      <Badge tone="neutral">AI modules</Badge>
    </div>
    <Accordion items={curriculumItems} className="shadow-[var(--shadow-soft)]" />
    {courseId && (
      <Button href={`/courses/lessons/${courseId}`} variant="outline" className="mt-4 w-full">
        View full syllabus
        <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
      </Button>
    )}
  </div>
);

// Course image with fallback for missing URLs; zooms on card hover
const CourseImage = ({ src, alt }: { src: string; alt: string }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="flex aspect-video w-full items-center justify-center bg-mesh">
        <BookOpen className="h-10 w-10 text-brand-300" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      width={800}
      height={450}
      alt={alt}
      className="aspect-video w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
      onError={() => setFailed(true)}
    />
  );
};

const STATUS_BADGE: Record<ApiCourse['status'], { label: string; tone: 'success' | 'warning' | 'neutral' }> = {
  live: { label: 'Enrolling now', tone: 'success' },
  coming_soon: { label: 'Coming soon', tone: 'warning' },
  expired: { label: 'Closed', tone: 'neutral' },
};

// Course card
const EnhancedCourseCard = ({ course, handleEnrollClick }: { course: UICourse; handleEnrollClick: (course: UICourse) => void }) => {
  const isLive = course.status === 'live';
  const buttonLabel = course.status === 'live' ? 'Enroll now' : course.status === 'coming_soon' ? 'Coming soon' : 'Enrollment closed';
  const badge = STATUS_BADGE[course.status] ?? { label: course.batchStatus, tone: 'neutral' as const };
  const rating = Number(course.courseRatings);
  const total = Number(course.totalSeat);
  const available = Number(course.availableSeat);
  const hasSeats = Number.isFinite(total) && total > 0 && Number.isFinite(available) && available >= 0;
  const filledPct = hasSeats ? Math.min(100, Math.max(0, ((total - available) / total) * 100)) : 0;
  const syllabusHref = `/courses/lessons/${course.id}`;

  return (
    <Card interactive className="group flex h-full flex-col overflow-hidden rounded-3xl">
      <Link href={syllabusHref} className="relative block overflow-hidden" aria-label={`${course.title} syllabus`}>
        <CourseImage src={course.courseImageURL} alt={course.title} />
        <div className="absolute left-4 top-4">
          <Badge tone={badge.tone} className="shadow-sm">
            {isLive && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" aria-hidden />}
            {badge.label}
          </Badge>
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-6">
        <h3 className="text-xl font-semibold tracking-tight text-ink">
          <Link href={syllabusHref} className="hover:text-brand-700">
            {course.title}
          </Link>
        </h3>

        <div className="mt-3 flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-ink-3">
          {course.courseDuration && (
            <span className="inline-flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden />
              {course.courseDuration}
            </span>
          )}
          {course.courseDuration && course.level && <span aria-hidden>·</span>}
          {course.level && (
            <span className="inline-flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4" aria-hidden />
              {course.level}
            </span>
          )}
          {Number.isFinite(rating) && rating > 0 && (
            <span className="inline-flex items-center gap-1 font-medium text-ink-2">
              <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
              {rating.toFixed(1)}
            </span>
          )}
        </div>

        {hasSeats && (
          <div className="mt-5">
            <div className="mb-1.5 flex items-center justify-between text-xs font-medium">
              <span className="text-ink-2">
                {available} of {total} seats left
              </span>
              <span className="text-ink-3">{Math.round(filledPct)}% filled</span>
            </div>
            <div
              className="h-1.5 w-full overflow-hidden rounded-full bg-surface"
              role="progressbar"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(filledPct)}
              aria-label="Seats filled"
            >
              <motion.div
                className="h-full rounded-full bg-brand-gradient"
                initial={{ width: 0 }}
                whileInView={{ width: `${filledPct}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
              />
            </div>
          </div>
        )}

        <div className="mt-auto pt-6">
          <div className="flex items-baseline justify-between gap-3 border-t border-line pt-5">
            <span className="text-sm text-ink-3">Course fee</span>
            <span className="text-2xl font-semibold tracking-tight text-ink">{formatPrice(course.discountedPrice)}</span>
          </div>
          <div className="mt-4 flex gap-2">
            <Button
              type="button"
              onClick={() => handleEnrollClick(course)}
              disabled={!isLive}
              variant={isLive ? 'primary' : 'outline'}
              className="h-11 flex-1"
            >
              {buttonLabel}
              {isLive && <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />}
            </Button>
            <Button href={syllabusHref} variant="ghost" className="h-11">
              Syllabus
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

const CourseCardSkeleton = () => (
  <div className="overflow-hidden rounded-3xl border border-line bg-white">
    <Skeleton className="aspect-video w-full rounded-none" />
    <div className="space-y-3 p-6">
      <Skeleton className="h-6 w-2/3" />
      <Skeleton className="h-4 w-1/2" />
      <Skeleton className="h-1.5 w-full" />
      <div className="flex items-center justify-between border-t border-line pt-5">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-7 w-24" />
      </div>
      <Skeleton className="h-11 w-full rounded-full" />
    </div>
  </div>
);

type LevelFilter = 'all' | 'Beginner' | 'Intermediate' | 'Advanced';
const LEVEL_TABS: { id: LevelFilter; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'Beginner', label: 'Beginner' },
  { id: 'Intermediate', label: 'Intermediate' },
  { id: 'Advanced', label: 'Advanced' },
];

export default function ViewCourses() {
  const user = useSelector((state: RootState) => state.auth.user);
  const { data: coursesData, isLoading, isFetching, error, refetch } = useGetAllCoursesQuery();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [level, setLevel] = useState<LevelFilter>('all');

  // Transform the API data to match the component's needs
  const courses: UICourse[] = useMemo(() => {
    const extractedCourses = extractCoursesFromResponse(coursesData as ApiResponse);

    return extractedCourses.map((course: ApiCourse): UICourse => {
      const priceValue = parseFloat(course.price);
      const discountedPrice = Number.isFinite(priceValue) ? priceValue : 0;

      return {
        ...course,
        category: determineCategory(),
        tags: getCourseTags(course),
        // No real list price exists in the API, so no discount is shown.
        originalPrice: discountedPrice,
        discountedPrice,
        discountPercentage: 0,
        programName: course.title,
        batchStatus: mapStatusToBatchStatus(course.status),
        instructor: { name: course.instructorName || 'Unknown Instructor' },
        totalSeats: course.totalSeat || 0,
        popularity: calculatePopularity(course)
      };
    });
  }, [coursesData]);

  // Filter only Mobile Development courses
  const mobileDevelopmentCourses = useMemo(() => {
    return courses.filter(course => course.category === 'Mobile Development');
  }, [courses]);

  // Client-side search + level filter
  const visibleCourses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return mobileDevelopmentCourses.filter((course) => {
      if (level !== 'all' && course.level !== level) return false;
      if (!q) return true;
      const haystack = [course.title, course.description, course.instructorName, course.level, ...course.tags]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [mobileDevelopmentCourses, query, level]);

  const isFiltered = query.trim() !== '' || level !== 'all';
  const resetFilters = () => {
    setQuery('');
    setLevel('all');
  };

  // Handle enrollment button click
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
        level: course.level
      },
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        profileURL: user.profileURL,
        phone: user.phone
      }
    };

    router.push(`/payment-page?data=${encodeURIComponent(JSON.stringify(enrollmentData))}`);
  };

  const renderCourses = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2" aria-busy="true" aria-label="Loading courses">
          <CourseCardSkeleton />
          <CourseCardSkeleton />
        </div>
      );
    }

    if (error) {
      return (
        <ErrorState
          title="Could not load courses"
          text="Check your connection and try again."
          onRetry={() => refetch()}
          retrying={isFetching}
        />
      );
    }

    if (mobileDevelopmentCourses.length === 0) {
      return (
        <EmptyState
          icon={<BookOpen className="h-5 w-5" />}
          title="No courses available right now"
          text="New batches are added regularly. Please check back soon."
        />
      );
    }

    if (visibleCourses.length === 0) {
      return (
        <EmptyState
          icon={<SearchX className="h-5 w-5" />}
          title="No courses match your filters"
          text="Try a different search or level."
          action={
            <Button variant="outline" size="sm" onClick={resetFilters}>
              <RotateCcw className="h-4 w-4" />
              Reset filters
            </Button>
          }
        />
      );
    }

    return (
      <Stagger className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {visibleCourses.map((course) => (
          <StaggerItem key={course.id} className="h-full">
            <EnhancedCourseCard course={course} handleEnrollClick={handleEnrollClick} />
          </StaggerItem>
        ))}
      </Stagger>
    );
  };

  const stats = [
    { value: isLoading ? '–' : String(mobileDevelopmentCourses.length), label: 'Courses', icon: Layers },
    { value: '5K+', label: 'Developers trained', icon: Users },
    { value: '4.9/5', label: 'Avg. rating', icon: Star },
    { value: '12', label: 'Weeks', icon: Clock },
  ];

  return (
    <div className="min-h-screen bg-white">
      <PageHeader
        eyebrow={<Eyebrow>Flutter + AI programs</Eyebrow>}
        title={
          <>
            Courses that get you <span className="text-gradient-brand">hired</span>
          </>
        }
        subtitle="Build real, AI-powered apps in 12 weeks with mentors who ship."
      >
        <Stagger className="flex flex-wrap gap-2.5">
          {stats.map(({ value, label, icon: Icon }) => (
            <StaggerItem key={label}>
              <div className="inline-flex items-center gap-2.5 rounded-full border border-line bg-white/80 py-1.5 pl-1.5 pr-4 shadow-[var(--shadow-soft)] backdrop-blur">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 text-brand-600">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="text-sm">
                  {value === '–' ? (
                    <span className="font-semibold text-ink">–</span>
                  ) : (
                    <CountUp value={value} className="font-semibold tabular-nums text-ink" />
                  )}
                  <span className="ml-1.5 text-ink-3">{label}</span>
                </span>
              </div>
            </StaggerItem>
          ))}
        </Stagger>
      </PageHeader>

      <section className="py-12 sm:py-16">
        <div className="container-x">
          <div className="grid grid-cols-1 items-start gap-10 lg:grid-cols-3">
            {/* Courses column */}
            <div className="min-w-0 lg:col-span-2">
              {/* Toolbar */}
              <Reveal className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="relative w-full sm:max-w-xs">
                  <label htmlFor="course-search" className="sr-only">
                    Search courses
                  </label>
                  <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-3" aria-hidden />
                  <Input
                    id="course-search"
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search courses"
                    className="rounded-full pl-11"
                    autoComplete="off"
                  />
                </div>
                <Tabs tabs={LEVEL_TABS} value={level} onChange={setLevel} size="sm" />
              </Reveal>

              {!isLoading && !error && mobileDevelopmentCourses.length > 0 && (
                <p className="mb-4 text-sm text-ink-3" aria-live="polite">
                  {visibleCourses.length} {visibleCourses.length === 1 ? 'course' : 'courses'}
                  {isFiltered && (
                    <>
                      {' '}
                      ·{' '}
                      <button type="button" onClick={resetFilters} className="font-medium text-brand-700 hover:underline">
                        Clear filters
                      </button>
                    </>
                  )}
                </p>
              )}

              {renderCourses()}
            </div>

            {/* Curriculum column */}
            <aside className="lg:sticky lg:top-24">
              <Reveal delay={0.1}>
                <CurriculumCard courseId={mobileDevelopmentCourses[0]?.id ?? ''} />
              </Reveal>
            </aside>
          </div>
        </div>
      </section>
    </div>
  );
}
