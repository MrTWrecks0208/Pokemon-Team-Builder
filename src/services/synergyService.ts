import { BattleFormat, TeamAnalysis, TeamMember, TeamReport } from '../types/pokemon';

export async function generateTeamReport(
  members: (TeamMember | null)[],
  battleFormat: BattleFormat,
  teamName: string,
  analysis: TeamAnalysis
): Promise<TeamReport> {
  const response = await fetch('/api/analyze-synergy', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      members,
      battleFormat,
      teamName,
      weaknesses: analysis.weaknesses,
      resistances: analysis.resistances,
      immunities: analysis.immunities,
      offensiveCoverage: analysis.offensiveCoverage,
      uncoveredTypes: analysis.uncoveredTypes,
      totalPower: analysis.totalPower,
    }),
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Server responded with status ${response.status}`);
  }

  const data = await response.json();
  return {
    ...data.report,
    generatedAt: Date.now(),
  };
}
