import React from 'react';
import { BattleFormat } from '../types/pokemon';
import { Shield, Sparkles, FolderDown, Image as ImageIcon, Sun, Moon, Table, Plus } from 'lucide-react';

interface HeaderProps {
  battleFormat: BattleFormat;
  onFormatChange: (format: BattleFormat) => void;
  onOpenTypeChart: () => void;
  onOpenSavedSquads: () => void;
  onOpenExport: () => void;
  onAddNewPokemon: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  isOffline: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  battleFormat,
  onFormatChange,
  onOpenTypeChart,
  onOpenSavedSquads,
  onOpenExport,
  onAddNewPokemon,
  isDark,
  onToggleTheme,
  isOffline,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Zone 1: Wordmark Brand */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 via-rose-500 to-indigo-600 flex items-center justify-center shadow-sm text-white font-bold text-lg">
            ⚡
          </div>
          <div className="flex flex-col">
            <span className="font-display font-bold text-lg tracking-tight text-slate-900 dark:text-white leading-none">
              CHAMPIONS BUILDER
            </span>
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              <span>Competitive Lineup</span>
              <span aria-hidden="true">·</span>
              <span>PokéAPI Live</span>
              {isOffline && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="text-amber-500 font-medium">Offline Mode</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Center Zone: Battle Format Toggle */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-lg">
          <button
            type="button"
            onClick={() => onFormatChange('single')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              battleFormat === 'single'
                ? 'bg-white dark:bg-slate-800 text-rose-600 dark:text-rose-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Singles (3v3)
          </button>
          <button
            type="button"
            onClick={() => onFormatChange('doubles')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
              battleFormat === 'doubles'
                ? 'bg-white dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
            }`}
          >
            Doubles (VGC 4v4)
          </button>
        </div>

        {/* Zone 3: Navigation Tools & Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Type Chart Tool */}
          <button
            type="button"
            onClick={onOpenTypeChart}
            title="Open Type Matchup Chart"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <Table className="w-3.5 h-3.5 text-blue-500" />
            <span className="hidden md:inline">Type Chart</span>
          </button>

          {/* Saved Squads Drawer */}
          <button
            type="button"
            onClick={onOpenSavedSquads}
            title="Saved Squads Library"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <FolderDown className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden md:inline">Saved Squads</span>
          </button>

          {/* Export Card */}
          <button
            type="button"
            onClick={onOpenExport}
            title="Export Lineup as High-Res Image"
            className="flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
          >
            <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />
            <span className="hidden md:inline">Export Card</span>
          </button>

          {/* Dark Mode Toggle */}
          <button
            type="button"
            onClick={onToggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            className="p-1.5 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
          </button>

          {/* Primary CTA: Add Pokemon */}
          <button
            type="button"
            onClick={onAddNewPokemon}
            className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 rounded-lg shadow-sm transition-all whitespace-nowrap active:scale-95"
          >
            <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            <span>Add Pokémon</span>
          </button>
        </div>
      </div>
    </header>
  );
};
