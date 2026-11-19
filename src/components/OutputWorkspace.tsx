import { useState } from 'react';
import {
  AlertTriangle,
  Check,
  Copy,
  Download,
  Edit3,
  Plus,
  Trash2,
} from 'lucide-react';
import type {
  AcceptanceCriterion,
  EdgeCase,
  EdgeCaseCategory,
  FeatureInput,
  QaTestCase,
  SectionKey,
  StoryCraftOutput,
  UserFlow,
  UserStory,
} from '../types/storycraft.ts';
import { formatAllMarkdown, formatSectionMarkdown } from '../utils/formatters.ts';

interface OutputWorkspaceProps {
  input: FeatureInput;
  output: StoryCraftOutput;
  updatedAt: string;
  onUpdateOutput: (next: StoryCraftOutput) => void;
  onCopyText: (text: string, label: string) => void;
}

const SECTION_TABS: Array<{ key: SectionKey; shortLabel: string; title: string }> = [
  { key: 'userStories', shortLabel: 'A. User Stories', title: 'User Stories' },
  {
    key: 'acceptanceCriteria',
    shortLabel: 'B. Acceptance Criteria',
    title: 'Acceptance Criteria',
  },
  { key: 'flows', shortLabel: 'C. Flows', title: 'Happy Paths & Alternative Flows' },
  { key: 'edgeCases', shortLabel: 'D. Edge Cases', title: 'Edge Cases' },
  { key: 'qaTestCases', shortLabel: 'E. QA Test Cases', title: 'QA Test Cases' },
  {
    key: 'gapAnalysis',
    shortLabel: 'F. Gaps & Questions',
    title: 'Requirement Gaps, Assumptions & Clarifying Questions',
  },
];

const EDGE_CASE_CATEGORIES: EdgeCaseCategory[] = [
  'Invalid Input',
  'Empty States',
  'Permissions',
  'Network Failures',
  'Boundary Conditions',
  'Duplicate Actions',
  'System Failures',
  'Other',
];

export function OutputWorkspace({
  input,
  output,
  updatedAt,
  onUpdateOutput,
  onCopyText,
}: OutputWorkspaceProps) {
  const [activeTab, setActiveTab] = useState<SectionKey>('userStories');
  const [isEditingSection, setIsEditingSection] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const triggerCopy = (text: string, key: string, label: string) => {
    onCopyText(text, label);
    setCopiedKey(key);
    window.setTimeout(() => {
      setCopiedKey((current) => (current === key ? null : current));
    }, 1800);
  };

  const handleDownloadMarkdown = () => {
    const markdown = formatAllMarkdown(input, output);
    const slug =
      input.featureName
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '') || 'specification';
    const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${slug}-spec.md`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const getTabCount = (key: SectionKey): number => {
    switch (key) {
      case 'userStories':
        return output.userStories.length;
      case 'acceptanceCriteria':
        return output.acceptanceCriteria.length;
      case 'flows':
        return output.flows.length;
      case 'edgeCases':
        return output.edgeCases.length;
      case 'qaTestCases':
        return output.qaTestCases.length;
      case 'gapAnalysis':
        return (
          output.gapAnalysis.missingInformationGaps.length +
          output.gapAnalysis.clarifyingQuestions.length
        );
    }
  };

  // --- Update Helpers ---
  const updateStory = (index: number, patch: Partial<UserStory>) => {
    const next = [...output.userStories];
    next[index] = { ...next[index], ...patch };
    onUpdateOutput({ ...output, userStories: next });
  };

  const addStory = () => {
    const nextId = `US-${String(output.userStories.length + 1).padStart(2, '0')}`;
    onUpdateOutput({
      ...output,
      userStories: [
        ...output.userStories,
        {
          id: nextId,
          title: 'New User Story',
          asA: '',
          iWant: '',
          soThat: '',
          priority: 'Should Have',
          notes: '',
        },
      ],
    });
    setIsEditingSection(true);
  };

  const removeStory = (index: number) => {
    onUpdateOutput({
      ...output,
      userStories: output.userStories.filter((_, i) => i !== index),
    });
  };

  const updateAcceptanceCriterion = (index: number, patch: Partial<AcceptanceCriterion>) => {
    const next = [...output.acceptanceCriteria];
    next[index] = { ...next[index], ...patch };
    onUpdateOutput({ ...output, acceptanceCriteria: next });
  };

  const addAcceptanceCriterion = () => {
    const nextId = `AC-${String(output.acceptanceCriteria.length + 1).padStart(2, '0')}`;
    onUpdateOutput({
      ...output,
      acceptanceCriteria: [
        ...output.acceptanceCriteria,
        {
          id: nextId,
          storyRef: output.userStories[0]?.id || 'US-01',
          title: 'New Acceptance Criterion',
          given: '',
          when: '',
          then: '',
        },
      ],
    });
    setIsEditingSection(true);
  };

  const removeAcceptanceCriterion = (index: number) => {
    onUpdateOutput({
      ...output,
      acceptanceCriteria: output.acceptanceCriteria.filter((_, i) => i !== index),
    });
  };

  const updateFlow = (index: number, patch: Partial<UserFlow>) => {
    const next = [...output.flows];
    next[index] = { ...next[index], ...patch };
    onUpdateOutput({ ...output, flows: next });
  };

  const addFlow = () => {
    const nextId = `FLOW-${String(output.flows.length + 1).padStart(2, '0')}`;
    onUpdateOutput({
      ...output,
      flows: [
        ...output.flows,
        {
          id: nextId,
          title: 'New User Flow',
          flowType: 'Alternative Flow',
          actor: input.userPersona || 'End User',
          trigger: '',
          steps: ['Step 1'],
          outcome: '',
        },
      ],
    });
    setIsEditingSection(true);
  };

  const removeFlow = (index: number) => {
    onUpdateOutput({
      ...output,
      flows: output.flows.filter((_, i) => i !== index),
    });
  };

  const updateEdgeCase = (index: number, patch: Partial<EdgeCase>) => {
    const next = [...output.edgeCases];
    next[index] = { ...next[index], ...patch };
    onUpdateOutput({ ...output, edgeCases: next });
  };

  const addEdgeCase = () => {
    const nextId = `EC-${String(output.edgeCases.length + 1).padStart(2, '0')}`;
    onUpdateOutput({
      ...output,
      edgeCases: [
        ...output.edgeCases,
        {
          id: nextId,
          category: 'Invalid Input',
          scenario: '',
          expectedHandling: '',
          severity: 'Medium',
        },
      ],
    });
    setIsEditingSection(true);
  };

  const removeEdgeCase = (index: number) => {
    onUpdateOutput({
      ...output,
      edgeCases: output.edgeCases.filter((_, i) => i !== index),
    });
  };

  const updateTestCase = (index: number, patch: Partial<QaTestCase>) => {
    const next = [...output.qaTestCases];
    next[index] = { ...next[index], ...patch };
    onUpdateOutput({ ...output, qaTestCases: next });
  };

  const addTestCase = () => {
    const nextId = `TC-${String(output.qaTestCases.length + 1).padStart(2, '0')}`;
    onUpdateOutput({
      ...output,
      qaTestCases: [
        ...output.qaTestCases,
        {
          testId: nextId,
          scenario: '',
          preconditions: '',
          steps: ['Step 1'],
          expectedResult: '',
          priority: 'Medium',
        },
      ],
    });
    setIsEditingSection(true);
  };

  const removeTestCase = (index: number) => {
    onUpdateOutput({
      ...output,
      qaTestCases: output.qaTestCases.filter((_, i) => i !== index),
    });
  };

  const updateGapList = (
    field:
      | 'suppliedFacts'
      | 'assumptionsAndRecommendations'
      | 'missingInformationGaps'
      | 'clarifyingQuestions',
    textValue: string
  ) => {
    const lines = textValue.split('\n');
    onUpdateOutput({
      ...output,
      gapAnalysis: {
        ...output.gapAnalysis,
        [field]: lines,
      },
    });
  };

  const activeTabMeta = SECTION_TABS.find((t) => t.key === activeTab)!;

  return (
    <section
      aria-label="Generated specification documentation"
      className="rounded-xl border border-slate-200 bg-white overflow-hidden"
    >
      {/* Document Summary Header */}
      <div className="border-b border-slate-200 bg-white p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-1.5 min-w-0">
            <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500">
              <span className="font-medium text-violet-700">Generated Documentation</span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                Last saved{' '}
                {new Date(updatedAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
              {input.userPersona && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="truncate max-w-xs">{input.userPersona}</span>
                </>
              )}
            </div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              {input.featureName}
            </h2>
            <p className="inline-flex items-center gap-1.5 text-xs text-amber-700">
              <AlertTriangle className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>{output.gapAnalysis.validationDisclaimer}</span>
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            <button
              type="button"
              onClick={() => setIsEditingSection((prev) => !prev)}
              className={`inline-flex items-center gap-1.5 rounded-lg border px-3.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 ${
                isEditingSection
                  ? 'border-violet-600 bg-violet-50 text-violet-700'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <Edit3 className="h-3.5 w-3.5" aria-hidden="true" />
              <span>{isEditingSection ? 'Done Editing' : 'Edit Results'}</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadMarkdown}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-medium text-slate-700 transition-colors hover:bg-slate-50 whitespace-nowrap shrink-0"
            >
              <Download className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Export .md</span>
            </button>

            <button
              type="button"
              onClick={() =>
                triggerCopy(
                  formatAllMarkdown(input, output),
                  'all',
                  'entire specification'
                )
              }
              className="inline-flex items-center gap-1.5 rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-700 whitespace-nowrap shrink-0"
            >
              {copiedKey === 'all' ? (
                <Check className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <Copy className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              <span>{copiedKey === 'all' ? 'Copied All' : 'Copy All'}</span>
            </button>
          </div>
        </div>

        {/* Section Tabs */}
        <div
          role="tablist"
          aria-label="Documentation sections"
          className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-slate-200 pb-px"
        >
          {SECTION_TABS.map((tab) => {
            const active = activeTab === tab.key;
            const count = getTabCount(tab.key);
            return (
              <button
                key={tab.key}
                role="tab"
                type="button"
                aria-selected={active}
                onClick={() => setActiveTab(tab.key)}
                className={`inline-flex items-center gap-2 border-b-2 px-3.5 py-2.5 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                  active
                    ? 'border-violet-600 text-violet-700 bg-violet-50/50'
                    : 'border-transparent text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                <span>{tab.shortLabel}</span>
                <span
                  className={`font-mono text-[11px] tabular-nums ${
                    active ? 'text-violet-600' : 'text-slate-400'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Active Section Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-6 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-display text-sm font-semibold text-slate-900">
            {activeTabMeta.title}
          </h3>
          {isEditingSection && (
            <span className="text-xs text-violet-700">
              · Editing mode active (changes auto-save locally)
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {activeTab !== 'gapAnalysis' && (
            <button
              type="button"
              onClick={() => {
                if (activeTab === 'userStories') addStory();
                else if (activeTab === 'acceptanceCriteria') addAcceptanceCriterion();
                else if (activeTab === 'flows') addFlow();
                else if (activeTab === 'edgeCases') addEdgeCase();
                else if (activeTab === 'qaTestCases') addTestCase();
              }}
              className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-violet-300 hover:text-violet-700 whitespace-nowrap"
            >
              <Plus className="h-3.5 w-3.5" aria-hidden="true" />
              <span>Add Item</span>
            </button>
          )}
          <button
            type="button"
            onClick={() =>
              triggerCopy(
                formatSectionMarkdown(activeTab, output),
                activeTab,
                activeTabMeta.title
              )
            }
            className="inline-flex items-center gap-1.5 rounded-md border border-violet-200 bg-white px-3 py-1.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-50 whitespace-nowrap"
          >
            {copiedKey === activeTab ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <Copy className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            <span>{copiedKey === activeTab ? 'Copied Section' : 'Copy Section'}</span>
          </button>
        </div>
      </div>

      {/* Section Content Body */}
      <div className="p-6" role="tabpanel">
        {/* SECTION A: USER STORIES */}
        {activeTab === 'userStories' && (
          <div className="divide-y divide-slate-200">
            {output.userStories.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No user stories yet. Click &ldquo;Add Item&rdquo; to create one.
              </p>
            ) : (
              output.userStories.map((story, idx) => (
                <article key={`${story.id}-${idx}`} className="py-5 first:pt-1 last:pb-1 space-y-3">
                  {isEditingSection ? (
                    <div className="space-y-3 rounded-lg border border-violet-200/80 bg-violet-50/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="flex flex-wrap items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={story.id}
                            onChange={(e) => updateStory(idx, { id: e.target.value })}
                            aria-label="Story ID"
                            className="w-20 rounded border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800"
                          />
                          <input
                            type="text"
                            value={story.title}
                            onChange={(e) => updateStory(idx, { title: e.target.value })}
                            aria-label="Story title"
                            className="flex-1 min-w-[200px] rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-900"
                          />
                          <select
                            value={story.priority}
                            onChange={(e) =>
                              updateStory(idx, {
                                priority: e.target.value as UserStory['priority'],
                              })
                            }
                            aria-label="Story priority"
                            className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700"
                          >
                            <option value="Must Have">Must Have</option>
                            <option value="Should Have">Should Have</option>
                            <option value="Could Have">Could Have</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeStory(idx)}
                          aria-label={`Remove ${story.id}`}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <label className="space-y-1 text-xs font-medium text-slate-600">
                          <span>As a</span>
                          <textarea
                            rows={2}
                            value={story.asA}
                            onChange={(e) => updateStory(idx, { asA: e.target.value })}
                            className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                          />
                        </label>
                        <label className="space-y-1 text-xs font-medium text-slate-600">
                          <span>I want</span>
                          <textarea
                            rows={2}
                            value={story.iWant}
                            onChange={(e) => updateStory(idx, { iWant: e.target.value })}
                            className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                          />
                        </label>
                        <label className="space-y-1 text-xs font-medium text-slate-600">
                          <span>So that</span>
                          <textarea
                            rows={2}
                            value={story.soThat}
                            onChange={(e) => updateStory(idx, { soThat: e.target.value })}
                            className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                          />
                        </label>
                      </div>
                      <label className="block space-y-1 text-xs font-medium text-slate-600">
                        <span>Notes</span>
                        <input
                          type="text"
                          value={story.notes}
                          onChange={(e) => updateStory(idx, { notes: e.target.value })}
                          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-normal text-slate-800"
                        />
                      </label>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="font-display text-base font-semibold text-slate-900">
                          <span className="font-mono text-xs font-medium text-violet-700 mr-2">
                            {story.id}
                          </span>
                          {story.title}
                        </h4>
                        <span className="text-xs font-medium text-slate-500">
                          Priority: <span className="text-slate-800">{story.priority}</span>
                        </span>
                      </div>
                      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="text-xs font-medium text-slate-500">As a</dt>
                          <dd className="mt-0.5 text-slate-800 leading-relaxed">{story.asA}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-500">I want</dt>
                          <dd className="mt-0.5 text-slate-800 leading-relaxed">{story.iWant}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-500">So that</dt>
                          <dd className="mt-0.5 text-slate-800 leading-relaxed">{story.soThat}</dd>
                        </div>
                      </dl>
                      {story.notes.trim() && (
                        <p className="text-xs text-slate-500 leading-relaxed">
                          <span className="font-medium text-slate-700">Note:</span> {story.notes}
                        </p>
                      )}
                    </>
                  )}
                </article>
              ))
            )}
          </div>
        )}

        {/* SECTION B: ACCEPTANCE CRITERIA */}
        {activeTab === 'acceptanceCriteria' && (
          <div className="divide-y divide-slate-200">
            {output.acceptanceCriteria.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No acceptance criteria yet. Click &ldquo;Add Item&rdquo; to create one.
              </p>
            ) : (
              output.acceptanceCriteria.map((ac, idx) => (
                <article key={`${ac.id}-${idx}`} className="py-5 first:pt-1 last:pb-1 space-y-3">
                  {isEditingSection ? (
                    <div className="space-y-3 rounded-lg border border-violet-200/80 bg-violet-50/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={ac.id}
                            onChange={(e) =>
                              updateAcceptanceCriterion(idx, { id: e.target.value })
                            }
                            aria-label="Criterion ID"
                            className="w-20 rounded border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800"
                          />
                          <input
                            type="text"
                            value={ac.storyRef}
                            onChange={(e) =>
                              updateAcceptanceCriterion(idx, { storyRef: e.target.value })
                            }
                            aria-label="Linked story ID"
                            placeholder="US-01"
                            className="w-24 rounded border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs text-slate-800"
                          />
                          <input
                            type="text"
                            value={ac.title}
                            onChange={(e) =>
                              updateAcceptanceCriterion(idx, { title: e.target.value })
                            }
                            aria-label="Criterion title"
                            className="flex-1 min-w-[200px] rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium text-slate-900"
                          />
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAcceptanceCriterion(idx)}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
                        <label className="space-y-1 text-xs font-medium text-slate-600">
                          <span>Given</span>
                          <textarea
                            rows={2}
                            value={ac.given}
                            onChange={(e) =>
                              updateAcceptanceCriterion(idx, { given: e.target.value })
                            }
                            className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                          />
                        </label>
                        <label className="space-y-1 text-xs font-medium text-slate-600">
                          <span>When</span>
                          <textarea
                            rows={2}
                            value={ac.when}
                            onChange={(e) =>
                              updateAcceptanceCriterion(idx, { when: e.target.value })
                            }
                            className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                          />
                        </label>
                        <label className="space-y-1 text-xs font-medium text-slate-600">
                          <span>Then</span>
                          <textarea
                            rows={2}
                            value={ac.then}
                            onChange={(e) =>
                              updateAcceptanceCriterion(idx, { then: e.target.value })
                            }
                            className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                          />
                        </label>
                      </div>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="font-display text-sm font-semibold text-slate-900">
                          <span className="font-mono text-xs font-medium text-violet-700 mr-2">
                            {ac.id}
                          </span>
                          {ac.title}
                        </h4>
                        <span className="font-mono text-xs text-slate-500">
                          Story {ac.storyRef}
                        </span>
                      </div>
                      <dl className="grid grid-cols-1 gap-3 text-sm sm:grid-cols-3">
                        <div>
                          <dt className="text-xs font-medium text-slate-500">Given</dt>
                          <dd className="mt-0.5 text-slate-800 leading-relaxed">{ac.given}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-500">When</dt>
                          <dd className="mt-0.5 text-slate-800 leading-relaxed">{ac.when}</dd>
                        </div>
                        <div>
                          <dt className="text-xs font-medium text-slate-500">Then</dt>
                          <dd className="mt-0.5 text-slate-800 leading-relaxed">{ac.then}</dd>
                        </div>
                      </dl>
                    </>
                  )}
                </article>
              ))
            )}
          </div>
        )}

        {/* SECTION C: HAPPY PATHS & ALTERNATIVE FLOWS */}
        {activeTab === 'flows' && (
          <div className="divide-y divide-slate-200">
            {output.flows.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No flows defined yet. Click &ldquo;Add Item&rdquo; to create one.
              </p>
            ) : (
              output.flows.map((flow, idx) => (
                <article key={`${flow.id}-${idx}`} className="py-5 first:pt-1 last:pb-1 space-y-3">
                  {isEditingSection ? (
                    <div className="space-y-3 rounded-lg border border-violet-200/80 bg-violet-50/20 p-4">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex flex-wrap items-center gap-2 flex-1">
                          <input
                            type="text"
                            value={flow.id}
                            onChange={(e) => updateFlow(idx, { id: e.target.value })}
                            className="w-24 rounded border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs"
                          />
                          <input
                            type="text"
                            value={flow.title}
                            onChange={(e) => updateFlow(idx, { title: e.target.value })}
                            className="flex-1 min-w-[200px] rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium"
                          />
                          <select
                            value={flow.flowType}
                            onChange={(e) =>
                              updateFlow(idx, {
                                flowType: e.target.value as UserFlow['flowType'],
                              })
                            }
                            className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                          >
                            <option value="Happy Path">Happy Path</option>
                            <option value="Alternative Flow">Alternative Flow</option>
                          </select>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeFlow(idx)}
                          className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                        >
                          <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                          <span>Remove</span>
                        </button>
                      </div>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                        <label className="space-y-1 text-xs font-medium text-slate-600">
                          <span>Actor</span>
                          <input
                            type="text"
                            value={flow.actor}
                            onChange={(e) => updateFlow(idx, { actor: e.target.value })}
                            className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                          />
                        </label>
                        <label className="space-y-1 text-xs font-medium text-slate-600">
                          <span>Trigger</span>
                          <input
                            type="text"
                            value={flow.trigger}
                            onChange={(e) => updateFlow(idx, { trigger: e.target.value })}
                            className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                          />
                        </label>
                      </div>
                      <label className="block space-y-1 text-xs font-medium text-slate-600">
                        <span>Steps (one step per line)</span>
                        <textarea
                          rows={4}
                          value={flow.steps.join('\n')}
                          onChange={(e) =>
                            updateFlow(idx, { steps: e.target.value.split('\n') })
                          }
                          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                        />
                      </label>
                      <label className="block space-y-1 text-xs font-medium text-slate-600">
                        <span>Outcome</span>
                        <input
                          type="text"
                          value={flow.outcome}
                          onChange={(e) => updateFlow(idx, { outcome: e.target.value })}
                          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                        />
                      </label>
                    </div>
                  ) : (
                    <>
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h4 className="font-display text-base font-semibold text-slate-900">
                          <span className="font-mono text-xs font-medium text-violet-700 mr-2">
                            {flow.id}
                          </span>
                          {flow.title}
                        </h4>
                        <span
                          className={`text-xs font-medium ${
                            flow.flowType === 'Happy Path'
                              ? 'text-emerald-700'
                              : 'text-amber-700'
                          }`}
                        >
                          {flow.flowType}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
                        <span>
                          Actor: <strong className="font-medium text-slate-700">{flow.actor}</strong>
                        </span>
                        <span aria-hidden="true">·</span>
                        <span>
                          Trigger:{' '}
                          <strong className="font-medium text-slate-700">{flow.trigger}</strong>
                        </span>
                      </div>
                      <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-800 pl-1">
                        {flow.steps
                          .filter((s) => s.trim().length > 0)
                          .map((step, stepIdx) => (
                            <li key={stepIdx} className="leading-relaxed">
                              {step}
                            </li>
                          ))}
                      </ol>
                      <p className="text-xs text-slate-600">
                        <span className="font-medium text-slate-800">Outcome:</span> {flow.outcome}
                      </p>
                    </>
                  )}
                </article>
              ))
            )}
          </div>
        )}

        {/* SECTION D: EDGE CASES */}
        {activeTab === 'edgeCases' && (
          <div className="overflow-x-auto">
            {output.edgeCases.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No edge cases defined yet. Click &ldquo;Add Item&rdquo; to create one.
              </p>
            ) : isEditingSection ? (
              <div className="space-y-4">
                {output.edgeCases.map((ec, idx) => (
                  <div
                    key={`${ec.id}-${idx}`}
                    className="space-y-3 rounded-lg border border-violet-200/80 bg-violet-50/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2">
                        <input
                          type="text"
                          value={ec.id}
                          onChange={(e) => updateEdgeCase(idx, { id: e.target.value })}
                          className="w-20 rounded border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs"
                        />
                        <select
                          value={ec.category}
                          onChange={(e) =>
                            updateEdgeCase(idx, {
                              category: e.target.value as EdgeCaseCategory,
                            })
                          }
                          className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                        >
                          {EDGE_CASE_CATEGORIES.map((cat) => (
                            <option key={cat} value={cat}>
                              {cat}
                            </option>
                          ))}
                        </select>
                        <select
                          value={ec.severity}
                          onChange={(e) =>
                            updateEdgeCase(idx, {
                              severity: e.target.value as EdgeCase['severity'],
                            })
                          }
                          className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                        >
                          <option value="High">High Severity</option>
                          <option value="Medium">Medium Severity</option>
                          <option value="Low">Low Severity</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeEdgeCase(idx)}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Remove</span>
                      </button>
                    </div>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-xs font-medium text-slate-600">
                        <span>Scenario</span>
                        <textarea
                          rows={2}
                          value={ec.scenario}
                          onChange={(e) => updateEdgeCase(idx, { scenario: e.target.value })}
                          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                        />
                      </label>
                      <label className="space-y-1 text-xs font-medium text-slate-600">
                        <span>Expected Handling</span>
                        <textarea
                          rows={2}
                          value={ec.expectedHandling}
                          onChange={(e) =>
                            updateEdgeCase(idx, { expectedHandling: e.target.value })
                          }
                          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="text-xs font-medium text-slate-500">
                  <tr>
                    <th scope="col" className="py-3 pr-4">
                      ID
                    </th>
                    <th scope="col" className="py-3 pr-4">
                      Category
                    </th>
                    <th scope="col" className="py-3 pr-4">
                      Scenario
                    </th>
                    <th scope="col" className="py-3 pr-4">
                      Expected Handling
                    </th>
                    <th scope="col" className="py-3 text-right">
                      Severity
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {output.edgeCases.map((ec, idx) => (
                    <tr key={`${ec.id}-${idx}`}>
                      <td className="py-3.5 pr-4 align-top font-mono text-xs text-violet-700 whitespace-nowrap">
                        {ec.id}
                      </td>
                      <td className="py-3.5 pr-4 align-top text-xs font-medium text-slate-700 whitespace-nowrap">
                        {ec.category}
                      </td>
                      <td className="py-3.5 pr-4 align-top text-slate-800 leading-relaxed max-w-sm">
                        {ec.scenario}
                      </td>
                      <td className="py-3.5 pr-4 align-top text-slate-600 leading-relaxed max-w-md">
                        {ec.expectedHandling}
                      </td>
                      <td
                        className={`py-3.5 align-top text-right text-xs font-medium whitespace-nowrap ${
                          ec.severity === 'High'
                            ? 'text-red-700'
                            : ec.severity === 'Medium'
                              ? 'text-amber-700'
                              : 'text-slate-600'
                        }`}
                      >
                        {ec.severity}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SECTION E: QA TEST CASES */}
        {activeTab === 'qaTestCases' && (
          <div className="overflow-x-auto">
            {output.qaTestCases.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-500">
                No QA test cases yet. Click &ldquo;Add Item&rdquo; to create one.
              </p>
            ) : isEditingSection ? (
              <div className="space-y-4">
                {output.qaTestCases.map((tc, idx) => (
                  <div
                    key={`${tc.testId}-${idx}`}
                    className="space-y-3 rounded-lg border border-violet-200/80 bg-violet-50/20 p-4"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex flex-wrap items-center gap-2 flex-1">
                        <input
                          type="text"
                          value={tc.testId}
                          onChange={(e) => updateTestCase(idx, { testId: e.target.value })}
                          className="w-24 rounded border border-slate-200 bg-white px-2.5 py-1.5 font-mono text-xs"
                        />
                        <input
                          type="text"
                          value={tc.scenario}
                          onChange={(e) => updateTestCase(idx, { scenario: e.target.value })}
                          placeholder="Scenario"
                          className="flex-1 min-w-[200px] rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-medium"
                        />
                        <select
                          value={tc.priority}
                          onChange={(e) =>
                            updateTestCase(idx, {
                              priority: e.target.value as QaTestCase['priority'],
                            })
                          }
                          className="rounded border border-slate-200 bg-white px-2.5 py-1.5 text-xs"
                        >
                          <option value="High">High Priority</option>
                          <option value="Medium">Medium Priority</option>
                          <option value="Low">Low Priority</option>
                        </select>
                      </div>
                      <button
                        type="button"
                        onClick={() => removeTestCase(idx)}
                        className="inline-flex items-center gap-1 text-xs text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                        <span>Remove</span>
                      </button>
                    </div>
                    <label className="block space-y-1 text-xs font-medium text-slate-600">
                      <span>Preconditions</span>
                      <input
                        type="text"
                        value={tc.preconditions}
                        onChange={(e) => updateTestCase(idx, { preconditions: e.target.value })}
                        className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                      />
                    </label>
                    <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                      <label className="space-y-1 text-xs font-medium text-slate-600">
                        <span>Steps (one step per line)</span>
                        <textarea
                          rows={4}
                          value={tc.steps.join('\n')}
                          onChange={(e) =>
                            updateTestCase(idx, { steps: e.target.value.split('\n') })
                          }
                          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                        />
                      </label>
                      <label className="space-y-1 text-xs font-medium text-slate-600">
                        <span>Expected Result</span>
                        <textarea
                          rows={4}
                          value={tc.expectedResult}
                          onChange={(e) =>
                            updateTestCase(idx, { expectedResult: e.target.value })
                          }
                          className="w-full rounded border border-slate-200 bg-white px-2.5 py-1.5 text-sm font-normal text-slate-900"
                        />
                      </label>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
                <thead className="text-xs font-medium text-slate-500">
                  <tr>
                    <th scope="col" className="py-3 pr-4">
                      Test ID
                    </th>
                    <th scope="col" className="py-3 pr-4">
                      Scenario &amp; Preconditions
                    </th>
                    <th scope="col" className="py-3 pr-4">
                      Steps
                    </th>
                    <th scope="col" className="py-3 pr-4">
                      Expected Result
                    </th>
                    <th scope="col" className="py-3 text-right">
                      Priority
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {output.qaTestCases.map((tc, idx) => (
                    <tr key={`${tc.testId}-${idx}`}>
                      <td className="py-4 pr-4 align-top font-mono text-xs font-medium text-violet-700 whitespace-nowrap">
                        {tc.testId}
                      </td>
                      <td className="py-4 pr-4 align-top max-w-xs space-y-1">
                        <p className="font-medium text-slate-900 leading-snug">{tc.scenario}</p>
                        <p className="text-xs text-slate-500 leading-relaxed">
                          <span className="font-medium text-slate-600">Preconditions:</span>{' '}
                          {tc.preconditions}
                        </p>
                      </td>
                      <td className="py-4 pr-4 align-top max-w-xs">
                        <ol className="list-decimal list-inside space-y-1 text-xs text-slate-700">
                          {tc.steps
                            .filter((s) => s.trim().length > 0)
                            .map((step, sIdx) => (
                              <li key={sIdx} className="leading-relaxed">
                                {step}
                              </li>
                            ))}
                        </ol>
                      </td>
                      <td className="py-4 pr-4 align-top text-xs text-slate-700 leading-relaxed max-w-xs">
                        {tc.expectedResult}
                      </td>
                      <td
                        className={`py-4 align-top text-right text-xs font-medium whitespace-nowrap ${
                          tc.priority === 'High'
                            ? 'text-red-700'
                            : tc.priority === 'Medium'
                              ? 'text-amber-700'
                              : 'text-slate-600'
                        }`}
                      >
                        {tc.priority}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        )}

        {/* SECTION F: REQUIREMENT GAPS, ASSUMPTIONS & CLARIFYING QUESTIONS */}
        {activeTab === 'gapAnalysis' && (
          <div className="space-y-6">
            {isEditingSection ? (
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <label className="space-y-1.5 text-xs font-medium text-slate-700">
                  <span>Facts Supplied by User (one per line)</span>
                  <textarea
                    rows={5}
                    value={output.gapAnalysis.suppliedFacts.join('\n')}
                    onChange={(e) => updateGapList('suppliedFacts', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900"
                  />
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-700">
                  <span>Assumptions &amp; Recommendations (one per line)</span>
                  <textarea
                    rows={5}
                    value={output.gapAnalysis.assumptionsAndRecommendations.join('\n')}
                    onChange={(e) =>
                      updateGapList('assumptionsAndRecommendations', e.target.value)
                    }
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900"
                  />
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-700">
                  <span>Missing Information / Requirement Gaps (one per line)</span>
                  <textarea
                    rows={5}
                    value={output.gapAnalysis.missingInformationGaps.join('\n')}
                    onChange={(e) => updateGapList('missingInformationGaps', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900"
                  />
                </label>
                <label className="space-y-1.5 text-xs font-medium text-slate-700">
                  <span>Clarifying Questions (one per line)</span>
                  <textarea
                    rows={5}
                    value={output.gapAnalysis.clarifyingQuestions.join('\n')}
                    onChange={(e) => updateGapList('clarifyingQuestions', e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm font-normal text-slate-900"
                  />
                </label>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div className="space-y-2.5 border-b border-slate-100 pb-5 md:border-b-0 md:pb-0">
                  <h4 className="font-display text-sm font-semibold text-slate-900">
                    Facts Supplied by User
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700">
                    {output.gapAnalysis.suppliedFacts
                      .filter((item) => item.trim().length > 0)
                      .map((fact, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {fact}
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="space-y-2.5">
                  <h4 className="font-display text-sm font-semibold text-slate-900">
                    Assumptions &amp; Recommendations (Unconfirmed)
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700">
                    {output.gapAnalysis.assumptionsAndRecommendations
                      .filter((item) => item.trim().length > 0)
                      .map((item, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {item}
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="space-y-2.5 border-t border-slate-200 pt-5">
                  <h4 className="font-display text-sm font-semibold text-slate-900">
                    Missing Information &amp; Requirement Gaps
                  </h4>
                  <ul className="list-disc list-inside space-y-1.5 text-sm text-slate-700">
                    {output.gapAnalysis.missingInformationGaps
                      .filter((item) => item.trim().length > 0)
                      .map((gap, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {gap}
                        </li>
                      ))}
                  </ul>
                </div>

                <div className="space-y-2.5 border-t border-slate-200 pt-5">
                  <h4 className="font-display text-sm font-semibold text-slate-900">
                    Clarifying Questions for Stakeholders &amp; Engineering
                  </h4>
                  <ol className="list-decimal list-inside space-y-1.5 text-sm text-slate-700">
                    {output.gapAnalysis.clarifyingQuestions
                      .filter((item) => item.trim().length > 0)
                      .map((q, idx) => (
                        <li key={idx} className="leading-relaxed">
                          {q}
                        </li>
                      ))}
                  </ol>
                </div>
              </div>
            )}

            <div className="rounded-lg border border-amber-200 bg-amber-50/70 px-4 py-3 text-xs text-amber-900">
              <strong className="font-semibold">Engineering Validation Notice:</strong>{' '}
              {output.gapAnalysis.validationDisclaimer}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
