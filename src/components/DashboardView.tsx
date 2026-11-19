import { ArrowRight, BookOpen, CheckCircle2, Play, PlusSquare, Terminal } from 'lucide-react';
import { SAMPLE_FEATURES, type SampleFeaturePreset } from '../data/sampleFeatures.ts';
import type { GenerationRecord } from '../types/storycraft.ts';

interface DashboardViewProps {
  records: GenerationRecord[];
  onStartNew: () => void;
  onTrySample: (preset: SampleFeaturePreset) => void;
  onOpenRecord: (record: GenerationRecord) => void;
  onOpenHistory: () => void;
}

export function DashboardView({
  records,
  onStartNew,
  onTrySample,
  onOpenRecord,
  onOpenHistory,
}: DashboardViewProps) {
  const totalSpecs = records.length;
  const totalStories = records.reduce((sum, r) => sum + r.output.userStories.length, 0);
  const totalTestCases = records.reduce((sum, r) => sum + r.output.qaTestCases.length, 0);
  const totalOpenQuestions = records.reduce(
    (sum, r) => sum + r.output.gapAnalysis.clarifyingQuestions.length,
    0
  );

  const recentRecords = records.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Hero / Workspace Intro */}
      <section className="rounded-xl border border-slate-200 bg-white p-6 sm:p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="max-w-2xl space-y-2">
            <p className="text-xs font-medium text-violet-700">
              Product Management Specification Workspace
            </p>
            <h1 className="font-display text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl text-balance">
              Turn raw feature briefs into structured stories, flows, and QA specs.
            </h1>
            <p className="text-sm leading-relaxed text-slate-600 sm:text-base">
              StoryCraft AI generates engineering-ready user stories, Given/When/Then acceptance
              criteria, edge cases, QA test cases, and requirement gap analysis while separating
              confirmed facts from assumptions.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={onStartNew}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              <PlusSquare className="h-4 w-4" aria-hidden="true" />
              <span>New Generation</span>
            </button>
            <button
              type="button"
              onClick={() => onTrySample(SAMPLE_FEATURES[0])}
              className="inline-flex items-center gap-2 rounded-lg border border-violet-200 bg-violet-50/70 px-4 py-2.5 text-sm font-medium text-violet-700 transition-colors hover:bg-violet-100/80 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <Play className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Load Sample Demo</span>
            </button>
          </div>
        </div>

        {/* 4-column metric strip separated by hairline dividers */}
        <div className="mt-8 grid grid-cols-2 gap-6 border-t border-slate-200 pt-6 sm:grid-cols-4">
          <div>
            <p className="text-xs font-medium text-slate-500">Saved Specs</p>
            <p className="mt-1 font-display text-2xl font-semibold text-slate-900 tabular-nums">
              {totalSpecs}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">User Stories</p>
            <p className="mt-1 font-display text-2xl font-semibold text-slate-900 tabular-nums">
              {totalStories}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">QA Test Cases</p>
            <p className="mt-1 font-display text-2xl font-semibold text-slate-900 tabular-nums">
              {totalTestCases}
            </p>
          </div>
          <div>
            <p className="text-xs font-medium text-slate-500">Clarifying Questions</p>
            <p className="mt-1 font-display text-2xl font-semibold text-slate-900 tabular-nums">
              {totalOpenQuestions}
            </p>
          </div>
        </div>
      </section>

      {/* Two-column section: Sample Presets & Recent Generations */}
      <div className="grid grid-cols-1 gap-6 xl:grid-cols-12">
        {/* Sample Demo Presets */}
        <section className="xl:col-span-5 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Sample Demo Features
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Pre-filled PM briefs to test generation immediately.
              </p>
            </div>
          </div>

          <div className="mt-4 divide-y divide-slate-100">
            {SAMPLE_FEATURES.map((preset) => (
              <div key={preset.id} className="py-4 first:pt-1 last:pb-1">
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-sm font-semibold text-slate-900">{preset.label}</h3>
                    <p className="text-xs leading-relaxed text-slate-600">{preset.summary}</p>
                    <p className="text-xs text-slate-400">
                      Persona: {preset.input.userPersona}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onTrySample(preset)}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
                  >
                    <span>Test Brief</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Recent Generations */}
        <section className="xl:col-span-7 rounded-xl border border-slate-200 bg-white p-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <h2 className="font-display text-base font-semibold text-slate-900">
                Recent Specifications
              </h2>
              <p className="mt-0.5 text-xs text-slate-500">
                Saved locally in browser storage for quick review and editing.
              </p>
            </div>
            {records.length > 0 && (
              <button
                type="button"
                onClick={onOpenHistory}
                className="text-xs font-medium text-violet-700 hover:text-violet-800 whitespace-nowrap shrink-0"
              >
                View all history
              </button>
            )}
          </div>

          {recentRecords.length === 0 ? (
            <div className="py-10 text-center">
              <p className="text-sm font-medium text-slate-900">No saved specifications yet</p>
              <p className="mt-1 text-xs text-slate-500">
                Create a new feature specification or test a sample demo brief to populate your
                workspace.
              </p>
              <div className="mt-4 flex justify-center gap-3">
                <button
                  type="button"
                  onClick={onStartNew}
                  className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-medium text-white hover:bg-violet-700 whitespace-nowrap"
                >
                  Create First Spec
                </button>
              </div>
            </div>
          ) : (
            <div className="mt-2 divide-y divide-slate-100">
              {recentRecords.map((rec) => (
                <div
                  key={rec.id}
                  className="flex flex-col gap-2 py-3.5 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="min-w-0 space-y-0.5">
                    <button
                      type="button"
                      onClick={() => onOpenRecord(rec)}
                      className="text-left text-sm font-semibold text-slate-900 hover:text-violet-700 truncate block max-w-full"
                    >
                      {rec.input.featureName}
                    </button>
                    <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 tabular-nums">
                      <span>{rec.output.userStories.length} stories</span>
                      <span aria-hidden="true">·</span>
                      <span>{rec.output.qaTestCases.length} QA tests</span>
                      <span aria-hidden="true">·</span>
                      <span>{rec.output.gapAnalysis.clarifyingQuestions.length} questions</span>
                      <span aria-hidden="true">·</span>
                      <span>
                        {new Date(rec.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onOpenRecord(rec)}
                    className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700 whitespace-nowrap shrink-0 self-start sm:self-auto"
                  >
                    <span>Open Spec</span>
                    <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {/* Setup & Deployment Quick Reference */}
      <section className="rounded-xl border border-slate-200 bg-slate-50/60 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-slate-900">
              <Terminal className="h-4 w-4 text-violet-600" aria-hidden="true" />
              <h2 className="font-display text-base font-semibold">
                Architecture, Setup &amp; Deployment
              </h2>
            </div>
            <p className="text-xs leading-relaxed text-slate-600 max-w-2xl">
              Full-stack Express + React workspace with server-side Gemini API integration and zero
              paid database dependencies.
            </p>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-slate-700 shrink-0">
            <BookOpen className="h-3.5 w-3.5 text-violet-600" aria-hidden="true" />
            <span>Self-contained local storage v1</span>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-3">
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-900">1. Configure Secrets</p>
            <p className="text-xs leading-relaxed text-slate-600">
              Set <code className="font-mono text-violet-700">GEMINI_API_KEY</code> in AI Studio{' '}
              <strong>Settings &gt; Secrets</strong> (or in a local{' '}
              <code className="font-mono">.env</code> file). Requests run strictly server-side via{' '}
              <code className="font-mono">POST /api/generate</code>.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-900">2. Run Locally</p>
            <p className="text-xs leading-relaxed text-slate-600">
              Install packages with <code className="font-mono">npm install</code> and start the
              Express + Vite dev server on port 3000 with{' '}
              <code className="font-mono">npm run dev</code>.
            </p>
          </div>
          <div className="rounded-lg border border-slate-200 bg-white p-4 space-y-2">
            <p className="text-xs font-semibold text-slate-900">3. Build &amp; Deploy</p>
            <p className="text-xs leading-relaxed text-slate-600">
              Compile the client bundle with <code className="font-mono">npm run build</code> and
              launch production serving with{' '}
              <code className="font-mono">NODE_ENV=production npm start</code>.
            </p>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            Server-side Gemini API key protection
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            Structured JSON Schema validation
          </span>
          <span className="inline-flex items-center gap-1.5">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" aria-hidden="true" />
            No external paid services required
          </span>
        </div>
      </section>
    </div>
  );
}
