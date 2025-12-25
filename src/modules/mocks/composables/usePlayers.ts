
/* ===========================
   usePlayers.ts (Composable)
   =========================== */

import { ref, computed } from 'vue';
import { PlayerService } from '../player.service';
import { Player } from '../draftTypes';

const players = ref<Player[]>([]);
const selectedPosition = ref<string>('All');
const playerService = new PlayerService();

export function usePlayers() {
  const availablePlayers = computed(() => {
    return players.value.filter(p => !p.isDrafted);
  });

  const fetchPlayers = async () => {
    try {
      players.value = await playerService.getPlayers();
    } catch (error) {
      console.error('Failed to fetch players:', error);
    }
  };

  const filterByPosition = (position: string) => {
    selectedPosition.value = position;
  };

  const selectPlayer = async (player: Player) => {
    try {
      await playerService.draftPlayer(player.id);
      const index = players.value.findIndex(p => p.id === player.id);
      if (index !== -1) {
        players.value[index].isDrafted = true;
      }
    } catch (error) {
      console.error('Failed to draft player:', error);
      throw error;
    }
  };

  return {
    players,
    availablePlayers,
    selectedPosition,
    fetchPlayers,
    filterByPosition,
    selectPlayer
  };
}
