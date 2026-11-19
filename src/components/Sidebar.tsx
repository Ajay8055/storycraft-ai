import {
  FileText,
  History,
  LayoutDashboard,
  PlusSquare,
  X,
} from 'lucide-react';
import type { NavView } from '../types/storycraft.ts';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  historyCount: number;
  mobileOpen: boolean;
  onCloseMobile: () => void;
  onOpenSetupGuide: () => void;
}

export function Sidebar({
  activeView,
  onSelectView,
  historyCount,
  mobileOpen,
  onCloseMobile,
  onOpenSetupGuide,
}: SidebarProps) {
  const navItems: Array<{
    id: NavView;
    label: string;
    icon: typeof LayoutDashboard;
    count?: number;
  }> = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'generate', label: 'New Generation', icon: PlusSquare },
    { id: 'history', label: 'History', icon: History, count: historyCount },
  ];

  const handleNavigate = (view: NavView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full w-64 flex-col border-r border-slate-200 bg-white">
      <div className="flex h-16 items-center justify-between border-b border-slate-200 px-5">
        <button
          type="button"
          onClick={() => handleNavigate('dashboard')}
          className="flex items-center gap-2.5 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 rounded-md"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white font-display font-bold text-sm">
            SC
          </span>
          <span className="font-display text-base font-semibold tracking-tight text-slate-900 whitespace-nowrap shrink-0">
            StoryCraft AI
          </span>
        </button>
        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 lg:hidden"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <nav aria-label="Primary navigation" className="flex-1 space-y-1 px-3 py-4">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleNavigate(item.id)}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-sm font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 ${
                isActive
                  ? 'bg-violet-50 text-violet-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon
                  className={`h-4 w-4 ${isActive ? 'text-violet-600' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
                <span>{item.label}</span>
              </span>
              {typeof item.count === 'number' && (
                <span
                  className={`font-mono text-xs tabular-nums ${
                    isActive ? 'text-violet-700' : 'text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div className="border-t border-slate-200 p-4 space-y-3">
        <div className="space-y-1 text-xs text-slate-500">
          <p className="font-medium text-slate-700">Local Workspace Storage</p>
          <p className="leading-relaxed">
            Specs are saved directly in your browser without requiring sign-in.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            onOpenSetupGuide();
            onCloseMobile();
          }}
          className="flex w-full items-center gap-2 rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 transition-colors hover:border-violet-200 hover:bg-violet-50/50 hover:text-violet-700 whitespace-nowrap focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <FileText className="h-3.5 w-3.5 text-violet-600 shrink-0" aria-hidden="true" />
          <span>Setup &amp; Deployment Guide</span>
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:block lg:shrink-0">{sidebarContent}</aside>

      {/* Mobile slide-over drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-slate-900/30 transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 flex h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
}
