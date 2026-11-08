import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(express.json({ limit: '5mb' }));

// Initialize Google GenAI instance with server-side API key and User-Agent telemetry
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Synergy Analysis Endpoint
app.post('/api/analyze-synergy', async (req, res) => {
  try {
    const {
      members,
      battleFormat,
      teamName,
      weaknesses,
      resistances,
      immunities,
      offensiveCoverage,
      uncoveredTypes,
      totalPower,
    } = req.body;

    if (!members || !Array.isArray(members) || members.filter(Boolean).length === 0) {
      return res.status(400).json({ error: 'Please add at least 1 Pokémon to generate a team report.' });
    }

    const activeMembers = members.filter(Boolean);

    // Prepare human-readable team breakdown for Gemini
    const teamDescription = activeMembers.map((m: any, idx: number) => {
      const moves = (m.moves || []).filter(Boolean).map((mv: any) => `${mv.name} (${mv.type}, ${mv.category})`).join(', ');
      return `Pokémon ${idx + 1}: ${m.species.displayName}
- Types: ${m.species.types.join(' / ')}
- Level 50 Stats: HP ${m.calculatedStats.hp}, Atk ${m.calculatedStats.atk}, Def ${m.calculatedStats.def}, SpA ${m.calculatedStats.spa}, SpD ${m.calculatedStats.spd}, Spe ${m.calculatedStats.spe}
- Nature: ${m.nature.name}
- Ability: ${m.ability.name} (${m.ability.description || ''})
- Item: ${m.item ? m.item.name : 'None'}
- Moves: ${moves || 'None'}
- Combat Power: ${m.powerRating}
- Role: ${m.role || 'Attacker'}`;
    }).join('\n\n');

    const prompt = `Analyze this competitive Pokémon team for "${teamName || 'Competitive Squad'}" in ${battleFormat === 'doubles' ? 'Doubles (VGC 4v4)' : 'Singles (3v3)'} format for POKEMON CHAMPIONS.

Squad Composition (${activeMembers.length} active Pokémon):
${teamDescription}

Pre-Calculated Metrics:
- Battle Format: ${battleFormat === 'doubles' ? 'Doubles / VGC' : 'Singles (3v3)'}
- Total Power Rating: ${totalPower} / 1000
- Weakness counts by type: ${JSON.stringify(weaknesses || {})}
- Resistance counts by type: ${JSON.stringify(resistances || {})}
- Immunity counts by type: ${JSON.stringify(immunities || {})}
- Types Hit Super-Effectively: ${(offensiveCoverage || []).join(', ') || 'None'}
- Types NOT hit super-effectively: ${(uncoveredTypes || []).join(', ') || 'None'}

CRITICAL FORMAT RULES:
- This is specifically for POKÉMON CHAMPIONS format.
- ALL Paradox Pokémon (Flutter Mane, Iron Bundle, etc.), ALL Treasures of Ruin (Chien-Pao, Chi-Yu, etc.), and ALL Legendaries/Mythicals (Urshifu, Koraidon, Miraidon, Ogerpon, Tornadus, Landorus, etc.) are STRICTLY ILLEGAL/BANNED.
- NEVER suggest or mention banned Pokémon (Flutter Mane, Urshifu, Chien-Pao, etc.). ONLY suggest legal Pokémon Champions species (e.g. Incineroar, Rillaboom, Kingambit, Gholdengo, Archaludon, Dragonite, Garchomp, Amoonguss, Farigiraf, Sneasler, Dragapult, Pelipper, Volcarona, Primarina, Grimmsnarl, Tyranitar, Excadrill, Dondozo, Clefable, Gastrodon, Ursaluna).

Provide an ultra-clear, fast, decision-ready audit report.
The user needs to quickly skim it and make team choices.
Structure it as a bulleted list where each point states:
1. Exactly what the problem is (e.g. "No Water-type resistance: Vulnerable to Rain teams and Palafin/Dondozo.").
2. A direct solutions list for that bullet point (e.g., "Add Gastrodon or Amoonguss", "Equip Passho Berry").
3. A list of which Pokémon on this squad are threatened by this problem.
Include missing resistances, shared weaknesses (2+ members weak to a type), missing offensive coverage, and speed/support gaps.`;

    if (process.env.GEMINI_API_KEY) {
      try {
        const response = await ai.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt,
          config: {
            systemInstruction: `You are an elite competitive Pokémon Champions coach. In Pokémon Champions, all Paradox Pokémon, Treasures of Ruin, and Legendaries/Mythicals are strictly banned. Only recommend and discuss legal Pokémon Champions species. Format feedback as quick, skimmable bullet points with actionable solutions.`,
            responseMimeType: 'application/json',
            responseSchema: {
              type: Type.OBJECT,
              properties: {
                synergyGrade: {
                  type: Type.STRING,
                  description: 'Letter grade rating (S, A+, A, B+, B, C)',
                },
                archetype: {
                  type: Type.STRING,
                  description: 'Brief strategy label (e.g. "Sun Weather Offense", "Trick Room Psyspam")',
                },
                summary: {
                  type: Type.STRING,
                  description: '1 concise sentence summarizing team status',
                },
                auditPoints: {
                  type: Type.ARRAY,
                  items: {
                    type: Type.OBJECT,
                    properties: {
                      problem: {
                        type: Type.STRING,
                        description: 'Punchy 1-sentence statement of exactly what is wrong',
                      },
                      severity: {
                        type: Type.STRING,
                        description: '"critical", "warning", or "moderate"',
                      },
                      typeCategory: {
                        type: Type.STRING,
                        description: 'Affected type or concept (e.g. "Water", "Ground", "Speed Control", "Steel Coverage")',
                      },
                      solutions: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Bulleted list of exact practical solutions to fix this problem',
                      },
                      threatenedPokemon: {
                        type: Type.ARRAY,
                        items: { type: Type.STRING },
                        description: 'Squad members threatened or affected by this issue',
                      },
                      suggestedAddition: {
                        type: Type.OBJECT,
                        properties: {
                          name: { type: Type.STRING },
                          role: { type: Type.STRING },
                          item: { type: Type.STRING },
                          ability: { type: Type.STRING },
                          moves: {
                            type: Type.ARRAY,
                            items: { type: Type.STRING },
                          },
                        },
                      },
                    },
                    required: ['problem', 'severity', 'solutions'],
                  },
                },
                threatenedSummary: {
                  type: Type.ARRAY,
                  items: { type: Type.STRING },
                  description: 'Consolidated list of squad Pokémon that face severe counter-threats',
                },
              },
              required: ['synergyGrade', 'archetype', 'summary', 'auditPoints'],
            },
          },
        });

        const jsonText = response.text?.trim() || '{}';
        const parsedReport = JSON.parse(jsonText);
        return res.json({ report: parsedReport, source: 'gemini' });
      } catch (geminiError: any) {
        console.warn('Gemini generateContent call encountered an issue, falling back to rule engine:', geminiError);
      }
    }

    // High-fidelity algorithmic rule-based fallback if API key is not yet configured
    const auditPoints: any[] = [];
    const threatenedMap = new Map<string, string[]>(); // pokemon -> array of threatening types

    // 1. Analyze defensive holes & shared weaknesses
    const checkTypes = ['water', 'ground', 'fire', 'fairy', 'fighting', 'electric', 'steel', 'ghost', 'ice'];
    checkTypes.forEach(t => {
      const resistCount = (resistances && resistances[t]) || 0;
      const immuneCount = (immunities && immunities[t]) || 0;
      const weakCount = (weaknesses && weaknesses[t]) || 0;
      const typeCap = t.charAt(0).toUpperCase() + t.slice(1);

      // Find who is threatened by this type
      const threatenedMembers = activeMembers.filter((m: any) => {
        const types = m.species.types || [];
        // Approximate weakness if any member has type weak to t
        return weakCount > 0 && types.some((myType: string) => {
          // simple check for popular weaknesses
          if (t === 'water' && ['fire', 'ground', 'rock'].includes(myType)) return true;
          if (t === 'ground' && ['fire', 'electric', 'poison', 'rock', 'steel'].includes(myType)) return true;
          if (t === 'fire' && ['grass', 'ice', 'bug', 'steel'].includes(myType)) return true;
          if (t === 'fairy' && ['dragon', 'fighting', 'dark'].includes(myType)) return true;
          if (t === 'fighting' && ['normal', 'ice', 'rock', 'dark', 'steel'].includes(myType)) return true;
          if (t === 'electric' && ['water', 'flying'].includes(myType)) return true;
          if (t === 'steel' && ['fairy', 'ice', 'rock'].includes(myType)) return true;
          if (t === 'ghost' && ['psychic', 'ghost'].includes(myType)) return true;
          if (t === 'ice' && ['grass', 'ground', 'flying', 'dragon'].includes(myType)) return true;
          return false;
        });
      }).map((m: any) => m.species.displayName);

      threatenedMembers.forEach((name: string) => {
        if (!threatenedMap.has(name)) threatenedMap.set(name, []);
        if (!threatenedMap.get(name)!.includes(typeCap)) {
          threatenedMap.get(name)!.push(typeCap);
        }
      });

      if (resistCount === 0 && immuneCount === 0) {
        auditPoints.push({
          problem: `No ${typeCap}-type resistance or immunity on the squad.`,
          severity: weakCount >= 2 ? 'critical' : 'warning',
          typeCategory: typeCap,
          solutions: [
            `Add a defensive ${typeCap} pivot or redirector (e.g. Amoonguss, Rillaboom, or Gastrodon).`,
            `Equip a type-resist damage-reduction berry (e.g. Passho/Yache/Shuca Berry) or Focus Sash.`,
            `Utilize high-speed offensive pressure to eliminate enemy ${typeCap} attackers before they move.`
          ],
          threatenedPokemon: threatenedMembers.length > 0 ? threatenedMembers : activeMembers.slice(0, 2).map((m: any) => m.species.displayName),
          suggestedAddition: t === 'water' ? {
            name: 'Rillaboom',
            role: 'Grassy Terrain Pivot & Water Check',
            item: 'Assault Vest',
            ability: 'Grassy Surge',
            moves: ['Grassy Glide', 'Fake Out', 'Wood Hammer', 'U-turn'],
          } : undefined,
        });
      } else if (weakCount >= 3) {
        auditPoints.push({
          problem: `Heavy shared vulnerability: ${weakCount} squad members are weak to ${typeCap} attacks.`,
          severity: 'critical',
          typeCategory: typeCap,
          solutions: [
            `Equip defensive mitigation items (Assault Vest, Focus Sash, or resist berry) on primary carry.`,
            `Include redirection support (Amoonguss Rage Powder or Clefairy Follow Me) to protect sweepers.`,
            `Swap one redundant attacker for a reliable ${typeCap} resistance anchor.`
          ],
          threatenedPokemon: threatenedMembers.length > 0 ? threatenedMembers : activeMembers.slice(0, 3).map((m: any) => m.species.displayName),
        });
      }
    });

    // 2. Analyze offensive coverage gaps
    (uncoveredTypes || []).slice(0, 2).forEach((t: string) => {
      const typeCap = t.charAt(0).toUpperCase() + t.slice(1);
      auditPoints.push({
        problem: `Lacks super-effective STAB offensive coverage against ${typeCap}-type defenders.`,
        severity: 'moderate',
        typeCategory: typeCap,
        solutions: [
          `Teach a strong coverage move (e.g. Thunderbolt, Ice Beam, Earth Power, or Close Combat) to your primary special/physical attacker.`,
          `Consider a versatile secondary attacker with innate ${typeCap} coverage.`
        ],
        threatenedPokemon: [],
      });
    });

    // If team has no major issues, add general tactical points
    if (auditPoints.length === 0) {
      auditPoints.push({
        problem: 'Speed control options are limited for late-game positioning.',
        severity: 'moderate',
        typeCategory: 'Speed Control',
        solutions: [
          'Add Tailwind or Icy Wind support to manipulate turn order.',
          'Consider Trick Room reverse mode if facing hyper-offense booster energy teams.'
        ],
        threatenedPokemon: activeMembers.filter((m: any) => (m.species.baseStats?.spe || 0) < 85).map((m: any) => m.species.displayName),
      });
    }

    // Build consolidated threatened Pokémon list
    const threatenedSummary: string[] = [];
    threatenedMap.forEach((types, pokeName) => {
      threatenedSummary.push(`${pokeName} (Vulnerable to ${types.join(', ')})`);
    });
    if (threatenedSummary.length === 0 && activeMembers.length > 0) {
      threatenedSummary.push(`${activeMembers[0].species.displayName} (High-value target vulnerable to targeted double-attacks)`);
    }

    const report = {
      synergyGrade: auditPoints.some(p => p.severity === 'critical') ? 'B+' : activeMembers.length === 6 ? 'S-' : 'A',
      archetype: battleFormat === 'doubles' ? 'Dual-Core Competitive VGC' : 'Balanced Singles Lineup',
      summary: `A high-tempo ${battleFormat} squad with solid offensive pressure. Follow the solutions below to seal defensive gaps.`,
      auditPoints,
      threatenedSummary,
      defensiveWeaknesses: auditPoints.filter(p => p.severity !== 'moderate').map(p => ({
        type: p.typeCategory || 'General',
        severity: p.severity,
        description: p.problem,
        affectedPokemon: p.threatenedPokemon,
      })),
      missingCoverage: (uncoveredTypes || []).slice(0, 3).map((t: string) => ({
        targetType: t.charAt(0).toUpperCase() + t.slice(1),
        explanation: `No super-effective STAB against ${t} defenders.`,
      })),
      recommendedAdditions: [
        {
          pokemonName: 'Rillaboom',
          role: 'Grassy Terrain Pivot & Water Check',
          whyItHelps: 'Provides priority Grassy Glide, Fake Out flinch support, and resists Water and Ground.',
          suggestedItem: 'Assault Vest',
          suggestedAbility: 'Grassy Surge',
          suggestedMoves: ['Grassy Glide', 'Fake Out', 'Wood Hammer', 'U-turn'],
          replacesOrComplements: 'Complements offensive core and mitigates Earthquake damage.',
        },
        {
          pokemonName: 'Amoonguss',
          role: 'Redirection & Sleep Support',
          whyItHelps: 'Absorbs Water, Grass, and Electric moves while offering 100% accurate Spore and Pollen Puff ally healing.',
          suggestedItem: 'Rocky Helmet',
          suggestedAbility: 'Regenerator',
          suggestedMoves: ['Spore', 'Rage Powder', 'Pollen Puff', 'Protect'],
          replacesOrComplements: 'Protects fragile sweepers and controls trick room pacing.',
        },
      ],
      tacticalTips: [
        battleFormat === 'doubles'
          ? 'Lead with your highest speed tier or a Fake Out user to secure turn-1 tempo.'
          : 'Preserve your defensive backbone until opponent hazard setters are removed.',
      ],
    };

    return res.json({ report, source: 'rule-engine' });
  } catch (error: any) {
    console.error('Synergy analyzer server error:', error);
    res.status(500).json({ error: error.message || 'Failed to analyze synergy.' });
  }
});

// Configure Vite middleware in development or static serving in production
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
