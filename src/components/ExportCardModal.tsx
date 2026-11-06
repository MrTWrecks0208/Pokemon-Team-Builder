import React, { useRef, useState } from 'react';
import { BattleFormat, TeamAnalysis, TeamMember } from '../types/pokemon';
import { TypeBadge } from './TypeBadge';
import html2canvas from 'html2canvas';
import { X, Download, Copy, Check, Loader2, Sparkles, Image as ImageIcon } from 'lucide-react';

interface ExportCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: (TeamMember | null)[];
  battleFormat: BattleFormat;
  teamName: string;
  analysis: TeamAnalysis;
}

export const ExportCardModal: React.FC<ExportCardModalProps> = ({
  isOpen,
  onClose,
  members,
  battleFormat,
  teamName,
  analysis,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const [previewDataUrl, setPreviewDataUrl] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: '#090d16',
        logging: false,
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `${teamName.toLowerCase().replace(/\s+/g, '_')}_champion_card.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Error generating image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyImage = async () => {
    if (!cardRef.current) return;
    try {
      setIsGenerating(true);
      const canvas = await html2canvas(cardRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#090d16',
        logging: false,
      });
      canvas.toBlob(async blob => {
        if (!blob) return;
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          setCopied(true);
          setTimeout(() => setCopied(false), 2500);
        } catch (clipErr) {
          console.warn('Clipboard API write failed, downloading instead:', clipErr);
          const link = document.createElement('a');
          link.download = `${teamName.toLowerCase().replace(/\s+/g, '_')}_champion_card.png`;
          link.href = canvas.toDataURL('image/png');
          link.click();
        }
      });
    } catch (err) {
      console.error('Error copying image:', err);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-xs overflow-y-auto">
      <div
        className="w-full max-w-5xl max-h-[92vh] bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150 my-auto"
        role="dialog"
      >
        {/* Top Header */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <ImageIcon className="w-5 h-5 text-emerald-500" />
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white">
                Export Champion Battle Card
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Generate high-resolution PNG image graphic ready to share with friends &amp; teammates
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Preview Scroll Container */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto bg-slate-100 dark:bg-slate-950/80 flex justify-center">
          {/* THE EXPORTABLE CARD COMPONENT */}
          <div
            ref={cardRef}
            className="w-full max-w-[940px] bg-[#090d16] text-white rounded-3xl p-6 sm:p-8 border border-slate-800 shadow-2xl space-y-6 select-none relative overflow-hidden"
          >
            {/* Background subtle glow patterns */}
            <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-96 h-96 bg-rose-600/10 rounded-full blur-3xl pointer-events-none" />

            {/* Header Lockup */}
            <div className="relative z-10 flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black tracking-widest text-indigo-400 uppercase font-mono">
                    ⚡ POKÉMON CHAMPIONS BATTLE ROSTER
                  </span>
                  <span className="text-slate-600">·</span>
                  <span className="text-xs font-bold uppercase px-2 py-0.5 rounded-md bg-slate-800 text-slate-300">
                    {battleFormat === 'doubles' ? 'Doubles (VGC 4v4)' : 'Singles (3v3)'}
                  </span>
                </div>
                <h1 className="font-display font-extrabold text-2xl sm:text-3xl tracking-tight text-white mt-1">
                  {teamName || 'Competitive Battle Squad'}
                </h1>
              </div>

              {/* Power Rating Pill */}
              <div className="bg-gradient-to-br from-indigo-950 to-slate-900 border border-indigo-500/30 px-4 py-2.5 rounded-2xl flex items-center gap-3 shadow-lg">
                <div className="text-right">
                  <div className="text-[10px] uppercase font-mono text-indigo-300 tracking-wider">
                    Total Team Power
                  </div>
                  <div className="font-mono font-black text-2xl text-white leading-none">
                    {analysis.totalPower}
                    <span className="text-xs font-sans text-indigo-400 font-normal"> / 1000</span>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-indigo-600/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 font-bold">
                  ★
                </div>
              </div>
            </div>

            {/* 6 Pokemon Grid in Card */}
            <div className="relative z-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
              {members.map((member, idx) => {
                if (!member) {
                  return (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl border border-dashed border-slate-800 bg-slate-900/40 min-h-[220px] flex flex-col items-center justify-center text-center text-slate-600"
                    >
                      <span className="text-xs font-semibold">Slot #{idx + 1} Empty</span>
                    </div>
                  );
                }

                const { species, nature, ability, item, moves, calculatedStats, powerRating } = member;

                return (
                  <div
                    key={member.id}
                    className="p-4 rounded-2xl border border-slate-800 bg-slate-900/90 shadow-md flex flex-col justify-between gap-3 relative overflow-hidden"
                  >
                    {/* Top Row: Sprite + Species + Power */}
                    <div className="flex items-start gap-3">
                      <div className="w-14 h-14 rounded-xl bg-slate-950/70 p-1 flex items-center justify-center shrink-0 border border-slate-800">
                        <img
                          src={species.artworkUrl || species.spriteUrl}
                          alt={species.displayName}
                          className="w-full h-full object-contain filter drop-shadow-sm"
                          crossOrigin="anonymous"
                          referrerPolicy="no-referrer"
                        />
                      </div>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center justify-between gap-1">
                          <h4 className="font-display font-bold text-sm text-white truncate">
                            {species.displayName}
                          </h4>
                          <span className="font-mono text-[10px] text-indigo-400 font-bold px-1.5 py-0.5 rounded bg-indigo-950 border border-indigo-900">
                            {powerRating} PWR
                          </span>
                        </div>

                        {/* Types */}
                        <div className="flex items-center gap-1 mt-1">
                          {species.types.map(t => (
                            <TypeBadge key={t} type={t} size="sm" />
                          ))}
                        </div>

                        {/* Item & Ability */}
                        <div className="text-[11px] text-slate-400 mt-1.5 space-y-0.5 truncate">
                          <div className="truncate">
                            <span className="text-slate-500">Item: </span>
                            <span className="text-slate-200 font-semibold">{item ? item.name : 'None'}</span>
                          </div>
                          <div className="truncate">
                            <span className="text-slate-500">Ability: </span>
                            <span className="text-slate-300">{ability.name}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Moves List (4 moves) */}
                    <div className="grid grid-cols-2 gap-1 bg-slate-950/60 p-2 rounded-xl border border-slate-800/80 text-[10px]">
                      {moves.map((m, mIdx) => (
                        <div
                          key={mIdx}
                          className="px-1.5 py-1 rounded bg-slate-900 border border-slate-800 flex items-center justify-between gap-1 truncate"
                        >
                          <span className="truncate text-slate-200 font-medium">
                            {m ? m.name : '—'}
                          </span>
                          {m && <TypeBadge type={m.type} size="sm" className="scale-75 origin-right" />}
                        </div>
                      ))}
                    </div>

                    {/* Level 50 Stats Row */}
                    <div className="grid grid-cols-6 gap-1 text-center font-mono text-[10px] bg-slate-950/40 p-1.5 rounded-lg border border-slate-800/50">
                      <div>
                        <span className="text-[8px] text-slate-500 block">HP</span>
                        <span className="font-bold text-slate-300">{calculatedStats.hp}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block">ATK</span>
                        <span className={`font-bold ${nature.increasedStat === 'atk' ? 'text-rose-400' : 'text-slate-300'}`}>{calculatedStats.atk}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block">DEF</span>
                        <span className={`font-bold ${nature.increasedStat === 'def' ? 'text-rose-400' : 'text-slate-300'}`}>{calculatedStats.def}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block">SPA</span>
                        <span className={`font-bold ${nature.increasedStat === 'spa' ? 'text-rose-400' : 'text-slate-300'}`}>{calculatedStats.spa}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block">SPD</span>
                        <span className={`font-bold ${nature.increasedStat === 'spd' ? 'text-rose-400' : 'text-slate-300'}`}>{calculatedStats.spd}</span>
                      </div>
                      <div>
                        <span className="text-[8px] text-slate-500 block">SPE</span>
                        <span className={`font-bold ${nature.increasedStat === 'spe' ? 'text-rose-400' : 'text-slate-300'}`}>{calculatedStats.spe}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Card Footer Banner */}
            <div className="relative z-10 flex items-center justify-between text-xs text-slate-500 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2">
                <span>Created with Pokémon Champions Team Builder</span>
                <span>·</span>
                <span>Official PokéAPI Verified</span>
              </div>
              <div className="font-mono text-[11px] text-slate-400">
                {new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
              </div>
            </div>
          </div>
        </div>

        {/* Modal Bottom Actions */}
        <div className="px-5 py-3.5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between gap-3">
          <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline">
            Export format: High-DPI 2x PNG Card
          </span>

          <div className="flex items-center gap-2 ml-auto">
            <button
              type="button"
              disabled={isGenerating}
              onClick={handleCopyImage}
              className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700 transition-colors"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copied Image!' : 'Copy to Clipboard'}</span>
            </button>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleDownload}
              className="flex items-center gap-1.5 px-5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-lg shadow-sm transition-all"
            >
              {isGenerating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
              <span>Download PNG Image</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
