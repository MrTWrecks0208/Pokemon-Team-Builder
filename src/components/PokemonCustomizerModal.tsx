import React, { useState, useMemo } from 'react';
import {
  Ability,
  HeldItem,
  Move,
  MoveCategory,
  Nature,
  StatName,
  StatSpread,
  TeamMember,
} from '../types/pokemon';
import { NATURES } from '../data/natures';
import { COMPETITIVE_ITEMS } from '../data/items';
import { TypeBadge } from './TypeBadge';
import { calculateAllStats, calculatePokemonPowerRating } from '../utils/statCalculators';
import { X, Check, RotateCcw, Zap, Sparkles, SlidersHorizontal, Shield, Swords } from 'lucide-react';

interface PokemonCustomizerModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updated: TeamMember) => void;
}

const STAT_LABELS: Record<StatName, string> = {
  hp: 'HP',
  atk: 'Attack',
  def: 'Defense',
  spa: 'Sp. Atk',
  spd: 'Sp. Def',
  spe: 'Speed',
};

export const PokemonCustomizerModal: React.FC<PokemonCustomizerModalProps> = ({
  member,
  isOpen,
  onClose,
  onSave,
}) => {
  if (!isOpen || !member) return null;

  // Local editing state initialized from member
  const [nature, setNature] = useState<Nature>(member.nature);
  const [ability, setAbility] = useState<Ability>(member.ability);
  const [item, setItem] = useState<HeldItem | null>(member.item);
  const [moves, setMoves] = useState<(Move | null)[]>([...member.moves]);
  const [evs, setEvs] = useState<StatSpread>({ ...member.evs });
  const [ivs, setIvs] = useState<StatSpread>({ ...member.ivs });
  const [role, setRole] = useState(member.role || 'Competitor');
  const [itemSearch, setItemSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'build' | 'stats' | 'moves'>('stats');

  // Total EVs used
  const totalEvs = useMemo(() => {
    return evs.hp + evs.atk + evs.def + evs.spa + evs.spd + evs.spe;
  }, [evs]);

  const remainingEvs = 510 - totalEvs;

  // Real-time calculated Level 50 stats
  const calculatedStats = useMemo(() => {
    return calculateAllStats(member.species, ivs, evs, nature);
  }, [member.species, ivs, evs, nature]);

  // Real-time power score
  const powerRating = useMemo(() => {
    return calculatePokemonPowerRating(calculatedStats, member.species, moves, item, nature);
  }, [calculatedStats, member.species, moves, item, nature]);

  // Handle EV slider change
  const handleEvChange = (stat: StatName, val: number) => {
    const clamped = Math.max(0, Math.min(252, val));
    const currentWithoutStat = totalEvs - evs[stat];
    const allowed = Math.min(clamped, 510 - currentWithoutStat);
    setEvs(prev => ({ ...prev, [stat]: allowed }));
  };

  // Handle IV change
  const handleIvChange = (stat: StatName, val: number) => {
    const clamped = Math.max(0, Math.min(31, val));
    setIvs(prev => ({ ...prev, [stat]: clamped }));
  };

  // Quick EV Presets
  const applyPreset = (presetType: 'physSweeper' | 'specSweeper' | 'bulkyPhys' | 'bulkySpec' | 'tank' | 'reset') => {
    switch (presetType) {
      case 'physSweeper':
        setEvs({ hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 });
        break;
      case 'specSweeper':
        setEvs({ hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 });
        break;
      case 'bulkyPhys':
        setEvs({ hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 });
        break;
      case 'bulkySpec':
        setEvs({ hp: 252, atk: 0, def: 4, spa: 0, spd: 252, spe: 0 });
        break;
      case 'tank':
        setEvs({ hp: 252, atk: 0, def: 180, spa: 0, spd: 76, spe: 0 });
        break;
      case 'reset':
        setEvs({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });
        break;
    }
  };

  // Filtered items
  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return COMPETITIVE_ITEMS;
    return COMPETITIVE_ITEMS.filter(
      i => i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
           i.description.toLowerCase().includes(itemSearch.toLowerCase())
    );
  }, [itemSearch]);

  const handleSave = () => {
    onSave({
      ...member,
      nature,
      ability,
      item,
      moves,
      evs,
      ivs,
      role,
      calculatedStats,
      powerRating,
    });
    onClose();
  };

  const getMoveCategoryIcon = (category: MoveCategory) => {
    switch (category) {
      case 'physical': return <span title="Physical">💥</span>;
      case 'special': return <span title="Special">🔮</span>;
      case 'status': return <span title="Status">🛡️</span>;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-4xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
        role="dialog"
      >
        {/* Header Ribbon */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={member.species.artworkUrl || member.species.spriteUrl}
              alt={member.species.displayName}
              className="w-12 h-12 object-contain filter drop-shadow-sm"
              referrerPolicy="no-referrer"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
                  {member.species.displayName}
                </h2>
                <div className="flex items-center gap-1">
                  {member.species.types.map(t => (
                    <TypeBadge key={t} type={t} size="sm" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Slot #{member.slotIndex + 1} · Level 50 Standard
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-[10px] text-slate-400 uppercase font-medium">Power Index</div>
              <div className="font-mono font-bold text-lg text-indigo-600 dark:text-indigo-400 leading-none">
                {powerRating} <span className="text-xs font-sans font-normal text-slate-400">/ 100</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Controls */}
        <div className="px-5 pt-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-2 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('stats')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'stats'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span>EV / IV &amp; Nature Stats</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('moves')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'moves'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Moveset (4 Slots)</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('build')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'build'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Held Item &amp; Ability</span>
          </button>
        </div>

        {/* Tab Contents */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* TAB 1: STATS & EV/IV */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* Nature Selector */}
              <div className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/40">
                <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Nature Alignment
                  </label>
                  <div className="text-xs text-slate-500">
                    {nature.increasedStat ? (
                      <span>
                        <span className="text-rose-500 font-bold">+{STAT_LABELS[nature.increasedStat]} (+10%)</span>,{' '}
                        <span className="text-blue-500 font-bold">-{STAT_LABELS[nature.decreasedStat!]} (-10%)</span>
                      </span>
                    ) : (
                      <span className="text-slate-400">Neutral (No multipliers)</span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {NATURES.map(nat => {
                    const isSelected = nature.name === nat.name;
                    return (
                      <button
                        key={nat.name}
                        type="button"
                        onClick={() => setNature(nat)}
                        className={`p-2 rounded-lg text-left text-xs transition-all border ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        <div className="font-bold">{nat.name}</div>
                        <div className={`text-[10px] mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {nat.increasedStat
                            ? `+${STAT_LABELS[nat.increasedStat].slice(0, 3)} / -${STAT_LABELS[nat.decreasedStat!].slice(0, 3)}`
                            : 'Neutral'}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* EV Budget & Presets */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                      Effort Values (EV Spread)
                    </h4>
                    <p className="text-xs text-slate-500">Max 252 per stat · 510 total team allotment</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300">
                      Remaining: <span className={remainingEvs < 0 ? 'text-rose-500' : 'text-emerald-500'}>{remainingEvs}</span> / 510
                    </span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Quick Spreads:</span>
                  <button
                    type="button"
                    onClick={() => applyPreset('physSweeper')}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 text-xs font-medium"
                  >
                    252 Atk / 252 Spe
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('specSweeper')}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 text-xs font-medium"
                  >
                    252 SpA / 252 Spe
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('bulkyPhys')}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 text-xs font-medium"
                  >
                    252 HP / 252 Atk
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('tank')}
                    className="px-2 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded text-slate-700 dark:text-slate-300 text-xs font-medium"
                  >
                    252 HP / Bulky Mixed
                  </button>
                  <button
                    type="button"
                    onClick={() => applyPreset('reset')}
                    className="px-2 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded text-xs font-medium"
                  >
                    Reset
                  </button>
                </div>

                {/* 6 Stat EV Sliders & IV inputs */}
                <div className="space-y-3 pt-2">
                  {(['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as StatName[]).map(stat => {
                    const base = member.species.baseStats[stat];
                    const currentEv = evs[stat];
                    const currentIv = ivs[stat];
                    const calcVal = calculatedStats[stat];
                    const isBoosted = nature.increasedStat === stat;
                    const isHindered = nature.decreasedStat === stat;

                    return (
                      <div key={stat} className="grid grid-cols-12 items-center gap-2 text-xs">
                        {/* Stat Name & Nature indicator */}
                        <div className="col-span-3 flex items-center justify-between">
                          <span className="font-semibold text-slate-800 dark:text-slate-200 uppercase font-sans">
                            {STAT_LABELS[stat]}
                          </span>
                          <span className="font-mono text-slate-400 text-[11px]">
                            Base {base}
                          </span>
                        </div>

                        {/* EV Slider */}
                        <div className="col-span-4 flex items-center gap-2">
                          <input
                            type="range"
                            min={0}
                            max={252}
                            step={4}
                            value={currentEv}
                            onChange={e => handleEvChange(stat, parseInt(e.target.value, 10))}
                            className="w-full accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <input
                            type="number"
                            min={0}
                            max={252}
                            value={currentEv}
                            onChange={e => handleEvChange(stat, parseInt(e.target.value, 10) || 0)}
                            className="w-14 px-1.5 py-1 text-center font-mono rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 font-bold text-xs"
                          />
                        </div>

                        {/* IV input */}
                        <div className="col-span-2 flex items-center justify-center gap-1">
                          <span className="text-[10px] text-slate-400">IV:</span>
                          <input
                            type="number"
                            min={0}
                            max={31}
                            value={currentIv}
                            onChange={e => handleIvChange(stat, parseInt(e.target.value, 10) || 0)}
                            className="w-10 px-1 py-1 text-center font-mono rounded border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs"
                          />
                        </div>

                        {/* Computed Level 50 Value */}
                        <div className="col-span-3 text-right flex items-center justify-end gap-1.5">
                          <span className="text-[11px] text-slate-400">Lv50:</span>
                          <span
                            className={`font-mono text-sm font-bold tabular-nums px-2 py-0.5 rounded ${
                              isBoosted
                                ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400'
                                : isHindered
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-white'
                            }`}
                          >
                            {calcVal}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* IV Quick Controls */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
                  <span className="text-[11px] text-slate-400">Quick IVs:</span>
                  <button
                    type="button"
                    onClick={() => setIvs({ hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 })}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-600 dark:text-slate-300"
                  >
                    All 31 IVs
                  </button>
                  <button
                    type="button"
                    onClick={() => setIvs(prev => ({ ...prev, atk: 0 }))}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-600 dark:text-slate-300"
                  >
                    0 Atk (Anti-Foul Play)
                  </button>
                  <button
                    type="button"
                    onClick={() => setIvs(prev => ({ ...prev, spe: 0 }))}
                    className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 rounded text-slate-600 dark:text-slate-300"
                  >
                    0 Spe (Trick Room)
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOVESET */}
          {activeTab === 'moves' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Equipped Battle Moves (4 Max)
                  </h4>
                  <p className="text-xs text-slate-500">Pick from competitive moves or custom attacks</p>
                </div>
              </div>

              {/* 4 Selected Moves Slots */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[0, 1, 2, 3].map(slotIdx => {
                  const currentMove = moves[slotIdx];
                  return (
                    <div
                      key={slotIdx}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 space-y-2"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-slate-400">Move Slot #{slotIdx + 1}</span>
                        {currentMove && (
                          <button
                            type="button"
                            onClick={() => {
                              const updated = [...moves];
                              updated[slotIdx] = null;
                              setMoves(updated);
                            }}
                            className="text-slate-400 hover:text-rose-500"
                          >
                            Clear
                          </button>
                        )}
                      </div>

                      {currentMove ? (
                        <div className="space-y-1.5">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5 font-bold text-sm text-slate-900 dark:text-white">
                              {getMoveCategoryIcon(currentMove.category)}
                              <span>{currentMove.name}</span>
                            </div>
                            <TypeBadge type={currentMove.type} size="sm" />
                          </div>
                          <div className="flex items-center gap-3 text-xs text-slate-500 font-mono">
                            <span>PWR {currentMove.power || '—'}</span>
                            <span>ACC {currentMove.accuracy || 100}%</span>
                            <span>PP {currentMove.pp}</span>
                          </div>
                          <p className="text-[11px] text-slate-400 line-clamp-2">
                            {currentMove.description}
                          </p>
                        </div>
                      ) : (
                        <div className="p-3 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-700 rounded-lg">
                          No move selected. Pick from the pool below.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Move Pool to choose from */}
              <div className="pt-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">
                  Available Competitive Movepool
                </h5>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-56 overflow-y-auto pr-1">
                  {member.species.availableMoves.map(m => {
                    const isEquipped = moves.some(equipped => equipped?.id === m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          if (isEquipped) {
                            setMoves(moves.map(em => (em?.id === m.id ? null : em)));
                          } else {
                            // Find first empty slot or replace slot 0
                            const emptyIdx = moves.findIndex(em => em === null);
                            const targetIdx = emptyIdx !== -1 ? emptyIdx : 0;
                            const updated = [...moves];
                            updated[targetIdx] = m;
                            setMoves(updated);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all flex items-center justify-between gap-2 ${
                          isEquipped
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 border-indigo-500 text-indigo-900 dark:text-indigo-200'
                            : 'bg-white dark:bg-slate-800/80 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5 font-semibold truncate">
                            {getMoveCategoryIcon(m.category)}
                            <span className="truncate">{m.name}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono mt-0.5">
                            <span>PWR {m.power || '—'}</span>
                            <span>ACC {m.accuracy}%</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 shrink-0">
                          <TypeBadge type={m.type} size="sm" />
                          {isEquipped && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: HELD ITEM & ABILITY */}
          {activeTab === 'build' && (
            <div className="space-y-6">
              {/* Ability Selector */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2">
                <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Combat Ability
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {member.species.abilities.map(ab => {
                    const isSelected = ability.name === ab.name;
                    return (
                      <div
                        key={ab.name}
                        onClick={() => setAbility(ab)}
                        className={`p-3 rounded-xl border cursor-pointer transition-all ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950/50 border-indigo-500 ring-1 ring-indigo-500'
                            : 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700 hover:border-slate-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-sm text-slate-900 dark:text-white">
                            {ab.name}
                          </span>
                          {ab.isHidden && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-900/60 text-amber-700 dark:text-amber-300 font-medium">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          {ab.description}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Held Item Selector */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                      Competitive Held Item
                    </h4>
                    <p className="text-xs text-slate-500">Currently equipped: <strong className="text-indigo-600 dark:text-indigo-400">{item ? item.name : 'None'}</strong></p>
                  </div>
                  {item && (
                    <button
                      type="button"
                      onClick={() => setItem(null)}
                      className="text-xs text-rose-500 hover:underline"
                    >
                      Remove Item
                    </button>
                  )}
                </div>

                <input
                  type="text"
                  placeholder="Filter items (e.g. Sash, Band, Scarf, Specs, Booster, Vest)..."
                  value={itemSearch}
                  onChange={e => setItemSearch(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {filteredItems.map(it => {
                    const isSelected = item?.id === it.id;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => setItem(it)}
                        className={`p-2.5 rounded-lg border text-left text-xs transition-all ${
                          isSelected
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                            : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        <div className="font-bold truncate">{it.name}</div>
                        <div className={`text-[10px] line-clamp-2 mt-0.5 ${isSelected ? 'text-indigo-100' : 'text-slate-400'}`}>
                          {it.description}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500 dark:text-slate-400 truncate hidden sm:block">
            {nature.name} nature · {ability.name} · {item ? item.name : 'No Item'}
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
            >
              Apply to Lineup
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
