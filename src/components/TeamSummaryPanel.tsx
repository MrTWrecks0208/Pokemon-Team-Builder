import React from 'react';
import { BattleFormat, PokemonType, TeamAnalysis, TeamMember } from '../types/pokemon';
import { ALL_POKEMON_TYPES, getDamageMultiplier, TYPE_METADATA } from '../data/types';
import { TypeBadge } from './TypeBadge';
import { Zap, ShieldAlert, Award, Activity, Gauge, AlertTriangle, CheckCircle2, Sparkles, Loader2 } from 'lucide-react';

interface TeamSummaryPanelProps {
  analysis: TeamAnalysis;
  members: (TeamMember | null)[];
  battleFormat: BattleFormat;
  onOpenTypeChart: () => void;
  onOpenSynergyReport: () => void;
  isAnalyzing?: boolean;
}

export const TeamSummaryPanel: React.FC<TeamSummaryPanelProps> = ({
  analysis,
  members,
  battleFormat,
  onOpenTypeChart,
  onOpenSynergyReport,
  isAnalyzing = false,
}) => {
  const activeMembers = members.filter((m): m is TeamMember => m !== null);
  const activeCount = activeMembers.length;

  if (activeCount === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 p-6 text-center">
        <p className="text-sm text-slate-500 dark:text-slate-400">
          Add Pokémon to your lineup to unlock real-time power analytics, speed tier ladders, and defensive coverage matrices.
        </p>
      </div>
    );
  }

  // Format synergy checks
  const hasSpeedControl = activeMembers.some(m =>
    m.moves.some(move => move && ['tailwind', 'trick-room', 'icy-wind', 'electroweb'].includes(move.id))
  );

  const hasRedirection = activeMembers.some(m =>
    m.moves.some(move => move && ['follow-me', 'rage-powder'].includes(move.id))
  );

  const hasFakeOut = activeMembers.some(m =>
    m.moves.some(move => move && move.id === 'fake-out')
  );

  const hasIntimidate = activeMembers.some(m =>
    m.ability.name.toLowerCase().includes('intimidate')
  );

  const totalMoves = analysis.physicalSpecialRatio.physical + analysis.physicalSpecialRatio.special + analysis.physicalSpecialRatio.status || 1;
  const physPct = Math.round((analysis.physicalSpecialRatio.physical / totalMoves) * 100);
  const specPct = Math.round((analysis.physicalSpecialRatio.special / totalMoves) * 100);
  const statusPct = 100 - physPct - specPct;

  const renderMultiplierBadge = (mult: number) => {
    if (mult === 4) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-rose-600 text-white shadow-2xs" title="4× Double Weakness">
          4×
        </span>
      );
    }
    if (mult === 2) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900" title="2× Weakness">
          2×
        </span>
      );
    }
    if (mult === 0.5) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-900" title="½× Resistance">
          ½
        </span>
      );
    }
    if (mult === 0.25) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-teal-200 dark:bg-teal-900 text-teal-950 dark:text-teal-200 border border-teal-300 dark:border-teal-800" title="¼× Double Resistance">
          ¼
        </span>
      );
    }
    if (mult === 0) {
      return (
        <span className="inline-block px-1.5 py-0.5 rounded text-[10px] font-black bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800" title="0× Immune">
          0
        </span>
      );
    }
    return <span className="text-slate-300 dark:text-slate-700 text-xs select-none font-medium">—</span>;
  };

  return (
    <div className="space-y-6">
      {/* Top Section: Power Rating & Core KPI Strip */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total Power Index Card */}
        <div className="md:col-span-2 rounded-2xl border border-slate-200 dark:border-slate-800 bg-gradient-to-br from-indigo-900/10 via-white to-rose-900/10 dark:from-indigo-950/40 dark:via-slate-900 dark:to-rose-950/30 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase font-bold tracking-wider text-indigo-600 dark:text-indigo-400">
                Squad Battle Readiness
              </span>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-indigo-100 dark:bg-indigo-900/60 text-indigo-700 dark:text-indigo-300">
                {battleFormat === 'doubles' ? 'Doubles Champions' : 'Singles Champions'}
              </span>
            </div>
            <div className="flex items-baseline gap-2 mt-2">
              <span className="font-display font-black text-4xl sm:text-5xl text-slate-900 dark:text-white tracking-tight tabular-nums">
                {analysis.totalPower}
              </span>
              <span className="text-sm font-semibold text-slate-400">/ 1,000 Power</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Real-time index synthesized from base stat distributions, movepool synergy, EV focus, and offensive coverage.
            </p>
          </div>

          {/* Progress bar & AI Synergy CTA */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex-1">
              <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 transition-all duration-500 rounded-full"
                  style={{ width: `${Math.min(100, Math.max(10, (analysis.totalPower / 1000) * 100))}%` }}
                />
              </div>
            </div>
            <button
              type="button"
              disabled={isAnalyzing}
              onClick={onOpenSynergyReport}
              className="flex items-center justify-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 rounded-xl shadow-xs transition-all whitespace-nowrap active:scale-95 disabled:opacity-50"
            >
              {isAnalyzing ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              <span>AI Synergy Report</span>
            </button>
          </div>
        </div>

        {/* Avg BST & Coverage */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Avg. Base Stat Total
            </span>
            <div className="font-display font-bold text-3xl text-slate-900 dark:text-white mt-1 tabular-nums">
              {analysis.avgBaseStatTotal}
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Top competitive tiers typically average 520–580+ BST.
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500">Offensive Types Hit:</span>
            <span className="font-bold text-indigo-600 dark:text-indigo-400 font-mono">
              {analysis.offensiveCoverage.length} / 18
            </span>
          </div>
        </div>

        {/* Attack Category Balance */}
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 flex flex-col justify-between shadow-xs">
          <div>
            <span className="text-xs uppercase font-bold tracking-wider text-slate-400">
              Damage Profile
            </span>
            <div className="flex items-center gap-2 mt-2">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">💥 Phys {physPct}%</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-300">🔮 Spec {specPct}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-200 dark:bg-slate-800 overflow-hidden flex">
                  <div style={{ width: `${physPct}%` }} className="bg-orange-500 h-full" />
                  <div style={{ width: `${specPct}%` }} className="bg-indigo-500 h-full" />
                  <div style={{ width: `${statusPct}%` }} className="bg-emerald-500 h-full" />
                </div>
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              {physPct > 70
                ? 'High physical skew: beware Intimidate & Burns.'
                : specPct > 70
                ? 'High special skew: beware Snarl & Assault Vests.'
                : 'Balanced physical and special attack threats.'}
            </p>
          </div>

          <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs flex items-center justify-between">
            <span className="text-slate-500">Support / Status:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 font-mono">
              {analysis.physicalSpecialRatio.status} moves
            </span>
          </div>
        </div>
      </div>

      {/* Format-Specific Tactical Checks */}
      {battleFormat === 'doubles' ? (
        <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60">
          <div className="text-xs uppercase font-bold tracking-wider text-slate-500 mb-2">
            Doubles (VGC) Tactical Checklist
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${hasSpeedControl ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Speed Control {hasSpeedControl ? '✓' : '(Tailwind/TR)'}</span>
            </div>
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${hasRedirection ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Redirection {hasRedirection ? '✓' : '(Follow Me)'}</span>
            </div>
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${hasFakeOut ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Fake Out {hasFakeOut ? '✓' : '(Turn 1 Flinch)'}</span>
            </div>
            <div className={`p-2 rounded-lg border flex items-center gap-2 ${hasIntimidate ? 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300' : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-400'}`}>
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>Intimidate {hasIntimidate ? '✓' : '(Atk Debuff)'}</span>
            </div>
          </div>
        </div>
      ) : null}

      {/* Warnings & Strengths */}
      {(analysis.synergyWarnings.length > 0 || analysis.synergyStrengths.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {analysis.synergyWarnings.length > 0 && (
            <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-900/60 bg-amber-50/60 dark:bg-amber-950/20 space-y-1.5">
              <div className="flex items-center gap-2 text-amber-800 dark:text-amber-300 font-semibold text-xs uppercase tracking-wide">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Tactical Vulnerabilities</span>
              </div>
              <ul className="text-xs text-amber-900 dark:text-amber-200/90 space-y-1 list-disc list-inside">
                {analysis.synergyWarnings.map((warn, i) => (
                  <li key={i}>{warn}</li>
                ))}
              </ul>
            </div>
          )}

          {analysis.synergyStrengths.length > 0 && (
            <div className="p-4 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 space-y-1.5">
              <div className="flex items-center gap-2 text-emerald-800 dark:text-emerald-300 font-semibold text-xs uppercase tracking-wide">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>Team Strengths</span>
              </div>
              <ul className="text-xs text-emerald-900 dark:text-emerald-200/90 space-y-1 list-disc list-inside">
                {analysis.synergyStrengths.map((str, i) => (
                  <li key={i}>{str}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Defensive Vulnerability Matrix Table Chart */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Team Defensive Matrix Chart
              </h3>
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                All 18 Types
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Exact incoming damage multipliers per Pokémon across all 18 attack types, with team aggregate defensive balance.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onOpenTypeChart}
              className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline shrink-0"
            >
              Full Matchup Guide →
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-2 text-[10px] font-medium bg-slate-50 dark:bg-slate-950/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-[9px]">Legend:</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-600 text-white font-black">4× Double Weak</span>
          <span className="px-1.5 py-0.5 rounded bg-rose-100 dark:bg-rose-950/80 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-900">2× Weak</span>
          <span className="px-1.5 py-0.5 text-slate-400">— Neutral (1×)</span>
          <span className="px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-900">½ Resist</span>
          <span className="px-1.5 py-0.5 rounded bg-teal-200 dark:bg-teal-900 text-teal-950 dark:text-teal-200 font-black border border-teal-300 dark:border-teal-800">¼ Double Resist</span>
          <span className="px-1.5 py-0.5 rounded bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 font-black border border-purple-200 dark:border-purple-800">0 Immune</span>
        </div>

        {/* Unified Matrix Table */}
        <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 scrollbar-thin">
          <table className="w-full text-center border-collapse min-w-[920px]">
            <thead>
              <tr className="bg-slate-100/90 dark:bg-slate-950/90 border-b border-slate-200 dark:border-slate-800 text-[11px] font-bold text-slate-600 dark:text-slate-300">
                <th className="sticky left-0 z-20 bg-slate-100 dark:bg-slate-950 text-left px-3 py-2.5 font-bold min-w-[170px] border-r border-slate-200 dark:border-slate-800 shadow-xs">
                  Squad Member
                </th>
                {ALL_POKEMON_TYPES.map(t => (
                  <th key={t} className="px-1 py-2 text-center min-w-[42px] border-r border-slate-200/50 dark:border-slate-800/50 last:border-r-0">
                    <TypeBadge type={t} size="sm" className="scale-90" />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
              {activeMembers.map((member, idx) => (
                <tr key={member.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="sticky left-0 z-10 bg-white dark:bg-slate-900 px-3 py-2 border-r border-slate-200 dark:border-slate-800 text-left shadow-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded bg-slate-100 dark:bg-slate-800 p-0.5 shrink-0 border border-slate-200/60 dark:border-slate-700">
                        <img
                          src={member.species.spriteUrl}
                          alt={member.species.displayName}
                          className="w-full h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="font-bold text-slate-800 dark:text-slate-200 text-xs truncate max-w-[115px]">
                          {member.species.displayName}
                        </div>
                        <div className="flex items-center gap-1 mt-0.5">
                          {member.species.types.map(t => (
                            <span key={t} className="text-[9px] uppercase font-mono text-slate-400">
                              {t.slice(0, 3)}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </td>
                  {ALL_POKEMON_TYPES.map(atkType => {
                    const mult = getDamageMultiplier(atkType, member.species.types);
                    return (
                      <td key={atkType} className="px-1 py-2 border-r border-slate-100 dark:border-slate-800/50 last:border-r-0">
                        {renderMultiplierBadge(mult)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
            {/* Aggregated Summary Footer */}
            <tfoot className="border-t-2 border-slate-300 dark:border-slate-700 bg-slate-50/95 dark:bg-slate-950/95 text-[11px] font-mono font-bold">
              {/* Row 1: Weaknesses */}
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80">
                <td className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-left font-sans text-rose-600 dark:text-rose-400 font-bold border-r border-slate-200 dark:border-slate-800 shadow-xs">
                  Weaknesses (2× / 4×)
                </td>
                {ALL_POKEMON_TYPES.map(t => {
                  const weakCount = analysis.weaknesses[t] || 0;
                  const isCritical = weakCount >= 3;
                  return (
                    <td
                      key={t}
                      className={`px-1 py-2 border-r border-slate-100 dark:border-slate-800/50 last:border-r-0 ${
                        isCritical ? 'bg-rose-100/70 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400' : ''
                      }`}
                    >
                      {weakCount > 0 ? (
                        <span className={isCritical ? 'font-black underline decoration-rose-500' : 'text-rose-600 dark:text-rose-400'}>
                          {weakCount}{isCritical ? '⚠️' : ''}
                        </span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700 font-normal">0</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 2: Resistances */}
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80">
                <td className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-left font-sans text-emerald-600 dark:text-emerald-400 font-bold border-r border-slate-200 dark:border-slate-800 shadow-xs">
                  Resistances (½ / ¼)
                </td>
                {ALL_POKEMON_TYPES.map(t => {
                  const resCount = analysis.resistances[t] || 0;
                  return (
                    <td key={t} className="px-1 py-2 border-r border-slate-100 dark:border-slate-800/50 last:border-r-0">
                      {resCount > 0 ? (
                        <span className="text-emerald-600 dark:text-emerald-400">{resCount}</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700 font-normal">0</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 3: Immunities */}
              <tr className="border-b border-slate-200/80 dark:border-slate-800/80">
                <td className="sticky left-0 z-10 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-left font-sans text-purple-600 dark:text-purple-400 font-bold border-r border-slate-200 dark:border-slate-800 shadow-xs">
                  Immunities (0×)
                </td>
                {ALL_POKEMON_TYPES.map(t => {
                  const immCount = analysis.immunities[t] || 0;
                  return (
                    <td key={t} className="px-1 py-2 border-r border-slate-100 dark:border-slate-800/50 last:border-r-0">
                      {immCount > 0 ? (
                        <span className="text-purple-600 dark:text-purple-400">{immCount}</span>
                      ) : (
                        <span className="text-slate-300 dark:text-slate-700 font-normal">0</span>
                      )}
                    </td>
                  );
                })}
              </tr>

              {/* Row 4: Net Balance */}
              <tr>
                <td className="sticky left-0 z-10 bg-slate-100 dark:bg-slate-900 px-3 py-2.5 text-left font-sans text-slate-800 dark:text-slate-200 font-bold border-r border-slate-200 dark:border-slate-800 shadow-xs">
                  Net Defensive Balance
                </td>
                {ALL_POKEMON_TYPES.map(t => {
                  const weak = analysis.weaknesses[t] || 0;
                  const res = analysis.resistances[t] || 0;
                  const imm = analysis.immunities[t] || 0;
                  const net = (res + imm) - weak;
                  return (
                    <td
                      key={t}
                      className={`px-1 py-2.5 border-r border-slate-100 dark:border-slate-800/50 last:border-r-0 ${
                        net < 0
                          ? 'text-rose-600 dark:text-rose-400 font-black bg-rose-50/50 dark:bg-rose-950/40'
                          : net > 0
                          ? 'text-emerald-600 dark:text-emerald-400 font-black'
                          : 'text-slate-400 font-normal'
                      }`}
                    >
                      {net > 0 ? `+${net}` : net}
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {/* Speed Tier Ladder */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Speed Tier Ladder (Lv 50)
            </h3>
            <p className="text-xs text-slate-500">
              Turn priority order among team members (includes Choice Scarf speed bonuses)
            </p>
          </div>
          <span className="text-xs text-slate-400 font-mono">Sorted Fast → Slow</span>
        </div>

        <div className="space-y-2 pt-1">
          {analysis.speedTiers.map((tier, index) => {
            const maxSpeed = analysis.speedTiers[0]?.speed || 200;
            const widthPct = Math.max(25, (tier.speed / maxSpeed) * 100);

            return (
              <div key={index} className="flex items-center gap-3 text-xs">
                <span className="font-mono text-slate-400 w-5 text-right font-semibold">
                  #{index + 1}
                </span>
                <div className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 p-0.5 flex items-center justify-center shrink-0 border border-slate-200 dark:border-slate-700">
                  <img
                    src={tier.sprite}
                    alt={tier.name}
                    className="w-full h-full object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="w-28 sm:w-36 truncate font-bold text-slate-800 dark:text-slate-200">
                  {tier.name}
                  {tier.item?.toLowerCase().includes('scarf') && (
                    <span className="text-[10px] text-indigo-500 font-normal ml-1">(Scarf)</span>
                  )}
                </div>

                <div className="flex-1 h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-300"
                    style={{ width: `${widthPct}%` }}
                  />
                </div>

                <span className="font-mono font-bold text-sm text-slate-900 dark:text-white w-12 text-right tabular-nums">
                  {tier.speed}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
