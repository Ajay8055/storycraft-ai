import { useEffect, useRef, useState } from 'react';
import { AlertCircle, CheckCircle2, Menu, PlusSquare, RefreshCw } from 'lucide-react';
import { DashboardView } from './components/DashboardView.tsx';
import { FeatureInputForm } from './components/FeatureInputForm.tsx';
import { HistoryView } from './components/HistoryView.tsx';
import { OutputWorkspace } from './components/OutputWorkspace.tsx';
import { SetupGuideModal } from './components/SetupGuideModal.tsx';
import { Sidebar } from './components/Sidebar.tsx';
import type { SampleFeaturePreset } from './data/sampleFeatures.ts';
import type {
  FeatureInput,
  GenerationRecord,
  NavView,
  StoryCraftOutput,
} from './types/storycraft.ts';
import { createRecordId, loadHistory, persistHistory } from './utils/storage.ts';

const EMPTY_INPUT: FeatureInput = {
  featureName: '',
  featureDescription: '',
  businessContext: '',
  userPersona: '',
  constraints: '',
};

export default function App() {
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [setupModalOpen, setSetupModalOpen] = useState(false);

  const [history, setHistory] = useState<GenerationRecord[]>(() => loadHistory());
  const [formInput, setFormInput] = useState<FeatureInput>(EMPTY_INPUT);
  const [activeRecordId, setActiveRecordId] = useState<string | null>(null);

  const [isGenerating, setIsGenerating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const toastTimerRef = useRef<number | null>(null);

  useEffect(() => {
    persistHistory(history);
  }, [history]);

  const showToast = (message: string) => {
    if (toastTimerRef.current !== null) {
      window.clearTimeout(toastTimerRef.current);
    }
    setToastMessage(message);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMessage(null);
      toastTimerRef.current = null;
    }, 2600);
  };

  const handleCopyText = async (text: string, label: string) => {
    try {
      if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
        await navigator.clipboard.writeText(text);
        showToast(`Copied ${label} to clipboard`);
        return;
      }
      throw new Error('Clipboard API unavailable');
    } catch {
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.setAttribute('readonly', '');
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();
        const copied = document.execCommand('copy');
        document.body.removeChild(textarea);
        if (copied) {
          showToast(`Copied ${label} to clipboard`);
          return;
        }
      } catch {
        // Fallback below
      }
      showToast('Clipboard permission denied in this browser');
    }
  };

  const activeRecord = activeRecordId
    ? history.find((item) => item.id === activeRecordId) ?? null
    : null;

  const handleStartNew = () => {
    setFormInput(EMPTY_INPUT);
    setActiveRecordId(null);
    setValidationError(null);
    setApiError(null);
    setActiveView('generate');
  };

  const handleLoadSample = (preset: SampleFeaturePreset) => {
    setFormInput({ ...preset.input });
    setActiveRecordId(null);
    setValidationError(null);
    setApiError(null);
    setActiveView('generate');
    showToast(`Loaded sample: ${preset.label}`);
  };

  const handleOpenRecord = (record: GenerationRecord) => {
    setFormInput({ ...record.input });
    setActiveRecordId(record.id);
    setValidationError(null);
    setApiError(null);
    setActiveView('generate');
  };

  const handleDeleteRecord = (id: string) => {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    if (activeRecordId === id) {
      setActiveRecordId(null);
    }
    showToast('Specification deleted from local history');
  };

  const handleUpdateOutput = (nextOutput: StoryCraftOutput) => {
    if (!activeRecordId) return;
    const now = new Date().toISOString();
    setHistory((prev) =>
      prev.map((item) =>
        item.id === activeRecordId ? { ...item, updatedAt: now, output: nextOutput } : item
      )
    );
  };

  const handleGenerate = async () => {
    const trimmedName = formInput.featureName.trim();
    const trimmedDescription = formInput.featureDescription.trim();

    if (!trimmedName) {
      setValidationError('Please enter a Feature name before generating documentation.');
      return;
    }
    if (!trimmedDescription || trimmedDescription.length < 10) {
      setValidationError(
        'Please enter a Feature description (at least 10 characters) so the assistant has enough context.'
      );
      return;
    }

    setValidationError(null);
    setApiError(null);
    setIsGenerating(true);

    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          featureName: trimmedName,
          featureDescription: trimmedDescription,
          businessContext: formInput.businessContext.trim(),
          userPersona: formInput.userPersona.trim(),
          constraints: formInput.constraints.trim(),
        }),
      });

      const payload = (await response.json().catch(() => ({}))) as {
        output?: StoryCraftOutput;
        error?: string;
      };

      if (!response.ok || !payload.output) {
        throw new Error(
          payload.error ||
            `Request failed with status ${response.status}. Please check server configuration.`
        );
      }

      const now = new Date().toISOString();
      const newRecord: GenerationRecord = {
        id: createRecordId(),
        createdAt: now,
        updatedAt: now,
        input: {
          featureName: trimmedName,
          featureDescription: trimmedDescription,
          businessContext: formInput.businessContext.trim(),
          userPersona: formInput.userPersona.trim(),
          constraints: formInput.constraints.trim(),
        },
        output: payload.output,
      };

      setHistory((prev) => [newRecord, ...prev]);
      setActiveRecordId(newRecord.id);
      showToast('Specification generated and saved locally');
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : 'Unable to reach the StoryCraft AI generation service.';
      setApiError(message);
    } finally {
      setIsGenerating(false);
    }
  };

  const viewTitleMap: Record<NavView, string> = {
    dashboard: 'Dashboard',
    generate: activeRecord ? `Specification / ${activeRecord.input.featureName}` : 'New Generation',
    history: 'History',
  };

  return (
    <div className="flex min-h-screen bg-slate-50/40 text-slate-900">
      <Sidebar
        activeView={activeView}
        onSelectView={(view) => {
          setActiveView(view);
          setApiError(null);
          setValidationError(null);
        }}
        historyCount={history.length}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
        onOpenSetupGuide={() => setSetupModalOpen(true)}
      />

      <div className="flex min-w-0 flex-1 flex-col">
        {/* Top Workspace Header Bar */}
        <header className="sticky top-0 z-30 flex h-16 items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 backdrop-blur sm:px-8">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 lg:hidden shrink-0"
            >
              <Menu className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="text-slate-400 whitespace-nowrap shrink-0">StoryCraft AI</span>
              <span className="text-slate-300" aria-hidden="true">
                /
              </span>
              <span className="font-medium text-slate-900 truncate">
                {viewTitleMap[activeView]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={handleStartNew}
              className="inline-flex items-center gap-2 rounded-lg bg-violet-600 px-3.5 py-2 text-xs font-medium text-white transition-colors hover:bg-violet-700 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
            >
              <PlusSquare className="h-3.5 w-3.5" aria-hidden="true" />
              <span>New Generation</span>
            </button>
          </div>
        </header>

        {/* Main Viewport */}
        <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-8 sm:py-8">
          {activeView === 'dashboard' && (
            <DashboardView
              records={history}
              onStartNew={handleStartNew}
              onTrySample={handleLoadSample}
              onOpenRecord={handleOpenRecord}
              onOpenHistory={() => setActiveView('history')}
            />
          )}

          {activeView === 'generate' && (
            <div className="space-y-6">
              <FeatureInputForm
                input={formInput}
                onChange={setFormInput}
                onSubmit={handleGenerate}
                onReset={() => {
                  setFormInput(EMPTY_INPUT);
                  setActiveRecordId(null);
                  setValidationError(null);
                  setApiError(null);
                }}
                onLoadSample={handleLoadSample}
                isGenerating={isGenerating}
                validationError={validationError}
              />

              {/* Loading Skeleton State */}
              {isGenerating && (
                <section
                  aria-live="polite"
                  className="rounded-xl border border-violet-200 bg-white p-6 space-y-5"
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="space-y-1">
                      <p className="font-display text-sm font-semibold text-violet-800">
                        Generating structured product &amp; QA documentation...
                      </p>
                      <p className="text-xs text-slate-500">
                        Drafting user stories, Given/When/Then criteria, edge cases, QA test
                        cases, and requirement gap checks.
                      </p>
                    </div>
                    <div
                      className="h-5 w-5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600 shrink-0"
                      aria-hidden="true"
                    />
                  </div>
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                    <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
                    <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
                    <div className="h-20 animate-pulse rounded-lg bg-slate-100" />
                  </div>
                </section>
              )}

              {/* API Error Banner */}
              {!isGenerating && apiError && (
                <section
                  role="alert"
                  className="rounded-xl border border-red-200 bg-red-50/90 p-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" aria-hidden="true" />
                    <div className="space-y-1">
                      <h3 className="font-display text-sm font-semibold text-red-900">
                        Generation Failed
                      </h3>
                      <p className="text-xs leading-relaxed text-red-800">{apiError}</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleGenerate}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-red-300 bg-white px-3.5 py-2 text-xs font-medium text-red-700 hover:bg-red-50 whitespace-nowrap shrink-0 self-start sm:self-auto"
                  >
                    <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
                    <span>Retry Generation</span>
                  </button>
                </section>
              )}

              {/* Output Workspace: Shown ONLY after successful response or when inspecting a saved record */}
              {!isGenerating && !apiError && activeRecord && (
                <OutputWorkspace
                  key={activeRecord.id}
                  input={activeRecord.input}
                  output={activeRecord.output}
                  updatedAt={activeRecord.updatedAt}
                  onUpdateOutput={handleUpdateOutput}
                  onCopyText={handleCopyText}
                />
              )}
            </div>
          )}

          {activeView === 'history' && (
            <HistoryView
              records={history}
              onViewRecord={handleOpenRecord}
              onDeleteRecord={handleDeleteRecord}
              onCopyText={handleCopyText}
              onStartNew={handleStartNew}
            />
          )}
        </main>
      </div>

      <SetupGuideModal open={setupModalOpen} onClose={() => setSetupModalOpen(false)} />

      {/* Subtle Toast Confirmation */}
      {toastMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed bottom-5 right-5 z-50 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-xs font-medium text-slate-800 shadow-md"
        >
          <CheckCircle2 className="h-4 w-4 text-violet-600 shrink-0" aria-hidden="true" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
