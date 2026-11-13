import { Move, SavedTeam, TeamMember } from '../types/pokemon';
import { PRESET_COMPETITIVE_POKEMON } from './pokemonDatabase';
import { NATURE_MAP } from './natures';
import { COMPETITIVE_ITEMS } from './items';
import { calculateAllStats, calculatePokemonPowerRating } from '../utils/statCalculators';

function createMember(
  slotIndex: number,
  speciesName: string,
  natureName: string,
  itemId: string,
  spPoints: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number },
  moveIds: string[],
  role: string
): TeamMember {
  const species = PRESET_COMPETITIVE_POKEMON.find(p => p.name === speciesName) || PRESET_COMPETITIVE_POKEMON[0];
  const nature = NATURE_MAP[natureName.toLowerCase()] || NATURE_MAP['serious'];
  const item = COMPETITIVE_ITEMS.find(i => i.id === itemId) || null;
  const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

  // Strict clamp to Pokemon Champions 66 SP total budget and max 32 SP per stat
  const evs = {
    hp: Math.min(32, Math.max(0, spPoints.hp)),
    atk: Math.min(32, Math.max(0, spPoints.atk)),
    def: Math.min(32, Math.max(0, spPoints.def)),
    spa: Math.min(32, Math.max(0, spPoints.spa)),
    spd: Math.min(32, Math.max(0, spPoints.spd)),
    spe: Math.min(32, Math.max(0, spPoints.spe)),
  };

  const moves: (Move | null)[] = moveIds.map(mId => {
    return species.availableMoves.find(m => m.id === mId) || species.availableMoves[0] || null;
  });
  while (moves.length < 4) moves.push(null);

  const calculatedStats = calculateAllStats(species, evs, nature);
  const powerRating = calculatePokemonPowerRating(calculatedStats, species, moves, item, nature);

  return {
    id: `member-${slotIndex}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    slotIndex,
    species,
    level: 50,
    nature,
    ability: species.abilities[0],
    item,
    moves,
    evs,
    ivs,
    role,
    calculatedStats,
    powerRating,
  };
}

export const SAMPLE_TEAMS: SavedTeam[] = [
  {
    id: 'sample-champions-doubles-balance',
    name: 'Champions Doubles Balance Core',
    format: 'doubles',
    updatedAt: Date.now(),
    notes: 'Tournament-winning Pokemon Champions balance core. Incineroar and Rillaboom execute premier Intimidate/Fake Out pivot cycles. Farigiraf prevents opposing priority moves with Armor Tail, while Gholdengo, Kingambit, and Dragonite deliver devastating late-game sweeps.',
    members: [
      createMember(0, 'incineroar', 'Careful', 'sitrus-berry', { hp: 31, atk: 1, def: 10, spa: 0, spd: 20, spe: 4 }, ['fake-out', 'flare-blitz', 'knock-off', 'parting-shot'], 'Defensive Pivot & Intimidate'),
      createMember(1, 'rillaboom', 'Adamant', 'miracle-seed', { hp: 32, atk: 25, def: 3, spa: 0, spd: 5, spe: 1 }, ['grassy-glide', 'fake-out', 'wood-hammer', 'u-turn'], 'Terrain Control & Priority'),
      createMember(2, 'kingambit', 'Adamant', 'leftovers', { hp: 32, atk: 32, def: 1, spa: 0, spd: 1, spe: 0 }, ['kowtow-cleave', 'sucker-punch', 'iron-head', 'swords-dance'], 'Defiant & Late Cleaner'),
      createMember(3, 'gholdengo', 'Timid', 'choice-specs', { hp: 32, atk: 0, def: 0, spa: 2, spd: 0, spe: 32 }, ['make-it-rain', 'shadow-ball', 'nasty-plot', 'protect'], 'Special Sweeper & Status Shield'),
      createMember(4, 'dragonite', 'Adamant', 'lum-berry', { hp: 18, atk: 32, def: 0, spa: 0, spd: 0, spe: 16 }, ['extreme-speed', 'outrage', 'stomping-tantrum', 'dragon-dance'], 'Multiscale Extreme Speed'),
      createMember(5, 'farigiraf', 'Modest', 'rocky-helmet', { hp: 30, atk: 0, def: 20, spa: 13, spd: 2, spe: 1 }, ['trick-room', 'hyper-voice', 'psychic', 'helping-hand'], 'Armor Tail Priority Blocker'),
    ],
  },
  {
    id: 'sample-champions-rain-steel',
    name: 'Champions Rain & Stamina Offense',
    format: 'doubles',
    updatedAt: Date.now(),
    notes: 'Heavy Rain synergy in Pokemon Champions. Pelipper summons Drizzle and sets Tailwind, enabling instant Electro Shot charge and 100% accurate Hurricanes. Archaludon stacks Stamina Defense, supported by Sneasler speed pressure and Amoonguss 100% Spore.',
    members: [
      createMember(0, 'pelipper', 'Modest', 'focus-sash', { hp: 32, atk: 0, def: 0, spa: 32, spd: 0, spe: 2 }, ['weather-ball', 'hurricane', 'tailwind', 'wide-guard'], 'Drizzle Rain Setter'),
      createMember(1, 'archaludon', 'Modest', 'rocky-helmet', { hp: 32, atk: 0, def: 1, spa: 20, spd: 12, spe: 1 }, ['electro-shot', 'flash-cannon', 'draco-meteor', 'body-press'], 'Stamina Tank & Rain Nuke'),
      createMember(2, 'sneasler', 'Jolly', 'focus-sash', { hp: 1, atk: 32, def: 0, spa: 0, spd: 1, spe: 32 }, ['dire-claw', 'close-combat', 'fake-out', 'acrobatics'], 'Unburden Fast Attacker'),
      createMember(3, 'amoonguss', 'Bold', 'sitrus-berry', { hp: 32, atk: 0, def: 24, spa: 0, spd: 10, spe: 0 }, ['spore', 'rage-powder', 'pollen-puff', 'clear-smog'], '100% Spore Sleep & Redirection'),
      createMember(4, 'garchomp', 'Jolly', 'life-orb', { hp: 1, atk: 32, def: 0, spa: 0, spd: 1, spe: 32 }, ['earthquake', 'dragon-claw', 'stomping-tantrum', 'swords-dance'], 'Rough Skin Physical Breaker'),
      createMember(5, 'primarina', 'Modest', 'mystic-water', { hp: 32, atk: 0, def: 2, spa: 30, spd: 2, spe: 0 }, ['hyper-voice', 'moonblast', 'calm-mind', 'aqua-jet'], 'Liquid Voice Special Spread'),
    ],
  },
  {
    id: 'sample-champions-singles-balance',
    name: 'Champions Singles Hyper Balance',
    format: 'single',
    updatedAt: Date.now(),
    notes: 'Versatile Singles 3v3 team built for Pokemon Champions. Features Dragapult blinding speed, Volcarona Quiver Dance sweeping, Gengar status disabling, and Clefable Unaware setup denial.',
    members: [
      createMember(0, 'dragapult', 'Timid', 'life-orb', { hp: 1, atk: 0, def: 1, spa: 32, spd: 0, spe: 32 }, ['draco-meteor', 'phantom-force', 'u-turn', 'will-o-wisp'], 'Blistering Speed Mixed Lead'),
      createMember(1, 'volcarona', 'Timid', 'leftovers', { hp: 32, atk: 0, def: 0, spa: 2, spd: 0, spe: 32 }, ['heat-wave', 'bug-buzz', 'quiver-dance', 'giga-drain'], 'Quiver Dance Setup Sweeper'),
      createMember(2, 'kingambit', 'Adamant', 'lum-berry', { hp: 32, atk: 32, def: 1, spa: 0, spd: 1, spe: 0 }, ['kowtow-cleave', 'sucker-punch', 'iron-head', 'low-kick'], 'Supreme Overlord Anchor'),
      createMember(3, 'gengar', 'Timid', 'focus-sash', { hp: 1, atk: 0, def: 1, spa: 32, spd: 0, spe: 32 }, ['shadow-ball', 'sludge-bomb', 'will-o-wisp', 'icy-wind'], 'Fast Special Ghost & Burn'),
      createMember(4, 'clefable', 'Bold', 'rocky-helmet', { hp: 32, atk: 0, def: 32, spa: 1, spd: 1, spe: 0 }, ['moonblast', 'follow-me', 'life-dew', 'thunder-wave'], 'Unaware Setup Neutralizer'),
      createMember(5, 'ursaluna', 'Brave', 'flame-orb', { hp: 32, atk: 32, def: 2, spa: 0, spd: 0, spe: 0 }, ['facade', 'headlong-rush', 'drain-punch', 'swords-dance'], 'Guts Colossal Physical Wallbreaker'),
    ],
  },
];
