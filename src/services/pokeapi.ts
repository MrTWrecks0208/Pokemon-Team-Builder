import { Ability, BaseStats, Move, MoveCategory, PokemonSpecies, PokemonType } from '../types/pokemon';
import { PRESET_COMPETITIVE_POKEMON } from '../data/pokemonDatabase';

const CACHE_PREFIX = 'pokeapi_cache_';

interface PokeApiStat {
  base_stat: number;
  stat: { name: string };
}

interface PokeApiType {
  type: { name: PokemonType };
}

interface PokeApiAbility {
  ability: { name: string; url: string };
  is_hidden: boolean;
}

interface PokeApiMove {
  move: { name: string; url: string };
}

/**
 * Format string to Title Case (e.g. "flutter-mane" -> "Flutter Mane")
 */
export function formatDisplayName(rawName: string): string {
  return rawName
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');
}

/**
 * Fetch move details from PokéAPI with caching
 */
export async function fetchMoveDetails(moveName: string): Promise<Move | null> {
  const cacheKey = `${CACHE_PREFIX}move_${moveName}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  try {
    const res = await fetch(`https://pokeapi.co/api/v2/move/${moveName}`);
    if (!res.ok) return null;
    const data = await res.json();

    const move: Move = {
      id: data.name,
      name: formatDisplayName(data.name),
      type: data.type.name as PokemonType,
      category: data.damage_class.name as MoveCategory,
      power: data.power || 0,
      accuracy: data.accuracy || 100,
      pp: data.pp || 10,
      description: data.flavor_text_entries?.find((f: any) => f.language.name === 'en')?.flavor_text?.replace(/\n|\f/g, ' ') || 'Deals damage to opponent.',
      priority: data.priority || 0,
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(move));
    } catch (e) {}
    return move;
  } catch (err) {
    return null;
  }
}

/**
 * Maps common pre-evolutions to their legal Pokemon Champions battle-ready forms.
 * (In Pokemon Champions, only fully evolved Pokemon and Pikachu are battle legal).
 */
export const PRE_EVOLUTION_MAPPINGS: Record<string, string> = {
  charmander: 'charizard',
  charmeleon: 'charizard',
  bulbasaur: 'venusaur',
  ivysaur: 'venusaur',
  squirtle: 'blastoise',
  wartortle: 'blastoise',
  pichu: 'pikachu',
  caterpie: 'butterfree',
  metapod: 'butterfree',
  weedle: 'beedrill',
  pidgey: 'pidgeot',
  rattata: 'raticate',
  gastly: 'gengar',
  haunter: 'gengar',
  abra: 'alakazam',
  kadabra: 'alakazam',
  machop: 'machamp',
  machoke: 'machamp',
  geodude: 'golem',
  graveler: 'golem',
  magikarp: 'gyarados',
  dratini: 'dragonite',
  dragonair: 'dragonite',
  larvitar: 'tyranitar',
  pupitar: 'tyranitar',
  treecko: 'sceptile',
  torchic: 'blaziken',
  mudkip: 'swampert',
  bagon: 'salamence',
  shelgon: 'salamence',
  beldum: 'metagross',
  metang: 'metagross',
  gible: 'garchomp',
  gabite: 'garchomp',
  riolu: 'lucario',
  deino: 'hydreigon',
  zweilous: 'hydreigon',
  froakie: 'greninja',
  frogadier: 'greninja',
  litten: 'incineroar',
  torracat: 'incineroar',
  grookey: 'rillaboom',
  thwackey: 'rillaboom',
  scorbunny: 'cinderace',
  dreepy: 'dragapult',
  drakloak: 'dragapult',
  sprigatito: 'meowscarada',
  fuecoco: 'skeledirge',
  quaxly: 'quaquaval',
  charcadet: 'armarouge',
  frigibax: 'baxcalibur',
  arctibax: 'baxcalibur',
};

/**
 * Fetch a Pokémon from PokéAPI or return cached/local data, ensuring Champions legality
 */
export async function fetchPokemonFromPokeAPI(query: string): Promise<PokemonSpecies | null> {
  let normalizedQuery = query.toLowerCase().trim().replace(/\s+/g, '-');

  // Check if query is an un-evolved species; if so, resolve to legal Champions evolution
  if (PRE_EVOLUTION_MAPPINGS[normalizedQuery]) {
    normalizedQuery = PRE_EVOLUTION_MAPPINGS[normalizedQuery];
  }

  // Check preset first
  const presetMatch = PRESET_COMPETITIVE_POKEMON.find(
    p => p.name.toLowerCase() === normalizedQuery ||
         p.displayName.toLowerCase() === query.toLowerCase().trim() ||
         p.id.toString() === query.trim()
  );
  if (presetMatch) return presetMatch;

  // Check local cache
  const cacheKey = `${CACHE_PREFIX}pokemon_${normalizedQuery}`;
  try {
    const cached = localStorage.getItem(cacheKey);
    if (cached) return JSON.parse(cached);
  } catch (e) {}

  // Fetch live from PokéAPI
  try {
    const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${normalizedQuery}`);
    if (!res.ok) return null;
    const data = await res.json();

    const statMap: Record<string, number> = {};
    data.stats.forEach((s: PokeApiStat) => {
      statMap[s.stat.name] = s.base_stat;
    });

    const baseStats: BaseStats = {
      hp: statMap['hp'] || 80,
      atk: statMap['attack'] || 80,
      def: statMap['defense'] || 80,
      spa: statMap['special-attack'] || 80,
      spd: statMap['special-defense'] || 80,
      spe: statMap['speed'] || 80,
    };

    const types = data.types.map((t: PokeApiType) => t.type.name as PokemonType);

    const abilities: Ability[] = data.abilities.map((a: PokeApiAbility) => ({
      name: formatDisplayName(a.ability.name),
      description: a.is_hidden ? 'Hidden Ability: Special combat trait.' : 'Standard competitive ability.',
      isHidden: a.is_hidden,
    }));

    // Fetch top 8 moves
    const candidateMoves = (data.moves as PokeApiMove[]).slice(0, 8);
    const resolvedMoves: Move[] = [];
    for (const item of candidateMoves) {
      const move = await fetchMoveDetails(item.move.name);
      if (move) resolvedMoves.push(move);
    }

    const species: PokemonSpecies = {
      id: data.id,
      name: data.name,
      displayName: formatDisplayName(data.name),
      types,
      baseStats,
      spriteUrl: data.sprites.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${data.id}.png`,
      artworkUrl: data.sprites.other?.['official-artwork']?.front_default || `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork/${data.id}.png`,
      abilities,
      availableMoves: resolvedMoves.length > 0 ? resolvedMoves : [
        { id: 'protect', name: 'Protect', type: 'normal', category: 'status', power: 0, accuracy: 100, pp: 10, description: 'Blocks incoming moves.' }
      ],
      tier: 'Standard',
      defaultRole: baseStats.atk > baseStats.spa ? 'Physical Attacker' : 'Special Attacker',
    };

    try {
      localStorage.setItem(cacheKey, JSON.stringify(species));
    } catch (e) {}

    return species;
  } catch (err) {
    console.warn('PokéAPI fetch failed or offline:', err);
    return null;
  }
}
