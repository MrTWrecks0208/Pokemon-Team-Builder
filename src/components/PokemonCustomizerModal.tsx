import React, { useState, useMemo } from 'react';
import {
  Ability,
  HeldItem,
  Move,
  MoveCategory,
  Nature,
  PokemonSpecies,
  StatName,
  StatSpread,
  TeamMember,
} from '../types/pokemon';
import {
  NATURE_ALIGNMENT_TABLE,
  NATURE_MAP,
  NATURES,
  STAT_ALIGNMENT_COL_HEADERS,
  STAT_ALIGNMENT_ROW_HEADERS,
} from '../data/natures';
import { COMPETITIVE_ITEMS } from '../data/items';
import { calculateAllStats, calculatePokemonPowerRating } from '../utils/statCalculators';
import { TypeBadge } from './TypeBadge';
import {
  X,
  SlidersHorizontal,
  Swords,
  Shield,
  Search,
  Check,
  ChevronDown,
  RotateCcw,
  Sparkles,
  Info,
} from 'lucide-react';

interface PokemonCustomizerModalProps {
  member: TeamMember | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedMember: TeamMember) => void;
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
  
  // In Pokémon Champions: 66 total Stat Points budget, max 32 per stat
  const [statPoints, setStatPoints] = useState<StatSpread>(() => {
    // If incoming member has old 252 EV spread, scale it down to Champions (max 32 per stat)
    const raw = member.evs || { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
    return {
      hp: Math.min(32, raw.hp > 32 ? Math.round(raw.hp / 8) : raw.hp),
      atk: Math.min(32, raw.atk > 32 ? Math.round(raw.atk / 8) : raw.atk),
      def: Math.min(32, raw.def > 32 ? Math.round(raw.def / 8) : raw.def),
      spa: Math.min(32, raw.spa > 32 ? Math.round(raw.spa / 8) : raw.spa),
      spd: Math.min(32, raw.spd > 32 ? Math.round(raw.spd / 8) : raw.spd),
      spe: Math.min(32, raw.spe > 32 ? Math.round(raw.spe / 8) : raw.spe),
    };
  });

  const [role, setRole] = useState(member.role || 'Competitor');
  const [itemSearch, setItemSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'stats' | 'moves' | 'build'>('stats');

  // Total Stat Points used in Pokémon Champions (Budget: 66 points)
  const totalPoints = useMemo(() => {
    return (
      (statPoints.hp || 0) +
      (statPoints.atk || 0) +
      (statPoints.def || 0) +
      (statPoints.spa || 0) +
      (statPoints.spd || 0) +
      (statPoints.spe || 0)
    );
  }, [statPoints]);

  const remainingPoints = 66 - totalPoints;

  // Real-time calculated Level 50 stats with Champions formula (fixed 31 IVs + stat points)
  const calculatedStats = useMemo(() => {
    return calculateAllStats(member.species, statPoints, nature);
  }, [member.species, statPoints, nature]);

  // Real-time power rating
  const powerRating = useMemo(() => {
    return calculatePokemonPowerRating(calculatedStats, member.species, moves, item, nature);
  }, [calculatedStats, member.species, moves, item, nature]);

  // Handle stat point change (0 - 32 per stat, 66 max total)
  const handleStatPointChange = (stat: StatName, val: number) => {
    const targetVal = isNaN(val) ? 0 : Math.max(0, Math.min(32, val));
    const currentWithoutStat = totalPoints - (statPoints[stat] || 0);
    const maxAllowed = Math.min(32, 66 - currentWithoutStat);
    const finalVal = Math.min(targetVal, maxAllowed);
    setStatPoints(prev => ({ ...prev, [stat]: Math.max(0, finalVal) }));
  };

  // Quick Presets tailored to Champions 66-point budget
  const applyChampionsPreset = (
    presetType: 'physSweeper' | 'specSweeper' | 'tankPhys' | 'tankSpec' | 'bulkyMixed' | 'reset'
  ) => {
    switch (presetType) {
      case 'physSweeper':
        setStatPoints({ hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 });
        break;
      case 'specSweeper':
        setStatPoints({ hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 });
        break;
      case 'tankPhys':
        setStatPoints({ hp: 32, atk: 2, def: 32, spa: 0, spd: 0, spe: 0 });
        break;
      case 'tankSpec':
        setStatPoints({ hp: 32, atk: 0, def: 0, spa: 2, spd: 32, spe: 0 });
        break;
      case 'bulkyMixed':
        setStatPoints({ hp: 22, atk: 0, def: 22, spa: 0, spd: 22, spe: 0 });
        break;
      case 'reset':
        setStatPoints({ hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 });
        break;
    }
  };

  // Filtered held items
  const filteredItems = useMemo(() => {
    if (!itemSearch.trim()) return COMPETITIVE_ITEMS;
    return COMPETITIVE_ITEMS.filter(
      i =>
        i.name.toLowerCase().includes(itemSearch.toLowerCase()) ||
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
      evs: statPoints,
      ivs: { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 },
      role,
      calculatedStats,
      powerRating,
    });
    onClose();
  };

  const getMoveCategoryIcon = (category: MoveCategory) => {
    switch (category) {
      case 'physical':
        return <span title="Physical">💥</span>;
      case 'special':
        return <span title="Special">🔮</span>;
      case 'status':
        return <span title="Status">🛡️</span>;
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
                Slot #{member.slotIndex + 1} · Pokémon Champions Standard (Level 50)
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
            <span>Stat Alignments &amp; Points</span>
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
        {/* Tab Contents */}
        <div className="p-5 flex-1 overflow-y-auto space-y-6">
          {/* TAB 1: STATS & NATURE MATRIX */}
          {activeTab === 'stats' && (
            <div className="space-y-6">
              {/* STAT ALIGNMENT MATRIX (NATURES) - NO GRID LINES, EQUAL COLUMNS, DE-CONTAINERIZED */}
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                      Stat Alignment Matrix (Natures)
                    </h3>
                    <p className="text-xs text-slate-500">
                      Row boosts stat (+10%), column lowers stat (-10%). Click any alignment to select.
                    </p>
                  </div>
                  <div className="text-xs font-medium px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                    <span className="text-slate-400 mr-1.5">Selected:</span>
                    <strong className="text-indigo-600 dark:text-indigo-400 font-bold">{nature.name}</strong>
                    {nature.increasedStat && nature.decreasedStat && (
                      <span className="ml-1 text-[11px] text-slate-500">
                        (<span className="text-rose-500 font-bold">+{STAT_LABELS[nature.increasedStat]}</span> /{' '}
                        <span className="text-blue-500 font-bold">-{STAT_LABELS[nature.decreasedStat]}</span>)
                      </span>
                    )}
                    {(!nature.increasedStat || nature.increasedStat === nature.decreasedStat) && (
                      <span className="ml-1 text-[11px] text-slate-400">(Neutral)</span>
                    )}
                  </div>
                </div>

                {/* Equal 6-column borderless matrix with shortened labels and zero grid lines */}
                <div className="grid grid-cols-6 gap-1.5 max-w-2xl">
                  {/* Header Row */}
                  <div className="h-6 flex items-center justify-end pr-2 text-[10px] font-mono text-slate-400">
                    +\−
                  </div>
                  {STAT_ALIGNMENT_COL_HEADERS.map((colName, colIdx) => (
                    <div
                      key={colIdx}
                      className="h-6 flex items-center justify-center text-xs font-bold text-blue-600 dark:text-blue-400 text-center truncate"
                    >
                      {colName}
                    </div>
                  ))}

                  {/* 5 Rows */}
                  {NATURE_ALIGNMENT_TABLE.map((row, rowIdx) => (
                    <React.Fragment key={rowIdx}>
                      {/* Left Row Header */}
                      <div className="h-8 flex items-center justify-end pr-2 text-xs font-bold text-rose-600 dark:text-rose-400 whitespace-nowrap">
                        {STAT_ALIGNMENT_ROW_HEADERS[rowIdx]}
                      </div>

                      {/* 5 Nature Buttons */}
                      {row.map((natureName, colIdx) => {
                        if (!natureName) {
                          return <div key={colIdx} className="h-8" />;
                        }

                        const isSelected = nature.name.toLowerCase() === natureName.toLowerCase();
                        const natObj =
                          NATURE_MAP[natureName.toLowerCase()] ||
                          ({ name: natureName, increasedStat: null, decreasedStat: null } as Nature);

                        return (
                          <button
                            key={colIdx}
                            type="button"
                            onClick={() => setNature(natObj)}
                            className={`h-8 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1 ${
                              isSelected
                                ? 'bg-indigo-600 text-white shadow-xs font-bold ring-2 ring-indigo-400'
                                : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200'
                            }`}
                          >
                            <span>{natureName}</span>
                            {isSelected && <Check className="w-3 h-3 shrink-0" />}
                          </button>
                        );
                      })}
                    </React.Fragment>
                  ))}
                </div>
              </div>

              {/* STAT POINTS ALLOCATION (CHAMPIONS 66-POINT BUDGET) - DE-CONTAINERIZED */}
              <div className="space-y-3 pt-3 border-t border-slate-200 dark:border-slate-800">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                        Stat Points (66 Points Budget)
                      </h4>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 font-mono">
                        Max 32 / Stat · Fixed 31 IVs
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Each Stat Point directly adds +1 point to Level 50 stats.
                    </p>
                  </div>

                  {/* Points remaining indicator */}
                  <div
                    className={`px-3 py-1 rounded-lg font-mono font-bold text-xs flex items-center gap-2 ${
                      remainingPoints === 0
                        ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300'
                        : remainingPoints > 0
                        ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300'
                        : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300'
                    }`}
                  >
                    <span>Remaining:</span>
                    <span className="text-sm">{remainingPoints}</span>
                    <span className="text-slate-400">/ 66 pts</span>
                  </div>
                </div>

                {/* Quick Presets */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="text-[11px] text-slate-400 font-medium">Quick Spreads:</span>
                  <button
                    type="button"
                    onClick={() => applyChampionsPreset('physSweeper')}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    Phys Sweeper (32 Atk / 32 Spe / 2 HP)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyChampionsPreset('specSweeper')}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    Spec Sweeper (32 SpA / 32 Spe / 2 HP)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyChampionsPreset('tankPhys')}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    Phys Tank (32 HP / 32 Def / 2 Atk)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyChampionsPreset('tankSpec')}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    Spec Tank (32 HP / 32 SpD / 2 SpA)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyChampionsPreset('bulkyMixed')}
                    className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg text-slate-700 dark:text-slate-300 text-xs font-medium transition-colors"
                  >
                    Bulky Mixed (22 HP / 22 Def / 22 SpD)
                  </button>
                  <button
                    type="button"
                    onClick={() => applyChampionsPreset('reset')}
                    className="px-2.5 py-1 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg text-xs font-medium transition-colors"
                  >
                    Reset (0)
                  </button>
                </div>

                {/* 6 Clean Stat Allocation Rows (Borderless) */}
                <div className="space-y-1.5 pt-1">
                  {(['hp', 'atk', 'def', 'spa', 'spd', 'spe'] as StatName[]).map(stat => {
                    const base = member.species.baseStats[stat];
                    const currentPoints = statPoints[stat] || 0;
                    const calcVal = calculatedStats[stat];
                    const isBoosted = nature.increasedStat === stat;
                    const isHindered = nature.decreasedStat === stat;

                    return (
                      <div
                        key={stat}
                        className="py-1 px-2 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800/40 grid grid-cols-12 items-center gap-3 text-xs"
                      >
                        {/* Stat Name & Base */}
                        <div className="col-span-3 flex items-center justify-between pr-2">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-900 dark:text-white uppercase font-sans">
                              {STAT_LABELS[stat]}
                            </span>
                            {isBoosted && (
                              <span className="text-[10px] font-bold text-rose-600 dark:text-rose-400">
                                +10%
                              </span>
                            )}
                            {isHindered && (
                              <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
                                -10%
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">Base {base}</span>
                        </div>

                        {/* Point controls: [0] [-] Slider [+] [32] */}
                        <div className="col-span-6 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleStatPointChange(stat, 0)}
                            className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-center"
                            title="Set to 0"
                          >
                            0
                          </button>
                          <button
                            type="button"
                            disabled={currentPoints <= 0}
                            onClick={() => handleStatPointChange(stat, currentPoints - 1)}
                            className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center justify-center"
                          >
                            -
                          </button>
                          <input
                            type="range"
                            min={0}
                            max={32}
                            step={1}
                            value={currentPoints}
                            onChange={e => handleStatPointChange(stat, parseInt(e.target.value, 10))}
                            className="flex-1 accent-indigo-600 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg cursor-pointer"
                          />
                          <button
                            type="button"
                            disabled={currentPoints >= 32 || remainingPoints <= 0}
                            onClick={() => handleStatPointChange(stat, currentPoints + 1)}
                            className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-bold text-xs text-slate-700 dark:text-slate-300 disabled:opacity-40 flex items-center justify-center"
                          >
                            +
                          </button>
                          <button
                            type="button"
                            onClick={() => handleStatPointChange(stat, currentPoints + remainingPoints)}
                            className="w-6 h-6 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 font-mono text-[10px] text-slate-600 dark:text-slate-400 flex items-center justify-center"
                            title="Invest Maximum Remaining"
                          >
                            32
                          </button>

                          {/* Numeric input box */}
                          <input
                            type="number"
                            min={0}
                            max={32}
                            value={currentPoints}
                            onChange={e => handleStatPointChange(stat, parseInt(e.target.value, 10) || 0)}
                            className="w-12 px-1 py-0.5 text-center font-mono rounded border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 font-bold text-xs"
                          />
                        </div>

                        {/* Calculated Final Stat at Level 50 */}
                        <div className="col-span-3 text-right">
                          <span className="text-[11px] text-slate-400 mr-2 font-mono">Lv50:</span>
                          <span
                            className={`font-mono text-sm font-bold tabular-nums ${
                              isBoosted
                                ? 'text-rose-600 dark:text-rose-400'
                                : isHindered
                                ? 'text-blue-600 dark:text-blue-400'
                                : 'text-slate-900 dark:text-white'
                            }`}
                          >
                            {calcVal}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: MOVES */}
          {activeTab === 'moves' && (
            <div className="space-y-6">
              {/* Selected 4 Moves */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Equipped Battle Moves (4 Slots)
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[0, 1, 2, 3].map(slotIdx => {
                    const currentMove = moves[slotIdx];
                    return (
                      <div
                        key={slotIdx}
                        className={`p-3 rounded-xl border flex items-center justify-between gap-3 ${
                          currentMove
                            ? 'bg-slate-50 dark:bg-slate-800/60 border-slate-200 dark:border-slate-700'
                            : 'bg-dashed border-slate-300 dark:border-slate-700 text-slate-400'
                        }`}
                      >
                        {currentMove ? (
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <TypeBadge type={currentMove.type} size="sm" />
                              <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                                {currentMove.name}
                              </span>
                              <span className="text-xs">{getMoveCategoryIcon(currentMove.category)}</span>
                            </div>
                            <div className="flex items-center gap-3 text-[11px] text-slate-500 mt-1">
                              <span>Power: {currentMove.power || '—'}</span>
                              <span>Acc: {currentMove.accuracy ? `${currentMove.accuracy}%` : '—'}</span>
                              <span>PP: {currentMove.pp}</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs italic text-slate-400">Empty Move Slot {slotIdx + 1}</span>
                        )}

                        {currentMove && (
                          <button
                            type="button"
                            onClick={() => {
                              const next = [...moves];
                              next[slotIdx] = null;
                              setMoves(next);
                            }}
                            className="p-1 rounded text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Movepool Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Available Movepool
                  </label>
                  <span className="text-xs text-slate-400">
                    Click to equip into next available slot
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {member.species.availableMoves.map(m => {
                    const isEquipped = moves.some(equipped => equipped?.id === m.id);
                    return (
                      <button
                        key={m.id}
                        type="button"
                        disabled={isEquipped}
                        onClick={() => {
                          const emptyIdx = moves.findIndex(slot => slot === null);
                          if (emptyIdx !== -1) {
                            const next = [...moves];
                            next[emptyIdx] = m;
                            setMoves(next);
                          }
                        }}
                        className={`p-2.5 rounded-lg border text-left flex items-start justify-between gap-2 transition-all ${
                          isEquipped
                            ? 'opacity-40 bg-slate-100 dark:bg-slate-800 border-slate-200 dark:border-slate-700'
                            : 'bg-white dark:bg-slate-800 hover:border-indigo-500 border-slate-200 dark:border-slate-700 shadow-2xs'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <TypeBadge type={m.type} size="sm" />
                            <span className="font-semibold text-xs text-slate-900 dark:text-white">
                              {m.name}
                            </span>
                            <span className="text-xs">{getMoveCategoryIcon(m.category)}</span>
                          </div>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-0.5">
                            {m.description}
                          </p>
                        </div>
                        <div className="text-right shrink-0 text-[11px] text-slate-400 font-mono">
                          <div>{m.power ? `${m.power} BP` : 'Status'}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: ITEM & ABILITY */}
          {activeTab === 'build' && (
            <div className="space-y-6">
              {/* Abilities */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Ability Selection
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {member.species.abilities.map(ab => {
                    const isSelected = ability.name === ab.name;
                    return (
                      <button
                        key={ab.name}
                        type="button"
                        onClick={() => setAbility(ab)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50/60 dark:bg-indigo-950/40 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-bold text-xs text-slate-900 dark:text-white">
                            {ab.name}
                          </span>
                          {ab.isHidden && (
                            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300">
                              Hidden
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">
                          {ab.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Held Item */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                    Held Item
                  </label>
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

                {/* Search */}
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type="text"
                    value={itemSearch}
                    onChange={e => setItemSearch(e.target.value)}
                    placeholder="Search competitive items (e.g. Life Orb, Choice Scarf, Assault Vest)..."
                    className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Items Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 max-h-56 overflow-y-auto pr-1">
                  {filteredItems.map(it => {
                    const isSelected = item?.id === it.id;
                    return (
                      <button
                        key={it.id}
                        type="button"
                        onClick={() => setItem(it)}
                        className={`p-2.5 rounded-xl border text-left transition-all ${
                          isSelected
                            ? 'border-indigo-600 bg-indigo-50 dark:bg-indigo-950/50 shadow-xs'
                            : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-indigo-400'
                        }`}
                      >
                        <div className="font-bold text-xs text-slate-900 dark:text-white flex items-center justify-between">
                          <span>{it.name}</span>
                          <span className="text-[10px] uppercase font-mono text-slate-400 font-normal">
                            {it.category}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 mt-0.5">
                          {it.description}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Role Tag Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                  Squad Role Tag
                </label>
                <input
                  type="text"
                  value={role}
                  onChange={e => setRole(e.target.value)}
                  placeholder="e.g. Physical Wallbreaker, Tailwind Setter, Rain Sweeper"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer Ribbon with Save Action */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 flex items-center justify-between gap-3">
          <div className="text-xs text-slate-500">
            {remainingPoints > 0 ? (
              <span className="text-amber-600 dark:text-amber-400 font-medium">
                Tip: You have {remainingPoints} unused Stat Points
              </span>
            ) : remainingPoints === 0 ? (
              <span className="text-emerald-600 dark:text-emerald-400 font-medium">
                ✓ All 66 Stat Points allocated
              </span>
            ) : (
              <span className="text-rose-600 font-bold">
                ⚠️ Over budget by {Math.abs(remainingPoints)} points!
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>Apply Build</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
