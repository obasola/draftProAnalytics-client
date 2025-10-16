import { TeamColors, TeamId } from "@/types/team.types";

// domain/entities/team.entity.ts
export class TeamEntity {
  constructor(
    public readonly id: TeamId,
    public readonly name: string,
    public readonly abbreviation: string,
    public readonly colors: TeamColors,
    public readonly division: string,
    public readonly conference: 'AFC' | 'NFC'
  ) {}

  public applyColors(): void {
    const root = document.documentElement;
    root.style.setProperty('--team-primary', this.colors.primary);
    root.style.setProperty('--team-secondary', this.colors.secondary);
    root.style.setProperty('--team-accent', this.colors.accent);
  }

  public getContrastColor(backgroundColor: string): string {
    // Simple contrast calculation - could be enhanced
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substr(0, 2), 16);
    const g = parseInt(hex.substr(2, 2), 16);
    const b = parseInt(hex.substr(4, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#FFFFFF';
  }
}