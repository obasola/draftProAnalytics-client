// domain/repositories/team.repository.interface.ts
export interface ITeamRepository {
  getAll(): Promise<TeamEntity[]>;
  getById(id: TeamId): Promise<TeamEntity | null>;
  getByDivision(division: string): Promise<TeamEntity[]>;
  getByConference(conference: 'AFC' | 'NFC'): Promise<TeamEntity[]>;
}
