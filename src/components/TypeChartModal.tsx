import React, { useState } from 'react';
import { PokemonType } from '../types/pokemon';
import { ALL_POKEMON_TYPES, getDamageMultiplier, TYPE_METADATA } from '../data/types';
import { TypeBadge } from './TypeBadge';
import { X, Search, ZoomIn, ZoomOut, Maximize2, Shield, Swords } from 'lucide-react';

interface TypeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const TypeChartModal: React.FC<TypeChartModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'interactive' | 'graphic'>('interactive');
  const [primaryType, setPrimaryType] = useState<PokemonType>('fire');
  const [secondaryType, setSecondaryType] = useState<PokemonType | 'none'>('dragon');
  const [searchFilter, setSearchFilter] = useState('');
  const [zoomLevel, setZoomLevel] = useState(1);

  if (!isOpen) return null;

  // Calculate defense multipliers for chosen dual-type combo
  const defendingTypes: PokemonType[] = secondaryType !== 'none' && secondaryType !== primaryType
    ? [primaryType, secondaryType]
    : [primaryType];

  const matchups = ALL_POKEMON_TYPES.map(atkType => ({
    type: atkType,
    multiplier: getDamageMultiplier(atkType, defendingTypes),
  }));

  const quadWeak = matchups.filter(m => m.multiplier === 4);
  const doubleWeak = matchups.filter(m => m.multiplier === 2);
  const neutral = matchups.filter(m => m.multiplier === 1);
  const halfResist = matchups.filter(m => m.multiplier === 0.5);
  const quadResist = matchups.filter(m => m.multiplier === 0.25);
  const immune = matchups.filter(m => m.multiplier === 0);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
        role="dialog"
      >
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Pokémon Type Chart &amp; Matchup Guide
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Interactive battle calculations and Gen 6–9 official reference
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Switcher */}
        <div className="px-5 py-2.5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab('interactive')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'interactive'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Interactive Dual-Type Matchups
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('graphic')}
              className={`px-3 py-1.5 rounded-md transition-all ${
                activeTab === 'graphic'
                  ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
              }`}
            >
              Official 18×18 Chart Graphic
            </button>
          </div>

          {activeTab === 'graphic' && (
            <div className="flex items-center gap-1 text-slate-500">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(0.7, prev - 0.15))}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="text-xs font-mono px-1">{Math.round(zoomLevel * 100)}%</span>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(2.0, prev + 0.15))}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(1)}
                className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-xs"
                title="Reset Zoom"
              >
                Reset
              </button>
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {activeTab === 'interactive' ? (
            <div className="space-y-6">
              {/* Type Selectors */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-950/40 space-y-3">
                <div className="text-xs uppercase font-bold tracking-wider text-slate-500">
                  Select Defending Type Combination
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Primary Type */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Primary Type
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      {ALL_POKEMON_TYPES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setPrimaryType(t)}
                          className={`p-1.5 rounded-md border text-center transition-all ${
                            primaryType === t
                              ? 'ring-2 ring-indigo-500 scale-105 shadow-xs'
                              : 'opacity-85 hover:opacity-100'
                          }`}
                        >
                          <TypeBadge type={t} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Secondary Type */}
                  <div>
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 block mb-1">
                      Secondary Type (Optional)
                    </label>
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 max-h-36 overflow-y-auto pr-1">
                      <button
                        type="button"
                        onClick={() => setSecondaryType('none')}
                        className={`p-1.5 rounded-md border text-center text-[10px] font-semibold transition-all ${
                          secondaryType === 'none'
                            ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 ring-2 ring-indigo-500'
                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                        }`}
                      >
                        None
                      </button>
                      {ALL_POKEMON_TYPES.map(t => (
                        <button
                          key={t}
                          type="button"
                          onClick={() => setSecondaryType(t)}
                          className={`p-1.5 rounded-md border text-center transition-all ${
                            secondaryType === t
                              ? 'ring-2 ring-indigo-500 scale-105 shadow-xs'
                              : 'opacity-85 hover:opacity-100'
                          }`}
                        >
                          <TypeBadge type={t} size="sm" />
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Selected Combo Banner */}
                <div className="pt-2 flex items-center justify-between border-t border-slate-200 dark:border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-500">Defending as:</span>
                    <TypeBadge type={primaryType} size="md" />
                    {secondaryType !== 'none' && secondaryType !== primaryType && (
                      <>
                        <span className="text-xs text-slate-400">+</span>
                        <TypeBadge type={secondaryType} size="md" />
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Matchup Breakdown Groups */}
              <div className="space-y-4">
                {/* 4x Quad Weakness */}
                {quadWeak.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-rose-300 dark:border-rose-900 bg-rose-50/70 dark:bg-rose-950/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-rose-700 dark:text-rose-400">
                        ⚡ Severe Weakness (400% / 4× Damage)
                      </span>
                      <span className="text-xs font-mono font-bold text-rose-600">
                        {quadWeak.length} types
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quadWeak.map(m => (
                        <TypeBadge key={m.type} type={m.type} size="md" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 2x Super Effective */}
                <div className="p-3.5 rounded-xl border border-orange-200 dark:border-orange-900/60 bg-orange-50/50 dark:bg-orange-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-orange-700 dark:text-orange-400">
                      Weaknesses (200% / 2× Damage)
                    </span>
                    <span className="text-xs font-mono font-bold text-orange-600">
                      {doubleWeak.length} types
                    </span>
                  </div>
                  {doubleWeak.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {doubleWeak.map(m => (
                        <TypeBadge key={m.type} type={m.type} size="md" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No standard 2× weaknesses.</p>
                  )}
                </div>

                {/* 0.5x Resistances */}
                <div className="p-3.5 rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/50 dark:bg-emerald-950/20 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                      Resistances (50% / ½× Damage)
                    </span>
                    <span className="text-xs font-mono font-bold text-emerald-600">
                      {halfResist.length} types
                    </span>
                  </div>
                  {halfResist.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {halfResist.map(m => (
                        <TypeBadge key={m.type} type={m.type} size="md" />
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-slate-400 italic">No ½× resistances.</p>
                  )}
                </div>

                {/* 0.25x Quad Resistances */}
                {quadResist.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-teal-200 dark:border-teal-900 bg-teal-50/60 dark:bg-teal-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-teal-700 dark:text-teal-400">
                        🛡️ Double Resistances (25% / ¼× Damage)
                      </span>
                      <span className="text-xs font-mono font-bold text-teal-600">
                        {quadResist.length} types
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {quadResist.map(m => (
                        <TypeBadge key={m.type} type={m.type} size="md" />
                      ))}
                    </div>
                  </div>
                )}

                {/* 0x Immunities */}
                {immune.length > 0 && (
                  <div className="p-3.5 rounded-xl border border-purple-200 dark:border-purple-900 bg-purple-50/60 dark:bg-purple-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-purple-700 dark:text-purple-400">
                        ✨ Full Immunities (0% / 0× Damage)
                      </span>
                      <span className="text-xs font-mono font-bold text-purple-600">
                        {immune.length} types
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {immune.map(m => (
                        <TypeBadge key={m.type} type={m.type} size="md" />
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* TAB 2: Official Type Chart Graphic Asset */
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs text-slate-600 dark:text-slate-300 flex items-center justify-between">
                <span>
                  Official Pokémon Type Chart (PokemonDB reference for Gen 6+ through Gen 9 Scarlet &amp; Violet).
                </span>
                <span className="font-mono text-[11px] text-slate-400">
                  Green = 200% · Red = 50% · Dark = 0%
                </span>
              </div>

              <div className="overflow-auto max-h-[600px] border border-slate-200 dark:border-slate-800 rounded-xl bg-white p-4 flex items-center justify-center">
                <img
                  src="/assets/aistudio/typechart_eedc436d.png"
                  alt="Official Pokémon Type Chart"
                  className="transition-transform duration-200 select-none max-w-full h-auto"
                  style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top center' }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
