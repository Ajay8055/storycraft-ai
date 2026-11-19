import { useState } from 'react';
import { Copy, Eye, PlusSquare, Search, Trash2 } from 'lucide-react';
import type { GenerationRecord } from '../types/storycraft.ts';
import { formatAllMarkdown } from '../utils/formatters.ts';

interface HistoryViewProps {
  records: GenerationRecord[];
  onViewRecord: (record: GenerationRecord) => void;
  onDeleteRecord: (id: string) => void;
  onCopyText: (text: string, label: string) => void;
  onStartNew: () => void;
}

export function HistoryView({
  records,
  onViewRecord,
  onDeleteRecord,
  onCopyText,
  onStartNew,
}: HistoryViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const filteredRecords = records.filter((rec) => {
    if (!normalizedQuery) return true;
    return (
      rec.input.featureName.toLowerCase().includes(normalizedQuery) ||
      rec.input.featureDescription.toLowerCase().includes(normalizedQuery) ||
      rec.input.userPersona.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-6 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="font-display text-xl font-semibold text-slate-900">
            Generation History
          </h1>
          <p className="mt-1 text-xs text-slate-500">
            All specifications are stored locally in your browser. Open any entry to view, edit, or
            copy sections.
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative">
            <Search
              className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
              aria-hidden="true"
            />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search specs or persona..."
              aria-label="Search saved specifications"
              className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20 sm:w-64"
            />
          </div>
          <button
            type="button"
            onClick={onStartNew}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 whitespace-nowrap shrink-0"
          >
            <PlusSquare className="h-4 w-4" aria-hidden="true" />
            <span>New Spec</span>
          </button>
        </div>
      </div>

      {records.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-14 text-center">
          <p className="font-display text-base font-semibold text-slate-900">
            Your specification history is empty
          </p>
          <p className="mt-1.5 text-sm text-slate-500 max-w-md mx-auto">
            Generate your first feature specification from the New Generation workspace. Every
            successful run is automatically saved here.
          </p>
          <button
            type="button"
            onClick={onStartNew}
            className="mt-5 inline-flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            <PlusSquare className="h-4 w-4" aria-hidden="true" />
            <span>Go to New Generation</span>
          </button>
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-12 text-center">
          <p className="text-sm font-medium text-slate-900">
            No specifications match &ldquo;{searchQuery}&rdquo;
          </p>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="mt-3 text-xs font-medium text-violet-700 hover:text-violet-800"
          >
            Clear search filter
          </button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50/70 text-xs font-medium text-slate-500">
                <tr>
                  <th scope="col" className="px-5 py-3.5">
                    Feature
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Persona
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    Stories
                  </th>
                  <th scope="col" className="px-4 py-3.5 text-right">
                    QA Tests
                  </th>
                  <th scope="col" className="px-4 py-3.5">
                    Updated
                  </th>
                  <th scope="col" className="px-5 py-3.5 text-right">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {filteredRecords.map((rec) => {
                  const isConfirming = confirmDeleteId === rec.id;
                  return (
                    <tr key={rec.id} className="hover:bg-violet-50/30 transition-colors">
                      <td className="px-5 py-4 align-top max-w-sm">
                        <button
                          type="button"
                          onClick={() => onViewRecord(rec)}
                          className="text-left font-semibold text-slate-900 hover:text-violet-700 block"
                        >
                          {rec.input.featureName}
                        </button>
                        <p className="mt-0.5 text-xs text-slate-500 line-clamp-2">
                          {rec.input.featureDescription}
                        </p>
                      </td>
                      <td className="px-4 py-4 align-top text-xs text-slate-600 max-w-[180px]">
                        {rec.input.userPersona || <span className="text-slate-400">Unspecified</span>}
                      </td>
                      <td className="px-4 py-4 align-top text-right font-mono text-xs text-slate-700 tabular-nums">
                        {rec.output.userStories.length}
                      </td>
                      <td className="px-4 py-4 align-top text-right font-mono text-xs text-slate-700 tabular-nums">
                        {rec.output.qaTestCases.length}
                      </td>
                      <td className="px-4 py-4 align-top text-xs text-slate-500 whitespace-nowrap tabular-nums">
                        {new Date(rec.updatedAt).toLocaleDateString(undefined, {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </td>
                      <td className="px-5 py-4 align-top text-right whitespace-nowrap">
                        <div className="inline-flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => onViewRecord(rec)}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:border-violet-300 hover:bg-violet-50 hover:text-violet-700"
                          >
                            <Eye className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            onClick={() =>
                              onCopyText(
                                formatAllMarkdown(rec.input, rec.output),
                                `${rec.input.featureName} specification`
                              )
                            }
                            aria-label={`Copy all documentation for ${rec.input.featureName}`}
                            className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                          >
                            <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                            <span>Copy</span>
                          </button>
                          {isConfirming ? (
                            <div className="inline-flex items-center gap-1">
                              <button
                                type="button"
                                onClick={() => {
                                  onDeleteRecord(rec.id);
                                  setConfirmDeleteId(null);
                                }}
                                className="rounded-md bg-red-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-red-700"
                              >
                                Confirm
                              </button>
                              <button
                                type="button"
                                onClick={() => setConfirmDeleteId(null)}
                                className="rounded-md border border-slate-200 px-2 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                              >
                                Cancel
                              </button>
                            </div>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(rec.id)}
                              aria-label={`Delete ${rec.input.featureName}`}
                              className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:border-red-200 hover:bg-red-50 hover:text-red-700"
                            >
                              <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                              <span>Delete</span>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
