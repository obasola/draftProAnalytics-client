

/* ===========================
   useTeams.ts (Composable)
   =========================== */

import { ref, onMounted } from 'vue';
import { Team } from '../draftTypes';
import { TeamService } from '@/services/teamService';

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