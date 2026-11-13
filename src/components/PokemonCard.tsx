import React, { useState } from 'react';
import { BattleFormat, MoveCategory, TeamMember } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import { MoveCategoryIcon } from './MoveCategoryIcon';
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
          Slot #{slotIndex + 1}
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
      {/* Top Bar with Slot Info & Controls */}
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
            Slot #{slotIndex + 1}
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

            {/* Held Item, Ability & Nature */}
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
              <div className="flex items-center gap-1.5 truncate">
                <span className="text-slate-400 dark:text-slate-500 font-medium shrink-0">Nature:</span>
                <span className="truncate font-semibold text-slate-700 dark:text-slate-200">
                  {nature.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Dual-Column Container: Attributes on Left, Moveset on Right */}
        <div className="bg-slate-50 dark:bg-slate-950/40 p-3 rounded-xl border border-slate-100 dark:border-slate-800/60 grid grid-cols-[145px_1fr] gap-3.5">
          {/* Left Column: Attributes & Points */}
          <div className="flex flex-col">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
              Attributes
            </div>
            <div className="flex flex-col gap-1.5 pt-2">
              {[
                { label: 'HP', val: calculatedStats.hp, sp: member.evs.hp },
                { label: 'Atk', val: calculatedStats.atk, sp: member.evs.atk, isUp: nature.increasedStat === 'atk', isDown: nature.decreasedStat === 'atk' },
                { label: 'Def', val: calculatedStats.def, sp: member.evs.def, isUp: nature.increasedStat === 'def', isDown: nature.decreasedStat === 'def' },
                { label: 'Sp. Atk', val: calculatedStats.spa, sp: member.evs.spa, isUp: nature.increasedStat === 'spa', isDown: nature.decreasedStat === 'spa' },
                { label: 'Sp. Def', val: calculatedStats.spd, sp: member.evs.spd, isUp: nature.increasedStat === 'spd', isDown: nature.decreasedStat === 'spd' },
                { label: 'Speed', val: calculatedStats.spe, sp: member.evs.spe, isUp: nature.increasedStat === 'spe', isDown: nature.decreasedStat === 'spe' },
              ].map(stat => (
                <div
                  key={stat.label}
                  title={
                    stat.isUp
                      ? `Nature boost (+10% from ${nature.name})`
                      : stat.isDown
                      ? `Nature reduction (-10% from ${nature.name})`
                      : undefined
                  }
                  className={`flex items-center justify-between px-2 py-1 rounded-lg text-xs transition-colors ${
                    stat.isUp
                      ? 'bg-rose-50/90 dark:bg-rose-950/40 border border-rose-200/90 dark:border-rose-900/60'
                      : stat.isDown
                      ? 'bg-blue-50/90 dark:bg-blue-950/40 border border-blue-200/90 dark:border-blue-900/60'
                      : 'bg-white dark:bg-slate-800/90 border border-slate-200/70 dark:border-slate-700/60'
                  }`}
                >
                  <div className="flex items-center gap-1">
                    <span className="font-semibold text-slate-700 dark:text-slate-200 text-xs">
                      {stat.label}
                    </span>
                    {stat.isUp && (
                      <span className="text-[9px] font-black text-rose-500 leading-none" title="Nature +10%">▲</span>
                    )}
                    {stat.isDown && (
                      <span className="text-[9px] font-black text-blue-500 leading-none" title="Nature -10%">▼</span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 font-mono text-xs">
                    {stat.sp > 0 && (
                      <span className="text-[10px] text-indigo-500 dark:text-indigo-400 font-bold" title={`Stat Points: +${stat.sp}`}>
                        +{stat.sp}
                      </span>
                    )}
                    <span
                      className={`font-bold tabular-nums text-xs ${
                        stat.isUp
                          ? 'text-rose-600 dark:text-rose-400'
                          : stat.isDown
                          ? 'text-blue-600 dark:text-blue-400'
                          : 'text-slate-800 dark:text-slate-100'
                      }`}
                    >
                      {stat.val}
                    </span>
                  </div>
                </div>
              ))}

              {/* Red / Blue Nature Legend */}
              <div className="pt-1.5 mt-0.5 flex items-center justify-between text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-800/60 px-1">
                <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-semibold" title="Red: Nature boosts this stat by +10%">
                  ▲ +10%
                </span>
                <span className="text-slate-300 dark:text-slate-600">·</span>
                <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400 font-semibold" title="Blue: Nature reduces this stat by -10%">
                  ▼ -10%
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Move set (1 column of four, 4 down with clean uniform spacing) */}
          <div className="flex flex-col">
            <div className="text-[10px] uppercase font-bold tracking-wider text-slate-500 dark:text-slate-400 pb-1.5 border-b border-slate-200/60 dark:border-slate-800/60">
              Moveset
            </div>
            <div className="grid grid-rows-4 gap-2 pt-2 flex-1">
              {moves.map((move, idx) => (
                <div
                  key={idx}
                  className="px-2.5 py-2 bg-white dark:bg-slate-800/90 rounded-lg border border-slate-200/70 dark:border-slate-700/60 flex items-center justify-between gap-2 text-xs shadow-2xs"
                >
                  {move ? (
                    <>
                      <div className="flex items-center gap-2 truncate min-w-0">
                        <MoveCategoryIcon category={move.category} size="sm" />
                        <span className="truncate font-medium text-slate-800 dark:text-slate-200 text-xs">
                          {move.name}
                        </span>
                      </div>
                      <TypeBadge type={move.type} size="sm" className="shrink-0" />
                    </>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Empty Slot {idx + 1}</span>
                  )}
                </div>
              ))}
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
