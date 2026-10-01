// Mock service layer for webinars. Every function maps to a future endpoint:
//
//   GET    /webinars                         → listWebinars()
//   GET    /webinars/:slug                   → getWebinarBySlug()
//   POST   /webinars/:id/register            → register()
//   DELETE /webinars/:id/register            → cancelRegistration()
//   GET    /webinars/me/registrations        → myRegistrations()
//   POST   /webinars/:id/quiz                → submitQuiz()
//   GET    /webinars/certificates/:certId    → verifyCertificate()
//
// Until the backend exists, registrations are kept in localStorage so the
// UI flow (register → join → recording → certificate) works end to end.

import { demoRegistrationsFor, publicIssuedCertificates, speakers, webinars } from "./data";
import type { Webinar, WebinarRegistration } from "./types";
import { certificateId, certificateState } from "./utils";

const KEY = "vereda_webinar_registrations_v1";
const SEEDED = "vereda_webinar_demo_seeded_v1";
const EVT = "vereda-webinars-change";

export const listWebinars = (): Webinar[] => webinars;
export const getWebinarBySlug = (slug: string) => webinars.find((w) => w.slug === slug) ?? null;
export const getWebinarById = (id: string) => webinars.find((w) => w.id === id) ?? null;
export const getSpeaker = (id: string) => speakers.find((s) => s.id === id) ?? null;

// ── local store ──────────────────────────────────────────────────────────
function read(): WebinarRegistration[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = JSON.parse(localStorage.getItem(KEY) || "[]");
    return Array.isArray(raw) ? raw : [];
  } catch {
    return [];
  }
}

function write(list: WebinarRegistration[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(list));
  } catch {
    /* storage full or blocked — UI still works for this page view */
  }
  window.dispatchEvent(new Event(EVT));
}

export function subscribe(cb: () => void) {
  window.addEventListener(EVT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVT, cb);
    window.removeEventListener("storage", cb);
  };
}

export const allRegistrations = read;

type Who = { id?: string | null; email?: string | null } | null | undefined;

/** A registration belongs to the user if it was made while logged in, or as a guest with the same email. */
const owns = (r: WebinarRegistration, who: Who) =>
  !!who &&
  ((who.id && r.ownerId === who.id) ||
    (!!who.email && r.email.toLowerCase() === who.email.toLowerCase()));

export function myRegistrations(who: Who): WebinarRegistration[] {
  if (!who) return read().filter((r) => r.ownerId === "guest");
  return read().filter((r) => owns(r, who));
}

export function findRegistration(webinarId: string, who: Who): WebinarRegistration | null {
  const mine = myRegistrations(who);
  return mine.find((r) => r.webinarId === webinarId) ?? null;
}

export function isEmailRegistered(webinarId: string, email: string) {
  return read().some((r) => r.webinarId === webinarId && r.email.toLowerCase() === email.trim().toLowerCase());
}

/** Demo only: give a logged-in user a history so every dashboard state shows. */
export function seedDemoHistory(user: { id: string; name: string; email: string; phone?: string }) {
  if (typeof window === "undefined" || !user?.id) return;
  const seeded: string[] = JSON.parse(localStorage.getItem(SEEDED) || "[]");
  if (seeded.includes(user.id)) return;
  const existing = read();
  const add = demoRegistrationsFor({ ...user, email: user.email || `${user.id}@student.vereda` }).filter(
    (d) => !existing.some((r) => r.webinarId === d.webinarId && owns(r, user)),
  );
  localStorage.setItem(SEEDED, JSON.stringify([...seeded, user.id]));
  write([...existing, ...add]);
}

export function resetDemo() {
  localStorage.removeItem(KEY);
  localStorage.removeItem(SEEDED);
  window.dispatchEvent(new Event(EVT));
}

const wait = (ms: number) => new Promise((r) => setTimeout(r, ms));

export async function register(input: Omit<WebinarRegistration, "registeredAt">) {
  await wait(700);
  if (isEmailRegistered(input.webinarId, input.email)) {
    throw new Error("This email is already registered for this webinar.");
  }
  const reg: WebinarRegistration = { ...input, email: input.email.trim(), name: input.name.trim(), registeredAt: new Date().toISOString() };
  write([...read(), reg]);
  return reg;
}

/** Dummy payment. Razorpay (already in the project) plugs in here later. */
export async function pay(amount: number) {
  await wait(1200);
  return { id: `pay_demo_${Math.random().toString(36).slice(2, 8).toUpperCase()}`, amount };
}

export async function cancelRegistration(webinarId: string, who: Who) {
  await wait(400);
  write(read().filter((r) => !(r.webinarId === webinarId && owns(r, who ?? { id: "guest" }))));
}

export async function submitQuiz(webinarId: string, who: Who, correct: number, total: number) {
  await wait(500);
  const passed = correct / total >= 0.6;
  write(read().map((r) => (r.webinarId === webinarId && owns(r, who) ? { ...r, quizPassed: passed } : r)));
  return passed;
}

export function verifyCertificate(id: string) {
  const clean = id.trim().toUpperCase();
  if (!clean) return null;
  const pub = publicIssuedCertificates.find((c) => c.id === clean);
  if (pub) return { id: clean, name: pub.name, webinar: getWebinarById(pub.webinarId)! };
  const now = Date.now();
  for (const r of read()) {
    const w = getWebinarById(r.webinarId);
    if (!w) continue;
    if (certificateId(w, r.email) === clean && certificateState(w, now, r) === "eligible") {
      return { id: clean, name: r.name, webinar: w };
    }
  }
  return null;
}
