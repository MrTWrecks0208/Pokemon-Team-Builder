export type PokemonType =
  | 'normal'
  | 'fire'
  | 'water'
  | 'grass'
  | 'electric'
  | 'ice'
  | 'fighting'
  | 'poison'
  | 'ground'
  | 'flying'
  | 'psychic'
  | 'bug'
  | 'rock'
  | 'ghost'
  | 'dragon'
  | 'dark'
  | 'steel'
  | 'fairy';

export type StatName = 'hp' | 'atk' | 'def' | 'spa' | 'spd' | 'spe';

export interface BaseStats {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export interface StatSpread {
  hp: number;
  atk: number;
  def: number;
  spa: number;
  spd: number;
  spe: number;
}

export type MoveCategory = 'physical' | 'special' | 'status';

export interface Move {
  id: string;
  name: string;
  type: PokemonType;
  category: MoveCategory;
  power: number;
  accuracy: number;
  pp: number;
  description: string;
  priority?: number;
}

export interface Nature {
  name: string;
  increasedStat: StatName | null;
  decreasedStat: StatName | null;
}

export interface HeldItem {
  id: string;
  name: string;
  description: string;
  category: 'choice' | 'defensive' | 'offensive' | 'berry' | 'utility';
  icon?: string;
}

export interface Ability {
  name: string;
  description: string;
  isHidden?: boolean;
}

export interface PokemonSpecies {
  id: number;
  name: string;
  displayName: string;
  types: PokemonType[];
  baseStats: BaseStats;
  spriteUrl: string;
  artworkUrl: string;
  abilities: Ability[];
  availableMoves: Move[];
  generation?: number;
  tier?: string;
  defaultRole?: string;
}

export interface TeamMember {
  id: string;
  slotIndex: number;
  species: PokemonSpecies;
  nickname?: string;
  gender?: 'M' | 'F' | 'N';
  level: number;
  nature: Nature;
  ability: Ability;
  item: HeldItem | null;
  moves: (Move | null)[]; // 4 slots
  evs: StatSpread;
  ivs: StatSpread;
  teraType?: PokemonType;
  role?: string;
  calculatedStats: StatSpread;
  powerRating: number;
}

export type BattleFormat = 'single' | 'doubles';

export interface SavedTeam {
  id: string;
  name: string;
  format: BattleFormat;
  updatedAt: number;
  notes?: string;
  members: (TeamMember | null)[];
}

export interface TeamAnalysis {
  totalPower: number;
  avgBaseStatTotal: number;
  speedTiers: { name: string; speed: number; species: string; sprite: string; item?: string }[];
  weaknesses: Record<PokemonType, number>;
  resistances: Record<PokemonType, number>;
  immunities: Record<PokemonType, number>;
  offensiveCoverage: PokemonType[];
  uncoveredTypes: PokemonType[];
  physicalSpecialRatio: { physical: number; special: number; status: number };
  synergyWarnings: string[];
  synergyStrengths: string[];
}

export interface DefensiveWeaknessItem {
  type: string;
  severity: 'critical' | 'warning' | 'moderate';
  description: string;
  affectedPokemon?: string[];
}

export interface MissingCoverageItem {
  targetType: string;
  explanation: string;
}

export interface RecommendedAdditionItem {
  pokemonName: string;
  role: string;
  whyItHelps: string;
  suggestedItem: string;
  suggestedAbility: string;
  suggestedMoves: string[];
  replacesOrComplements?: string;
}

export interface AuditPoint {
  problem: string;
  severity: 'critical' | 'warning' | 'moderate';
  typeCategory?: string;
  solutions: string[];
  threatenedPokemon?: string[];
  suggestedAddition?: {
    name: string;
    role: string;
    item: string;
    ability: string;
    moves: string[];
  };
}

export interface TeamReport {
  synergyGrade: string;
  archetype: string;
  summary: string;
  auditPoints: AuditPoint[];
  threatenedSummary?: string[];
  defensiveWeaknesses?: DefensiveWeaknessItem[];
  missingCoverage?: MissingCoverageItem[];
  recommendedAdditions?: RecommendedAdditionItem[];
  tacticalTips?: string[];
  generatedAt?: number;
}

