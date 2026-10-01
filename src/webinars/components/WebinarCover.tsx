// Topic illustrations drawn as SVG (no stock images, scale to any size).

import type { WebinarTopic } from "@/webinars/lib/types";

const BG: Record<WebinarTopic, string> = {
  flutter: "#EAF1FD",
  "ai-ml": "#EEEFFF",
  backend: "#F1F2F4",
  career: "#E9F8F1",
};

export default function WebinarCover({ topic, className }: { topic: WebinarTopic; className?: string }) {
  return (
    <svg viewBox="0 0 400 225" className={className} role="img" aria-label={`${topic} webinar illustration`} preserveAspectRatio="xMidYMid slice">
      <rect width="400" height="225" fill={BG[topic]} />
      {topic === "flutter" && <Flutter />}
      {topic === "ai-ml" && <AI />}
      {topic === "backend" && <Backend />}
      {topic === "career" && <Career />}
      {/* presenter tile — every webinar is live */}
      <g transform="translate(18 162)">
        <rect width="92" height="56" rx="8" fill="#111827" />
        <circle cx="46" cy="24" r="10" fill="#9CA3AF" />
        <path d="M26 50c3-11 11-16 20-16s17 5 20 16" fill="#9CA3AF" />
        <rect x="6" y="6" width="26" height="11" rx="3" fill="#DC2626" />
        <text x="19" y="14.5" textAnchor="middle" fontSize="7" fontWeight="700" fill="#fff" fontFamily="Arial, sans-serif">LIVE</text>
      </g>
    </svg>
  );
}

function Flutter() {
  return (
    <g>
      <path d="M250 -10 L400 -10 L400 90 Z" fill="#D5E3FB" />
      {/* phone */}
      <g transform="translate(236 26)">
        <rect width="110" height="190" rx="18" fill="#111827" />
        <rect x="7" y="9" width="96" height="172" rx="12" fill="#fff" />
        <rect x="18" y="22" width="52" height="8" rx="4" fill="#1055C9" />
        {[44, 74, 104].map((y) => (
          <g key={y}>
            <rect x="18" y={y} width="74" height="22" rx="6" fill="#EAF1FD" />
            <circle cx="30" cy={y + 11} r="5" fill="#1055C9" />
            <rect x="40" y={y + 8} width="40" height="6" rx="3" fill="#93B4EC" />
          </g>
        ))}
        <circle cx="84" cy="160" r="12" fill="#1055C9" />
        <path d="M84 154v12M78 160h12" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" />
      </g>
      {/* widget tree */}
      <g stroke="#1055C9" strokeWidth="2" fill="none">
        <path d="M150 50v24M150 74h-40v20M150 74h40v20M110 118v18M190 118v18" />
      </g>
      {[
        [124, 32, "App"],
        [84, 94, "Row"],
        [164, 94, "List"],
        [84, 136, "Text"],
        [164, 136, "Card"],
      ].map(([x, y, label]) => (
        <g key={label as string}>
          <rect x={x as number} y={y as number} width="52" height="22" rx="6" fill="#fff" stroke="#1055C9" strokeWidth="1.5" />
          <text x={(x as number) + 26} y={(y as number) + 15} textAnchor="middle" fontSize="10" fontFamily="ui-monospace, monospace" fill="#111827">
            {label}
          </text>
        </g>
      ))}
    </g>
  );
}

function AI() {
  const layers = [
    [60, 95, 130],
    [40, 80, 120, 160],
    [70, 120],
  ];
  const xs = [150, 210, 270];
  return (
    <g>
      <g stroke="#A5B4FC" strokeWidth="1.2">
        {layers.slice(0, -1).flatMap((ys, i) =>
          ys.flatMap((y1) => layers[i + 1].map((y2) => <line key={`${i}-${y1}-${y2}`} x1={xs[i]} y1={y1} x2={xs[i + 1]} y2={y2} />)),
        )}
      </g>
      {layers.flatMap((ys, i) => ys.map((y) => <circle key={`${i}-${y}`} cx={xs[i]} cy={y} r="9" fill={i === 2 ? "#101AC9" : "#fff"} stroke="#101AC9" strokeWidth="2" />))}
      {/* chat bubbles */}
      <g transform="translate(300 40)">
        <rect width="84" height="34" rx="10" fill="#fff" stroke="#C7D2FE" />
        <rect x="10" y="10" width="50" height="5" rx="2.5" fill="#A5B4FC" />
        <rect x="10" y="20" width="34" height="5" rx="2.5" fill="#C7D2FE" />
        <rect x="-6" y="46" width="84" height="44" rx="10" fill="#101AC9" />
        <rect x="4" y="57" width="60" height="5" rx="2.5" fill="#fff" opacity=".9" />
        <rect x="4" y="67" width="44" height="5" rx="2.5" fill="#fff" opacity=".7" />
        <rect x="4" y="77" width="52" height="5" rx="2.5" fill="#fff" opacity=".5" />
      </g>
      <text x="36" y="60" fontSize="28" fontWeight="700" fill="#101AC9" fontFamily="ui-monospace, monospace">{"{ }"}</text>
      <text x="40" y="92" fontSize="11" fill="#4B5563" fontFamily="ui-monospace, monospace">prompt()</text>
    </g>
  );
}

function Backend() {
  return (
    <g>
      {[30, 80, 130].map((y, i) => (
        <g key={y} transform={`translate(240 ${y})`}>
          <rect width="130" height="40" rx="8" fill="#111827" />
          <circle cx="18" cy="20" r="4" fill={i === 1 ? "#10B981" : "#6B7280"} />
          <rect x="32" y="16" width="60" height="8" rx="4" fill="#374151" />
          <rect x="100" y="14" width="18" height="12" rx="3" fill="#374151" />
        </g>
      ))}
      <g transform="translate(130 50)">
        <rect width="92" height="112" rx="10" fill="#fff" stroke="#D1D5DB" />
        <text x="12" y="24" fontSize="10" fontFamily="ui-monospace, monospace" fill="#10B981">POST</text>
        <text x="46" y="24" fontSize="10" fontFamily="ui-monospace, monospace" fill="#111827">/predict</text>
        {[40, 54, 68, 82].map((y, i) => (
          <rect key={y} x="12" y={y} width={[62, 48, 56, 36][i]} height="6" rx="3" fill={i === 0 ? "#1055C9" : "#E5E7EB"} />
        ))}
        <text x="12" y="104" fontSize="10" fontFamily="ui-monospace, monospace" fill="#6B7280">200 OK</text>
      </g>
      <path d="M222 106h18" stroke="#1055C9" strokeWidth="2" markerEnd="url(#arr)" />
      <defs>
        <marker id="arr" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="6" markerHeight="6" orient="auto">
          <path d="M0 0L10 5L0 10z" fill="#1055C9" />
        </marker>
      </defs>
    </g>
  );
}

function Career() {
  return (
    <g>
      {/* steps */}
      {[0, 1, 2, 3].map((i) => (
        <rect key={i} x={170 + i * 50} y={170 - i * 34} width="50" height={34 + i * 34} fill={i === 3 ? "#10B981" : "#A7E3C8"} />
      ))}
      <path d="M345 34v34" stroke="#111827" strokeWidth="2.5" />
      <path d="M345 34h26l-6 8 6 8h-26z" fill="#111827" />
      {/* resume */}
      <g transform="translate(40 26)">
        <rect width="110" height="120" rx="8" fill="#fff" stroke="#D1D5DB" />
        <circle cx="26" cy="28" r="12" fill="#D1FAE5" />
        <rect x="46" y="20" width="48" height="7" rx="3.5" fill="#111827" />
        <rect x="46" y="32" width="34" height="5" rx="2.5" fill="#9CA3AF" />
        {[56, 68, 80, 92, 104].map((y, i) => (
          <rect key={y} x="14" y={y} width={[80, 66, 74, 58, 70][i]} height="5" rx="2.5" fill="#E5E7EB" />
        ))}
        <path d="M86 88l8 8 16-18" stroke="#10B981" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
}
