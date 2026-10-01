import { Button } from "./ui";

export default function WebinarNotFound() {
  return (
    <div className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold text-brand-600">404</p>
      <h1 className="mt-2 text-2xl font-bold text-ink">We couldn&apos;t find that webinar</h1>
      <p className="mt-2 text-ink-3">The link may be old, or the webinar was removed.</p>
      <div className="mt-6 flex justify-center gap-2">
        <Button href="/webinars">All webinars</Button>
        <Button href="/view-courses" variant="secondary">Browse courses</Button>
      </div>
    </div>
  );
}
