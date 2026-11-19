import { Play, RotateCcw, Sparkles } from 'lucide-react';
import { SAMPLE_FEATURES, type SampleFeaturePreset } from '../data/sampleFeatures.ts';
import type { FeatureInput } from '../types/storycraft.ts';

interface FeatureInputFormProps {
  input: FeatureInput;
  onChange: (next: FeatureInput) => void;
  onSubmit: () => void;
  onReset: () => void;
  onLoadSample: (preset: SampleFeaturePreset) => void;
  isGenerating: boolean;
  validationError: string | null;
}

export function FeatureInputForm({
  input,
  onChange,
  onSubmit,
  onReset,
  onLoadSample,
  isGenerating,
  validationError,
}: FeatureInputFormProps) {
  const handleFieldChange = (field: keyof FeatureInput, value: string) => {
    onChange({ ...input, [field]: value });
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit();
  };

  return (
    <form
      onSubmit={handleFormSubmit}
      className="rounded-xl border border-slate-200 bg-white p-6 sm:p-7 space-y-6"
      noValidate
    >
      <div className="flex flex-col gap-3 border-b border-slate-100 pb-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-display text-lg font-semibold text-slate-900">
            Feature Specification Brief
          </h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Provide what is known today. Missing rules or policies will be flagged rather than
            invented.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {SAMPLE_FEATURES.map((preset, index) => (
            <button
              key={preset.id}
              type="button"
              disabled={isGenerating}
              onClick={() => onLoadSample(preset)}
              className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50/70 px-3 py-1.5 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100/80 disabled:opacity-50 whitespace-nowrap"
            >
              <Play className="h-3 w-3" aria-hidden="true" />
              <span>{index === 0 ? 'Sample Demo 1' : 'Sample Demo 2'}</span>
            </button>
          ))}
          <button
            type="button"
            disabled={isGenerating}
            onClick={onReset}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50 whitespace-nowrap"
          >
            <RotateCcw className="h-3 w-3" aria-hidden="true" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {validationError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
        >
          {validationError}
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* 1. Feature name (required) */}
        <div className="space-y-1.5">
          <label htmlFor="feature-name" className="block text-sm font-medium text-slate-800">
            Feature name <span className="text-violet-600">*</span>
          </label>
          <input
            id="feature-name"
            type="text"
            required
            disabled={isGenerating}
            value={input.featureName}
            onChange={(e) => handleFieldChange('featureName', e.target.value)}
            placeholder="e.g. Workspace Member Invites & Role Permissions"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-slate-50"
          />
        </div>

        {/* 4. User type or persona (optional) */}
        <div className="space-y-1.5">
          <label htmlFor="user-persona" className="block text-sm font-medium text-slate-800">
            User type or persona <span className="text-xs font-normal text-slate-400">Optional</span>
          </label>
          <input
            id="user-persona"
            type="text"
            disabled={isGenerating}
            value={input.userPersona}
            onChange={(e) => handleFieldChange('userPersona', e.target.value)}
            placeholder="e.g. Workspace Admin, Finance Reviewer, End Customer"
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-slate-50"
          />
        </div>
      </div>

      {/* 2. Feature description (required, multiline) */}
      <div className="space-y-1.5">
        <label htmlFor="feature-description" className="block text-sm font-medium text-slate-800">
          Feature description <span className="text-violet-600">*</span>
        </label>
        <textarea
          id="feature-description"
          rows={4}
          required
          disabled={isGenerating}
          value={input.featureDescription}
          onChange={(e) => handleFieldChange('featureDescription', e.target.value)}
          placeholder="Describe what the feature should do, the core user workflow, and key states..."
          className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-slate-50"
        />
      </div>

      <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
        {/* 3. Business context (optional, multiline) */}
        <div className="space-y-1.5">
          <label htmlFor="business-context" className="block text-sm font-medium text-slate-800">
            Business context <span className="text-xs font-normal text-slate-400">Optional</span>
          </label>
          <textarea
            id="business-context"
            rows={3}
            disabled={isGenerating}
            value={input.businessContext}
            onChange={(e) => handleFieldChange('businessContext', e.target.value)}
            placeholder="Why are we building this now? Target metrics, customer pain, or tier goals..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-slate-50"
          />
        </div>

        {/* 5. Constraints and business rules (optional) */}
        <div className="space-y-1.5">
          <label htmlFor="constraints" className="block text-sm font-medium text-slate-800">
            Constraints and business rules{' '}
            <span className="text-xs font-normal text-slate-400">Optional</span>
          </label>
          <textarea
            id="constraints"
            rows={3}
            disabled={isGenerating}
            value={input.constraints}
            onChange={(e) => handleFieldChange('constraints', e.target.value)}
            placeholder="Known permissions, rate limits, compliance rules, or technical boundaries..."
            className="w-full rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm leading-relaxed text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 disabled:bg-slate-50"
          />
        </div>
      </div>

      {/* 6. Generate Documentation button */}
      <div className="flex flex-col gap-3 border-t border-slate-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-xs text-slate-500">
          Generates Sections A–F: User Stories, Acceptance Criteria, Flows, Edge Cases, QA Tests &amp;
          Gaps.
        </p>
        <button
          type="submit"
          disabled={isGenerating}
          className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-violet-700 disabled:cursor-not-allowed disabled:bg-violet-400 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          <Sparkles className="h-4 w-4" aria-hidden="true" />
          <span>{isGenerating ? 'Generating Documentation...' : 'Generate Documentation'}</span>
        </button>
      </div>
    </form>
  );
}
