"use client";

import { CountUp, Reveal } from "@/ui";

const stats = [
  { number: "7+", label: "Years training developers" },
  { number: "5,000+", label: "Learners enrolled" },
  { number: "2,000+", label: "Students placed" },
  { number: "100+", label: "Projects built" },
];

export default function StatsSection() {
  return (
    <section className="w-full border-y border-line bg-white">
      <Reveal className="container-x">
        <dl className="grid grid-cols-2 divide-line lg:grid-cols-4 lg:divide-x">
          {stats.map((item, index) => (
            <div
              key={item.label}
              className={`flex flex-col-reverse items-center px-4 py-9 text-center sm:py-11 ${index % 2 === 1 ? "border-l border-line lg:border-l-0" : ""} ${index < 2 ? "border-b border-line lg:border-b-0" : ""}`}
            >
              <dt className="mt-2 text-xs font-medium uppercase tracking-wider text-ink-3 sm:text-[13px]">{item.label}</dt>
              <dd className="text-4xl font-semibold tracking-tight text-ink sm:text-5xl">
                <CountUp value={item.number} />
              </dd>
            </div>
          ))}
        </dl>
      </Reveal>
    </section>
  );
}
