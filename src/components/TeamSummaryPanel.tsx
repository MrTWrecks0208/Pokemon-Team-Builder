import React from 'react';
import { BattleFormat, PokemonType, TeamAnalysis, TeamMember } from '../types/pokemon';
import { ALL_POKEMON_TYPES, TYPE_METADATA } from '../data/types';
import { TypeBadge } from './TypeBadge';
import { Zap, ShieldAlert, Award, Activity, Gauge, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface TeamSummaryPanelProps {
  analysis: TeamAnalysis;
  members: (TeamMember | null)[];
  battleFormat: BattleFormat;
  onOpenTypeChart: () => void;
}

export const TeamSummaryPanel: React.FC<TeamSummaryPanelProps> = ({
  analysis,
  members,
  battleFormat,
  onOpenTypeChart,
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

          {/* Progress bar */}
          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80">
            <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-amber-500 via-rose-500 to-indigo-600 transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, Math.max(10, (analysis.totalPower / 1000) * 100))}%` }}
              />
            </div>
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

      {/* Defensive Vulnerability Matrix across all 18 Types */}
      <div className="rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-5 space-y-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Defensive Team Matrix
            </h3>
            <p className="text-xs text-slate-500">
              Aggregated team resistance, weakness, and immunity count against every attacking type
            </p>
          </div>
          <button
            type="button"
            onClick={onOpenTypeChart}
            className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline"
          >
            View Official Type Chart →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {ALL_POKEMON_TYPES.map(type => {
            const weak = analysis.weaknesses[type] || 0;
            const resist = analysis.resistances[type] || 0;
            const immune = analysis.immunities[type] || 0;

            const isHighVulnerability = weak >= 3;

            return (
              <div
                key={type}
                className={`p-2.5 rounded-xl border flex flex-col justify-between gap-1.5 transition-all ${
                  isHighVulnerability
                    ? 'bg-rose-50 dark:bg-rose-950/30 border-rose-300 dark:border-rose-900 ring-1 ring-rose-400'
                    : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <TypeBadge type={type} size="sm" />
                  {isHighVulnerability && (
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-bold">
                      ⚠️ 3+
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-1 text-center font-mono text-[11px] pt-1 border-t border-slate-200/50 dark:border-slate-700/50">
                  <div title="Weak to this type">
                    <span className="text-[9px] text-slate-400 block font-sans">Weak</span>
                    <span className={`font-bold ${weak > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-400'}`}>
                      {weak}
                    </span>
                  </div>
                  <div title="Resists this type">
                    <span className="text-[9px] text-slate-400 block font-sans">Resist</span>
                    <span className={`font-bold ${resist > 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                      {resist}
                    </span>
                  </div>
                  <div title="Immune to this type">
                    <span className="text-[9px] text-slate-400 block font-sans">Immune</span>
                    <span className={`font-bold ${immune > 0 ? 'text-purple-600 dark:text-purple-400' : 'text-slate-400'}`}>
                      {immune}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
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
