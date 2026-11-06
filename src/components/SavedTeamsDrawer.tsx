import React, { useState } from 'react';
import { BattleFormat, SavedTeam, TeamMember } from '../types/pokemon';
import { SAMPLE_TEAMS } from '../data/sampleTeams';
import { X, Save, Trash2, Copy, Download, Upload, Check, FolderOpen, Sparkles } from 'lucide-react';

interface SavedTeamsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  savedTeams: SavedTeam[];
  currentMembers: (TeamMember | null)[];
  currentFormat: BattleFormat;
  onLoadTeam: (team: SavedTeam) => void;
  onSaveCurrentTeam: (name: string, notes?: string) => void;
  onDeleteTeam: (id: string) => void;
  onImportTeamJson: (imported: SavedTeam) => void;
}

export const SavedTeamsDrawer: React.FC<SavedTeamsDrawerProps> = ({
  isOpen,
  onClose,
  savedTeams,
  currentMembers,
  currentFormat,
  onLoadTeam,
  onSaveCurrentTeam,
  onDeleteTeam,
  onImportTeamJson,
}) => {
  const [teamName, setTeamName] = useState('');
  const [teamNotes, setTeamNotes] = useState('');
  const [activeTab, setActiveTab] = useState<'myTeams' | 'presets'>('myTeams');
  const [importError, setImportError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName.trim()) return;
    onSaveCurrentTeam(teamName.trim(), teamNotes.trim());
    setTeamName('');
    setTeamNotes('');
  };

  const handleExportJson = (team: SavedTeam) => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(team, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `${team.name.toLowerCase().replace(/\s+/g, '_')}_team.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleFileImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (!parsed.name || !Array.isArray(parsed.members)) {
          throw new Error('Invalid squad file format');
        }
        onImportTeamJson({
          ...parsed,
          id: `imported-${Date.now()}`,
          updatedAt: Date.now(),
        });
        setImportError(null);
      } catch (err: any) {
        setImportError(err.message || 'Failed to parse JSON squad file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/60 backdrop-blur-xs">
      <div
        className="w-full max-w-lg h-full bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-200"
        role="dialog"
      >
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50/80 dark:bg-slate-950/40">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5 text-amber-500" />
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
              Squad Library &amp; Builds
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Controls */}
        <div className="px-4 pt-2 border-b border-slate-200 dark:border-slate-800 flex items-center gap-3 bg-white dark:bg-slate-900">
          <button
            type="button"
            onClick={() => setActiveTab('myTeams')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'myTeams'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            My Saved Squads ({savedTeams.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('presets')}
            className={`px-3 py-2 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'presets'
                ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            Championship Presets ({SAMPLE_TEAMS.length})
          </button>
        </div>

        {/* Body Content */}
        <div className="p-4 flex-1 overflow-y-auto space-y-4">
          {activeTab === 'myTeams' && (
            <>
              {/* Save Current Squad Box */}
              <form
                onSubmit={handleSave}
                className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 space-y-2.5"
              >
                <div className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
                  <span>Save Current Active Squad</span>
                  <span className="font-mono text-[10px] lowercase text-slate-400">
                    stored locally for offline access
                  </span>
                </div>
                <input
                  type="text"
                  required
                  placeholder="Squad Name (e.g., Rain Sweeper VGC, Dual Screens Core)..."
                  value={teamName}
                  onChange={e => setTeamName(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <input
                  type="text"
                  placeholder="Optional battle strategy notes..."
                  value={teamNotes}
                  onChange={e => setTeamNotes(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-900 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500"
                />
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">
                    Format: <strong className="uppercase">{currentFormat}</strong>
                  </span>
                  <button
                    type="submit"
                    className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-xs"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>Save Squad</span>
                  </button>
                </div>
              </form>

              {/* Import / Export JSON tools */}
              <div className="flex items-center justify-between text-xs text-slate-500 pt-1">
                <label className="flex items-center gap-1.5 cursor-pointer hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors">
                  <Upload className="w-3.5 h-3.5" />
                  <span>Import Squad JSON</span>
                  <input
                    type="file"
                    accept=".json"
                    onChange={handleFileImport}
                    className="hidden"
                  />
                </label>
                {importError && (
                  <span className="text-[11px] text-rose-500">{importError}</span>
                )}
              </div>

              {/* Saved Squads List */}
              <div className="space-y-3">
                {savedTeams.map(team => {
                  const activeMembers = team.members.filter((m): m is TeamMember => m !== null);
                  return (
                    <div
                      key={team.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-700 transition-all space-y-2.5 shadow-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                            {team.name}
                          </h4>
                          <div className="flex items-center gap-1.5 text-[11px] text-slate-400 mt-0.5">
                            <span className="uppercase font-semibold">{team.format}</span>
                            <span aria-hidden="true">·</span>
                            <span>{new Date(team.updatedAt).toLocaleDateString()}</span>
                            <span aria-hidden="true">·</span>
                            <span>{activeMembers.length} Pokémon</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleExportJson(team)}
                            title="Export as JSON"
                            className="p-1 hover:bg-slate-100 dark:hover:bg-slate-800 rounded text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => onDeleteTeam(team.id)}
                            title="Delete Squad"
                            className="p-1 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {team.notes && (
                        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">
                          {team.notes}
                        </p>
                      )}

                      {/* Mini Sprite Roster */}
                      <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                        {team.members.map((m, idx) => (
                          <div
                            key={idx}
                            className="w-8 h-8 rounded bg-white dark:bg-slate-800 flex items-center justify-center p-0.5 border border-slate-200/60 dark:border-slate-700 shrink-0"
                            title={m ? m.species.displayName : `Empty Slot ${idx + 1}`}
                          >
                            {m ? (
                              <img
                                src={m.species.spriteUrl}
                                alt={m.species.displayName}
                                className="w-full h-full object-contain"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <span className="text-[10px] text-slate-300">·</span>
                            )}
                          </div>
                        ))}
                      </div>

                      {/* Load Action */}
                      <div className="flex justify-end pt-1">
                        <button
                          type="button"
                          onClick={() => {
                            onLoadTeam(team);
                            onClose();
                          }}
                          className="px-3.5 py-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 rounded-md transition-colors"
                        >
                          Load into Workspace →
                        </button>
                      </div>
                    </div>
                  );
                })}

                {savedTeams.length === 0 && (
                  <div className="p-8 text-center text-xs text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
                    No custom saved squads yet. Name your current build above to save it locally for offline reference!
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === 'presets' && (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Official championship-caliber archetypes fine-tuned with competitive EV spreads, optimal natures, and tier movesets:
              </p>

              {SAMPLE_TEAMS.map(preset => (
                <div
                  key={preset.id}
                  className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 space-y-2.5 shadow-xs"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-display font-bold text-sm text-slate-900 dark:text-white">
                          {preset.name}
                        </span>
                        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 font-mono">
                          {preset.format}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {preset.notes}
                      </p>
                    </div>
                  </div>

                  {/* Mini Sprites */}
                  <div className="flex items-center gap-1.5 bg-slate-50 dark:bg-slate-950/60 p-2 rounded-lg border border-slate-100 dark:border-slate-800/80">
                    {preset.members.map((m, idx) => (
                      <div
                        key={idx}
                        className="w-9 h-9 rounded bg-white dark:bg-slate-800 flex items-center justify-center p-0.5 border border-slate-200/60 dark:border-slate-700 shrink-0"
                        title={m ? `${m.species.displayName} (${m.item?.name})` : ''}
                      >
                        {m && (
                          <img
                            src={m.species.spriteUrl}
                            alt={m.species.displayName}
                            className="w-full h-full object-contain"
                            referrerPolicy="no-referrer"
                          />
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="button"
                      onClick={() => {
                        onLoadTeam(preset);
                        onClose();
                      }}
                      className="px-3.5 py-1 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md transition-all shadow-xs"
                    >
                      Load Preset Squad →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
