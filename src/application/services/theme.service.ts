// application/services/theme.service.ts
import type { Team, TeamId } from '@/types/team.types';
import type { ITeamRepository } from '@/infrastructure/repositories/team.repository';
import { ColorUtils } from '@/util/color.util';

export interface IThemeService {
  applyTeamColors(teamId: TeamId): Promise<void>;
  resetToDefault(): void;
  getCurrentTeam(): Team | null;
}

export class ThemeService implements IThemeService {
  private currentTeam: Team | null = null;

  constructor(private readonly teamRepository: ITeamRepository) {}

  async applyTeamColors(teamId: TeamId): Promise<void> {
    const team = await this.teamRepository.getById(teamId);
    if (!team) {
      throw new Error(`Team with id ${teamId} not found`);
    }

    this.currentTeam = team;
    this.applyColorsToDOM(team);
    
    // Store preference
    localStorage.setItem('selectedTeam', teamId);
  }

  private applyColorsToDOM(team: Team): void {
    const root = document.documentElement;
    root.style.setProperty('--team-primary', team.colors.primary);
    root.style.setProperty('--team-secondary', team.colors.secondary);
    root.style.setProperty('--team-accent', team.colors.accent);
    
    // Set RGB versions for transparency
    const primaryRgb = ColorUtils.hexToRgb(team.colors.primary);
    const secondaryRgb = ColorUtils.hexToRgb(team.colors.secondary);
    const accentRgb = ColorUtils.hexToRgb(team.colors.accent);
    
    if (primaryRgb) {
      root.style.setProperty('--team-primary-rgb', `${primaryRgb.r}, ${primaryRgb.g}, ${primaryRgb.b}`);
    }
    if (secondaryRgb) {
      root.style.setProperty('--team-secondary-rgb', `${secondaryRgb.r}, ${secondaryRgb.g}, ${secondaryRgb.b}`);
    }
    if (accentRgb) {
      root.style.setProperty('--team-accent-rgb', `${accentRgb.r}, ${accentRgb.g}, ${accentRgb.b}`);
    }
  }

  resetToDefault(): void {
    const root = document.documentElement;
    root.style.setProperty('--team-primary', '#013369');
    root.style.setProperty('--team-secondary', '#D50A0A');
    root.style.setProperty('--team-accent', '#FFFFFF');
    root.style.setProperty('--team-primary-rgb', '1, 51, 105');
    root.style.setProperty('--team-secondary-rgb', '213, 10, 10');
    root.style.setProperty('--team-accent-rgb', '255, 255, 255');
    
    this.currentTeam = null;
    localStorage.removeItem('selectedTeam');
  }

  getCurrentTeam(): Team | null {
    return this.currentTeam;
  }

  async loadSavedTeam(): Promise<void> {
    const savedTeamId = localStorage.getItem('selectedTeam');
    if (savedTeamId) {
      await this.applyTeamColors(savedTeamId);
    }
  }
}