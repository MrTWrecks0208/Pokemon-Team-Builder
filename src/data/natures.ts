import { Nature, StatName } from '../types/pokemon';

export const NATURES: Nature[] = [
  // Neutral
  { name: 'Hardy', increasedStat: null, decreasedStat: null },
  { name: 'Docile', increasedStat: null, decreasedStat: null },
  { name: 'Serious', increasedStat: null, decreasedStat: null },
  { name: 'Bashful', increasedStat: null, decreasedStat: null },
  { name: 'Quirky', increasedStat: null, decreasedStat: null },

  // +Attack
  { name: 'Lonely', increasedStat: 'atk', decreasedStat: 'def' },
  { name: 'Brave', increasedStat: 'atk', decreasedStat: 'spe' },
  { name: 'Adamant', increasedStat: 'atk', decreasedStat: 'spa' },
  { name: 'Naughty', increasedStat: 'atk', decreasedStat: 'spd' },

  // +Defense
  { name: 'Bold', increasedStat: 'def', decreasedStat: 'atk' },
  { name: 'Relaxed', increasedStat: 'def', decreasedStat: 'spe' },
  { name: 'Impish', increasedStat: 'def', decreasedStat: 'spa' },
  { name: 'Lax', increasedStat: 'def', decreasedStat: 'spd' },

  // +Sp. Atk
  { name: 'Modest', increasedStat: 'spa', decreasedStat: 'atk' },
  { name: 'Mild', increasedStat: 'spa', decreasedStat: 'def' },
  { name: 'Quiet', increasedStat: 'spa', decreasedStat: 'spe' },
  { name: 'Rash', increasedStat: 'spa', decreasedStat: 'spd' },

  // +Sp. Def
  { name: 'Calm', increasedStat: 'spd', decreasedStat: 'atk' },
  { name: 'Gentle', increasedStat: 'spd', decreasedStat: 'def' },
  { name: 'Sassy', increasedStat: 'spd', decreasedStat: 'spe' },
  { name: 'Careful', increasedStat: 'spd', decreasedStat: 'spa' },

  // +Speed
  { name: 'Timid', increasedStat: 'spe', decreasedStat: 'atk' },
  { name: 'Hasty', increasedStat: 'spe', decreasedStat: 'def' },
  { name: 'Jolly', increasedStat: 'spe', decreasedStat: 'spa' },
  { name: 'Naive', increasedStat: 'spe', decreasedStat: 'spd' },
];

export const NATURE_MAP: Record<string, Nature> = NATURES.reduce((acc, nature) => {
  acc[nature.name.toLowerCase()] = nature;
  return acc;
}, {} as Record<string, Nature>);

export const STAT_ALIGNMENT_ROW_HEADERS = [
  'Atk+',
  'Def+',
  'Sp. Atk+',
  'Sp. Def+',
  'Speed+',
];

export const STAT_ALIGNMENT_COL_HEADERS = [
  'Atk-',
  'Def-',
  'Sp. Atk-',
  'Sp. Def-',
  'Speed-',
];

/**
 * 5x5 Stat Alignment table as defined in Pokemon Champions:
 * Rows (from top to bottom): Attack+, Defense+, Special Attack+, Special Defense+, Speed+
 * Cols (from left to right): Attack-, Defense-, Special Attack-, Special Defense-, Speed-
 * "" represents empty blank space on diagonal where multipliers cancel.
 */
export const NATURE_ALIGNMENT_TABLE: string[][] = [
  ['Serious', 'Lonely', 'Adamant', 'Naughty', 'Brave'],
  ['Bold', '', 'Impish', 'Lax', 'Relaxed'],
  ['Modest', 'Mild', '', 'Rash', 'Quiet'],
  ['Calm', 'Gentle', 'Careful', '', 'Sassy'],
  ['Timid', 'Hasty', 'Jolly', 'Naive', ''],
];

export function getNatureMultiplier(nature: Nature, stat: StatName): number {
  if (nature.increasedStat === stat && nature.decreasedStat === stat) return 1.0;
  if (nature.increasedStat === stat) return 1.1;
  if (nature.decreasedStat === stat) return 0.9;
  return 1.0;
}

