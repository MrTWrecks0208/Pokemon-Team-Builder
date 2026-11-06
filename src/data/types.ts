import { PokemonType } from '../types/pokemon';

export const ALL_POKEMON_TYPES: PokemonType[] = [
  'normal',
  'fire',
  'water',
  'electric',
  'grass',
  'ice',
  'fighting',
  'poison',
  'ground',
  'flying',
  'psychic',
  'bug',
  'rock',
  'ghost',
  'dragon',
  'dark',
  'steel',
  'fairy',
];

export interface TypeVisual {
  name: PokemonType;
  label: string;
  badgeBg: string;
  badgeText: string;
  border: string;
  accent: string;
}

export const TYPE_METADATA: Record<PokemonType, TypeVisual> = {
  normal: { name: 'normal', label: 'Normal', badgeBg: 'bg-stone-500', badgeText: 'text-white', border: 'border-stone-400', accent: '#A8A77A' },
  fire: { name: 'fire', label: 'Fire', badgeBg: 'bg-orange-600', badgeText: 'text-white', border: 'border-orange-500', accent: '#EE8130' },
  water: { name: 'water', label: 'Water', badgeBg: 'bg-blue-600', badgeText: 'text-white', border: 'border-blue-500', accent: '#6390F0' },
  grass: { name: 'grass', label: 'Grass', badgeBg: 'bg-emerald-600', badgeText: 'text-white', border: 'border-emerald-500', accent: '#7AC74C' },
  electric: { name: 'electric', label: 'Electric', badgeBg: 'bg-amber-500', badgeText: 'text-slate-950', border: 'border-amber-400', accent: '#F7D02C' },
  ice: { name: 'ice', label: 'Ice', badgeBg: 'bg-cyan-500', badgeText: 'text-slate-950', border: 'border-cyan-400', accent: '#96D9D6' },
  fighting: { name: 'fighting', label: 'Fighting', badgeBg: 'bg-red-700', badgeText: 'text-white', border: 'border-red-600', accent: '#C22E28' },
  poison: { name: 'poison', label: 'Poison', badgeBg: 'bg-purple-700', badgeText: 'text-white', border: 'border-purple-600', accent: '#A33EA1' },
  ground: { name: 'ground', label: 'Ground', badgeBg: 'bg-amber-700', badgeText: 'text-white', border: 'border-amber-600', accent: '#E2BF65' },
  flying: { name: 'flying', label: 'Flying', badgeBg: 'bg-indigo-500', badgeText: 'text-white', border: 'border-indigo-400', accent: '#A98FF3' },
  psychic: { name: 'psychic', label: 'Psychic', badgeBg: 'bg-pink-600', badgeText: 'text-white', border: 'border-pink-500', accent: '#F95587' },
  bug: { name: 'bug', label: 'Bug', badgeBg: 'bg-lime-600', badgeText: 'text-white', border: 'border-lime-500', accent: '#A6B91A' },
  rock: { name: 'rock', label: 'Rock', badgeBg: 'bg-yellow-800', badgeText: 'text-white', border: 'border-yellow-700', accent: '#B6A136' },
  ghost: { name: 'ghost', label: 'Ghost', badgeBg: 'bg-purple-900', badgeText: 'text-white', border: 'border-purple-800', accent: '#735797' },
  dragon: { name: 'dragon', label: 'Dragon', badgeBg: 'bg-violet-700', badgeText: 'text-white', border: 'border-violet-600', accent: '#6F35FC' },
  dark: { name: 'dark', label: 'Dark', badgeBg: 'bg-neutral-800', badgeText: 'text-white', border: 'border-neutral-700', accent: '#705746' },
  steel: { name: 'steel', label: 'Steel', badgeBg: 'bg-slate-500', badgeText: 'text-white', border: 'border-slate-400', accent: '#B7B7CE' },
  fairy: { name: 'fairy', label: 'Fairy', badgeBg: 'bg-rose-400', badgeText: 'text-slate-950', border: 'border-rose-300', accent: '#D685AD' },
};

// Attack -> Defense multiplier mapping
// AttackingType -> { DefendingType: multiplier }
export const TYPE_CHART: Record<PokemonType, Partial<Record<PokemonType, number>>> = {
  normal: { rock: 0.5, ghost: 0, steel: 0.5 },
  fire: { fire: 0.5, water: 0.5, grass: 2, ice: 2, bug: 2, rock: 0.5, dragon: 0.5, steel: 2 },
  water: { fire: 2, water: 0.5, grass: 0.5, ground: 2, rock: 2, dragon: 0.5 },
  electric: { water: 2, electric: 0.5, grass: 0.5, ground: 0, flying: 2, dragon: 0.5 },
  grass: { fire: 0.5, water: 2, grass: 0.5, poison: 0.5, ground: 2, flying: 0.5, bug: 0.5, rock: 2, dragon: 0.5, steel: 0.5 },
  ice: { fire: 0.5, water: 0.5, grass: 2, ice: 0.5, ground: 2, flying: 2, dragon: 2, steel: 0.5 },
  fighting: { normal: 2, ice: 2, poison: 0.5, flying: 0.5, psychic: 0.5, bug: 0.5, rock: 2, ghost: 0, dark: 2, steel: 2, fairy: 0.5 },
  poison: { grass: 2, poison: 0.5, ground: 0.5, rock: 0.5, ghost: 0.5, steel: 0, fairy: 2 },
  ground: { fire: 2, electric: 2, grass: 0.5, poison: 2, flying: 0, bug: 0.5, rock: 2, steel: 2 },
  flying: { electric: 0.5, grass: 2, fighting: 2, bug: 2, rock: 0.5, steel: 0.5 },
  psychic: { fighting: 2, poison: 2, psychic: 0.5, dark: 0, steel: 0.5 },
  bug: { fire: 0.5, grass: 2, fighting: 0.5, poison: 0.5, flying: 0.5, psychic: 2, ghost: 0.5, dark: 2, steel: 0.5, fairy: 0.5 },
  rock: { fire: 2, ice: 2, fighting: 0.5, ground: 0.5, flying: 2, bug: 2, steel: 0.5 },
  ghost: { normal: 0, psychic: 2, ghost: 2, dark: 0.5 },
  dragon: { dragon: 2, steel: 0.5, fairy: 0 },
  dark: { fighting: 0.5, psychic: 2, ghost: 2, dark: 0.5, fairy: 0.5 },
  steel: { fire: 0.5, water: 0.5, electric: 0.5, ice: 2, rock: 2, steel: 0.5, fairy: 2 },
  fairy: { fire: 0.5, fighting: 2, poison: 0.5, dragon: 2, dark: 2, steel: 0.5 },
};

/**
 * Returns damage multiplier when an attack of attackingType hits a Pokemon with defendingTypes
 */
export function getDamageMultiplier(attackingType: PokemonType, defendingTypes: PokemonType[]): number {
  if (!defendingTypes || defendingTypes.length === 0) return 1;
  let mult = 1;
  for (const defType of defendingTypes) {
    const table = TYPE_CHART[attackingType];
    const singleMult = table?.[defType] !== undefined ? table[defType]! : 1;
    mult *= singleMult;
  }
  return mult;
}

/**
 * Get defensive profile for a Pokémon: for each attacking type, what is the damage multiplier?
 */
export function getPokemonDefensiveMatchups(types: PokemonType[]): Record<PokemonType, number> {
  const result: Record<PokemonType, number> = {} as any;
  for (const atkType of ALL_POKEMON_TYPES) {
    result[atkType] = getDamageMultiplier(atkType, types);
  }
  return result;
}
