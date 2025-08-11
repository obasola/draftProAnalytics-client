// infrastructure/repositories/team.repository.ts
import type { Team, TeamId } from '@/types/team.types';

export interface ITeamRepository {
  getAll(): Promise<Team[]>;
  getById(id: TeamId): Promise<Team | null>;
  getByDivision(division: string): Promise<Team[]>;
  getByConference(conference: 'AFC' | 'NFC'): Promise<Team[]>;
}

export class TeamRepository implements ITeamRepository {
  private readonly teams: Map<TeamId, Team> = new Map();

  constructor() {
    this.initializeTeams();
  }

  private initializeTeams(): void {
    const teamsData: Team[] = [
      // AFC East
      { id: 'bills', name: 'Buffalo Bills', abbreviation: 'BUF', colors: { primary: '#00338D', secondary: '#C60C30', accent: '#FFFFFF' }, division: 'AFC East', conference: 'AFC' },
      { id: 'dolphins', name: 'Miami Dolphins', abbreviation: 'MIA', colors: { primary: '#008E97', secondary: '#FC4C02', accent: '#005778' }, division: 'AFC East', conference: 'AFC' },
      { id: 'patriots', name: 'New England Patriots', abbreviation: 'NE', colors: { primary: '#002244', secondary: '#C60C30', accent: '#B0B7BC' }, division: 'AFC East', conference: 'AFC' },
      { id: 'jets', name: 'New York Jets', abbreviation: 'NYJ', colors: { primary: '#125740', secondary: '#FFFFFF', accent: '#000000' }, division: 'AFC East', conference: 'AFC' },
      
      // AFC North
      { id: 'ravens', name: 'Baltimore Ravens', abbreviation: 'BAL', colors: { primary: '#241773', secondary: '#000000', accent: '#9E7C0C' }, division: 'AFC North', conference: 'AFC' },
      { id: 'bengals', name: 'Cincinnati Bengals', abbreviation: 'CIN', colors: { primary: '#FB4F14', secondary: '#000000', accent: '#FFFFFF' }, division: 'AFC North', conference: 'AFC' },
      { id: 'browns', name: 'Cleveland Browns', abbreviation: 'CLE', colors: { primary: '#311D00', secondary: '#FF3C00', accent: '#FFFFFF' }, division: 'AFC North', conference: 'AFC' },
      { id: 'steelers', name: 'Pittsburgh Steelers', abbreviation: 'PIT', colors: { primary: '#FFB612', secondary: '#101820', accent: '#FFFFFF' }, division: 'AFC North', conference: 'AFC' },
      
      // AFC South
      { id: 'texans', name: 'Houston Texans', abbreviation: 'HOU', colors: { primary: '#03202F', secondary: '#A71930', accent: '#FFFFFF' }, division: 'AFC South', conference: 'AFC' },
      { id: 'colts', name: 'Indianapolis Colts', abbreviation: 'IND', colors: { primary: '#002C5F', secondary: '#FFFFFF', accent: '#A2AAAD' }, division: 'AFC South', conference: 'AFC' },
      { id: 'jaguars', name: 'Jacksonville Jaguars', abbreviation: 'JAX', colors: { primary: '#006778', secondary: '#D7A22A', accent: '#101820' }, division: 'AFC South', conference: 'AFC' },
      { id: 'titans', name: 'Tennessee Titans', abbreviation: 'TEN', colors: { primary: '#0C2340', secondary: '#4B92DB', accent: '#C8102E' }, division: 'AFC South', conference: 'AFC' },
      
      // AFC West
      { id: 'broncos', name: 'Denver Broncos', abbreviation: 'DEN', colors: { primary: '#FB4F14', secondary: '#002244', accent: '#FFFFFF' }, division: 'AFC West', conference: 'AFC' },
      { id: 'chiefs', name: 'Kansas City Chiefs', abbreviation: 'KC', colors: { primary: '#E31837', secondary: '#FFB81C', accent: '#FFFFFF' }, division: 'AFC West', conference: 'AFC' },
      { id: 'raiders', name: 'Las Vegas Raiders', abbreviation: 'LV', colors: { primary: '#000000', secondary: '#A5ACAF', accent: '#FFFFFF' }, division: 'AFC West', conference: 'AFC' },
      { id: 'chargers', name: 'Los Angeles Chargers', abbreviation: 'LAC', colors: { primary: '#0080C6', secondary: '#FFC20E', accent: '#FFFFFF' }, division: 'AFC West', conference: 'AFC' },
      
      // NFC East
      { id: 'cowboys', name: 'Dallas Cowboys', abbreviation: 'DAL', colors: { primary: '#003594', secondary: '#869397', accent: '#FFFFFF' }, division: 'NFC East', conference: 'NFC' },
      { id: 'giants', name: 'New York Giants', abbreviation: 'NYG', colors: { primary: '#0B2265', secondary: '#A71930', accent: '#FFFFFF' }, division: 'NFC East', conference: 'NFC' },
      { id: 'eagles', name: 'Philadelphia Eagles', abbreviation: 'PHI', colors: { primary: '#004C54', secondary: '#A5ACAF', accent: '#000000' }, division: 'NFC East', conference: 'NFC' },
      { id: 'commanders', name: 'Washington Commanders', abbreviation: 'WAS', colors: { primary: '#5A1414', secondary: '#FFB612', accent: '#FFFFFF' }, division: 'NFC East', conference: 'NFC' },
      
      // NFC North
      { id: 'bears', name: 'Chicago Bears', abbreviation: 'CHI', colors: { primary: '#0B162A', secondary: '#C83803', accent: '#FFFFFF' }, division: 'NFC North', conference: 'NFC' },
      { id: 'lions', name: 'Detroit Lions', abbreviation: 'DET', colors: { primary: '#0076B6', secondary: '#B0B7BC', accent: '#FFFFFF' }, division: 'NFC North', conference: 'NFC' },
      { id: 'packers', name: 'Green Bay Packers', abbreviation: 'GB', colors: { primary: '#203731', secondary: '#FFB612', accent: '#FFFFFF' }, division: 'NFC North', conference: 'NFC' },
      { id: 'vikings', name: 'Minnesota Vikings', abbreviation: 'MIN', colors: { primary: '#4F2683', secondary: '#FFC62F', accent: '#FFFFFF' }, division: 'NFC North', conference: 'NFC' },
      
      // NFC South
      { id: 'falcons', name: 'Atlanta Falcons', abbreviation: 'ATL', colors: { primary: '#A71930', secondary: '#000000', accent: '#A5ACAF' }, division: 'NFC South', conference: 'NFC' },
      { id: 'panthers', name: 'Carolina Panthers', abbreviation: 'CAR', colors: { primary: '#0085CA', secondary: '#101820', accent: '#BFC0BF' }, division: 'NFC South', conference: 'NFC' },
      { id: 'saints', name: 'New Orleans Saints', abbreviation: 'NO', colors: { primary: '#D3BC8D', secondary: '#101820', accent: '#FFFFFF' }, division: 'NFC South', conference: 'NFC' },
      { id: 'buccaneers', name: 'Tampa Bay Buccaneers', abbreviation: 'TB', colors: { primary: '#D50A0A', secondary: '#FF7900', accent: '#34302B' }, division: 'NFC South', conference: 'NFC' },
      
      // NFC West
      { id: 'cardinals', name: 'Arizona Cardinals', abbreviation: 'ARI', colors: { primary: '#97233F', secondary: '#000000', accent: '#FFB612' }, division: 'NFC West', conference: 'NFC' },
      { id: 'rams', name: 'Los Angeles Rams', abbreviation: 'LAR', colors: { primary: '#003594', secondary: '#FFA300', accent: '#FFFFFF' }, division: 'NFC West', conference: 'NFC' },
      { id: 'niners', name: 'San Francisco 49ers', abbreviation: 'SF', colors: { primary: '#AA0000', secondary: '#B3995D', accent: '#FFFFFF' }, division: 'NFC West', conference: 'NFC' },
      { id: 'seahawks', name: 'Seattle Seahawks', abbreviation: 'SEA', colors: { primary: '#002244', secondary: '#69BE28', accent: '#A5ACAF' }, division: 'NFC West', conference: 'NFC' },
    ];

    teamsData.forEach(team => {
      this.teams.set(team.id, team);
    });
  }

  async getAll(): Promise<Team[]> {
    return Array.from(this.teams.values());
  }

  async getById(id: TeamId): Promise<Team | null> {
    return this.teams.get(id) || null;
  }

  async getByDivision(division: string): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team => team.division === division);
  }

  async getByConference(conference: 'AFC' | 'NFC'): Promise<Team[]> {
    return Array.from(this.teams.values()).filter(team => team.conference === conference);
  }
}