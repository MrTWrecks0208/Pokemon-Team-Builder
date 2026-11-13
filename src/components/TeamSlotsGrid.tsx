import React from 'react';
import { BattleFormat, TeamMember } from '../types/pokemon';
import { PokemonCard } from './PokemonCard';
import { Sparkles, RefreshCw } from 'lucide-react';

interface TeamSlotsGridProps {
  members: (TeamMember | null)[];
  battleFormat: BattleFormat;
  onSelectSlot: (slotIndex: number) => void;
  onEditMember: (member: TeamMember) => void;
  onRemoveMember: (slotIndex: number) => void;
  onDuplicateMember: (slotIndex: number) => void;
  onMoveSlot: (fromIndex: number, toIndex: number) => void;
  onClearTeam: () => void;
}

export const TeamSlotsGrid: React.FC<TeamSlotsGridProps> = ({
  members,
  battleFormat,
  onSelectSlot,
  onEditMember,
  onRemoveMember,
  onDuplicateMember,
  onMoveSlot,
  onClearTeam,
}) => {
  const activeCount = members.filter(m => m !== null).length;

  return (
    <section className="space-y-4">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
        <div>
          <h2 className="font-display font-bold text-lg text-slate-900 dark:text-white">
            Pokémon Champions Lineup
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Drag any slot to reorder your team. Click a card to customize its nature, ability, held item, and moveset.
          </p>
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={onClearTeam}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-lg transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Clear Roster</span>
          </button>
        )}
      </div>

      {/* 6 Slots Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member, index) => (
          <PokemonCard
            key={member ? member.id : `empty-slot-${index}`}
            member={member}
            slotIndex={index}
            battleFormat={battleFormat}
            onSelectSlot={onSelectSlot}
            onEditMember={onEditMember}
            onRemoveMember={onRemoveMember}
            onDuplicateMember={onDuplicateMember}
            onMoveSlot={onMoveSlot}
          />
        ))}
      </div>
    </section>
  );
};
