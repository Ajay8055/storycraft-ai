import { X } from 'lucide-react';

interface SetupGuideModalProps {
  open: boolean;
  onClose: () => void;
}

export function SetupGuideModal({ open, onClose }: SetupGuideModalProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="setup-guide-title"
    >
      <div className="w-full max-w-2xl rounded-xl border border-slate-200 bg-white shadow-lg overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <h2 id="setup-guide-title" className="font-display text-base font-semibold text-slate-900">
            Setup &amp; Deployment Instructions
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close setup guide"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="max-h-[75vh] overflow-y-auto p-6 space-y-5 text-sm text-slate-700">
          <div className="space-y-1.5">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              1. Prerequisites &amp; Environment Secrets
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              StoryCraft AI runs Gemini API requests strictly on the Express server via{' '}
              <code className="font-mono text-violet-700">POST /api/generate</code>. Never expose
              API keys in frontend code.
            </p>
            <ul className="list-disc list-inside space-y-1 text-xs text-slate-600">
              <li>
                In AI Studio: Add <code className="font-mono">GEMINI_API_KEY</code> under{' '}
                <strong>Settings &gt; Secrets</strong>.
              </li>
              <li>
                Locally: Copy <code className="font-mono">.env.example</code> to{' '}
                <code className="font-mono">.env</code> and set{' '}
                <code className="font-mono">GEMINI_API_KEY=&quot;your-key&quot;</code>.
              </li>
            </ul>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              2. Local Development
            </h3>
            <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800">
{`npm install
npm run dev`}
            </pre>
            <p className="text-xs text-slate-500">
              Starts the Express backend and Vite dev middleware together on{' '}
              <code className="font-mono">http://localhost:3000</code>.
            </p>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              3. Production Build &amp; Deployment
            </h3>
            <pre className="overflow-x-auto rounded-lg border border-slate-200 bg-slate-50 p-3 font-mono text-xs text-slate-800">
{`npm run build
NODE_ENV=production npm start`}
            </pre>
            <p className="text-xs leading-relaxed text-slate-600">
              <code className="font-mono">npm run build</code> compiles the React frontend into{' '}
              <code className="font-mono">dist/</code>. Running{' '}
              <code className="font-mono">npm start</code> executes{' '}
              <code className="font-mono">node server.ts</code>, serving both{' '}
              <code className="font-mono">/api/*</code> routes and static frontend assets on port{' '}
              <code className="font-mono">3000</code> (or <code className="font-mono">PORT</code>).
            </p>
          </div>

          <div className="space-y-1.5 border-t border-slate-100 pt-4">
            <h3 className="font-display text-sm font-semibold text-slate-900">
              4. Local History Persistence
            </h3>
            <p className="text-xs leading-relaxed text-slate-600">
              This first version persists generated specifications and inline edits directly in
              browser <code className="font-mono">localStorage</code>—requiring zero login or paid
              external databases.
            </p>
          </div>
        </div>

        <div className="flex justify-end border-t border-slate-200 bg-slate-50 px-6 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg bg-violet-600 px-4 py-2 text-xs font-medium text-white hover:bg-violet-700"
          >
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
}
