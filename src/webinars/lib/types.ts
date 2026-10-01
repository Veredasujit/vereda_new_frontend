// Webinar module types. These mirror the shape the backend should return later,
// so the UI can switch from dummy data to API calls without changes.

export type WebinarTopic = "flutter" | "ai-ml" | "career" | "backend";
export type WebinarLevel = "Beginner" | "Intermediate" | "Advanced" | "All levels";

/** Set by admin. Everything else (live, ended…) is computed from dates. */
export type WebinarAdminState = "scheduled" | "cancelled" | "postponed";

export interface WebinarSession {
  id: string;
  title: string;
  startsAt: string; // ISO
  durationMin: number;
}

export interface Speaker {
  id: string;
  name: string;
  role: string;
  photo?: string; // path in /public or absolute URL
  bio: string;
}

export interface WebinarRecording {
  /** false while the video is being processed after the session */
  ready: boolean;
  durationMin: number;
  /** days the recording stays online after the webinar ends; null = forever */
  expiresInDays: number | null;
  access: "registered" | "public";
  chapters: { at: string; title: string }[];
}

export interface WebinarCertificateRule {
  offered: boolean;
  /** minimum live attendance, in percent of total webinar time */
  minAttendancePct: number;
  requiresQuiz: boolean;
}

export interface Webinar {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  topic: WebinarTopic;
  level: WebinarLevel;
  language: string;
  price: number; // 0 = free
  originalPrice?: number;
  capacity: number;
  registeredCount: number;
  /** allow registering after the webinar has started */
  lateRegistration: boolean;
  waitlist: boolean;
  sessions: WebinarSession[];
  speakerIds: string[];
  agenda: string[];
  outcomes: string[];
  audience: string[];
  prerequisites: string[];
  state: WebinarAdminState;
  cancelReason?: string;
  rescheduledFrom?: string; // ISO, when postponed
  recording: WebinarRecording | null; // null = not recorded
  certificate: WebinarCertificateRule;
  /** ties the webinar to an existing course (matched by title keyword) */
  relatedCourse: { keyword: string; fallbackTitle: string };
  courseOffer?: { code: string; text: string };
  featured?: boolean;
  tags: string[];
}

/** Stored per user per webinar. Backend: webinar_registrations table. */
export interface WebinarRegistration {
  webinarId: string;
  ownerId: string; // user id, or "guest"
  name: string;
  email: string;
  phone: string;
  registeredAt: string;
  amountPaid: number;
  couponCode?: string;
  paymentRef?: string;
  waitlisted?: boolean;
  /** filled by backend from live attendance logs after the webinar */
  attendancePct?: number;
  quizPassed?: boolean;
  demo?: boolean;
}

export type WebinarStatus =
  | "upcoming"
  | "starting-soon"
  | "live"
  | "between-sessions"
  | "ended"
  | "cancelled";

export type CertificateState =
  | "not-offered"
  | "not-registered"
  | "waitlisted"
  | "after-webinar"
  | "cancelled"
  | "processing"
  | "missed"
  | "low-attendance"
  | "quiz-pending"
  | "eligible";

export type RecordingState =
  | "after-webinar"
  | "not-recorded"
  | "processing"
  | "expired"
  | "locked"
  | "available"
  | "cancelled";
