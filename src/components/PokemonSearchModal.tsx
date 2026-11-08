import React, { useState, useEffect, useMemo } from 'react';
import { PokemonSpecies, PokemonType } from '../types/pokemon';
import { PRESET_COMPETITIVE_POKEMON } from '../data/pokemonDatabase';
import { fetchPokemonFromPokeAPI, getPokemonNameIndex, PokemonIndexItem } from '../services/pokeapi';
import { ALL_POKEMON_TYPES } from '../data/types';
import { TypeBadge } from './TypeBadge';
import { Search, X, Loader2, Check } from 'lucide-react';

interface PokemonSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPokemon: (species: PokemonSpecies) => void;
  targetSlotIndex: number;
}

export const PokemonSearchModal: React.FC<PokemonSearchModalProps> = ({
  isOpen,
  onClose,
  onSelectPokemon,
  targetSlotIndex,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<PokemonType | 'all'>('all');
  const [nameIndex, setNameIndex] = useState<PokemonIndexItem[]>([]);
  const [loadingSelection, setLoadingSelection] = useState<string | null>(null);

  // Load index once on mount
  useEffect(() => {
    getPokemonNameIndex().then(list => {
      setNameIndex(list);
    });
  }, []);

  // Reset state when opening modal
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedType('all');
      setLoadingSelection(null);
    }
  }, [isOpen]);

  // Combined instant search results
  const searchResults = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();

    // 1. Filter presets
    let matchedPresets = PRESET_COMPETITIVE_POKEMON;
    if (selectedType !== 'all') {
      matchedPresets = matchedPresets.filter(p => p.types.includes(selectedType));
    }
    if (q) {
      matchedPresets = matchedPresets.filter(
        p =>
          p.name.toLowerCase().includes(q) ||
          p.displayName.toLowerCase().includes(q) ||
          p.id.toString() === q
      );
    }

    // If query is empty and selectedType is 'all', show preset roster
    if (!q && selectedType === 'all') {
      return { presets: matchedPresets, indexMatches: [] };
    }

    // 2. Filter broader name index for instant prefix/substring matches (e.g. "sab", "sabl")
    let extraMatches: PokemonIndexItem[] = [];
    if (q.length >= 1 && nameIndex.length > 0) {
      const existingIds = new Set(matchedPresets.map(p => p.id));
      extraMatches = nameIndex
        .filter(item => {
          if (existingIds.has(item.id)) return false;
          return item.name.includes(q) || item.displayName.toLowerCase().includes(q);
        })
        .slice(0, 15);
    }

    return { presets: matchedPresets, indexMatches: extraMatches };
  }, [searchQuery, selectedType, nameIndex]);

  // Handle clicking a Pokémon
  const handleSelect = async (pokeOrName: PokemonSpecies | PokemonIndexItem) => {
    if ('baseStats' in pokeOrName) {
      onSelectPokemon(pokeOrName);
      onClose();
      return;
    }

    // If selected from index, fetch full details from PokeAPI
    setLoadingSelection(pokeOrName.name);
    try {
      const full = await fetchPokemonFromPokeAPI(pokeOrName.name);
      if (full) {
        onSelectPokemon(full);
        onClose();
      }
    } finally {
      setLoadingSelection(null);
    }
  };

  if (!isOpen) return null;

  const totalResultsCount = searchResults.presets.length + searchResults.indexMatches.length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/75 backdrop-blur-xs">
      <div
        className="w-full max-w-md max-h-[88vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header - Clean, No Badges, No Fluff */}
        <div className="px-4 py-3 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
            Slot #{targetSlotIndex + 1}: Select Pokémon
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Compact Search Bar */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800 space-y-2.5 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search name (e.g. Sab, Garchomp, Char)..."
              className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Type Filter: 5 Columns Grid, No Horizontal Scrollbar */}
          <div className="grid grid-cols-5 gap-1">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`py-1 px-1 text-[11px] font-semibold rounded-md text-center transition-all truncate ${
                selectedType === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All
            </button>
            {ALL_POKEMON_TYPES.map(type => {
              const isSelected = selectedType === type;
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => setSelectedType(type)}
                  className={`py-1 px-0.5 text-[10px] font-bold uppercase rounded-md text-center transition-all truncate ${
                    isSelected
                      ? 'ring-2 ring-indigo-500 scale-[1.02] shadow-xs'
                      : 'opacity-85 hover:opacity-100'
                  }`}
                >
                  <TypeBadge type={type} size="sm" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Results List - Clean Single-Column Uniform Rows */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 max-h-[380px]">
          {/* Preset Matches (Full stats immediately available) */}
          {searchResults.presets.map(poke => (
            <button
              key={poke.id}
              type="button"
              onClick={() => handleSelect(poke)}
              className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-left flex items-center justify-between gap-3 transition-all group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 flex items-center justify-center shrink-0">
                  <img
                    src={poke.artworkUrl || poke.spriteUrl}
                    alt={poke.displayName}
                    className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                      {poke.displayName}
                    </span>
                    {/* Relevant combat stats: HP & Speed instead of tier */}
                    <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                      HP {poke.baseStats.hp} · Spe {poke.baseStats.spe}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    {poke.types.map(t => (
                      <TypeBadge key={t} type={t} size="sm" />
                    ))}
                  </div>
                </div>
              </div>

              <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 mr-1">
                Select
              </span>
            </button>
          ))}

          {/* Autocomplete Index Matches (Instant prefix matches e.g. "sab") */}
          {searchResults.indexMatches.map(item => {
            const isLoading = loadingSelection === item.name;
            const spriteUrl = `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${item.id}.png`;

            return (
              <button
                key={item.id}
                type="button"
                disabled={isLoading}
                onClick={() => handleSelect(item)}
                className="w-full p-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/80 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 text-left flex items-center justify-between gap-3 transition-all group"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-900 p-0.5 flex items-center justify-center shrink-0">
                    <img
                      src={spriteUrl}
                      alt={item.displayName}
                      className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-105 transition-transform"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-sm text-slate-900 dark:text-white truncate">
                        {item.displayName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        #{item.id}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="shrink-0 mr-1">
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-indigo-600 dark:text-indigo-400" />
                  ) : (
                    <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      Select
                    </span>
                  )}
                </div>
              </button>
            );
          })}

          {totalResultsCount === 0 && (
            <div className="py-8 text-center text-slate-500 dark:text-slate-400 text-xs">
              No Pokémon found matching "{searchQuery}".
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
