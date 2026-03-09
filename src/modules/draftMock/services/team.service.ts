// ============================================
// File: src/services/team.service.ts
// ============================================

import axios from 'axios';
import { Team } from '../types/draft.types';
 
/**
 * Team Service
 * Handles all team-related API operations following SOLID principles
 * Single Responsibility: Manages team data retrieval and operations
 */
export class TeamService {
  private readonly apiUrl: string;

  constructor() {
    this.apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
  }

  /**
   * Retrieve all NFL teams
   * @returns Promise<Team[]> - Array of all teams
   */
  async getTeams(): Promise<Team[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/teams`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch teams:', error);
      throw new Error('Unable to retrieve teams');
    }
  }

  /**
   * Retrieve a specific team by ID
   * @param id - Team identifier
   * @returns Promise<Team> - Single team object
   */
  async getTeamById(id: string): Promise<Team> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/teams/${id}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch team ${id}:`, error);
      throw new Error(`Unable to retrieve team: ${id}`);
    }
  }

  /**
   * Retrieve teams by conference
   * @param conference - 'AFC' or 'NFC'
   * @returns Promise<Team[]> - Array of teams in the conference
   */
  async getTeamsByConference(conference: 'AFC' | 'NFC'): Promise<Team[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/teams/conference/${conference}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${conference} teams:`, error);
      throw new Error(`Unable to retrieve ${conference} teams`);
    }
  }

  /**
   * Retrieve teams by division
   * @param division - Division name (e.g., 'AFC East')
   * @returns Promise<Team[]> - Array of teams in the division
   */
  async getTeamsByDivision(division: string): Promise<Team[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/teams/division/${encodeURIComponent(division)}`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch ${division} teams:`, error);
      throw new Error(`Unable to retrieve ${division} teams`);
    }
  }

  /**
   * Get team draft needs
   * @param teamId - Team identifier
   * @returns Promise<string[]> - Array of position needs
   */
  async getTeamNeeds(teamId: string): Promise<string[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/teams/${teamId}/needs`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch team needs for ${teamId}:`, error);
      throw new Error(`Unable to retrieve team needs: ${teamId}`);
    }
  }

  /**
   * Get team draft picks
   * @param teamId - Team identifier
   * @returns Promise<any[]> - Array of draft picks owned by team
   */
  async getTeamDraftPicks(teamId: string): Promise<any[]> {
    try {
      const response = await axios.get(`${this.apiUrl}/api/teams/${teamId}/picks`);
      return response.data;
    } catch (error) {
      console.error(`Failed to fetch draft picks for ${teamId}:`, error);
      throw new Error(`Unable to retrieve draft picks: ${teamId}`);
    }
  }
}