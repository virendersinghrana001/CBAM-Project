"use client";

import { useState } from "react";
import Link from "next/link";

type Opt = { label: string; score: number };
type Q = { id: string; q: string; options: Opt[]; advice: string };

const QUESTIONS: Q[] = [
  {
    id: "exports",
    q: "Do you export CBAM-covered goods (steel, aluminium, cement, fertilisers, hydrogen, electricity) to the EU?",
    options: [{ label: "Yes, regularly", score: 2 }, { label: "Occasionally / planning to", score: 1 }, { label: "Not sure", score: 0 }],
    advice: "Confirm which of your products fall under CBAM using the CN Code Checker — scope drives everything else.",
  },
  {
    id: "classified",
    q: "Have you classified your products to their CN codes?",
    options: [{ label: "Yes, all of them", score: 2 }, { label: "Some of them", score: 1 }, { label: "Not yet", score: 0 }],
    advice: "Map every SKU to an 8-digit CN code. Start with the CN Code Checker and build a master product list.",
  },
  {
    id: "emissions",
    q: "Do you measure the embedded emissions (Scope 1 & 2) of your products?",
    options: [{ label: "Yes, with verified data", score: 2 }, { label: "Rough estimates only", score: 1 }, { label: "No measurement yet", score: 0 }],
    advice: "Set up installation-level energy and process metering. Verified data is almost always lower than the EU default values.",
  },
  {
    id: "suppliers",
    q: "Can you collect emissions data from your suppliers / precursors?",
    options: [{ label: "Yes, a process exists", score: 2 }, { label: "Difficult / manual", score: 1 }, { label: "No process", score: 0 }],
    advice: "Build a supplier data-request template covering precursor emissions — these cascade into your finished goods.",
  },
  {
    id: "reporting",
    q: "Have you prepared an EU CBAM quarterly report?",
    options: [{ label: "Yes, submitted", score: 2 }, { label: "Started but stuck", score: 1 }, { label: "Not started", score: 0 }],
    advice: "Use the Report Builder to assemble a structured declaration from your product lines and export it for review.",
  },
];

export default function ReadinessQuiz() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [done, setDone] = useState(false);

  const total = QUESTIONS.length;
  const score = Object.values(answers).reduce((a, b) => a + b, 0);
  const pct = Math.round((score / (total * 2)) * 100);
  const tier = pct >= 75
    ? { label: "CBAM Ready", color: "#16a34a", note: "Strong foundations. Focus on optimising verified data to reduce certificate cost." }
    : pct >= 40
      ? { label: "Getting There", color: "#d97706", note: "The basics are in place, but gaps could expose you to higher default emission values." }
      : { label: "At Risk", color: "#dc2626", note: "Significant gaps remain. Build your CBAM process before the next quarterly deadline." };

  function answer(qid: string, s: number) {
    setAnswers((a) => ({ ...a, [qid]: s }));
    if (step < total - 1) setStep(step + 1);
    else setDone(true);
  }
  function restart() {
    setAnswers({});
    setStep(0);
    setDone(false);
  }

  if (done) {
    const gaps = QUESTIONS.filter((q) => (answers[q.id] ?? 0) < 2);
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center card-shadow">
          <div className="relative mx-auto h-36 w-36">
            <svg viewBox="0 0 100 100" className="h-full w-full -rotate-90">
              <circle cx="50" cy="50" r="44" fill="none" stroke="#e2e8f0" strokeWidth="8" />
              <circle cx="50" cy="50" r="44" fill="none" stroke={tier.color} strokeWidth="8" strokeLinecap="round" strokeDasharray={`${(pct / 100) * 276} 276`} />
            </svg>
            <div className="absolute inset-0 grid place-items-center">
              <div>
                <div className="data-num text-3xl font-extrabold text-slate-900">{pct}%</div>
                <div className="text-xs font-medium text-slate-500">ready</div>
              </div>
            </div>
          </div>
          <h3 className="mt-4 text-2xl font-extrabold" style={{ color: tier.color }}>{tier.label}</h3>
          <p className="mt-2 text-slate-600">{tier.note}</p>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-200 bg-white p-6">
          <h4 className="font-bold text-slate-900">Your prioritised action list</h4>
          {gaps.length === 0 ? (
            <p className="mt-2 text-slate-600">No major gaps — you&apos;re in great shape. Keep your data verified and reports filed on time.</p>
          ) : (
            <ol className="mt-4 space-y-3">
              {gaps.map((g, i) => (
                <li key={g.id} className="flex items-start gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-cyan-100 text-xs font-bold text-cyan-700">{i + 1}</span>
                  <span className="text-sm text-slate-700">{g.advice}</span>
                </li>
              ))}
            </ol>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/tools/cbam-calculator" className="rounded-full bg-cyan-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-cyan-700">Estimate your liability →</Link>
            <Link href="/tools/report-builder" className="rounded-full border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50">Build a report</Link>
            <button onClick={restart} className="rounded-full px-5 py-2.5 text-sm font-semibold text-slate-500 hover:text-slate-700">Retake</button>
          </div>
        </div>
      </div>
    );
  }

  const current = QUESTIONS[step];
  return (
    <div className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-8 card-shadow">
      <div className="mb-3 flex items-center justify-between text-sm">
        <span className="font-semibold text-cyan-600">Question {step + 1} of {total}</span>
        <span className="text-slate-400">{Math.round((step / total) * 100)}%</span>
      </div>
      <div className="mb-6 h-1.5 overflow-hidden rounded-full bg-slate-100">
        <div className="h-full brand-gradient transition-all" style={{ width: `${(step / total) * 100}%` }} />
      </div>
      <h3 className="text-xl font-bold text-slate-900">{current.q}</h3>
      <div className="mt-6 space-y-3">
        {current.options.map((o) => (
          <button key={o.label} onClick={() => answer(current.id, o.score)} className="flex w-full items-center justify-between rounded-xl border border-slate-200 px-5 py-4 text-left font-medium text-slate-700 transition-colors hover:border-cyan-500 hover:bg-cyan-50">
            {o.label}
            <span className="text-cyan-500">→</span>
          </button>
        ))}
      </div>
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="mt-6 text-sm font-medium text-slate-400 hover:text-slate-600">← Back</button>
      )}
    </div>
  );
}
