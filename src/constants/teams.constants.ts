// constants/teams.constants.ts
export const NFL_DIVISIONS = [
  'AFC East',
  'AFC North', 
  'AFC South',
  'AFC West',
  'NFC East',
  'NFC North',
  'NFC South',
  'NFC West',
] as const;

export const NFL_CONFERENCES = ['AFC', 'NFC'] as const;

export const DEFAULT_TEAM_COLORS = {
  primary: '#013369',
  secondary: '#D50A0A',
  accent: '#FFFFFF',
} as const;
