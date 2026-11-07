import React from 'react';
import { BattleFormat, RecommendedAdditionItem, TeamReport } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import {
  X,
  RefreshCw,
  Loader2,
  AlertOctagon,
  AlertTriangle,
  Info,
  ShieldAlert,
  CheckCircle2,
  PlusCircle,
  Skull
} from 'lucide-react';

interface TeamReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  report: TeamReport | null;
  isLoading: boolean;
  error: string | null;
  teamName: string;
  battleFormat: BattleFormat;
  onRefreshAnalysis: () => void;
  onAdoptRecommendation: (rec: RecommendedAdditionItem) => void;
}

export const TeamReportModal: React.FC<TeamReportModalProps> = ({
  isOpen,
  onClose,
  report,
  isLoading,
  error,
  teamName,
  battleFormat,
  onRefreshAnalysis,
  onAdoptRecommendation,
}) => {
  if (!isOpen) return null;

  const getSeverityBadge = (severity: string) => {
    switch (severity) {
      case 'critical':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <AlertOctagon className="w-3 h-3 text-rose-600 dark:text-rose-400 shrink-0" />
            Critical
          </span>
        );
      case 'warning':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-amber-100 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400 shrink-0" />
            Warning
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700">
            <Info className="w-3 h-3 text-slate-500 shrink-0" />
            Moderate
          </span>
        );
    }
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('S')) return 'from-amber-400 to-rose-500 text-white shadow-amber-500/20';
    if (grade.startsWith('A')) return 'from-emerald-500 to-teal-600 text-white shadow-emerald-500/20';
    if (grade.startsWith('B')) return 'from-blue-500 to-indigo-600 text-white shadow-blue-500/20';
    return 'from-slate-600 to-slate-800 text-white';
  };

  // Harmonize points if legacy format or modern format
  const auditPoints: import('../types/pokemon').AuditPoint[] = report?.auditPoints && report.auditPoints.length > 0
    ? report.auditPoints
    : (report?.defensiveWeaknesses || []).map(w => ({
        problem: w.description || `Weakness to ${w.type}-type attacks`,
        severity: w.severity,
        typeCategory: w.type,
        solutions: [
          `Add a defensive ${w.type} resistance or immunity anchor.`,
          `Equip type-resist berry or defensive focus item.`
        ],
        threatenedPokemon: w.affectedPokemon || [],
        suggestedAddition: undefined,
      }));

  // Consolidate threatened Pokémon list
  const threatenedList = report?.threatenedSummary && report.threatenedSummary.length > 0
    ? report.threatenedSummary
    : Array.from(
        new Set(
          (report?.auditPoints || []).flatMap(p => p.threatenedPokemon || [])
            .concat((report?.defensiveWeaknesses || []).flatMap(w => w.affectedPokemon || []))
        )
      ).map(name => `${name} (Vulnerable to team's unresisted or shared defensive gaps)`);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-3xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
        role="dialog"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/60 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center text-white shadow-sm font-bold text-sm">
              ⚡
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-slate-900 dark:text-white">
                  Squad Audit Report
                </h3>
                <span className="text-[11px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-mono">
                  {battleFormat === 'doubles' ? 'VGC Doubles' : 'Singles'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Actionable competitive evaluation for <strong className="text-slate-700 dark:text-slate-300">{teamName}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isLoading}
              onClick={onRefreshAnalysis}
              title="Re-run Audit"
              className="p-2 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-indigo-500' : ''}`} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 flex-1 overflow-y-auto space-y-6">
          {/* Loading State */}
          {isLoading && (
            <div className="py-14 text-center space-y-3">
              <div className="w-12 h-12 mx-auto rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center">
                <Loader2 className="w-6 h-6 text-indigo-600 dark:text-indigo-400 animate-spin" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Auditing squad weaknesses and generating direct solutions...
                </h4>
                <p className="text-xs text-slate-500">
                  Cross-referencing 18-type matrix and competitive counter-matchups.
                </p>
              </div>
            </div>
          )}

          {/* Error State */}
          {!isLoading && error && (
            <div className="p-4 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/80 dark:bg-rose-950/30 text-rose-900 dark:text-rose-200 text-xs flex items-center gap-3">
              <AlertOctagon className="w-5 h-5 text-rose-600 shrink-0" />
              <div>
                <p className="font-bold">Audit Failed</p>
                <p className="mt-0.5">{error}</p>
              </div>
            </div>
          )}

          {/* Report Content */}
          {!isLoading && report && (
            <div className="space-y-6">
              {/* Quick Summary Row */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400 font-mono">
                      Archetype
                    </span>
                    <span className="text-slate-300 dark:text-slate-700">·</span>
                    <span className="font-bold text-slate-900 dark:text-white text-xs">
                      {report.archetype}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    {report.summary}
                  </p>
                </div>

                <div className="flex items-center gap-3 shrink-0 bg-white dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 shadow-2xs">
                  <div className="text-right">
                    <div className="text-[9px] uppercase font-mono text-slate-400">Rating</div>
                    <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Grade</div>
                  </div>
                  <div className={`w-8 h-8 rounded-md bg-gradient-to-tr ${getGradeColor(report.synergyGrade)} flex items-center justify-center font-display font-black text-lg`}>
                    {report.synergyGrade}
                  </div>
                </div>
              </div>

              {/* SECTION: Problems & Direct Solutions Bullet List */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                      Problems &amp; Solutions
                    </h4>
                  </div>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {auditPoints.length} {auditPoints.length === 1 ? 'Point' : 'Points'} Identified
                  </span>
                </div>

                <div className="space-y-4">
                  {auditPoints.map((point, idx) => {
                    const isCritical = point.severity === 'critical';
                    const isWarning = point.severity === 'warning';
                    const bulletColor = isCritical
                      ? 'bg-rose-500'
                      : isWarning
                      ? 'bg-amber-500'
                      : 'bg-indigo-500';

                    return (
                      <div
                        key={idx}
                        className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/90 shadow-2xs space-y-2.5"
                      >
                        {/* What's Wrong (Problem Bullet) */}
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex items-start gap-2.5">
                            <span className={`w-2 h-2 rounded-full ${bulletColor} mt-1.5 shrink-0`} />
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-xs sm:text-sm text-slate-900 dark:text-white">
                                  {point.problem}
                                </span>
                                {point.typeCategory && (
                                  <TypeBadge
                                    type={point.typeCategory.toLowerCase() as any}
                                    size="sm"
                                  />
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="shrink-0">
                            {getSeverityBadge(point.severity)}
                          </div>
                        </div>

                        {/* Solutions List */}
                        {point.solutions && point.solutions.length > 0 && (
                          <div className="pl-5 pt-1 space-y-1 border-l-2 border-slate-100 dark:border-slate-800 ml-1">
                            <div className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-1">
                              Recommended Solutions:
                            </div>
                            <ul className="space-y-1 list-disc list-inside text-xs text-slate-700 dark:text-slate-300">
                              {point.solutions.map((sol, sIdx) => (
                                <li key={sIdx} className="leading-relaxed">
                                  {sol}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}

                        {/* Actionable Addition Quick Button if Available */}
                        {point.suggestedAddition && (
                          <div className="pt-2 flex items-center justify-between gap-2 border-t border-slate-100 dark:border-slate-800">
                            <span className="text-[11px] text-slate-500 truncate">
                              Quick counter: <strong className="text-slate-800 dark:text-slate-200">{point.suggestedAddition.name}</strong> ({point.suggestedAddition.role})
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onAdoptRecommendation({
                                  pokemonName: point.suggestedAddition!.name,
                                  role: point.suggestedAddition!.role,
                                  whyItHelps: `Direct solution to: ${point.problem}`,
                                  suggestedItem: point.suggestedAddition!.item,
                                  suggestedAbility: point.suggestedAddition!.ability,
                                  suggestedMoves: point.suggestedAddition!.moves,
                                })
                              }
                              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-lg shadow-2xs transition-all shrink-0 active:scale-95"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>Add to Lineup</span>
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* SECTION: Threatened Squad Pokémon at the Bottom */}
              <div className="space-y-2.5 pt-2">
                <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                  <Skull className="w-4 h-4 text-rose-500" />
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Threatened Squad Pokémon
                  </h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    (Vulnerable to team's unresisted or shared gaps)
                  </span>
                </div>

                {threatenedList.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                    {threatenedList.map((item, idx) => (
                      <li
                        key={idx}
                        className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-start gap-2"
                      >
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                        <span className="text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                          {item}
                        </span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-3 rounded-lg border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>No squad members have dangerous unmitigated 2×/4× weaknesses.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between">
          <span className="text-xs text-slate-400">
            Click any solution to adjust moves, items, or add counter-picks
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
