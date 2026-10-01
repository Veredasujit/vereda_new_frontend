'use client';

import { useParams, useRouter } from "next/navigation";
import { useGetLessonByIdQuery } from "../../../../Redux/api/lessonApi";
import { useGetAllCoursesQuery } from "../../../../Redux/api/coursesApi";
import {
  BookOpen,
  ArrowLeft,
  ArrowRight,
  Clock,
  Users,
  BarChart3,
  Star,
  Bookmark,
  Share2,
  FileText,
  CheckCircle,
  Award,
  MessageCircle,
  Phone,
  Mail,
  Check,
  Infinity as InfinityIcon,
  Video,
  ShieldCheck,
} from "lucide-react";

import { useMemo, useState } from "react";
import { FetchBaseQueryError } from "@reduxjs/toolkit/query";
import Image from "next/image";
import {
  Accordion,
  AnimatePresence,
  Badge,
  Button,
  Card,
  EmptyState,
  ErrorState,
  Eyebrow,
  Modal,
  Reveal,
  Section,
  SectionHeader,
  Skeleton,
  Stagger,
  StaggerItem,
  Tabs,
  cn,
  motion,
} from "@/ui";

const TABS = ["overview", "lessons", "projects", "mentors", "reviews"] as const;
type TabId = (typeof TABS)[number];
const TAB_ITEMS: { id: TabId; label: string }[] = TABS.map((t) => ({ id: t, label: t.charAt(0).toUpperCase() + t.slice(1) }));

// Mentor data with contact information
const mentors = [
  {
    id: 1,
    name: "Himanshu Kumar",
    role: "Founder, Vereda Technologies",
    image: "/images/Pictures-2.png",
    rating: 4.9,
    experience: "9+ years experience",
    achievements: "15+ apps published",
    students: "1000+ students trained",
    support: "1:1 mentorship available",
    phone: "+91-9958073192",
    email: "himanshu@vereda.co.in"
  },
  {
    id: 2,
    name: "Hemant Kumar",
    role: "Co-Founder, Vereda Technologies",
    image: "/images/Hermant-kumar.webp",
    rating: 4.9,
    experience: "9+ years experience",
    achievements: "15+ projects delivered",
    students: "1000+ students mentored",
    support: "1:1 tech support",
    phone: "+91-9801785547",
    email: "hemant@vereda.co.in"
  }
];

// Reviews data
const customReviews = [
  {
    name: "Aditi Sharma",
    role: "Mobile Developer @Google",
    review: "This course took me from beginner to job-ready. The matrimonial app project gave me real-world experience building a production platform.",
    rating: 5,
    avatar: "AS",
  },
  {
    name: "Rohit Mehta",
    role: "Flutter Team Lead",
    review: "The CRM project taught me how to integrate multiple third-party APIs and manage complex state. I built 3 production apps after finishing.",
    rating: 5,
    avatar: "RM",
  },
  {
    name: "Priya Nair",
    role: "Freelance Developer",
    review: "The mentorship made the difference. The matrimonial app project helped me understand real client requirements and delivery timelines.",
    rating: 5,
    avatar: "PN",
  },
  {
    name: "Arjun Patel",
    role: "Full Stack Developer @Microsoft",
    review: "The section on third-party integrations taught me how to architect apps that scale across multiple external services.",
    rating: 5,
    avatar: "AP",
  },
  {
    name: "Neha Gupta",
    role: "Startup Founder",
    review: "As a non-technical founder, this course helped me understand app development and communicate better with my team.",
    rating: 5,
    avatar: "NG",
  },
  {
    name: "Vikram Singh",
    role: "Product Manager @Amazon",
    review: "Building actual matrimonial and CRM apps gave me practical skills I use in my job every day.",
    rating: 5,
    avatar: "VS",
  }
];

// Projects data
const projects = [
  {
    title: "Matrimonial App",
    description: "A complete matrimonial app with matching, real-time chat and secure profile management.",
    features: [
      "User matching algorithms",
      "Real-time messaging",
      "Profile verification",
      "Payment gateway integration"
    ],
    tech: ["Flutter", "Firebase", "Node.js", "MongoDB"]
  },
  {
    title: "CRM App",
    description: "A CRM for US-based clients with third-party integrations, analytics and automated workflows.",
    features: [
      "Third-party API integrations",
      "Analytics dashboard",
      "Automated workflows",
      "Multi-tenant architecture"
    ],
    tech: ["Flutter", "React", "Python", "PostgreSQL"]
  },
  {
    title: "3rd Party Integration Platform",
    description: "One dashboard for multiple third-party services, covering authentication, API management and data sync.",
    features: [
      "Unified service management",
      "OAuth2 authentication flows",
      "Real-time data sync",
      "Error handling & retries"
    ],
    tech: ["Flutter", "Express.js", "Redis", "REST APIs"]
  }
];

const overviewItems = [
  "Flutter & Dart setup",
  "Stateless & Stateful widgets",
  "API integration & HTTP requests",
  "State management with Provider",
  "Firebase backend integration",
  "Animations & custom UI",
  "App Store & Play Store deployment",
  "Real-world projects (Matrimonial App, CRM App)",
  "Third-party API integrations",
  "AI-powered features and model integration",
  "AI chat, claim and calling agents",
  "Deploying ML models in apps"
];

const includes = [
  { icon: Video, text: "Live, mentor-led sessions" },
  { icon: FileText, text: "Weekly tests and assignments" },
  { icon: Award, text: "Certificate of completion" },
  { icon: MessageCircle, text: "1:1 mentorship" },
  { icon: InfinityIcon, text: "Lifetime access" },
  { icon: Users, text: "Community support" },
];

const formatPrice = (raw: string | undefined): string | null => {
  const n = parseFloat(raw ?? "");
  if (!Number.isFinite(n)) return null;
  if (n <= 0) return "Free";
  return `₹${n.toLocaleString("en-IN")}`;
};

const StarRow = ({ count }: { count: number }) => (
  <div className="flex gap-0.5" aria-label={`${count} out of 5 stars`}>
    {Array.from({ length: count }).map((_, i) => (
      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
    ))}
  </div>
);

const ReviewCard = ({ t }: { t: (typeof customReviews)[number] }) => (
  <Card className="flex h-full flex-col p-6">
    <StarRow count={t.rating} />
    <p className="mt-4 flex-1 text-[15px] leading-relaxed text-ink-2">&ldquo;{t.review}&rdquo;</p>
    <div className="mt-6 flex items-center gap-3 border-t border-line pt-5">
      <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-sm font-semibold text-brand-700">{t.avatar}</span>
      <div>
        <p className="text-sm font-semibold text-ink">{t.name}</p>
        <p className="text-xs text-ink-3">{t.role}</p>
      </div>
    </div>
  </Card>
);

const CenteredState = ({ children }: { children: React.ReactNode }) => (
  <div className="flex min-h-[70vh] items-center justify-center bg-surface px-4 py-16">
    <div className="w-full max-w-md">{children}</div>
  </div>
);

export default function LessonDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawId = params?.id;
  const id = typeof rawId === "string" ? rawId.trim() : "";
  const { data, isLoading, isFetching, error, refetch } = useGetLessonByIdQuery(id, { skip: !id });
  // Shared cache with /view-courses; only used to show the real fee when available.
  const { data: coursesData } = useGetAllCoursesQuery(undefined, { skip: !id });
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [activeTab, setActiveTab] = useState<TabId>("lessons");
  const [showMentorModal, setShowMentorModal] = useState(false);
  const [currentMentorIndex, setCurrentMentorIndex] = useState(0);
  const [copied, setCopied] = useState(false);
  const [showSnackbar, setShowSnackbar] = useState(false);
  const lessons = Array.isArray(data?.lessons) ? data.lessons : [];

  const course = useMemo(() => {
    const list = Array.isArray(coursesData?.courses) ? coursesData.courses : [];
    return list.find((c) => c?.id === id);
  }, [coursesData, id]);
  const price = formatPrice(course?.price);

  const handleMessageMentor = (index = 0) => {
    setCurrentMentorIndex(index);
    setShowMentorModal(true);
  };

  const handleNextMentor = () => {
    setCurrentMentorIndex((prev) => (prev + 1) % mentors.length);
  };

  const handlePrevMentor = () => {
    setCurrentMentorIndex((prev) => (prev - 1 + mentors.length) % mentors.length);
  };

  const handleShare = async () => {
    const link = window.location.href;
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setShowSnackbar(true);
      setTimeout(() => {
        setShowSnackbar(false);
        setCopied(false);
      }, 3000);
    } catch (err) {
      console.error('Failed to copy link:', err);
    }
  };

  const goEnroll = () => router.push("/view-courses");

  if (!id) {
    return (
      <CenteredState>
        <EmptyState
          icon={<FileText className="h-5 w-5" />}
          title="Course not found"
          text="This link is invalid or incomplete."
          action={
            <Button variant="dark" href="/view-courses">
              <ArrowLeft className="h-4 w-4" />
              Browse courses
            </Button>
          }
        />
      </CenteredState>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white" aria-busy="true" aria-label="Loading course content">
        <div className="bg-mesh">
          <div className="container-x space-y-5 pb-14 pt-16 sm:pt-24">
            <Skeleton className="h-6 w-40 rounded-full" />
            <Skeleton className="h-14 w-full max-w-2xl" />
            <Skeleton className="h-5 w-full max-w-xl" />
            <div className="flex gap-2">
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
              <Skeleton className="h-7 w-24 rounded-full" />
            </div>
          </div>
        </div>
        <div className="container-x grid gap-10 py-12 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <Skeleton className="h-11 w-80 max-w-full rounded-full" />
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-20 w-full rounded-2xl" />
            ))}
          </div>
          <Skeleton className="h-80 w-full rounded-3xl" />
        </div>
      </div>
    );
  }

  if (error) {
    let errorMessage = "We couldn't load this course. Please try again.";
    if (error && "data" in (error as FetchBaseQueryError)) {
      const err = error as FetchBaseQueryError & {
        data?: { message?: string };
      };
      errorMessage = err.data?.message || errorMessage;
    }
    return (
      <CenteredState>
        <ErrorState title="Course unavailable" text={errorMessage} onRetry={() => refetch()} retrying={isFetching} />
        <div className="mt-4 text-center">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4" />
            Go back
          </Button>
        </div>
      </CenteredState>
    );
  }

  const lessonItems = lessons.map((lesson, index) => {
    const content = lesson?.content as unknown;
    const topics = Array.isArray(content) ? content : [];
    return {
      q: (
        <span className="flex items-center gap-3">
          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-semibold text-brand-700">
            {String(index + 1).padStart(2, "0")}
          </span>
          <span>{lesson.title || `Lesson ${index + 1}`}</span>
        </span>
      ),
      meta: (
        <span className="inline-flex items-center gap-1.5 pl-11">
          <Clock className="h-3.5 w-3.5" aria-hidden /> 45 min
          {topics.length > 0 && <> · {topics.length} {topics.length === 1 ? "topic" : "topics"}</>}
        </span>
      ),
      a: Array.isArray(content) ? (
        content.length > 0 ? (
          <ul className="space-y-2.5 pl-11">
            {content.map((item, i: number) => (
              <li key={i} className="flex gap-2.5 text-ink-2">
                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                <span>{String(item)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="pl-11">Details coming soon.</p>
        )
      ) : content ? (
        <p className="pl-11 text-ink-2">{String(content)}</p>
      ) : (
        <p className="pl-11">Details coming soon.</p>
      ),
    };
  });

  const mentor = mentors[currentMentorIndex];

  const enrollCard = (
    <Card className="overflow-hidden rounded-3xl">
      <div className="relative bg-ink p-6 text-white">
        <div className="bg-grid-dark pointer-events-none absolute inset-0 opacity-60" aria-hidden />
        <div className="relative">
          {course?.status && (
            <Badge tone="dark" className="bg-white/10 text-white ring-white/20">
              <span
                className={cn("h-1.5 w-1.5 rounded-full", course.status === "live" ? "bg-emerald-400" : course.status === "coming_soon" ? "bg-amber-400" : "bg-white/50")}
                aria-hidden
              />
              {course.status === "live" ? "Enrolling now" : course.status === "coming_soon" ? "Coming soon" : "Closed"}
            </Badge>
          )}
          <p className="mt-4 text-sm text-white/60">Course fee</p>
          <p className="mt-1 text-4xl font-semibold tracking-tight">{price ?? "See batches"}</p>
          {course?.courseDuration && <p className="mt-1 text-sm text-white/60">{course.courseDuration}</p>}
        </div>
      </div>
      <div className="p-6">
        <Button onClick={goEnroll} size="lg" className="w-full">
          Enroll now
          <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
        </Button>
        <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-3">
          <ShieldCheck className="h-3.5 w-3.5" aria-hidden />
          Secure checkout
        </p>
        <p className="mb-3 mt-6 text-sm font-semibold text-ink">This course includes</p>
        <ul className="space-y-3">
          {includes.map(({ icon: Icon, text }) => (
            <li key={text} className="flex items-center gap-3 text-sm text-ink-2">
              <Icon className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
              {text}
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );

  return (
    <div className="min-h-screen bg-white text-ink">
      {/* Share confirmation */}
      <AnimatePresence>
        {showSnackbar && (
          <motion.div
            className="fixed right-4 top-20 z-[60] flex items-center gap-2 rounded-full bg-ink px-4 py-3 text-sm font-medium text-white shadow-[var(--shadow-lift)]"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            role="status"
          >
            <Check className="h-4 w-4 text-emerald-400" />
            Link copied to clipboard
          </motion.div>
        )}
      </AnimatePresence>

      {/* Hero */}
      <header className="relative overflow-hidden bg-mesh">
        <div className="bg-grid pointer-events-none absolute inset-0" aria-hidden />
        <div className="container-x relative pb-14 pt-8 sm:pb-20 sm:pt-10">
          <div className="mb-10 flex items-center justify-between gap-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()} className="-ml-3 h-11">
              <ArrowLeft className="h-4 w-4" />
              Back to courses
            </Button>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsBookmarked(!isBookmarked)}
                aria-pressed={isBookmarked}
                aria-label={isBookmarked ? "Remove bookmark" : "Bookmark this course"}
                className={cn(
                  "inline-flex h-11 w-11 items-center justify-center rounded-full border transition-colors",
                  isBookmarked ? "border-ink bg-ink text-white" : "border-line bg-white text-ink-2 hover:border-brand-300",
                )}
              >
                <Bookmark className={cn("h-4 w-4", isBookmarked && "fill-current")} />
              </button>
              <button
                type="button"
                onClick={handleShare}
                aria-label={copied ? "Link copied" : "Share this course"}
                title={copied ? "Link copied" : "Share this course"}
                className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink-2 transition-colors hover:border-brand-300"
              >
                {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Share2 className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <Reveal>
            <Eyebrow>Flutter + AI program</Eyebrow>
            <h1 className="mt-5 max-w-3xl text-4xl font-semibold tracking-tight text-ink sm:text-6xl sm:leading-[1.02]">
              App Development with <span className="text-gradient-brand">AI</span> Masterclass
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-3">
              Ship cross-platform Flutter apps, from a matrimonial app to a CRM.
            </p>
          </Reveal>

          <Reveal delay={0.1}>
            <ul className="mt-7 flex flex-wrap gap-2">
              {[
                { icon: Clock, text: "Weekly schedule" },
                { icon: Users, text: "5K+ students" },
                { icon: BarChart3, text: course?.level ?? "All levels" },
                { icon: Star, text: "4.7/5 rating" },
                { icon: BookOpen, text: `${lessons.length} ${lessons.length === 1 ? "lesson" : "lessons"}` },
              ].map((item) => (
                <li key={item.text}>
                  <Badge tone="neutral" className="bg-white/80 py-1.5">
                    <item.icon className="h-3.5 w-3.5" aria-hidden />
                    {item.text}
                  </Badge>
                </li>
              ))}
            </ul>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row lg:hidden">
              <Button size="lg" onClick={goEnroll}>
                Enroll now
                <ArrowRight className="h-4 w-4" />
              </Button>
              {price && <p className="self-center text-sm text-ink-3">Fee {price}</p>}
            </div>
          </Reveal>
        </div>
      </header>

      {/* Body */}
      <section className="py-12 sm:py-16">
        <div className="container-x grid grid-cols-1 items-start gap-10 lg:grid-cols-3">
          <div className="min-w-0 lg:col-span-2">
            <Tabs tabs={TAB_ITEMS} value={activeTab} onChange={setActiveTab} className="mb-8" />

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                role="tabpanel"
              >
                {activeTab === "lessons" &&
                  (lessons.length === 0 ? (
                    <EmptyState
                      icon={<BookOpen className="h-5 w-5" />}
                      title="No lessons published yet"
                      text="Lessons for this course will appear here once they are added."
                    />
                  ) : (
                    <Accordion items={lessonItems} className="shadow-[var(--shadow-soft)]" />
                  ))}

                {activeTab === "overview" && (
                  <div>
                    <h2 className="text-2xl font-semibold tracking-tight text-ink">What you will learn</h2>
                    <Stagger className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                      {overviewItems.map((item) => (
                        <StaggerItem key={item}>
                          <div className="flex h-full items-start gap-3 rounded-2xl border border-line bg-white p-4 text-[15px] text-ink-2">
                            <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-brand-600" aria-hidden />
                            <span>{item}</span>
                          </div>
                        </StaggerItem>
                      ))}
                    </Stagger>
                  </div>
                )}

                {activeTab === "projects" && (
                  <Stagger className="grid gap-4">
                    {projects.map((project, i) => (
                      <StaggerItem key={project.title}>
                        <Card interactive className="p-6 sm:p-7">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <p className="text-xs font-semibold uppercase tracking-wider text-brand-700">Project {String(i + 1).padStart(2, "0")}</p>
                              <h3 className="mt-1.5 text-xl font-semibold tracking-tight text-ink">{project.title}</h3>
                            </div>
                          </div>
                          <p className="mt-2 text-[15px] leading-relaxed text-ink-3">{project.description}</p>
                          <ul className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
                            {project.features.map((feature) => (
                              <li key={feature} className="flex items-start gap-2 text-sm text-ink-2">
                                <CheckCircle className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                                {feature}
                              </li>
                            ))}
                          </ul>
                          <div className="mt-5 flex flex-wrap gap-2">
                            {project.tech.map((tech) => (
                              <Badge key={tech} tone="neutral">
                                {tech}
                              </Badge>
                            ))}
                          </div>
                        </Card>
                      </StaggerItem>
                    ))}
                  </Stagger>
                )}

                {activeTab === "mentors" && (
                  <Stagger className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    {mentors.map((m, index) => (
                      <StaggerItem key={m.id} className="h-full">
                        <Card interactive className="flex h-full flex-col p-6">
                          <div className="flex items-center gap-4">
                            <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface">
                              <Image src={m.image} alt={m.name} width={200} height={200} className="h-full w-full object-cover" />
                            </div>
                            <div className="min-w-0">
                              <h3 className="text-lg font-semibold text-ink">{m.name}</h3>
                              <p className="text-sm text-ink-3">{m.role}</p>
                              <p className="mt-1 inline-flex items-center gap-1 text-sm text-ink-2">
                                <Star className="h-4 w-4 fill-amber-400 text-amber-400" aria-hidden />
                                {m.rating} · {m.experience}
                              </p>
                            </div>
                          </div>
                          <ul className="mt-5 flex-1 space-y-2.5 text-sm text-ink-2">
                            {[
                              { icon: Award, text: m.achievements },
                              { icon: Users, text: m.students },
                              { icon: MessageCircle, text: m.support },
                            ].map(({ icon: Icon, text }) => (
                              <li key={text} className="flex items-center gap-3">
                                <Icon className="h-4 w-4 text-brand-600" aria-hidden />
                                {text}
                              </li>
                            ))}
                          </ul>
                          <Button variant="outline" className="mt-6 w-full" onClick={() => handleMessageMentor(index)}>
                            <MessageCircle className="h-4 w-4" />
                            Message mentor
                          </Button>
                        </Card>
                      </StaggerItem>
                    ))}
                  </Stagger>
                )}

                {activeTab === "reviews" && (
                  <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2">
                    {customReviews.map((t) => (
                      <StaggerItem key={t.name} className="h-full">
                        <ReviewCard t={t} />
                      </StaggerItem>
                    ))}
                  </Stagger>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Sticky enroll card */}
          <aside className="lg:sticky lg:top-24">
            <Reveal delay={0.1}>{enrollCard}</Reveal>
          </aside>
        </div>
      </section>

      {/* Student reviews */}
      <Section tone="surface">
        <SectionHeader
          eyebrow={<Eyebrow>Student stories</Eyebrow>}
          title="Learners who shipped real apps"
          subtitle="What past students say about the course."
        />
        <Stagger className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {customReviews.slice(0, 3).map((t) => (
            <StaggerItem key={t.name} className="h-full">
              <ReviewCard t={t} />
            </StaggerItem>
          ))}
        </Stagger>
      </Section>

      {/* Final CTA */}
      <section className="bg-white py-16 sm:py-24">
        <div className="container-x">
          <Reveal>
            <div className="relative overflow-hidden rounded-3xl bg-ink px-6 py-14 text-center text-white sm:px-12 sm:py-20">
              <div className="bg-grid-dark pointer-events-none absolute inset-0" aria-hidden />
              <div className="relative">
                <h2 className="text-3xl font-semibold tracking-tight sm:text-5xl">Ready to start building apps?</h2>
                <p className="mx-auto mt-4 max-w-xl text-lg text-white/70">Real projects. 1:1 mentor support.</p>
                <Button variant="white" size="lg" onClick={goEnroll} className="mt-8 w-full sm:w-auto">
                  Enroll now
                  <ArrowRight className="h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                </Button>
                <ul className="mt-8 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-white/70">
                  {[
                    { icon: CheckCircle, text: "1:1 mentorship" },
                    { icon: Clock, text: "Lifetime access" },
                    { icon: Users, text: "Community support" }
                  ].map((item) => (
                    <li key={item.text} className="inline-flex items-center gap-2">
                      <item.icon className="h-4 w-4" aria-hidden />
                      {item.text}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Mentor contact modal */}
      <Modal open={showMentorModal} onClose={() => setShowMentorModal(false)} title="Contact mentor" size="sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={mentor.id}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -16 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-center gap-4">
              <div className="h-16 w-16 shrink-0 overflow-hidden rounded-2xl bg-surface">
                <Image src={mentor.image} alt={mentor.name} width={200} height={200} className="h-full w-full object-cover" />
              </div>
              <div>
                <p className="text-lg font-semibold text-ink">{mentor.name}</p>
                <p className="text-sm text-ink-3">{mentor.role}</p>
              </div>
            </div>

            <dl className="mt-6 space-y-3">
              <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
                <Phone className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                <div>
                  <dt className="text-xs text-ink-3">Phone</dt>
                  <dd className="font-medium text-ink">{mentor.phone}</dd>
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-2xl border border-line p-4">
                <Mail className="h-4 w-4 shrink-0 text-brand-600" aria-hidden />
                <div className="min-w-0">
                  <dt className="text-xs text-ink-3">Email</dt>
                  <dd className="break-all font-medium text-ink">{mentor.email}</dd>
                </div>
              </div>
            </dl>

            <div className="mt-5 flex gap-3">
              <Button href={`tel:${mentor.phone}`} variant="dark" className="flex-1">
                <Phone className="h-4 w-4" />
                Call
              </Button>
              <Button href={`mailto:${mentor.email}`} variant="outline" className="flex-1">
                <Mail className="h-4 w-4" />
                Email
              </Button>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Carousel controls */}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={handlePrevMentor}
            aria-label="Previous mentor"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink-2 transition-colors hover:border-brand-300"
          >
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div className="flex gap-2">
            {mentors.map((m, index) => (
              <button
                key={m.id}
                type="button"
                onClick={() => setCurrentMentorIndex(index)}
                aria-label={`Show ${m.name}`}
                aria-current={index === currentMentorIndex}
                className={cn("h-2 rounded-full transition-all", index === currentMentorIndex ? "w-6 bg-ink" : "w-2 bg-line hover:bg-ink-3")}
              />
            ))}
          </div>
          <button
            type="button"
            onClick={handleNextMentor}
            aria-label="Next mentor"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-line bg-white text-ink-2 transition-colors hover:border-brand-300"
          >
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </Modal>
    </div>
  );
}
