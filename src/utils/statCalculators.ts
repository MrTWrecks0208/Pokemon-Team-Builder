import { BaseStats, Move, Nature, PokemonSpecies, PokemonType, StatName, StatSpread, TeamAnalysis, TeamMember } from '../types/pokemon';
import { getNatureMultiplier } from '../data/natures';
import { ALL_POKEMON_TYPES, getPokemonDefensiveMatchups } from '../data/types';

/**
 * Calculates a single stat at Level 50 according to Pokémon Champions mechanics:
 * - All Pokémon have fixed 31 IVs.
 * - Stat Points (0-32 per stat, from 66 total points budget) add +1 directly to the stat at Level 50.
 * - Nature provides +10% or -10% multiplier.
 */
export function calculateStatAtLevel50(
  statName: StatName,
  base: number,
  statPoint: number,
  nature: Nature,
  speciesName?: string
): number;
export function calculateStatAtLevel50(
  statName: StatName,
  base: number,
  iv: number,
  ev: number,
  nature: Nature,
  speciesName?: string
): number;
export function calculateStatAtLevel50(
  statName: StatName,
  base: number,
  arg3: number,
  arg4?: any,
  arg5?: any,
  arg6: string = ''
): number {
  let statPoint = 0;
  let nature: Nature = { name: 'Serious', increasedStat: null, decreasedStat: null };
  let name = arg6;

  if (arg5 && typeof arg5 === 'object' && 'name' in arg5) {
    // Legacy 6-arg or 5-arg signature: (statName, base, iv, ev, nature, speciesName)
    const rawVal = Number(arg4) || 0;
    statPoint = rawVal > 32 ? Math.min(32, Math.round(rawVal / 8)) : rawVal;
    nature = arg5;
  } else if (arg4 && typeof arg4 === 'object' && 'name' in arg4) {
    // Champions signature: (statName, base, statPoint, nature, speciesName)
    const rawVal = Number(arg3) || 0;
    statPoint = rawVal > 32 ? Math.min(32, Math.round(rawVal / 8)) : rawVal;
    nature = arg4;
    if (typeof arg5 === 'string') name = arg5;
  } else {
    statPoint = Number(arg3) || 0;
  }

  // Cap stat points per single stat at 32
  statPoint = Math.max(0, Math.min(32, statPoint));

  if (statName === 'hp') {
    if (name.toLowerCase() === 'shedinja') return 1;
    // Formula with 31 IV at level 50: floor(((2 * Base + 31) * 50) / 100) + 50 + 10 = base + 75
    const baseHp = Math.floor(((2 * base + 31) * 50) / 100) + 60;
    return baseHp + statPoint;
  }

  // Other stats: floor(((2 * Base + 31) * 50) / 100) + 5
  const rawBase = Math.floor(((2 * base + 31) * 50) / 100) + 5;
  const mult = getNatureMultiplier(nature, statName);
  const withNature = Math.floor(rawBase * mult);
  return withNature + statPoint;
}

/**
 * Calculates all 6 stats at Level 50 for Pokémon Champions
 */
export function calculateAllStats(
  species: PokemonSpecies,
  arg2: any,
  arg3?: any,
  arg4?: any
): StatSpread {
  // Check if called as calculateAllStats(species, statPoints, nature)
  // or legacy calculateAllStats(species, ivs, evs, nature)
  let points: StatSpread = { hp: 0, atk: 0, def: 0, spa: 0, spd: 0, spe: 0 };
  let nature: Nature = { name: 'Serious', increasedStat: null, decreasedStat: null };

  if (arg4 && typeof arg4 === 'object' && 'name' in arg4) {
    // Legacy (species, ivs, evs, nature)
    points = arg3 || points;
    nature = arg4;
  } else if (arg3 && typeof arg3 === 'object' && 'name' in arg3) {
    // Champions (species, statPoints, nature)
    points = arg2 || points;
    nature = arg3;
  } else if (arg2 && typeof arg2 === 'object') {
    points = arg2;
  }

  return {
    hp: calculateStatAtLevel50('hp', species.baseStats.hp, points.hp, nature, species.name),
    atk: calculateStatAtLevel50('atk', species.baseStats.atk, points.atk, nature, species.name),
    def: calculateStatAtLevel50('def', species.baseStats.def, points.def, nature, species.name),
    spa: calculateStatAtLevel50('spa', species.baseStats.spa, points.spa, nature, species.name),
    spd: calculateStatAtLevel50('spd', species.baseStats.spd, points.spd, nature, species.name),
    spe: calculateStatAtLevel50('spe', species.baseStats.spe, points.spe, nature, species.name),
  };
}

/**
 * Calculates an individual Pokémon's power rating (0 - 100 scale, typical competitive range 60-98)
 */
export function calculatePokemonPowerRating(
  stats: StatSpread,
  species: PokemonSpecies,
  moves: (Move | null)[],
  item: TeamMember['item'],
  nature: Nature
): number {
  // 1. Base Stat Total factor (normalize 300 - 680 to 20 - 45 pts)
  const bst = species.baseStats.hp + species.baseStats.atk + species.baseStats.def +
    species.baseStats.spa + species.baseStats.spd + species.baseStats.spe;
  const bstScore = Math.min(45, Math.max(20, ((bst - 300) / 380) * 25 + 20));

  // 2. Stat optimization & EV efficiency (up to 20 pts)
  // Check if EVs are focused or distributed constructively
  const primaryAtk = stats.atk > stats.spa ? stats.atk : stats.spa;
  const offenseScore = Math.min(10, (primaryAtk / 220) * 10);
  const bulkScore = Math.min(10, ((stats.hp + stats.def + stats.spd) / 450) * 10);
  const statOptScore = offenseScore + bulkScore;

  // 3. Movepool validity (up to 20 pts)
  const activeMoves = moves.filter((m): m is Move => m !== null);
  let moveScore = activeMoves.length * 4; // 4 moves = 16 pts
  // Bonus for move variety / STAB matching
  const hasStab = activeMoves.some(m => species.types.includes(m.type));
  if (hasStab) moveScore += 4;

  // 4. Item synergy (up to 15 pts)
  let itemScore = item ? 12 : 0;
  if (item?.id === 'choice-scarf' || item?.id === 'focus-sash' || item?.id === 'life-orb' || item?.id === 'leftovers') {
    itemScore += 3;
  }

  // Nature synergy (up to 5 pts)
  const natureScore = nature.increasedStat !== null ? 5 : 2;

  const total = Math.round(bstScore + statOptScore + moveScore + itemScore + natureScore);
  return Math.min(99, Math.max(40, total));
}

/**
 * Calculates Team Total Power and detailed synergy metrics
 */
export function analyzeTeam(members: (TeamMember | null)[]): TeamAnalysis {
  const activeMembers = members.filter((m): m is TeamMember => m !== null);

  const weaknesses: Record<PokemonType, number> = ALL_POKEMON_TYPES.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as any);
  const resistances: Record<PokemonType, number> = ALL_POKEMON_TYPES.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as any);
  const immunities: Record<PokemonType, number> = ALL_POKEMON_TYPES.reduce((acc, t) => ({ ...acc, [t]: 0 }), {} as any);

  let totalBst = 0;
  let totalMemberPower = 0;
  let physicalCount = 0;
  let specialCount = 0;
  let statusCount = 0;

  const hitTypesSet = new Set<PokemonType>();

  const speedTiers: TeamAnalysis['speedTiers'] = [];

  for (const member of activeMembers) {
    // Base stats
    const bst = Object.values(member.species.baseStats).reduce((a, b) => a + b, 0);
    totalBst += bst;
    totalMemberPower += member.powerRating;

    // Defensive profile
    const defMatchups = getPokemonDefensiveMatchups(member.species.types);
    for (const [type, mult] of Object.entries(defMatchups) as [PokemonType, number][]) {
      if (mult > 1) weaknesses[type] += 1;
      else if (mult === 0) immunities[type] += 1;
      else if (mult < 1) resistances[type] += 1;
    }

    // Offensive moves
    for (const move of member.moves) {
      if (!move) continue;
      if (move.category === 'physical') physicalCount++;
      else if (move.category === 'special') specialCount++;
      else statusCount++;

      if (move.power > 0) {
        // Find which types this move hits super effectively
        ALL_POKEMON_TYPES.forEach(defType => {
          const match = getPokemonDefensiveMatchups([defType]);
          if (match[move.type] > 1) {
            hitTypesSet.add(defType);
          }
        });
      }
    }

    // Speed calculation with item modifier
    let effectiveSpeed = member.calculatedStats.spe;
    if (member.item?.id === 'choice-scarf') effectiveSpeed = Math.floor(effectiveSpeed * 1.5);

    speedTiers.push({
      name: member.species.displayName,
      species: member.species.name,
      speed: effectiveSpeed,
      sprite: member.species.spriteUrl,
      item: member.item?.name,
    });
  }

  // Sort speed tiers descending
  speedTiers.sort((a, b) => b.speed - a.speed);

  const offensiveCoverage = Array.from(hitTypesSet);
  const uncoveredTypes = ALL_POKEMON_TYPES.filter(t => !hitTypesSet.has(t));

  const count = activeMembers.length || 1;
  const avgBst = Math.round(totalBst / count);

  // Synergy Warnings and Strengths
  const synergyWarnings: string[] = [];
  const synergyStrengths: string[] = [];

  for (const [type, weakCount] of Object.entries(weaknesses) as [PokemonType, number][]) {
    if (weakCount >= 3) {
      synergyWarnings.push(`High vulnerability: ${weakCount} Pokémon are weak to ${type.toUpperCase()}-type moves.`);
    }
  }

  // Speed and balance checks
  if (activeMembers.length >= 4) {
    if (physicalCount === 0 && specialCount > 6) {
      synergyWarnings.push('Heavy Special skew: Vulnerable to Blissey and high Sp. Def walls.');
    } else if (specialCount === 0 && physicalCount > 6) {
      synergyWarnings.push('Heavy Physical skew: Vulnerable to Intimidate, Will-O-Wisp, and Dondozo/Physical walls.');
    } else if (physicalCount > 2 && specialCount > 2) {
      synergyStrengths.push('Balanced Attack Axis: Good mix of Physical and Special damage.');
    }

    if (offensiveCoverage.length >= 14) {
      synergyStrengths.push(`Superb coverage: Can hit ${offensiveCoverage.length}/18 types super-effectively.`);
    }

    // Immunities strength
    const immuneTypes = ALL_POKEMON_TYPES.filter(t => immunities[t] > 0);
    if (immuneTypes.length >= 3) {
      synergyStrengths.push(`Strong pivot options with immunities against ${immuneTypes.map(t => t.toUpperCase()).join(', ')}.`);
    }
  }

  // Total Team Power on 1000 scale
  let calculatedPower = 0;
  if (activeMembers.length > 0) {
    const rawPowerSum = totalMemberPower * 1.5; // Up to ~900 for 6 members
    const coverageBonus = offensiveCoverage.length * 4; // up to 72
    const penaltyPerSharedWeakness = Object.values(weaknesses).filter(w => w >= 3).length * 20;
    const synergyBonus = synergyStrengths.length * 15;
    calculatedPower = Math.min(999, Math.max(100, Math.round(rawPowerSum + coverageBonus + synergyBonus - penaltyPerSharedWeakness)));
  }

  return {
    totalPower: calculatedPower,
    avgBaseStatTotal: avgBst,
    speedTiers,
    weaknesses,
    resistances,
    immunities,
    offensiveCoverage,
    uncoveredTypes,
    physicalSpecialRatio: {
      physical: physicalCount,
      special: specialCount,
      status: statusCount,
    },
    synergyWarnings,
    synergyStrengths,
  };
}
