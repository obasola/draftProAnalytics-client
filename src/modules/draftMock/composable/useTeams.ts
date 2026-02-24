/* ===========================
   useTeams.ts (Composable)
   =========================== */

import { ref, onMounted } from 'vue';
import type { Team } from '../types/draft.types';
import { TeamService } from '../services/team.service';

const teams = ref<Team[]>([]);
const teamService = new TeamService();

export function useTeams() {
  const fetchTeams = async () => {
    try {
      teams.value = await teamService.getTeams();
    } catch (error) {
      console.error('Failed to fetch teams:', error);
    }
  };

  onMounted(() => {
    fetchTeams();
  });

  return {
    teams,
    fetchTeams
  };
}