/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  BattleFormat,
  Move,
  PokemonSpecies,
  RecommendedAdditionItem,
  SavedTeam,
  TeamMember,
  TeamReport,
} from './types/pokemon';
import { SAMPLE_TEAMS } from './data/sampleTeams';
import { PRESET_COMPETITIVE_POKEMON, isChampionsLegal } from './data/pokemonDatabase';
import { NATURE_MAP } from './data/natures';
import { COMPETITIVE_ITEMS } from './data/items';
import { analyzeTeam, calculateAllStats, calculatePokemonPowerRating } from './utils/statCalculators';
import { generateTeamReport } from './services/synergyService';
import { fetchPokemonFromPokeAPI } from './services/pokeapi';
import { Header } from './components/Header';
import { TeamSlotsGrid } from './components/TeamSlotsGrid';
import { TeamSummaryPanel } from './components/TeamSummaryPanel';
import { PokemonSearchModal } from './components/PokemonSearchModal';
import { PokemonCustomizerModal } from './components/PokemonCustomizerModal';
import { TypeChartModal } from './components/TypeChartModal';
import { SavedTeamsDrawer } from './components/SavedTeamsDrawer';
import { ExportCardModal } from './components/ExportCardModal';
import { TeamReportModal } from './components/TeamReportModal';
import {
  Trophy,
  Swords,
  FolderDown,
  Image as ImageIcon,
  Table,
  Plus,
  Edit2,
  Check,
  Sparkles,
  WifiOff,
  Wifi
} from 'lucide-react';

const STORAGE_SAVED_TEAMS = 'pokemon_champions_saved_teams_v1';
const STORAGE_CURRENT_TEAM = 'pokemon_champions_current_team_v1';
const STORAGE_THEME = 'poke_theme';

export default function App() {
  // Theme state
  const [isDark, setIsDark] = useState<boolean>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_THEME);
      return stored ? stored === 'dark' : true;
    } catch {
      return true;
    }
  });

  // Offline status
  const [isOffline, setIsOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const handleOnline = () => setIsOffline(false);
    const handleOffline = () => setIsOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Sync theme with HTML class
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
      localStorage.setItem(STORAGE_THEME, 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem(STORAGE_THEME, 'light');
    }
  }, [isDark]);

  const toggleTheme = () => setIsDark(prev => !prev);

  // Active Team & Format State
  const [battleFormat, setBattleFormat] = useState<BattleFormat>('doubles');
  const [teamName, setTeamName] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_TEAM);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.name && !parsed.name.includes('World Championship Sun Core')) {
          return parsed.name;
        }
      }
    } catch {}
    return 'Champions Doubles Balance Core';
  });
  const [isEditingTeamName, setIsEditingTeamName] = useState(false);
  const [members, setMembers] = useState<(TeamMember | null)[]>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_CURRENT_TEAM);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed.members)) {
          const allLegal = parsed.members.every((m: TeamMember | null) =>
            !m || isChampionsLegal(m.species.name)
          );
          if (allLegal && parsed.members.length === 6) {
            return parsed.members;
          }
        }
      }
    } catch {}
    // Default to the first championship sample team (100% Champions legal)
    return SAMPLE_TEAMS[0].members;
  });

  // Saved Teams Library State
  const [savedTeams, setSavedTeams] = useState<SavedTeam[]>(() => {
    try {
      const stored = localStorage.getItem(STORAGE_SAVED_TEAMS);
      if (stored) return JSON.parse(stored);
    } catch {}
    return [];
  });

  // Auto-save current team changes
  useEffect(() => {
    try {
      localStorage.setItem(
        STORAGE_CURRENT_TEAM,
        JSON.stringify({ name: teamName, format: battleFormat, members })
      );
    } catch (e) {}
  }, [teamName, battleFormat, members]);

  // Persist saved teams
  const persistSavedTeams = (teams: SavedTeam[]) => {
    setSavedTeams(teams);
    try {
      localStorage.setItem(STORAGE_SAVED_TEAMS, JSON.stringify(teams));
    } catch (e) {}
  };

  // Modals state
  const [searchModalOpen, setSearchModalOpen] = useState(false);
  const [searchTargetSlotIndex, setSearchTargetSlotIndex] = useState(0);

  const [customizerModalOpen, setCustomizerModalOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);

  const [typeChartModalOpen, setTypeChartModalOpen] = useState(false);
  const [savedSquadsOpen, setSavedSquadsOpen] = useState(false);
  const [exportModalOpen, setExportModalOpen] = useState(false);

  // AI Synergy Report State
  const [synergyReportModalOpen, setSynergyReportModalOpen] = useState(false);
  const [isAnalyzingSynergy, setIsAnalyzingSynergy] = useState(false);
  const [teamReport, setTeamReport] = useState<TeamReport | null>(null);
  const [synergyError, setSynergyError] = useState<string | null>(null);

  // Team Synergy & Power Analysis
  const teamAnalysis = useMemo(() => {
    return analyzeTeam(members);
  }, [members]);

  // Slot Handlers
  const handleSelectSlotToAdd = (slotIndex: number) => {
    setSearchTargetSlotIndex(slotIndex);
    setSearchModalOpen(true);
  };

  const handleAddNewPokemonCTA = () => {
    const emptyIndex = members.findIndex(m => m === null);
    const targetIdx = emptyIndex !== -1 ? emptyIndex : 0;
    handleSelectSlotToAdd(targetIdx);
  };

  const handleSelectPokemonSpecies = (species: PokemonSpecies) => {
    const slotIdx = searchTargetSlotIndex;

    // Pick smart default nature based on stats
    let defaultNature = NATURE_MAP['adamant'];
    if (species.baseStats.spa > species.baseStats.atk) {
      defaultNature = species.baseStats.spe >= 100 ? NATURE_MAP['timid'] : NATURE_MAP['modest'];
    } else {
      defaultNature = species.baseStats.spe >= 100 ? NATURE_MAP['jolly'] : NATURE_MAP['adamant'];
    }

    // Default item
    const defaultItem = COMPETITIVE_ITEMS[0];

    // Default moves (take first 4)
    const initialMoves: (Move | null)[] = [...species.availableMoves.slice(0, 4)];
    while (initialMoves.length < 4) initialMoves.push(null);

    // Default Stat Points in Pokémon Champions (66 total points budget, max 32 per stat)
    const defaultEvs = species.baseStats.spa > species.baseStats.atk
      ? { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }
      : { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 };

    const defaultIvs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

    const calculatedStats = calculateAllStats(species, defaultEvs, defaultNature);
    const powerRating = calculatePokemonPowerRating(calculatedStats, species, initialMoves, defaultItem, defaultNature);

    const newMember: TeamMember = {
      id: `member-${slotIdx}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slotIndex: slotIdx,
      species,
      level: 50,
      nature: defaultNature,
      ability: species.abilities[0],
      item: defaultItem,
      moves: initialMoves,
      evs: defaultEvs,
      ivs: defaultIvs,
      role: species.defaultRole || 'Battle Ready',
      calculatedStats,
      powerRating,
    };

    setMembers(prev => {
      const updated = [...prev];
      updated[slotIdx] = newMember;
      return updated;
    });

    // Auto-open customizer immediately so the user can fine-tune right away!
    setEditingMember(newMember);
    setCustomizerModalOpen(true);
  };

  const handleEditMember = (member: TeamMember) => {
    setEditingMember(member);
    setCustomizerModalOpen(true);
  };

  const handleSaveMemberCustomization = (updated: TeamMember) => {
    setMembers(prev => {
      const list = [...prev];
      list[updated.slotIndex] = updated;
      return list;
    });
  };

  const handleRemoveMember = (slotIndex: number) => {
    setMembers(prev => {
      const list = [...prev];
      list[slotIndex] = null;
      return list;
    });
  };

  const handleDuplicateMember = (slotIndex: number) => {
    const source = members[slotIndex];
    if (!source) return;

    // Find next empty slot
    const emptyIndex = members.findIndex(m => m === null);
    if (emptyIndex === -1) return;

    const clone: TeamMember = {
      ...source,
      id: `clone-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slotIndex: emptyIndex,
    };

    setMembers(prev => {
      const list = [...prev];
      list[emptyIndex] = clone;
      return list;
    });
  };

  const handleMoveSlot = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex || fromIndex < 0 || toIndex < 0 || fromIndex >= 6 || toIndex >= 6) return;
    setMembers(prev => {
      const copy = [...prev];
      const temp = copy[fromIndex];
      copy[fromIndex] = copy[toIndex];
      copy[toIndex] = temp;

      // Update slot index properties
      return copy.map((m, idx) => (m ? { ...m, slotIndex: idx } : null));
    });
  };

  const handleClearTeam = () => {
    if (window.confirm('Clear all Pokémon from your current lineup?')) {
      setMembers([null, null, null, null, null, null]);
    }
  };

  // Saved Squad Actions
  const handleSaveCurrentTeam = (name: string, notes?: string) => {
    const newSaved: SavedTeam = {
      id: `saved-${Date.now()}`,
      name,
      format: battleFormat,
      updatedAt: Date.now(),
      notes,
      members: [...members],
    };
    persistSavedTeams([newSaved, ...savedTeams]);
    setTeamName(name);
  };

  const handleLoadTeam = (team: SavedTeam) => {
    setTeamName(team.name);
    setBattleFormat(team.format);
    setMembers([...team.members]);
  };

  const handleDeleteTeam = (id: string) => {
    const filtered = savedTeams.filter(t => t.id !== id);
    persistSavedTeams(filtered);
  };

  const handleImportTeamJson = (imported: SavedTeam) => {
    persistSavedTeams([imported, ...savedTeams]);
    handleLoadTeam(imported);
  };

  // AI Synergy Report Triggers & Handlers
  const handleTriggerSynergyAnalysis = useCallback(async () => {
    const activeCount = members.filter(m => m !== null).length;
    if (activeCount === 0) {
      alert('Please add at least 1 Pokémon to your squad before generating an AI Synergy Report.');
      return;
    }

    setSynergyReportModalOpen(true);
    setIsAnalyzingSynergy(true);
    setSynergyError(null);

    try {
      const rep = await generateTeamReport(members, battleFormat, teamName, teamAnalysis);
      setTeamReport(rep);
    } catch (err: any) {
      console.error('Synergy generation error:', err);
      setSynergyError(err.message || 'Failed to generate team report.');
    } finally {
      setIsAnalyzingSynergy(false);
    }
  }, [members, battleFormat, teamName, teamAnalysis]);

  const handleAdoptRecommendation = useCallback(async (rec: RecommendedAdditionItem) => {
    let targetSpecies = PRESET_COMPETITIVE_POKEMON.find(
      p => p.displayName.toLowerCase() === rec.pokemonName.toLowerCase() ||
           p.name.toLowerCase() === rec.pokemonName.toLowerCase().replace(/\s+/g, '-')
    );

    if (!targetSpecies) {
      targetSpecies = (await fetchPokemonFromPokeAPI(rec.pokemonName)) || undefined;
    }

    if (!targetSpecies) {
      alert(`Could not find Pokédex data for ${rec.pokemonName}.`);
      return;
    }

    // Determine target slot (first empty slot or last slot 5)
    const emptyIndex = members.findIndex(m => m === null);
    const targetIdx = emptyIndex !== -1 ? emptyIndex : 5;

    const matchedItem = COMPETITIVE_ITEMS.find(
      i => i.name.toLowerCase() === rec.suggestedItem.toLowerCase()
    ) || COMPETITIVE_ITEMS[0];

    const matchedAbility = targetSpecies.abilities.find(
      a => a.name.toLowerCase() === rec.suggestedAbility.toLowerCase()
    ) || targetSpecies.abilities[0];

    const matchedMoves: (Move | null)[] = rec.suggestedMoves.map(mName => {
      const existing = targetSpecies!.availableMoves.find(
        m => m.name.toLowerCase() === mName.toLowerCase()
      );
      if (existing) return existing;
      return {
        id: mName.toLowerCase().replace(/\s+/g, '-'),
        name: mName,
        type: targetSpecies!.types[0] || 'normal',
        category: 'physical',
        power: 80,
        accuracy: 100,
        pp: 15,
        description: 'Recommended competitive attack.',
      };
    });
    while (matchedMoves.length < 4) matchedMoves.push(null);

    const nature = targetSpecies.baseStats.spa > targetSpecies.baseStats.atk
      ? (targetSpecies.baseStats.spe >= 100 ? NATURE_MAP['timid'] : NATURE_MAP['modest'])
      : (targetSpecies.baseStats.spe >= 100 ? NATURE_MAP['jolly'] : NATURE_MAP['adamant']);

    const defaultEvs = targetSpecies.baseStats.spa > targetSpecies.baseStats.atk
      ? { hp: 2, atk: 0, def: 0, spa: 32, spd: 0, spe: 32 }
      : { hp: 2, atk: 32, def: 0, spa: 0, spd: 0, spe: 32 };

    const defaultIvs = { hp: 31, atk: 31, def: 31, spa: 31, spd: 31, spe: 31 };

    const calculatedStats = calculateAllStats(targetSpecies, defaultEvs, nature);
    const powerRating = calculatePokemonPowerRating(calculatedStats, targetSpecies, matchedMoves, matchedItem, nature);

    const newMember: TeamMember = {
      id: `member-${targetIdx}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
      slotIndex: targetIdx,
      species: targetSpecies,
      level: 50,
      nature,
      ability: matchedAbility,
      item: matchedItem,
      moves: matchedMoves,
      evs: defaultEvs,
      ivs: defaultIvs,
      role: rec.role,
      calculatedStats,
      powerRating,
    };

    setMembers(prev => {
      const copy = [...prev];
      copy[targetIdx] = newMember;
      return copy;
    });

    setSynergyReportModalOpen(false);
  }, [members]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors selection:bg-rose-500 selection:text-white">
      {/* Top Bar Contract (3 zones) */}
      <Header
        battleFormat={battleFormat}
        onFormatChange={setBattleFormat}
        onOpenTypeChart={() => setTypeChartModalOpen(true)}
        onOpenSavedSquads={() => setSavedSquadsOpen(true)}
        onOpenExport={() => setExportModalOpen(true)}
        onOpenSynergyReport={handleTriggerSynergyAnalysis}
        onAddNewPokemon={handleAddNewPokemonCTA}
        isDark={isDark}
        onToggleTheme={toggleTheme}
        isOffline={isOffline}
      />

      {/* Main Workspace */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
        {/* Team Header Strip: Title, Format Tag, Quick Actions */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 sm:p-5 shadow-xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-500 to-rose-500 flex items-center justify-center text-white shrink-0 shadow-xs">
              <Trophy className="w-5 h-5" />
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                {isEditingTeamName ? (
                  <form
                    onSubmit={e => {
                      e.preventDefault();
                      setIsEditingTeamName(false);
                    }}
                    className="flex items-center gap-1.5"
                  >
                    <input
                      type="text"
                      autoFocus
                      value={teamName}
                      onChange={e => setTeamName(e.target.value)}
                      onBlur={() => setIsEditingTeamName(false)}
                      className="px-2 py-1 text-base font-bold font-display rounded-md border border-indigo-500 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
                    />
                    <button type="submit" className="p-1 text-indigo-600 dark:text-indigo-400">
                      <Check className="w-4 h-4" />
                    </button>
                  </form>
                ) : (
                  <div className="flex items-center gap-2 group cursor-pointer" onClick={() => setIsEditingTeamName(true)}>
                    <h1 className="font-display font-extrabold text-xl sm:text-2xl text-slate-900 dark:text-white tracking-tight truncate">
                      {teamName}
                    </h1>
                    <button
                      type="button"
                      title="Rename Team"
                      className="opacity-60 group-hover:opacity-100 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-opacity"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                  </div>
                )}
                <span className="text-xs uppercase font-bold px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400 font-mono">
                  {battleFormat === 'doubles' ? 'VGC Doubles' : 'Singles'}
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Competitive EV / IV fine-tuning · Real-time team power calculations · PokéAPI sync
              </p>
            </div>
          </div>

          {/* Quick Toolbar */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleTriggerSynergyAnalysis}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-purple-200 dark:border-purple-800 bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
              <span>AI Synergy</span>
            </button>
            <button
              type="button"
              onClick={() => setSavedSquadsOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              <FolderDown className="w-3.5 h-3.5 text-amber-500" />
              <span>Save / Load</span>
            </button>
            <button
              type="button"
              onClick={() => setExportModalOpen(true)}
              className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white shadow-xs transition-all active:scale-95"
            >
              <ImageIcon className="w-3.5 h-3.5" />
              <span>Export Card</span>
            </button>
          </div>
        </section>

        {/* 6 Pokemon Grid with Drag and Drop */}
        <TeamSlotsGrid
          members={members}
          battleFormat={battleFormat}
          onSelectSlot={handleSelectSlotToAdd}
          onEditMember={handleEditMember}
          onRemoveMember={handleRemoveMember}
          onDuplicateMember={handleDuplicateMember}
          onMoveSlot={handleMoveSlot}
          onClearTeam={handleClearTeam}
        />

        {/* Real-time Team Power Analysis & Matrix */}
        <TeamSummaryPanel
          analysis={teamAnalysis}
          members={members}
          battleFormat={battleFormat}
          onOpenTypeChart={() => setTypeChartModalOpen(true)}
          onOpenSynergyReport={handleTriggerSynergyAnalysis}
          isAnalyzing={isAnalyzingSynergy}
        />
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-6 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700 dark:text-slate-300">Pokémon Champions Builder</span>
            <span aria-hidden="true">·</span>
            <span>Singles &amp; Doubles Lineup Optimizer</span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <button
              type="button"
              onClick={() => setTypeChartModalOpen(true)}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors"
            >
              Type Chart Guide
            </button>
            <span>·</span>
            <div className="flex items-center gap-1 text-[11px]">
              {isOffline ? (
                <>
                  <WifiOff className="w-3.5 h-3.5 text-amber-500" />
                  <span className="text-amber-500">Offline Ready</span>
                </>
              ) : (
                <>
                  <Wifi className="w-3.5 h-3.5 text-emerald-500" />
                  <span>PokéAPI Connected</span>
                </>
              )}
            </div>
          </div>
        </div>
      </footer>

      {/* Modals & Drawers */}
      <PokemonSearchModal
        isOpen={searchModalOpen}
        onClose={() => setSearchModalOpen(false)}
        onSelectPokemon={handleSelectPokemonSpecies}
        targetSlotIndex={searchTargetSlotIndex}
      />

      <PokemonCustomizerModal
        isOpen={customizerModalOpen}
        member={editingMember}
        onClose={() => {
          setCustomizerModalOpen(false);
          setEditingMember(null);
        }}
        onSave={handleSaveMemberCustomization}
      />

      <TypeChartModal
        isOpen={typeChartModalOpen}
        onClose={() => setTypeChartModalOpen(false)}
      />

      <SavedTeamsDrawer
        isOpen={savedSquadsOpen}
        onClose={() => setSavedSquadsOpen(false)}
        savedTeams={savedTeams}
        currentMembers={members}
        currentFormat={battleFormat}
        onLoadTeam={handleLoadTeam}
        onSaveCurrentTeam={handleSaveCurrentTeam}
        onDeleteTeam={handleDeleteTeam}
        onImportTeamJson={handleImportTeamJson}
      />

      <ExportCardModal
        isOpen={exportModalOpen}
        onClose={() => setExportModalOpen(false)}
        members={members}
        battleFormat={battleFormat}
        teamName={teamName}
        analysis={teamAnalysis}
      />

      <TeamReportModal
        isOpen={synergyReportModalOpen}
        onClose={() => setSynergyReportModalOpen(false)}
        report={teamReport}
        isLoading={isAnalyzingSynergy}
        error={synergyError}
        teamName={teamName}
        battleFormat={battleFormat}
        onRefreshAnalysis={handleTriggerSynergyAnalysis}
        onAdoptRecommendation={handleAdoptRecommendation}
      />
    </div>
  );
}
