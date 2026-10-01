// DUMMY DATA — replace with API calls (see src/webinars/lib/api.ts).
// Dates are generated relative to "now" so every state (upcoming, starting
// soon, live, ended, cancelled, postponed, sold out…) is always visible in the UI.

import type { Speaker, Webinar, WebinarRegistration } from "./types";

const NOW = Date.now();
const IST_OFFSET_MIN = 330;

/** ISO string for a given IST clock time, `dayOffset` days from today. */
function atIST(dayOffset: number, hh: number, mm = 0): string {
  const ist = new Date(NOW + IST_OFFSET_MIN * 60_000);
  const utc = Date.UTC(ist.getUTCFullYear(), ist.getUTCMonth(), ist.getUTCDate() + dayOffset, hh, mm);
  return new Date(utc - IST_OFFSET_MIN * 60_000).toISOString();
}

/** ISO string `minutes` from now, rounded to the minute. */
function fromNow(minutes: number): string {
  const t = NOW + minutes * 60_000;
  return new Date(Math.floor(t / 60_000) * 60_000).toISOString();
}

export const speakers: Speaker[] = [
  {
    id: "himanshu",
    name: "Himanshu Kumar",
    role: "Founder, Vereda",
    photo: "/images/Pictures-2.png",
    bio: "9+ years building software products and training developers.",
  },
  {
    id: "hermant",
    name: "Hermant Kumar",
    role: "Co-Founder, Vereda",
    photo: "/images/Hermant-kumar.webp",
    bio: "9+ years in engineering and mentoring students into tech careers.",
  },
  {
    id: "mentors",
    name: "Vereda Mentor Team",
    role: "Flutter & AI mentors",
    bio: "The mentors who run Vereda's live classes and doubt sessions.",
  },
];

const flutterCourse = { keyword: "flutter", fallbackTitle: "Flutter App Development" };
const aiCourse = { keyword: "ai", fallbackTitle: "AI & Machine Learning" };

export const webinars: Webinar[] = [
  // ── Upcoming, free, featured ─────────────────────────────────────────
  {
    id: "w-flutter-first-app",
    slug: "build-your-first-flutter-app",
    title: "Build Your First Flutter App — Live",
    subtitle: "From an empty project to a working app on your phone in 90 minutes.",
    description:
      "A hands-on session for complete beginners. We install Flutter together, build a small to-do app screen by screen, and run it on a real phone. Bring a laptop; no prior Flutter experience needed.",
    topic: "flutter",
    level: "Beginner",
    language: "Hindi + English",
    price: 0,
    capacity: 500,
    registeredCount: 312,
    lateRegistration: true,
    waitlist: false,
    sessions: [{ id: "s1", title: "Live session", startsAt: atIST(3, 19), durationMin: 90 }],
    speakerIds: ["himanshu"],
    agenda: [
      "Set up Flutter and VS Code",
      "Widgets, layouts and hot reload",
      "Build the to-do screen",
      "Run on your phone + Q&A",
    ],
    outcomes: ["A working Flutter app", "How widgets and state fit together", "What to learn next"],
    audience: ["Students starting app development", "Web developers curious about Flutter"],
    prerequisites: ["A laptop (Windows, macOS or Linux)", "Basic programming knowledge helps"],
    state: "scheduled",
    recording: { ready: true, durationMin: 88, expiresInDays: 30, access: "registered", chapters: [] },
    certificate: { offered: true, minAttendancePct: 75, requiresQuiz: false },
    relatedCourse: flutterCourse,
    courseOffer: { code: "WEBINAR1000", text: "Attendees get ₹1,000 off the Flutter course for 7 days." },
    featured: true,
    tags: ["Flutter", "Dart", "Hands-on"],
  },

  // ── Upcoming, paid, two-day series, quiz required ────────────────────
  {
    id: "w-ai-agents",
    slug: "ai-agents-with-python",
    title: "AI Agents with Python: Prompt to Product",
    subtitle: "Two evenings. Build an agent that calls tools and answers from your own data.",
    description:
      "Day 1 covers LLM basics, prompts and tool calling. Day 2 connects the agent to your own documents and ships a small web demo. A short quiz at the end unlocks the certificate.",
    topic: "ai-ml",
    level: "Intermediate",
    language: "Hindi + English",
    price: 199,
    originalPrice: 499,
    capacity: 150,
    registeredCount: 97,
    lateRegistration: false,
    waitlist: true,
    sessions: [
      { id: "d1", title: "Day 1 — LLMs, prompts, tool calling", startsAt: atIST(6, 19), durationMin: 120 },
      { id: "d2", title: "Day 2 — Your data + web demo", startsAt: atIST(7, 19), durationMin: 120 },
    ],
    speakerIds: ["hermant", "mentors"],
    agenda: ["How LLMs answer", "Prompt patterns that work", "Tool calling", "Retrieval from your files", "Ship a demo"],
    outcomes: ["A working AI agent project", "Prompting and tool-calling patterns", "A certificate after the quiz"],
    audience: ["Students with basic Python", "Developers adding AI to apps"],
    prerequisites: ["Python basics", "A free API key (we show how)"],
    state: "scheduled",
    recording: { ready: true, durationMin: 236, expiresInDays: 60, access: "registered", chapters: [] },
    certificate: { offered: true, minAttendancePct: 70, requiresQuiz: true },
    relatedCourse: aiCourse,
    tags: ["Python", "LLM", "Agents"],
  },

  // ── LIVE right now ───────────────────────────────────────────────────
  {
    id: "w-flutter-firebase",
    slug: "flutter-firebase-auth",
    title: "Flutter + Firebase Auth in 60 Minutes",
    subtitle: "Email, OTP and Google sign-in, wired up live.",
    description:
      "We add Firebase to a Flutter app and build email, phone OTP and Google sign-in with proper error handling. Late joiners can still register and join.",
    topic: "flutter",
    level: "Intermediate",
    language: "Hindi + English",
    price: 0,
    capacity: 400,
    registeredCount: 268,
    lateRegistration: true,
    waitlist: false,
    sessions: [{ id: "s1", title: "Live session", startsAt: fromNow(-20), durationMin: 75 }],
    speakerIds: ["himanshu", "mentors"],
    agenda: ["Firebase project setup", "Email + password", "Phone OTP", "Google sign-in", "Q&A"],
    outcomes: ["Working auth flow", "Error handling patterns"],
    audience: ["Flutter learners who know widgets"],
    prerequisites: ["Flutter installed", "A Google account"],
    state: "scheduled",
    recording: { ready: true, durationMin: 72, expiresInDays: 30, access: "registered", chapters: [] },
    certificate: { offered: true, minAttendancePct: 75, requiresQuiz: false },
    relatedCourse: flutterCourse,
    tags: ["Flutter", "Firebase", "Auth"],
  },

  // ── Starting in 40 minutes (join room opens 15 min before) ──────────
  {
    id: "w-flutter-interview",
    slug: "crack-flutter-developer-interview",
    title: "Crack Your First Flutter Developer Interview",
    subtitle: "Real questions, mock answers and a resume review.",
    description:
      "The questions freshers actually get in Flutter interviews, how to answer them, and live reviews of three student resumes.",
    topic: "career",
    level: "All levels",
    language: "Hindi + English",
    price: 0,
    capacity: 300,
    registeredCount: 281,
    lateRegistration: true,
    waitlist: false,
    sessions: [{ id: "s1", title: "Live session", startsAt: fromNow(40), durationMin: 60 }],
    speakerIds: ["hermant"],
    agenda: ["Top 15 Flutter questions", "Explaining your projects", "Live resume review", "Q&A"],
    outcomes: ["Answers you can reuse", "A stronger resume"],
    audience: ["Final-year students", "Freshers applying for Flutter roles"],
    prerequisites: [],
    state: "scheduled",
    recording: { ready: true, durationMin: 58, expiresInDays: 30, access: "registered", chapters: [] },
    certificate: { offered: false, minAttendancePct: 0, requiresQuiz: false },
    relatedCourse: flutterCourse,
    tags: ["Career", "Interview", "Resume"],
  },

  // ── Sold out → waitlist ──────────────────────────────────────────────
  {
    id: "w-ml-roadmap",
    slug: "machine-learning-roadmap",
    title: "Machine Learning Roadmap for Beginners",
    subtitle: "What to learn, in what order, and which projects to build.",
    description:
      "A clear path from Python basics to your first ML project, with the free resources we recommend to our own students.",
    topic: "ai-ml",
    level: "Beginner",
    language: "Hindi",
    price: 0,
    capacity: 250,
    registeredCount: 250,
    lateRegistration: false,
    waitlist: true,
    sessions: [{ id: "s1", title: "Live session", startsAt: atIST(2, 18, 30), durationMin: 60 }],
    speakerIds: ["hermant"],
    agenda: ["Maths you actually need", "Python + NumPy + Pandas", "First three projects", "Q&A"],
    outcomes: ["A 12-week learning plan", "Project ideas for your portfolio"],
    audience: ["School and college students", "Career switchers"],
    prerequisites: [],
    state: "scheduled",
    recording: { ready: true, durationMin: 60, expiresInDays: null, access: "public", chapters: [] },
    certificate: { offered: true, minAttendancePct: 60, requiresQuiz: false },
    relatedCourse: aiCourse,
    tags: ["ML", "Roadmap"],
  },

  // ── Postponed ────────────────────────────────────────────────────────
  {
    id: "w-fastapi-ml",
    slug: "deploy-ml-models-fastapi",
    title: "Deploying ML Models with FastAPI",
    subtitle: "Turn a notebook model into an API your app can call.",
    description:
      "Package a trained model, serve it with FastAPI, and call it from a Flutter app. Moved to a new date — existing registrations carry over automatically.",
    topic: "backend",
    level: "Intermediate",
    language: "Hindi + English",
    price: 99,
    capacity: 200,
    registeredCount: 64,
    lateRegistration: false,
    waitlist: false,
    sessions: [{ id: "s1", title: "Live session", startsAt: atIST(12, 19), durationMin: 90 }],
    speakerIds: ["mentors"],
    agenda: ["Save and load a model", "FastAPI endpoints", "Deploy to a server", "Call it from Flutter"],
    outcomes: ["A deployed prediction API"],
    audience: ["Students who have trained a model"],
    prerequisites: ["Python", "Basic ML"],
    state: "postponed",
    rescheduledFrom: atIST(4, 19),
    recording: { ready: true, durationMin: 90, expiresInDays: 30, access: "registered", chapters: [] },
    certificate: { offered: true, minAttendancePct: 75, requiresQuiz: false },
    relatedCourse: aiCourse,
    tags: ["FastAPI", "Deployment"],
  },

  // ── Cancelled ────────────────────────────────────────────────────────
  {
    id: "w-career-after-12",
    slug: "tech-career-after-12th",
    title: "Tech Careers After 12th and B.Sc",
    subtitle: "Paths, salaries and skills — an honest talk.",
    description: "An open session for students and parents about getting into tech without a B.Tech.",
    topic: "career",
    level: "All levels",
    language: "Hindi",
    price: 0,
    capacity: 500,
    registeredCount: 140,
    lateRegistration: false,
    waitlist: false,
    sessions: [{ id: "s1", title: "Live session", startsAt: atIST(4, 17), durationMin: 60 }],
    speakerIds: ["himanshu"],
    agenda: ["Paths into tech", "Skills that get interviews", "Q&A with parents"],
    outcomes: [],
    audience: ["Students after 12th", "Parents"],
    prerequisites: [],
    state: "cancelled",
    cancelReason: "The speaker is unavailable on this date. We'll announce a new date soon.",
    recording: null,
    certificate: { offered: false, minAttendancePct: 0, requiresQuiz: false },
    relatedCourse: flutterCourse,
    tags: ["Career"],
  },

  // ── Ended 2 hours ago → recording + certificate processing ──────────
  {
    id: "w-prompt-eng",
    slug: "prompt-engineering-for-developers",
    title: "Prompt Engineering for Developers",
    subtitle: "Patterns that make LLM output reliable in real apps.",
    description: "Structured output, few-shot examples, evaluation and guardrails, with live code.",
    topic: "ai-ml",
    level: "Intermediate",
    language: "English",
    price: 0,
    capacity: 300,
    registeredCount: 211,
    lateRegistration: true,
    waitlist: false,
    sessions: [{ id: "s1", title: "Live session", startsAt: fromNow(-180), durationMin: 60 }],
    speakerIds: ["hermant"],
    agenda: ["Prompt anatomy", "Structured output", "Evaluating prompts", "Guardrails"],
    outcomes: ["Reusable prompt templates"],
    audience: ["Developers using LLM APIs"],
    prerequisites: ["Any programming language"],
    state: "scheduled",
    recording: { ready: false, durationMin: 58, expiresInDays: 30, access: "registered", chapters: [] },
    certificate: { offered: true, minAttendancePct: 75, requiresQuiz: false },
    relatedCourse: aiCourse,
    tags: ["LLM", "Prompts"],
  },

  // ── Ended 3 days ago, recording available, certificate offered ──────
  {
    id: "w-state-mgmt",
    slug: "flutter-state-management",
    title: "State Management in Flutter: Provider vs Riverpod vs Bloc",
    subtitle: "Same app, three approaches, one clear recommendation.",
    description:
      "We build one screen three ways and compare boilerplate, testability and how each scales in a team.",
    topic: "flutter",
    level: "Intermediate",
    language: "Hindi + English",
    price: 0,
    capacity: 400,
    registeredCount: 356,
    lateRegistration: true,
    waitlist: false,
    sessions: [{ id: "s1", title: "Live session", startsAt: atIST(-3, 19), durationMin: 90 }],
    speakerIds: ["himanshu"],
    agenda: ["Why state is hard", "Provider", "Riverpod", "Bloc", "Which to choose"],
    outcomes: ["A decision guide for your next project"],
    audience: ["Flutter learners"],
    prerequisites: ["Flutter basics"],
    state: "scheduled",
    recording: {
      ready: true,
      durationMin: 86,
      expiresInDays: 30,
      access: "registered",
      chapters: [
        { at: "00:00", title: "Introduction" },
        { at: "06:40", title: "Why state is hard" },
        { at: "18:10", title: "Provider" },
        { at: "37:25", title: "Riverpod" },
        { at: "58:00", title: "Bloc" },
        { at: "76:30", title: "Which one to choose + Q&A" },
      ],
    },
    certificate: { offered: true, minAttendancePct: 75, requiresQuiz: false },
    relatedCourse: flutterCourse,
    tags: ["Flutter", "Riverpod", "Bloc"],
  },

  // ── Ended 5 days ago, quiz required ─────────────────────────────────
  {
    id: "w-genai-students",
    slug: "generative-ai-tools-for-students",
    title: "Generative AI Tools for Students",
    subtitle: "Use AI to learn faster — without letting it think for you.",
    description: "Practical ways to use AI tools for notes, coding practice and projects, plus a short quiz.",
    topic: "ai-ml",
    level: "Beginner",
    language: "Hindi",
    price: 0,
    capacity: 600,
    registeredCount: 488,
    lateRegistration: true,
    waitlist: false,
    sessions: [{ id: "s1", title: "Live session", startsAt: atIST(-5, 18), durationMin: 60 }],
    speakerIds: ["hermant"],
    agenda: ["Study workflows", "Coding practice with AI", "What not to do", "Quiz"],
    outcomes: ["A study workflow you can start today"],
    audience: ["School and college students"],
    prerequisites: [],
    state: "scheduled",
    recording: {
      ready: true,
      durationMin: 57,
      expiresInDays: null,
      access: "public",
      chapters: [
        { at: "00:00", title: "Introduction" },
        { at: "09:15", title: "Study workflows" },
        { at: "27:40", title: "Coding practice" },
        { at: "45:10", title: "What not to do" },
      ],
    },
    certificate: { offered: true, minAttendancePct: 60, requiresQuiz: true },
    relatedCourse: aiCourse,
    tags: ["AI tools", "Students"],
  },

  // ── Ended 10 days ago, no certificate offered ───────────────────────
  {
    id: "w-flutter-animations",
    slug: "flutter-animations",
    title: "Flutter Animations That Feel Native",
    subtitle: "Implicit, explicit and hero animations in one app.",
    description: "A short, demo-heavy session on animations that make apps feel polished.",
    topic: "flutter",
    level: "Intermediate",
    language: "English",
    price: 0,
    capacity: 300,
    registeredCount: 190,
    lateRegistration: true,
    waitlist: false,
    sessions: [{ id: "s1", title: "Live session", startsAt: atIST(-10, 19), durationMin: 45 }],
    speakerIds: ["mentors"],
    agenda: ["Implicit animations", "AnimationController", "Hero transitions"],
    outcomes: ["Three animation patterns"],
    audience: ["Flutter learners"],
    prerequisites: ["Flutter basics"],
    state: "scheduled",
    recording: {
      ready: true,
      durationMin: 44,
      expiresInDays: 30,
      access: "registered",
      chapters: [
        { at: "00:00", title: "Implicit animations" },
        { at: "15:20", title: "AnimationController" },
        { at: "31:05", title: "Hero transitions" },
      ],
    },
    certificate: { offered: false, minAttendancePct: 0, requiresQuiz: false },
    relatedCourse: flutterCourse,
    tags: ["Flutter", "Animations"],
  },

  // ── Ended 20 days ago, paid, recording expired ──────────────────────
  {
    id: "w-dart-crash",
    slug: "dart-crash-course",
    title: "Dart Crash Course for Flutter",
    subtitle: "Everything in Dart you need before writing Flutter.",
    description: "Types, null safety, async/await and collections, explained with Flutter examples.",
    topic: "flutter",
    level: "Beginner",
    language: "Hindi + English",
    price: 49,
    capacity: 300,
    registeredCount: 173,
    lateRegistration: true,
    waitlist: false,
    sessions: [{ id: "s1", title: "Live session", startsAt: atIST(-20, 19), durationMin: 120 }],
    speakerIds: ["himanshu"],
    agenda: ["Types and null safety", "Functions and classes", "async/await", "Collections"],
    outcomes: ["Dart fundamentals for Flutter"],
    audience: ["Flutter beginners"],
    prerequisites: [],
    state: "scheduled",
    recording: { ready: true, durationMin: 118, expiresInDays: 14, access: "registered", chapters: [] },
    certificate: { offered: true, minAttendancePct: 75, requiresQuiz: false },
    relatedCourse: flutterCourse,
    tags: ["Dart"],
  },
];

/**
 * Demo history for a logged-in student, so the dashboard shows every
 * certificate state. Backend: GET /webinars/me/registrations.
 */
export function demoRegistrationsFor(user: { id: string; name: string; email: string; phone?: string }): WebinarRegistration[] {
  const base = {
    ownerId: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone ?? "",
    demo: true,
  };
  const reg = (webinarId: string, daysBefore: number, extra: Partial<WebinarRegistration> = {}): WebinarRegistration => {
    const w = webinars.find((x) => x.id === webinarId)!;
    return {
      ...base,
      webinarId,
      registeredAt: new Date(new Date(w.sessions[0].startsAt).getTime() - daysBefore * 86_400_000).toISOString(),
      amountPaid: w.price,
      ...extra,
    };
  };
  return [
    reg("w-flutter-firebase", 2),                                           // live now → Join
    reg("w-ai-agents", 1, { paymentRef: "pay_demo_71K2" }),                 // upcoming, paid
    reg("w-prompt-eng", 4, { attendancePct: undefined }),                   // just ended → processing
    reg("w-state-mgmt", 6, { attendancePct: 88 }),                          // certificate ready
    reg("w-genai-students", 3, { attendancePct: 81, quizPassed: false }),   // quiz pending
    reg("w-flutter-animations", 2, { attendancePct: 100 }),                 // no certificate offered
    reg("w-dart-crash", 5, { attendancePct: 38, paymentRef: "pay_demo_19QX" }), // below attendance, recording expired
  ];
}

/** Certificates issued to other people — used by the public verify page demo. */
export const publicIssuedCertificates = [
  { id: "VDL-WB-FLUTT-7Q4K2M", name: "Ananya Verma", webinarId: "w-state-mgmt" },
  { id: "VDL-WB-DART-3J8P1X", name: "Rohit Singh", webinarId: "w-dart-crash" },
];

export const TOPICS: { id: "all" | Webinar["topic"]; label: string }[] = [
  { id: "all", label: "All topics" },
  { id: "flutter", label: "Flutter" },
  { id: "ai-ml", label: "AI & ML" },
  { id: "backend", label: "Backend" },
  { id: "career", label: "Career" },
];
