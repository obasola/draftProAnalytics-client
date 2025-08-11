// types/team.types.ts
export interface TeamColors {
  primary: string;
  secondary: string;
  accent: string;
}

export interface Team {
  id: string;
  name: string;
  abbreviation: string;
  colors: TeamColors;
  division: string;
  conference: 'AFC' | 'NFC';
}

export type TeamId = string;
