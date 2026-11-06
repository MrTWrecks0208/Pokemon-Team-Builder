import React, { useState, useEffect, useMemo } from 'react';
import { PokemonSpecies, PokemonType } from '../types/pokemon';
import { PRESET_COMPETITIVE_POKEMON } from '../data/pokemonDatabase';
import { fetchPokemonFromPokeAPI } from '../services/pokeapi';
import { ALL_POKEMON_TYPES } from '../data/types';
import { TypeBadge } from './TypeBadge';
import { Search, X, Loader2, Sparkles, Filter } from 'lucide-react';

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
  const [isLoadingApi, setIsLoadingApi] = useState(false);
  const [apiResult, setApiResult] = useState<PokemonSpecies | null>(null);
  const [apiSearched, setApiSearched] = useState(false);

  // Filter local presets
  const filteredPresets = useMemo(() => {
    let list = PRESET_COMPETITIVE_POKEMON;

    if (selectedType !== 'all') {
      list = list.filter(p => p.types.includes(selectedType));
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        p => p.displayName.toLowerCase().includes(q) ||
             p.name.toLowerCase().includes(q) ||
             p.id.toString() === q
      );
    }

    return list;
  }, [searchQuery, selectedType]);

  // Live PokéAPI fallback search when local query has no match
  useEffect(() => {
    if (!searchQuery.trim() || searchQuery.trim().length < 3) {
      setApiResult(null);
      setApiSearched(false);
      return;
    }

    // If already in local presets, don't spam api
    const hasLocalExact = PRESET_COMPETITIVE_POKEMON.some(
      p => p.name.toLowerCase() === searchQuery.toLowerCase().trim() ||
           p.displayName.toLowerCase() === searchQuery.toLowerCase().trim()
    );
    if (hasLocalExact) {
      setApiResult(null);
      setApiSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoadingApi(true);
      setApiSearched(true);
      const res = await fetchPokemonFromPokeAPI(searchQuery);
      setApiResult(res);
      setIsLoadingApi(false);
    }, 450);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Reset state on open
  useEffect(() => {
    if (isOpen) {
      setSearchQuery('');
      setSelectedType('all');
      setApiResult(null);
      setApiSearched(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
      <div
        className="w-full max-w-3xl max-h-[90vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="px-5 py-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-4">
          <div>
            <h3 className="font-display font-bold text-lg text-slate-900 dark:text-white">
              Select Pokémon for Slot #{targetSlotIndex + 1}
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Instant autocomplete across competitive meta &amp; full PokéAPI national dex
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

        {/* Search Bar & Type Filter */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 space-y-3 bg-slate-50/50 dark:bg-slate-950/40">
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              autoFocus
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by Pokémon name (e.g. Flutter Mane, Landorus, Dragonite) or Pokédex #..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white placeholder-slate-400 text-sm focus:outline-hidden focus:ring-2 focus:ring-indigo-500 transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-0.5 scrollbar-thin">
            <button
              type="button"
              onClick={() => setSelectedType('all')}
              className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all whitespace-nowrap ${
                selectedType === 'all'
                  ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-xs'
                  : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-400 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
            >
              All Types
            </button>
            {ALL_POKEMON_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => setSelectedType(type)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all whitespace-nowrap capitalize ${
                  selectedType === type
                    ? 'ring-2 ring-indigo-500 scale-105 font-bold shadow-xs'
                    : 'opacity-80 hover:opacity-100'
                }`}
              >
                <TypeBadge type={type} size="sm" />
              </button>
            ))}
          </div>
        </div>

        {/* Results List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2 max-h-[500px]">
          {/* Loading indicator for API */}
          {isLoadingApi && (
            <div className="p-3 bg-indigo-50 dark:bg-indigo-950/40 rounded-xl border border-indigo-200 dark:border-indigo-900 flex items-center justify-center gap-2 text-xs text-indigo-700 dark:text-indigo-300">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Searching PokéAPI real-time database for "{searchQuery}"...</span>
            </div>
          )}

          {/* API Result Card if retrieved and not in local presets */}
          {apiResult && (
            <div
              onClick={() => {
                onSelectPokemon(apiResult);
                onClose();
              }}
              className="p-3 bg-gradient-to-r from-indigo-50 to-rose-50 dark:from-indigo-950/40 dark:to-rose-950/40 rounded-xl border-2 border-indigo-500 hover:border-indigo-600 cursor-pointer flex items-center justify-between gap-3 transition-all hover:scale-[1.01]"
            >
              <div className="flex items-center gap-3">
                <img
                  src={apiResult.artworkUrl || apiResult.spriteUrl}
                  alt={apiResult.displayName}
                  className="w-14 h-14 object-contain filter drop-shadow-sm"
                  referrerPolicy="no-referrer"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-display font-bold text-base text-slate-900 dark:text-white">
                      {apiResult.displayName}
                    </span>
                    <span className="text-xs font-mono text-indigo-600 dark:text-indigo-400 font-semibold px-1.5 py-0.5 rounded bg-indigo-100 dark:bg-indigo-900/60">
                      PokéAPI Live Match
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5 mt-1">
                    {apiResult.types.map(t => (
                      <TypeBadge key={t} type={t} size="sm" />
                    ))}
                    <span className="text-xs text-slate-500 ml-2">
                      BST {Object.values(apiResult.baseStats).reduce((a, b) => a + b, 0)}
                    </span>
                  </div>
                </div>
              </div>
              <button
                type="button"
                className="px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg"
              >
                Select
              </button>
            </div>
          )}

          {/* Local Preset Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {filteredPresets.map(poke => {
              const bst = Object.values(poke.baseStats).reduce((a, b) => a + b, 0);
              return (
                <div
                  key={poke.id}
                  onClick={() => {
                    onSelectPokemon(poke);
                    onClose();
                  }}
                  className="p-3 bg-white dark:bg-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-700/60 border border-slate-200 dark:border-slate-700 rounded-xl cursor-pointer flex items-center justify-between gap-3 transition-all hover:border-indigo-400 group"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-12 h-12 rounded-lg bg-slate-100 dark:bg-slate-900 p-1 flex items-center justify-center shrink-0">
                      <img
                        src={poke.artworkUrl || poke.spriteUrl}
                        alt={poke.displayName}
                        className="w-full h-full object-contain filter drop-shadow-xs group-hover:scale-110 transition-transform"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-display font-bold text-sm text-slate-900 dark:text-white truncate">
                          {poke.displayName}
                        </span>
                        {poke.tier && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {poke.tier}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-1">
                        {poke.types.map(t => (
                          <TypeBadge key={t} type={t} size="sm" />
                        ))}
                        <span className="text-[11px] font-mono text-slate-400 dark:text-slate-500 ml-1.5">
                          BST {bst}
                        </span>
                      </div>
                    </div>
                  </div>

                  <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0">
                    Add +
                  </span>
                </div>
              );
            })}
          </div>

          {filteredPresets.length === 0 && !apiResult && !isLoadingApi && (
            <div className="p-8 text-center text-slate-500 dark:text-slate-400">
              <p className="text-sm">No Pokémon found matching "{searchQuery}".</p>
              <p className="text-xs mt-1 text-slate-400">
                Type 3 or more letters to search live through PokéAPI's full Pokédex.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
