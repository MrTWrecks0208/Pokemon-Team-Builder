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
  rawPoints: { hp: number; atk: number; def: number; spa: number; spd: number; spe: number },
  moveIds: string[],
  role: string
): TeamMember {
  const species = PRESET_COMPETITIVE_POKEMON.find(p => p.name === speciesName) || PRESET_COMPETITIVE_POKEMON[0];
  const nature = NATURE_MAP[natureName.toLowerCase()] || NATURE_MAP['serious'];
  const item = COMPETITIVE_ITEMS.find(i => i.id === itemId) || null;
  const ivs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

  // Scale to Pokemon Champions 66-point budget (max 32 per stat)
  const evs = {
    hp: Math.min(32, rawPoints.hp > 32 ? Math.round(rawPoints.hp / 8) : rawPoints.hp),
    atk: Math.min(32, rawPoints.atk > 32 ? Math.round(rawPoints.atk / 8) : rawPoints.atk),
    def: Math.min(32, rawPoints.def > 32 ? Math.round(rawPoints.def / 8) : rawPoints.def),
    spa: Math.min(32, rawPoints.spa > 32 ? Math.round(rawPoints.spa / 8) : rawPoints.spa),
    spd: Math.min(32, rawPoints.spd > 32 ? Math.round(rawPoints.spd / 8) : rawPoints.spd),
    spe: Math.min(32, rawPoints.spe > 32 ? Math.round(rawPoints.spe / 8) : rawPoints.spe),
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
    id: 'sample-vgc-champions-sun',
    name: 'VGC World Championship Sun Core',
    format: 'doubles',
    updatedAt: Date.now(),
    notes: 'A premier tournament archetype built around Harsh Sunlight weather. Koraidon sets Sun via Orichalcum Pulse (boosting Fire damage by 50% while activating Flutter Mane Protosynthesis speed boost). Incineroar and Rillaboom provide essential Fake Out/Intimidate cycling, Farigiraf completely blocks opponent priority attacks with Armor Tail, and Ogerpon Wellspring redirects moves with Follow Me while countering opposing Rain squads with Water Absorb.',
    members: [
      createMember(0, 'koraidon', 'Jolly', 'life-orb', { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, ['collision-course', 'flare-blitz', 'dragon-claw', 'protect'], 'Sun Setter & Breaker'),
      createMember(1, 'flutter-mane', 'Timid', 'booster-energy', { hp: 116, atk: 0, def: 100, spa: 116, spd: 4, spe: 172 }, ['moonblast', 'shadow-ball', 'dazzling-gleam', 'protect'], 'Special Sweeper'),
      createMember(2, 'incineroar', 'Careful', 'sitrus-berry', { hp: 244, atk: 4, def: 76, spa: 0, spd: 156, spe: 28 }, ['fake-out', 'flare-blitz', 'knock-off', 'parting-shot'], 'Defensive Pivot & Intimidate'),
      createMember(3, 'rillaboom', 'Adamant', 'assault-vest', { hp: 252, atk: 196, def: 20, spa: 0, spd: 36, spe: 4 }, ['grassy-glide', 'fake-out', 'wood-hammer', 'u-turn'], 'Terrain Setter & Priority'),
      createMember(4, 'farigiraf', 'Modest', 'rocky-helmet', { hp: 236, atk: 0, def: 156, spa: 100, spd: 12, spe: 4 }, ['trick-room', 'hyper-voice', 'psychic', 'protect'], 'Armor Tail & Speed Control'),
      createMember(5, 'ogerpon-wellspring', 'Jolly', 'clear-amulet', { hp: 252, atk: 76, def: 20, spa: 0, spd: 12, spe: 148 }, ['ivy-cudgel', 'horn-leech', 'follow-me', 'spiky-shield'], 'Redirection & Water Absorb'),
    ],
  },
  {
    id: 'sample-vgc-hadron-hyper',
    name: 'Electric Terrain Speed Surge',
    format: 'doubles',
    updatedAt: Date.now(),
    notes: 'Fast-paced Doubles archetype leveraging Hadron Engine boosts, Quark Drive speed tiers, and Kingambit endgame cleanup.',
    members: [
      createMember(0, 'miraidon', 'Timid', 'choice-specs', { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 }, ['electro-drift', 'draco-meteor', 'volt-switch', 'dazzling-gleam'], 'Terrain Setter & Special Nuke'),
      createMember(1, 'iron-bundle', 'Timid', 'booster-energy', { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 }, ['freeze-dry', 'hydro-pump', 'icy-wind', 'protect'], 'High-Speed Controller'),
      createMember(2, 'kingambit', 'Adamant', 'black-sludge', { hp: 252, atk: 252, def: 4, spa: 0, spd: 0, spe: 0 }, ['kowtow-cleave', 'sucker-punch', 'iron-head', 'swords-dance'], 'Defiant & Late Cleaner'),
      createMember(3, 'tornadus-incarnate', 'Timid', 'covert-cloak', { hp: 252, atk: 0, def: 60, spa: 4, spd: 108, spe: 84 }, ['tailwind', 'bleakwind-storm', 'rain-dance', 'taunt'], 'Prankster Tailwind'),
      createMember(4, 'archaludon', 'Modest', 'assault-vest', { hp: 252, atk: 0, def: 4, spa: 156, spd: 92, spe: 4 }, ['electro-shot', 'flash-cannon', 'draco-meteor', 'body-press'], 'Stamina Bulk Sweeper'),
      createMember(5, 'whimsicott', 'Timid', 'focus-sash', { hp: 4, atk: 0, def: 0, spa: 252, spd: 0, spe: 252 }, ['tailwind', 'moonblast', 'encore', 'protect'], 'Fast Disruptor'),
    ],
  },
  {
    id: 'sample-singles-dragons-steel',
    name: 'Singles Standard Balance Core',
    format: 'single',
    updatedAt: Date.now(),
    notes: 'Well-rounded Singles squad with Dragonite Multiscale hazard mitigation, Gholdengo hazard denial, and Urshifu wallbreaker.',
    members: [
      createMember(0, 'dragonite', 'Adamant', 'heavy-duty-boots', { hp: 140, atk: 252, def: 0, spa: 0, spd: 0, spe: 116 }, ['extreme-speed', 'dragon-claw', 'stomping-tantrum', 'dragon-dance'], 'Dragon Dance Sweeper'),
      createMember(1, 'gholdengo', 'Timid', 'leftovers', { hp: 252, atk: 0, def: 0, spa: 4, spd: 0, spe: 252 }, ['make-it-rain', 'shadow-ball', 'nasty-plot', 'protect'], 'Spinblocker & Status Wall'),
      createMember(2, 'urshifu-rapid-strike', 'Jolly', 'choice-band', { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, ['surging-strikes', 'close-combat', 'aqua-jet', 'u-turn'], 'Physical Breaker'),
      createMember(3, 'chien-pao', 'Jolly', 'focus-sash', { hp: 4, atk: 252, def: 0, spa: 0, spd: 0, spe: 252 }, ['icicle-crash', 'sucker-punch', 'sacred-sword', 'protect'], 'Sword of Ruin Wallbreaker'),
      createMember(4, 'garchomp', 'Jolly', 'rocky-helmet', { hp: 252, atk: 4, def: 180, spa: 0, spd: 0, spe: 72 }, ['earthquake', 'dragon-claw', 'rock-slide', 'swords-dance'], 'Rough Skin Tank'),
      createMember(5, 'amoonguss', 'Bold', 'black-sludge', { hp: 252, atk: 0, def: 188, spa: 0, spd: 68, spe: 0 }, ['spore', 'pollen-puff', 'clear-smog', 'protect'], 'Regenerator Pivot'),
    ],
  },
];
