import React, { useState } from 'react';
import { BattleFormat, MoveCategory, TeamMember } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import {
  GripVertical,
  Sliders,
  Trash2,
  Copy,
  ChevronLeft,
  ChevronRight,
  Shield,
  Zap,
  Flame,
  Sparkles,
  Info
} from 'lucide-react';

interface PokemonCardProps {
  member: TeamMember | null;
  slotIndex: number;
  battleFormat: BattleFormat;
  onSelectSlot: (slotIndex: number) => void;
  onEditMember: (member: TeamMember) => void;
  onRemoveMember: (slotIndex: number) => void;
  onDuplicateMember: (slotIndex: number) => void;
  onMoveSlot: (fromIndex: number, toIndex: number) => void;
  isDragOver?: boolean;
}

export const PokemonCard: React.FC<PokemonCardProps> = ({
  member,
  slotIndex,
  battleFormat,
  onSelectSlot,
  onEditMember,
  onRemoveMember,
  onDuplicateMember,
  onMoveSlot,
  isDragOver = false,
}) => {
  const [imgError, setImgError] = useState(false);

  // Slot role labels based on battle format
  const getSlotRole = (index: number, format: BattleFormat): string => {
    if (format === 'doubles') {
      if (index === 0) return 'Lead Duo 1';
      if (index === 1) return 'Lead Duo 2';
      if (index === 2) return 'Core Pivot';
      if (index === 3) return 'Support / Tech';
      if (index === 4) return 'Late Anchor';
      return 'Flex Closer';
    }
    // Singles
    if (index === 0) return 'Primary Lead';
    if (index === 1) return 'Physical Breaker';
    if (index === 2) return 'Special Sweeper';
    if (index === 3) return 'Defensive Wall';
    if (index === 4) return 'Speed Pivot';
    return 'Endgame Sweeper';
  };

  const slotRole = getSlotRole(slotIndex, battleFormat);

  const getMoveCategoryIcon = (category: MoveCategory) => {
    switch (category) {
      case 'physical':
        return <span title="Physical Attack" className="text-orange-500 font-bold text-xs">💥</span>;
      case 'special':
        return <span title="Special Attack" className="text-indigo-400 font-bold text-xs">🔮</span>;
      case 'status':
        return <span title="Status Move" className="text-emerald-500 font-bold text-xs">🛡️</span>;
    }
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData('text/plain', slotIndex.toString());
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const fromIndex = parseInt(e.dataTransfer.getData('text/plain'), 10);
    if (!isNaN(fromIndex) && fromIndex !== slotIndex) {
      onMoveSlot(fromIndex, slotIndex);
    }
  };

  // Empty Slot Card
  if (!member) {
    return (
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => onSelectSlot(slotIndex)}
        className={`group relative rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col items-center justify-center min-h-[360px] p-6 text-center select-none ${
          isDragOver
            ? 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/20 scale-[1.01]'
            : 'border-slate-300 dark:border-slate-800 hover:border-indigo-400 dark:hover:border-indigo-600 bg-white/40 dark:bg-slate-900/40 hover:bg-slate-50 dark:hover:bg-slate-900/70'
        }`}
      >
        <div className="absolute top-3 left-3 text-[11px] font-semibold text-slate-400 dark:text-slate-500">
          Slot {slotIndex + 1} · {slotRole}
        </div>

        <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 group-hover:bg-indigo-50 dark:group-hover:bg-indigo-950/60 text-slate-400 dark:text-slate-500 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 flex items-center justify-center transition-all mb-3 text-2xl font-light">
          +
        </div>

        <span className="font-display font-semibold text-sm text-slate-700 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
          Add Pokémon
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 max-w-[180px]">
          Click to search PokéAPI or select meta picks
        </span>
      </div>
    );
  }

  const { species, nature, ability, item, moves, calculatedStats, powerRating } = member;

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      className={`group relative rounded-2xl border transition-all flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
        isDragOver
          ? 'border-indigo-500 ring-2 ring-indigo-400/50'
          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700'
      }`}
    >
      {/* Top Bar with Slot Info, Role, & Controls */}
      <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 bg-slate-50/70 dark:bg-slate-900/70 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="cursor-grab active:cursor-grabbing text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-0.5 rounded"
            title="Drag to reorder slot"
          >
            <GripVertical className="w-3.5 h-3.5" />
          </button>
          <span className="font-semibold text-slate-700 dark:text-slate-300">
            #{slotIndex + 1}
          </span>
          <span aria-hidden="true" className="text-slate-300 dark:text-slate-700">·</span>
          <span className="font-medium text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[90px] sm:max-w-[120px]">
            {slotRole}
          </span>
        </div>

        {/* Quick Position Shifts for Mobile / Easy Click */}
        <div className="flex items-center gap-1">
          {slotIndex > 0 && (
            <button
              type="button"
              onClick={() => onMoveSlot(slotIndex, slotIndex - 1)}
              title="Move Left"
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <ChevronLeft className="w-3 h-3" />
            </button>
          )}
          {slotIndex < 5 && (
            <button
              type="button"
              onClick={() => onMoveSlot(slotIndex, slotIndex + 1)}
              title="Move Right"
              className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
            >
              <ChevronRight className="w-3 h-3" />
            </button>
          )}
          <button
            type="button"
            onClick={() => onDuplicateMember(slotIndex)}
            title="Duplicate to next empty slot"
            className="p-1 hover:bg-slate-200 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <Copy className="w-3 h-3" />
          </button>
          <button
            type="button"
            onClick={() => onRemoveMember(slotIndex)}
            title="Remove from squad"
            className="p-1 hover:bg-rose-100 dark:hover:bg-rose-950/60 rounded text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-3">
        {/* Header: Sprite, Species Name, Types, Power Index */}
        <div className="flex items-start gap-3">
          <div className="relative w-16 h-16 shrink-0 bg-slate-100 dark:bg-slate-800/80 rounded-xl p-1 flex items-center justify-center border border-slate-200/60 dark:border-slate-800 overflow-hidden">
            {!imgError ? (
              <img
                src={species.artworkUrl || species.spriteUrl}
                alt={species.displayName}
                className="w-full h-full object-contain filter drop-shadow-sm transition-transform group-hover:scale-105"
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="text-xl font-bold text-slate-400">⚡</div>
            )}
            <span className="absolute bottom-0.5 right-1 text-[9px] font-mono text-slate-400 font-semibold">
              Lv50
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white truncate">
                {species.displayName}
              </h3>
              {/* Power Rating Badge */}
              <div
                title="Combat Power Score"
                className="shrink-0 px-2 py-0.5 rounded-md text-[11px] font-bold font-mono tracking-tight bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400 border border-slate-200 dark:border-slate-700"
              >
                {powerRating} <span className="text-[9px] font-sans font-normal text-slate-400">PWR</span>
              </div>
            </div>

            {/* Types */}
            <div className="flex items-center gap-1.5 mt-1">
              {species.types.map(t => (
                <TypeBadge key={t} type={t} size="sm" />
              ))}
            </div>

            {/* Held Item & Ability */}
            <div className="flex flex-col gap-0.5 mt-2 text-[11px] text-slate-600 dark:text-slate-400">
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0">Item:</span>
                <span className="truncate font-semibold text-slate-700 dark:text-slate-200">
                  {item ? item.name : 'None'}
                </span>
              </div>
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0">Ability:</span>
                <span className="truncate text-slate-700 dark:text-slate-200">
                  {ability.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Moves Grid */}
        <div className="space-y-1 bg-slate-50 dark:bg-slate-950/40 p-2 rounded-xl border border-slate-100 dark:border-slate-800/60">
          <div className="text-[10px] uppercase font-semibold tracking-wider text-slate-400 dark:text-slate-500 px-1 flex items-center justify-between">
            <span>Moveset</span>
            <span className="text-[9px] font-normal lowercase">{nature.name} nature</span>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {moves.map((move, idx) => (
              <div
                key={idx}
                className="px-2 py-1 bg-white dark:bg-slate-800/90 rounded-md border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-1 text-[11px] min-h-[26px]"
              >
                {move ? (
                  <>
                    <div className="flex items-center gap-1 truncate">
                      {getMoveCategoryIcon(move.category)}
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {move.name}
                      </span>
                    </div>
                    <TypeBadge type={move.type} size="sm" className="scale-80 origin-right" />
                  </>
                ) : (
                  <span className="text-slate-400 italic text-[10px]">Empty Slot</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Calculated Stats Ribbon */}
        <div className="grid grid-cols-6 gap-1 bg-slate-100/70 dark:bg-slate-800/40 p-1.5 rounded-lg text-center font-mono text-[10px]">
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-sans">HP</div>
            <div className="font-bold text-slate-700 dark:text-slate-200 tabular-nums">{calculatedStats.hp}</div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-sans">ATK</div>
            <div className={`font-bold tabular-nums ${nature.increasedStat === 'atk' ? 'text-rose-500' : nature.decreasedStat === 'atk' ? 'text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {calculatedStats.atk}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-sans">DEF</div>
            <div className={`font-bold tabular-nums ${nature.increasedStat === 'def' ? 'text-rose-500' : nature.decreasedStat === 'def' ? 'text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {calculatedStats.def}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-sans">SPA</div>
            <div className={`font-bold tabular-nums ${nature.increasedStat === 'spa' ? 'text-rose-500' : nature.decreasedStat === 'spa' ? 'text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {calculatedStats.spa}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-sans">SPD</div>
            <div className={`font-bold tabular-nums ${nature.increasedStat === 'spd' ? 'text-rose-500' : nature.decreasedStat === 'spd' ? 'text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {calculatedStats.spd}
            </div>
          </div>
          <div>
            <div className="text-[9px] text-slate-400 uppercase font-sans">SPE</div>
            <div className={`font-bold tabular-nums ${nature.increasedStat === 'spe' ? 'text-rose-500' : nature.decreasedStat === 'spe' ? 'text-blue-400' : 'text-slate-700 dark:text-slate-200'}`}>
              {calculatedStats.spe}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom CTA: Customize / Tune */}
      <div className="px-3 py-2 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between gap-2">
        <span className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
          SP: {member.evs.hp}/{member.evs.atk}/{member.evs.def}/{member.evs.spa}/{member.evs.spd}/{member.evs.spe}
        </span>
        <button
          type="button"
          onClick={() => onEditMember(member)}
          className="flex items-center gap-1 px-3 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-colors whitespace-nowrap"
        >
          <Sliders className="w-3.5 h-3.5" />
          <span>Customize</span>
        </button>
      </div>
    </div>
  );
};
